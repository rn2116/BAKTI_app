"use server"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { verifyReadingStartToken } from "@/lib/readingVerification"
import { XP_COMPLETE_MATERIAL } from "@/lib/constants"
import { getCategoryStats } from "@/services/material"

const markCompleteSchema = z.object({
  materialId: z.string().min(1, "ID materi diperlukan"),
  startedAt: z.coerce.number().optional(),
  readingToken: z.string().min(1, "Token verifikasi bacaan diperlukan"),
  checkVerified: z.boolean(),
  segmentsCompleted: z.coerce.number().min(1).optional(),
  totalSegments: z.coerce.number().min(1).optional(),
})

export async function markMaterialComplete(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  "use server"
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." }
  }

  const parsed = markCompleteSchema.safeParse({
    materialId: formData.get("materialId"),
    startedAt: formData.get("startedAt"),
    readingToken: formData.get("readingToken"),
    checkVerified: formData.get("checkVerified") === "true",
    segmentsCompleted: formData.get("segmentsCompleted") || undefined,
    totalSegments: formData.get("totalSegments") || undefined,
  })
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi bacaan belum lengkap. Harap selesaikan bacaan dan cek pemahaman.",
    }
  }

  const {
    materialId,
    startedAt,
    readingToken,
    checkVerified,
    segmentsCompleted,
    totalSegments,
  } = parsed.data

  if (!checkVerified) {
    return {
      success: false,
      error: "Harap selesaikan verifikasi cek pemahaman singkat sebelum mengklaim poin.",
    }
  }

  if (
    segmentsCompleted !== undefined &&
    totalSegments !== undefined &&
    segmentsCompleted < totalSegments
  ) {
    return {
      success: false,
      error: "Masih ada bagian materi yang belum terbaca. Silakan baca hingga bagian akhir.",
    }
  }

  // Validasi token sesi baca HMAC dari server (mencegah pemalsuan timestamp/bot)
  const tokenCheck = verifyReadingStartToken(readingToken, session.userId, materialId)
  if (!tokenCheck.valid || !tokenCheck.issuedAt) {
    return {
      success: false,
      error: tokenCheck.error ?? "Token verifikasi bacaan tidak valid.",
    }
  }

  // Hitung durasi baca aktual di server menggunakan timestamp penerbitan server & startedAt
  const serverElapsedSeconds = (Date.now() - tokenCheck.issuedAt) / 1000
  const clientElapsedSeconds = startedAt ? (Date.now() - startedAt) / 1000 : serverElapsedSeconds

  if (serverElapsedSeconds < 20 || clientElapsedSeconds < 20) {
    return {
      success: false,
      error:
        "Waktu membaca terlalu singkat. Harap baca materi secara perlahan sebelum mengklaim poin.",
    }
  }

  try {
    const material = await prisma.learningMaterial.findUnique({
      where: { id: materialId },
      select: { id: true, title: true, category: true, slug: true },
    })
    if (!material) {
      return { success: false, error: "Materi tidak ditemukan" }
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.userMaterialProgress.findUnique({
        where: { userId_materialId: { userId: session.userId, materialId } },
      })

      if (existing && existing.status === "SELESAI") {
        return
      }

      if (existing) {
        await tx.userMaterialProgress.update({
          where: { id: existing.id },
          data: {
            status: "SELESAI",
            completedAt: new Date(),
            xpEarned: XP_COMPLETE_MATERIAL,
            updatedAt: new Date(),
          },
        })
      } else {
        await tx.userMaterialProgress.create({
          data: {
            id: randomUUID(),
            userId: session.userId,
            materialId,
            status: "SELESAI",
            completedAt: new Date(),
            xpEarned: XP_COMPLETE_MATERIAL,
          },
        })
      }

      const updatedUser = await tx.masterUser.update({
        where: { id: session.userId },
        data: { xp: { increment: XP_COMPLETE_MATERIAL } },
        select: { xp: true },
      })

      const newLevel = Math.max(1, Math.floor(updatedUser.xp / 100) + 1)
      await tx.masterUser.update({
        where: { id: session.userId },
        data: { level: newLevel },
      })
    })

    const stats = await getCategoryStats(session.userId)
    const category = stats.find((s) => s.category === material.category)
    if (category && category.total > 0 && category.done === category.total) {
      // Semua materi dalam kategori selesai
    }

    // Sinkronisasi XP & Level ke seluruh layout, header, sidebar, dan dasbor secara instan
    revalidatePath("/", "layout")
    revalidatePath("/siswa")
    revalidatePath("/siswa/materi")
    if (material.slug) {
      revalidatePath(`/siswa/materi/${material.slug}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Gagal menandai materi selesai:", error)
    return { success: false, error: "Gagal menyimpan progres belajar" }
  }
}

// Alias fungsi untuk kompatibilitas
export const completeMaterialAction = markMaterialComplete

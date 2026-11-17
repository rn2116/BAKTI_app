"use server"
import { randomUUID } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { XP_COMPLETE_MATERIAL } from "@/lib/constants"
import { getCategoryStats } from "@/services/material"

const markCompleteSchema = z.object({
  materialId: z.string().min(1, "ID materi diperlukan"),
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
  })
  if (!parsed.success) {
    return { success: false, error: "ID materi tidak valid" }
  }

  const { materialId } = parsed.data

  try {
    const material = await prisma.learningMaterial.findUnique({
      where: { id: materialId },
      select: { id: true, title: true, category: true },
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

      await tx.masterUser.update({
        where: { id: session.userId },
        data: { xp: { increment: XP_COMPLETE_MATERIAL } },
      })
    })

    const stats = await getCategoryStats(session.userId)
    const category = stats.find((s) => s.category === material.category)
    if (category && category.total > 0 && category.done === category.total) {
      // Semua materi dalam kategori selesai — bisa diberikan badge di sini
      // (badge award logic dipanggil dari action kuis / terpisah)
    }

    return { success: true }
  } catch (error) {
    console.error("Gagal menandai materi selesai:", error)
    return { success: false, error: "Gagal menyimpan progres belajar" }
  }
}

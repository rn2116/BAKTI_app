"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { Role } from "@/types"
import {
  proposeDictionarySchema,
  curateDictionarySchema,
  type CurateDictionaryInput,
} from "@/validations/dictionary"
import type { ActionState } from "@/actions/auth"

const XP_COMMUNITY_CONTRIBUTION = 20

export async function proposeDictionaryEntryAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session) {
    return {
      success: false,
      error: "Silakan masuk terlebih dahulu untuk mengusulkan kosakata atau ungkapan.",
    }
  }

  const raw = {
    regionalLanguage: formData.get("regionalLanguage"),
    regionalTerm: formData.get("regionalTerm"),
    philosophicalMeaning: formData.get("philosophicalMeaning"),
    indonesianCharacter: formData.get("indonesianCharacter"),
    implementation: formData.get("implementation"),
    referenceSource: formData.get("referenceSource"),
  }

  const parsed = proposeDictionarySchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Formulir usulan kosakata tidak valid.",
    }
  }

  const upperLang = parsed.data.regionalLanguage.toUpperCase()

  try {
    const [languageRecord, proposerUser] = await Promise.all([
      prisma.masterRegionalLanguage.findUnique({
        where: { code: upperLang },
        select: { code: true, name: true, isActive: true },
      }),
      prisma.masterUser.findUnique({
        where: { id: session.userId },
        select: { id: true, fullName: true, isActive: true },
      }),
    ])

    if (!proposerUser || !proposerUser.isActive) {
      return {
        success: false,
        error: "Akun Anda belum aktif atau tidak ditemukan.",
      }
    }

    if (!languageRecord || !languageRecord.isActive) {
      return {
        success: false,
        error: `Bahasa daerah '${upperLang}' tidak terdaftar atau belum aktif.`,
      }
    }

    const composedSource = `${parsed.data.philosophicalMeaning}\n\nSumber Rujukan / Penutur Asli: ${parsed.data.referenceSource}`

    await prisma.$transaction(async (tx) => {
      await tx.characterMatrix.create({
        data: {
          regionalLanguage: upperLang,
          regionalTerm: parsed.data.regionalTerm,
          indonesianCharacter: parsed.data.indonesianCharacter,
          characterSource: composedSource,
          implementation: parsed.data.implementation,
          verificationStatus: "PENDING_REVIEW",
          createdBy: session.userId,
          proposedBy: session.userId,
        },
      })

      const reviewers = await tx.masterUser.findMany({
        where: {
          isActive: true,
          OR: [
            { role: Role.ADMIN },
            { role: Role.AHLI_BAHASA, expertStatus: "APPROVED" },
          ],
        },
        select: { id: true, role: true },
      })

      if (reviewers.length > 0) {
        await tx.notification.createMany({
          data: reviewers.map((rev) => ({
            id: randomUUID(),
            userId: rev.id,
            title: "Usulan Kosakata Masyarakat Baru",
            message: `${proposerUser.fullName} mengusulkan lema "${parsed.data.regionalTerm}" (${languageRecord.name}) untuk dikurasi ke Kamus Besar.`,
            type: "system",
            link:
              rev.role === Role.AHLI_BAHASA
                ? "/ahli-bahasa"
                : "/admin/matriks-karakter",
            isPriority: true,
          })),
        })
      }
    })

    revalidatePath("/siswa/budaya-bahasa")
    revalidatePath("/ahli-bahasa")
    revalidatePath("/ahli-bahasa/kamus")
    revalidatePath("/admin/matriks-karakter")

    return {
      success: true,
      message:
        "Usulan kosakata berhasil dikirim dan menunggu kurasi Ahli Bahasa Daerah BBPST.",
    }
  } catch (error) {
    console.error("Gagal mengirim usulan kosakata:", error)
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan usulan kosakata Anda.",
    }
  }
}

export async function curateDictionaryProposalAction(
  input: CurateDictionaryInput
): Promise<ActionState> {
  const session = await getSession()
  if (
    !session ||
    (session.role !== Role.ADMIN && session.role !== Role.AHLI_BAHASA)
  ) {
    return {
      success: false,
      error: "Hanya Ahli Bahasa Daerah atau Admin BBPST yang berwenang melakukan kurasi.",
    }
  }

  const parsed = curateDictionarySchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Data kurasi tidak valid.",
    }
  }

  if (
    parsed.data.decision === "REJECTED" &&
    (!parsed.data.reviewNotes || parsed.data.reviewNotes.length < 5)
  ) {
    return {
      success: false,
      error: "Harap tuliskan alasan penolakan atau catatan perbaikan minimal 5 karakter.",
    }
  }

  try {
    const curator = await prisma.masterUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        role: true,
        isActive: true,
        expertStatus: true,
      },
    })

    if (!curator || !curator.isActive) {
      return { success: false, error: "Akun kurator tidak aktif." }
    }

    if (
      curator.role === Role.AHLI_BAHASA &&
      curator.expertStatus !== "APPROVED"
    ) {
      return {
        success: false,
        error: "Akun Ahli Bahasa Anda belum disetujui Admin BBPST.",
      }
    }

    const existing = await prisma.characterMatrix.findUnique({
      where: { id: parsed.data.matrixId },
      select: {
        id: true,
        regionalTerm: true,
        regionalLanguage: true,
        indonesianCharacter: true,
        characterSource: true,
        implementation: true,
        audioUrl: true,
        verificationStatus: true,
        proposedBy: true,
      },
    })

    if (!existing) {
      return { success: false, error: "Entri usulan kosakata tidak ditemukan." }
    }

    const isNewlyApproved =
      parsed.data.decision === "APPROVED" &&
      existing.verificationStatus !== "APPROVED"

    await prisma.$transaction(async (tx) => {
      await tx.characterMatrix.update({
        where: { id: existing.id },
        data: {
          verificationStatus: parsed.data.decision,
          verifiedBy: curator.id,
          reviewNotes: parsed.data.reviewNotes || null,
          ...(parsed.data.regionalLanguage
            ? { regionalLanguage: parsed.data.regionalLanguage.toUpperCase() }
            : {}),
          ...(parsed.data.regionalTerm
            ? { regionalTerm: parsed.data.regionalTerm }
            : {}),
          ...(parsed.data.indonesianCharacter
            ? { indonesianCharacter: parsed.data.indonesianCharacter }
            : {}),
          ...(parsed.data.characterSource
            ? { characterSource: parsed.data.characterSource }
            : {}),
          ...(parsed.data.implementation
            ? { implementation: parsed.data.implementation }
            : {}),
          ...(parsed.data.audioUrl !== undefined
            ? { audioUrl: parsed.data.audioUrl || null }
            : {}),
        },
      })

      if (existing.proposedBy) {
        if (isNewlyApproved) {
          const proposer = await tx.masterUser.findUnique({
            where: { id: existing.proposedBy },
            select: { id: true, xp: true },
          })

          if (proposer) {
            const nextXp = proposer.xp + XP_COMMUNITY_CONTRIBUTION
            const nextLevel = Math.floor(nextXp / 100) + 1
            await tx.masterUser.update({
              where: { id: proposer.id },
              data: { xp: nextXp, level: nextLevel },
            })
          }

          await tx.notification.create({
            data: {
              id: randomUUID(),
              userId: existing.proposedBy,
              title: "Usulan Kosakata Disetujui (+20 XP)",
              message: `Selamat! Usulan kosakata "${parsed.data.regionalTerm || existing.regionalTerm}" telah diverifikasi oleh ${curator.fullName} dan diterbitkan ke Kamus Besar.`,
              type: "badge",
              link: "/siswa/budaya-bahasa",
              isPriority: true,
            },
          })
        } else if (parsed.data.decision === "REJECTED") {
          await tx.notification.create({
            data: {
              id: randomUUID(),
              userId: existing.proposedBy,
              title: "Catatan Kurasi Usulan Kosakata",
              message: `Usulan "${existing.regionalTerm}" memerlukan perbaikan: ${parsed.data.reviewNotes}`,
              type: "system",
              link: "/siswa/budaya-bahasa",
              isPriority: true,
            },
          })
        }
      }
    })

    revalidatePath("/siswa/budaya-bahasa")
    revalidatePath("/siswa/belajar-bahasa/[lang]", "page")
    revalidatePath("/ahli-bahasa")
    revalidatePath("/ahli-bahasa/kamus")
    revalidatePath("/admin/matriks-karakter")

    return {
      success: true,
      message:
        parsed.data.decision === "APPROVED"
          ? isNewlyApproved
            ? "Usulan disetujui dan diterbitkan ke Kamus Besar (+20 XP untuk pengusul)."
            : "Perubahan entri kamus berhasil disimpan dan diterbitkan."
          : "Usulan ditolak dan catatan kurasi telah dikirimkan kepada pengusul.",
    }
  } catch (error) {
    console.error("Gagal mengkurasi usulan kamus:", error)
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat menyimpan hasil kurasi.",
    }
  }
}

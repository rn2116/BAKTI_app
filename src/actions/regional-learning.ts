"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { RegionalLanguage } from "@/types"

const markCardSchema = z.object({
  regionalLanguage: z.nativeEnum(RegionalLanguage),
  cardId: z.string().min(1),
  totalCards: z.number().min(1),
})

export async function markFlashcardLearnedAction(input: {
  regionalLanguage: RegionalLanguage
  cardId: string
  totalCards: number
}): Promise<{
  success: boolean
  error?: string
  learnedCardIds?: string[]
  stage1Completed?: boolean
  xpAwarded?: number
}> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." }
  }

  const parsed = markCardSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Data kartu ungkapan tidak valid." }
  }

  const { regionalLanguage, cardId, totalCards } = parsed.data

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.regionalModuleProgress.findUnique({
        where: {
          userId_regionalLanguage: {
            userId: session.userId,
            regionalLanguage,
          },
        },
      })

      let learnedSet = new Set<string>()
      if (existing?.learnedCardIds) {
        try {
          const arr: unknown = JSON.parse(existing.learnedCardIds)
          if (Array.isArray(arr)) {
            arr.forEach((x) => learnedSet.add(String(x)))
          }
        } catch {
          learnedSet = new Set<string>()
        }
      }

      learnedSet.add(cardId)
      const learnedArray = Array.from(learnedSet)
      const shouldCompleteStage1 = learnedArray.length >= totalCards
      const newlyCompletedStage1 = shouldCompleteStage1 && !(existing?.stage1Completed ?? false)

      if (existing) {
        await tx.regionalModuleProgress.update({
          where: { id: existing.id },
          data: {
            learnedCardIds: JSON.stringify(learnedArray),
            stage1Completed: existing.stage1Completed || shouldCompleteStage1,
          },
        })
      } else {
        await tx.regionalModuleProgress.create({
          data: {
            id: randomUUID(),
            userId: session.userId,
            regionalLanguage,
            learnedCardIds: JSON.stringify(learnedArray),
            stage1Completed: shouldCompleteStage1,
          },
        })
      }

      let xpAwarded = 0
      if (newlyCompletedStage1) {
        xpAwarded = 15
        const updatedUser = await tx.masterUser.update({
          where: { id: session.userId },
          data: { xp: { increment: xpAwarded } },
          select: { xp: true },
        })
        const newLevel = Math.max(1, Math.floor(updatedUser.xp / 100) + 1)
        await tx.masterUser.update({
          where: { id: session.userId },
          data: { level: newLevel },
        })
      }

      return {
        learnedCardIds: learnedArray,
        stage1Completed: (existing?.stage1Completed ?? false) || shouldCompleteStage1,
        xpAwarded,
      }
    })

    revalidatePath(`/siswa/belajar-bahasa/${regionalLanguage}`)
    revalidatePath("/siswa")
    revalidatePath("/", "layout")

    return { success: true, ...result }
  } catch (err) {
    console.error("Gagal simpan progres kartu:", err)
    return { success: false, error: "Gagal menyimpan progres kartu ungkapan." }
  }
}

const completeMatchingSchema = z.object({
  regionalLanguage: z.nativeEnum(RegionalLanguage),
  score: z.number().min(0).max(100),
})

export async function completeMatchingStageAction(input: {
  regionalLanguage: RegionalLanguage
  score: number
}): Promise<{
  success: boolean
  error?: string
  xpAwarded?: number
}> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." }
  }

  const parsed = completeMatchingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Data latihan tidak valid." }
  }

  const { regionalLanguage, score } = parsed.data

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.regionalModuleProgress.findUnique({
        where: {
          userId_regionalLanguage: {
            userId: session.userId,
            regionalLanguage,
          },
        },
      })

      const newlyCompletedStage2 = !(existing?.stage2Completed ?? false)

      if (existing) {
        await tx.regionalModuleProgress.update({
          where: { id: existing.id },
          data: {
            stage2Completed: true,
            stage2Score: Math.max(existing.stage2Score, score),
          },
        })
      } else {
        await tx.regionalModuleProgress.create({
          data: {
            id: randomUUID(),
            userId: session.userId,
            regionalLanguage,
            learnedCardIds: "[]",
            stage1Completed: true,
            stage2Completed: true,
            stage2Score: score,
          },
        })
      }

      let xpAwarded = 0
      if (newlyCompletedStage2) {
        xpAwarded = 25
        const updatedUser = await tx.masterUser.update({
          where: { id: session.userId },
          data: { xp: { increment: xpAwarded } },
          select: { xp: true },
        })
        const newLevel = Math.max(1, Math.floor(updatedUser.xp / 100) + 1)
        await tx.masterUser.update({
          where: { id: session.userId },
          data: { level: newLevel },
        })
      }

      // Jika Tahap 3 (Kuis Evaluasi) sudah tuntas sebelumnya dan baru menyelesaikan Tahap 1 & 2, terbitkan Sertifikat
      const stage1Done = existing ? existing.stage1Completed : true
      if (stage1Done && existing?.stage3Completed) {
        const existingCert = await tx.sertifikat.findUnique({
          where: {
            userId_bahasaDaerah: {
              userId: session.userId,
              bahasaDaerah: regionalLanguage,
            },
          },
        })
        if (!existingCert) {
          const year = new Date().getFullYear()
          const shortCode = randomUUID().slice(0, 6).toUpperCase()
          await tx.sertifikat.create({
            data: {
              id: randomUUID(),
              nomorSertifikat: `BBPST-${regionalLanguage}-${year}-${shortCode}`,
              userId: session.userId,
              bahasaDaerah: regionalLanguage,
              skorAkhir: existing.bestQuizScore,
            },
          })
        }
      }

      return { xpAwarded }
    })

    revalidatePath(`/siswa/belajar-bahasa/${regionalLanguage}`)
    revalidatePath("/siswa/sertifikat")
    revalidatePath("/siswa")
    revalidatePath("/", "layout")

    return { success: true, ...result }
  } catch (err) {
    console.error("Gagal simpan progres tahap 2:", err)
    return { success: false, error: "Gagal menyimpan progres latihan mencocokkan." }
  }
}

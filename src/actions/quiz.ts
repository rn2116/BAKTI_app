"use server"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { calculateXPForAttempt } from "@/services/quiz"

const submitQuizSchema = z.object({
  quizId: z.string().min(1, "ID kuis diperlukan"),
  answers: z.string(), // JSON: [{ questionId, selectedIndex }]
  violationCount: z.coerce.number().min(0).default(0),
  isAutoSubmitted: z.boolean().default(false),
})

export async function submitQuizAttempt(
  prevState: { success: boolean; error?: string; attemptId?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string; attemptId?: string }> {
  "use server"
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." }
  }

  const parsed = submitQuizSchema.safeParse({
    quizId: formData.get("quizId"),
    answers: formData.get("answers"),
    violationCount: formData.get("violationCount") || 0,
    isAutoSubmitted: formData.get("isAutoSubmitted") === "true",
  })
  if (!parsed.success) {
    return { success: false, error: "Data kuis tidak valid" }
  }

  const { quizId, answers: answersJson } = parsed.data
  let answers: Array<{ questionId: string; selectedIndex: number }>
  try {
    answers = JSON.parse(answersJson)
  } catch {
    return { success: false, error: "Format jawaban tidak valid" }
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          where: { verificationStatus: "APPROVED" },
        },
      },
    })
    if (!quiz) {
      return { success: false, error: "Kuis tidak ditemukan" }
    }

    let score = 0
    let maxScore = 0
    const answerRecords: Array<{
      id: string
      attemptId: string
      questionId: string
      selectedIndex: number | null
      isCorrect: boolean
      pointsEarned: number
    }> = []

    for (const q of quiz.questions) {
      maxScore += q.points
      const userAnswer = answers.find((a) => a.questionId === q.id)
      const selectedIndex = userAnswer?.selectedIndex ?? null
      const isCorrect = selectedIndex !== null && selectedIndex === q.correctIndex
      const pointsEarned = isCorrect ? q.points : 0
      score += pointsEarned

      answerRecords.push({
        id: randomUUID(),
        attemptId: "", // diisi setelah attempt dibuat
        questionId: q.id,
        selectedIndex,
        isCorrect,
        pointsEarned,
      })
    }

    const passed = maxScore > 0 && score / maxScore >= quiz.passingScore / 100
    const xpEarned = passed ? await calculateXPForAttempt(quizId, score, maxScore) : 0

    const attempt = await prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.quizAttempt.create({
        data: {
          id: randomUUID(),
          userId: session.userId,
          quizId,
          score,
          maxScore,
          passed,
          xpEarned,
          completedAt: new Date(),
          violationCount: parsed.data.violationCount,
          isAutoSubmitted: parsed.data.isAutoSubmitted,
        } as any,
      })

      for (const rec of answerRecords) {
        rec.attemptId = createdAttempt.id
        await tx.quizAttemptAnswer.create({
          data: {
            id: rec.id,
            attemptId: rec.attemptId,
            questionId: rec.questionId,
            selectedIndex: rec.selectedIndex,
            isCorrect: rec.isCorrect,
            pointsEarned: rec.pointsEarned,
            answeredAt: new Date(),
          },
        })
      }

      if (passed && xpEarned > 0) {
        const updatedUser = await tx.masterUser.update({
          where: { id: session.userId },
          data: { xp: { increment: xpEarned } },
          select: { xp: true },
        })

        const newLevel = Math.max(1, Math.floor(updatedUser.xp / 100) + 1)
        await tx.masterUser.update({
          where: { id: session.userId },
          data: { level: newLevel },
        })
      }

      // Pembaruan Progres Modul Bahasa Daerah & Penerbitan Sertifikat Otomatis (Tugas 5)
      if (passed) {
        const pctScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
        const currentYear = new Date().getFullYear()

        if (quiz.regionalLanguage) {
          const existingMod = await tx.regionalModuleProgress.findUnique({
            where: {
              userId_regionalLanguage: {
                userId: session.userId,
                regionalLanguage: quiz.regionalLanguage,
              },
            },
          })

          const newBest = Math.max(existingMod?.bestQuizScore ?? 0, pctScore)
          if (existingMod) {
            await tx.regionalModuleProgress.update({
              where: { id: existingMod.id },
              data: {
                stage3Completed: true,
                bestQuizScore: newBest,
              },
            })
          } else {
            await tx.regionalModuleProgress.create({
              data: {
                id: randomUUID(),
                userId: session.userId,
                regionalLanguage: quiz.regionalLanguage,
                learnedCardIds: "[]",
                stage3Completed: true,
                bestQuizScore: newBest,
              },
            })
          }

          if (existingMod?.stage1Completed && existingMod?.stage2Completed) {
            const existingCert = await tx.sertifikat.findUnique({
              where: {
                userId_bahasaDaerah: {
                  userId: session.userId,
                  bahasaDaerah: quiz.regionalLanguage,
                },
              },
            })
            if (existingCert) {
              if (pctScore > existingCert.skorAkhir) {
                await tx.sertifikat.update({
                  where: { id: existingCert.id },
                  data: { skorAkhir: pctScore },
                })
              }
            } else {
              const shortCode = randomUUID().slice(0, 6).toUpperCase()
              await tx.sertifikat.create({
                data: {
                  id: randomUUID(),
                  nomorSertifikat: `BBPST-${quiz.regionalLanguage}-${currentYear}-${shortCode}`,
                  userId: session.userId,
                  bahasaDaerah: quiz.regionalLanguage,
                  skorAkhir: pctScore,
                },
              })
            }
          }
        } else if (quiz.category === "BUDAYA_SULTENG") {
          const pendingModules = await tx.regionalModuleProgress.findMany({
            where: {
              userId: session.userId,
              stage1Completed: true,
              stage2Completed: true,
            },
          })

          for (const mod of pendingModules) {
            const hasDedicatedQuiz = await tx.quiz.count({
              where: { isPublished: true, regionalLanguage: mod.regionalLanguage },
            })
            if (hasDedicatedQuiz > 0) continue

            const newBest = Math.max(mod.bestQuizScore, pctScore)
            await tx.regionalModuleProgress.update({
              where: { id: mod.id },
              data: {
                stage3Completed: true,
                bestQuizScore: newBest,
              },
            })

            const existingCert = await tx.sertifikat.findUnique({
              where: {
                userId_bahasaDaerah: {
                  userId: session.userId,
                  bahasaDaerah: mod.regionalLanguage,
                },
              },
            })
            if (!existingCert) {
              const shortCode = randomUUID().slice(0, 6).toUpperCase()
              await tx.sertifikat.create({
                data: {
                  id: randomUUID(),
                  nomorSertifikat: `BBPST-${mod.regionalLanguage}-${currentYear}-${shortCode}`,
                  userId: session.userId,
                  bahasaDaerah: mod.regionalLanguage,
                  skorAkhir: newBest,
                },
              })
            }
          }
        }
      }

      return createdAttempt
    })

    // Sinkronisasi XP & Level ke seluruh layout, header, sidebar, dan dasbor secara instan
    revalidatePath("/", "layout")
    revalidatePath("/siswa")
    revalidatePath("/siswa/kuis")
    revalidatePath("/siswa/peringkat")
    revalidatePath("/siswa/sertifikat")
    if (quiz.regionalLanguage) {
      revalidatePath(`/siswa/belajar-bahasa/${quiz.regionalLanguage}`)
    }

    return { success: true, attemptId: attempt.id }
  } catch (error) {
    console.error("Gagal menyimpan kuis:", error)
    return { success: false, error: "Gagal menyimpan hasil kuis" }
  }
}

// Alias fungsi untuk kompatibilitas
export const submitQuizAction = submitQuizAttempt

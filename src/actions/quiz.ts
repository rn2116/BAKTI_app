"use server"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { calculateXPForAttempt, startOrResumeQuizAttempt } from "@/services/quiz"

const submitQuizSchema = z.object({
  quizId: z.string().min(1, "ID kuis diperlukan"),
  attemptId: z.string().optional(),
  answers: z.string(), // JSON: [{ questionId, selectedIndex }]
  violationCount: z.coerce.number().min(0).max(50).default(0),
  isAutoSubmitted: z.boolean().default(false),
})

export interface ServerQuizResult {
  score: number
  maxScore: number
  passed: boolean
  xpEarned: number
  violationCount: number
  isAutoSubmitted: boolean
  disqualified: boolean
  timeSpentSeconds: number
  answers: Array<{
    questionId: string
    selectedIndex: number | null
    isCorrect: boolean
    correctIndex: number
    explanation?: string | null
  }>
}

export async function startQuizAttemptSession(quizId: string): Promise<{
  success: boolean
  attemptId?: string
  remainingSeconds?: number
  error?: string
}> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." }
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, isPublished: true },
      select: { id: true, timeLimit: true },
    })
    if (!quiz) {
      return { success: false, error: "Kuis tidak ditemukan." }
    }

    const started = await startOrResumeQuizAttempt(session.userId, quiz.id, quiz.timeLimit)
    return {
      success: true,
      attemptId: started.attemptId,
      remainingSeconds: started.remainingSeconds,
    }
  } catch (err) {
    console.error("Gagal memulai sesi kuis:", err)
    return { success: false, error: "Gagal memulai sesi kuis." }
  }
}

export async function submitQuizAttempt(
  prevState: {
    success: boolean
    error?: string
    attemptId?: string
    result?: ServerQuizResult
  } | null,
  formData: FormData
): Promise<{
  success: boolean
  error?: string
  attemptId?: string
  result?: ServerQuizResult
}> {
  "use server"
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Sesi tidak valid. Silakan masuk kembali." }
  }

  const parsed = submitQuizSchema.safeParse({
    quizId: formData.get("quizId"),
    attemptId: (formData.get("attemptId") as string) || undefined,
    answers: formData.get("answers"),
    violationCount: formData.get("violationCount") || 0,
    isAutoSubmitted: formData.get("isAutoSubmitted") === "true",
  })
  if (!parsed.success) {
    return { success: false, error: "Data kuis tidak valid" }
  }

  const { quizId, attemptId, answers: answersJson, violationCount, isAutoSubmitted } = parsed.data
  let answers: Array<{ questionId: string; selectedIndex: number | null }>
  try {
    const rawAnswers: unknown = JSON.parse(answersJson)
    if (!Array.isArray(rawAnswers)) {
      return { success: false, error: "Format jawaban tidak valid" }
    }
    answers = rawAnswers.map((item) => {
      const rec = item as { questionId?: unknown; selectedIndex?: unknown }
      return {
        questionId: typeof rec.questionId === "string" ? rec.questionId : "",
        selectedIndex:
          typeof rec.selectedIndex === "number" && Number.isInteger(rec.selectedIndex)
            ? rec.selectedIndex
            : null,
      }
    })
  } catch {
    return { success: false, error: "Format jawaban tidak valid" }
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, isPublished: true },
      include: {
        questions: {
          where: { verificationStatus: "APPROVED" },
          orderBy: { orderIndex: "asc" },
        },
      },
    })
    if (!quiz || quiz.questions.length === 0) {
      return { success: false, error: "Kuis tidak ditemukan atau belum memiliki soal" }
    }

    // Validasi sesi mulai (`startedAt`) di sisi server & cegah manipulasi attempt orang lain (IDOR) / replay
    const now = new Date()
    let activeAttempt = attemptId
      ? await prisma.quizAttempt.findUnique({
          where: { id: attemptId },
          select: { id: true, userId: true, quizId: true, startedAt: true, completedAt: true },
        })
      : await prisma.quizAttempt.findFirst({
          where: { userId: session.userId, quizId, completedAt: null },
          orderBy: { startedAt: "desc" },
          select: { id: true, userId: true, quizId: true, startedAt: true, completedAt: true },
        })

    if (!activeAttempt) {
      return {
        success: false,
        error: "Sesi ujian tidak ditemukan. Silakan muat ulang halaman kuis.",
      }
    }
    if (activeAttempt.userId !== session.userId || activeAttempt.quizId !== quizId) {
      return { success: false, error: "Akses sesi kuis ditolak." }
    }
    if (activeAttempt.completedAt !== null) {
      return {
        success: false,
        error: "Jawaban untuk sesi ujian ini sudah dikumpulkan sebelumnya.",
      }
    }

    const timeSpentSeconds = Math.max(
      0,
      Math.floor((now.getTime() - activeAttempt.startedAt.getTime()) / 1000)
    )
    const maxAllowedSeconds = quiz.timeLimit * 60
    const hardDeadlineSeconds = maxAllowedSeconds + 120
    const disqualifiedByViolations = violationCount >= 3
    const effectiveAutoSubmitted =
      isAutoSubmitted || disqualifiedByViolations || timeSpentSeconds > maxAllowedSeconds

    if (timeSpentSeconds > hardDeadlineSeconds) {
      return {
        success: false,
        error: "Batas waktu ujian telah melampaui toleransi server. Silakan ulangi kuis.",
      }
    }

    // Cegah bot / pengiriman instan sebelum siswa sempat membaca soal (kecuali auto-diskualifikasi)
    const minReasonableSeconds = Math.min(10, Math.max(3, quiz.questions.length * 2))
    if (!disqualifiedByViolations && !effectiveAutoSubmitted && timeSpentSeconds < minReasonableSeconds) {
      return {
        success: false,
        error: `Pengerjaan terlalu cepat (${timeSpentSeconds} detik). Cermati butir soal minimal ${minReasonableSeconds} detik sebelum mengumpulkan.`,
      }
    }

    // Penilaian 100% di sisi server (backend-authoritative)
    let score = 0
    let maxScore = 0
    const answerRecords: Array<{
      id: string
      questionId: string
      selectedIndex: number | null
      isCorrect: boolean
      pointsEarned: number
    }> = []
    const detailedResultAnswers: ServerQuizResult["answers"] = []

    for (const q of quiz.questions) {
      maxScore += q.points
      const userAnswer = answers.find((a) => a.questionId === q.id)
      const selectedIndex =
        userAnswer &&
        userAnswer.selectedIndex !== null &&
        userAnswer.selectedIndex >= 0 &&
        userAnswer.selectedIndex <= 3
          ? userAnswer.selectedIndex
          : null
      const isCorrect = selectedIndex !== null && selectedIndex === q.correctIndex
      const pointsEarned = isCorrect ? q.points : 0
      score += pointsEarned

      answerRecords.push({
        id: randomUUID(),
        questionId: q.id,
        selectedIndex,
        isCorrect,
        pointsEarned,
      })

      detailedResultAnswers.push({
        questionId: q.id,
        selectedIndex,
        isCorrect,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })
    }

    // Diskualifikasi jika pelanggaran pindah tab >= 3 kali
    const passed =
      !disqualifiedByViolations &&
      maxScore > 0 &&
      score / maxScore >= quiz.passingScore / 100
    const xpEarned = passed ? await calculateXPForAttempt(quizId, score, maxScore) : 0

    const completedAttempt = await prisma.$transaction(async (tx) => {
      const updatedAttempt = await tx.quizAttempt.update({
        where: { id: activeAttempt.id },
        data: {
          score,
          maxScore,
          passed,
          xpEarned,
          completedAt: now,
          timeSpent: timeSpentSeconds,
          violationCount,
          isAutoSubmitted: effectiveAutoSubmitted,
        },
      })

      await tx.quizAttemptAnswer.createMany({
        data: answerRecords.map((rec) => ({
          id: rec.id,
          attemptId: updatedAttempt.id,
          questionId: rec.questionId,
          selectedIndex: rec.selectedIndex,
          isCorrect: rec.isCorrect,
          pointsEarned: rec.pointsEarned,
          answeredAt: now,
        })),
      })

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

      // Pembaruan Progres Modul Bahasa Daerah & Penerbitan Sertifikat Otomatis (100% Sisi Server)
      if (passed && !disqualifiedByViolations) {
        const pctScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
        const currentYear = now.getFullYear()

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

      return updatedAttempt
    })

    revalidatePath("/", "layout")
    revalidatePath("/siswa")
    revalidatePath("/siswa/kuis")
    revalidatePath("/siswa/peringkat")
    revalidatePath("/siswa/sertifikat")
    if (quiz.regionalLanguage) {
      revalidatePath(`/siswa/belajar-bahasa/${quiz.regionalLanguage}`)
    }

    return {
      success: true,
      attemptId: completedAttempt.id,
      result: {
        score,
        maxScore,
        passed,
        xpEarned,
        violationCount,
        isAutoSubmitted: effectiveAutoSubmitted,
        disqualified: disqualifiedByViolations,
        timeSpentSeconds,
        answers: detailedResultAnswers,
      },
    }
  } catch (error) {
    console.error("Gagal menyimpan kuis:", error)
    return { success: false, error: "Gagal menyimpan hasil kuis" }
  }
}

// Alias fungsi untuk kompatibilitas
export const submitQuizAction = submitQuizAttempt

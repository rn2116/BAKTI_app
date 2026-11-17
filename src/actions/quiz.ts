"use server"
import { randomUUID } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { calculateXPForAttempt } from "@/services/quiz"

const submitQuizSchema = z.object({
  quizId: z.string().min(1, "ID kuis diperlukan"),
  answers: z.string(), // JSON: [{ questionId, selectedIndex }]
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
      include: { questions: true },
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
        },
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

      if (passed) {
        await tx.masterUser.update({
          where: { id: session.userId },
          data: { xp: { increment: xpEarned } },
        })
      }

      return createdAttempt
    })

    return { success: true, attemptId: attempt.id }
  } catch (error) {
    console.error("Gagal menyimpan kuis:", error)
    return { success: false, error: "Gagal menyimpan hasil kuis" }
  }
}

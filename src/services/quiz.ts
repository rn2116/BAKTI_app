import { prisma } from "@/lib/prisma"
import { XP_QUIZ_BASE } from "@/lib/constants"

export async function getPublishedQuizzes() {
  return prisma.quiz.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  })
}

export async function getQuizById(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          question: true,
          options: true,
          points: true,
          orderIndex: true,
          correctIndex: true,
          explanation: true,
        },
      },
    },
  })
}

export async function getQuizAttempt(attemptId: string) {
  return prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: { orderBy: { answeredAt: "asc" } },
      quiz: true,
    },
  })
}

export async function getUserQuizAttempts(userId: string, quizId?: string) {
  return prisma.quizAttempt.findMany({
    where: { userId, ...(quizId ? { quizId } : {}) },
    include: { quiz: true, answers: true },
    orderBy: { startedAt: "desc" },
  })
}

export async function getLeaderboard({
  quizId,
  schoolId,
  classId,
  limit = 10,
}: {
  quizId?: string
  schoolId?: string
  classId?: string
  limit?: number
}) {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      passed: true,
      ...(quizId ? { quizId } : {}),
      ...(schoolId ? { user: { schoolId } } : {}),
      ...(classId ? { user: { classId } } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          schoolId: true,
          classId: true,
          xp: true,
          level: true,
        },
      },
    },
    orderBy: { score: "desc" },
    take: limit,
  })

  return attempts
}

export async function calculateXPForAttempt(quizId: string, score: number, maxScore: number) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
  if (!quiz) return 0
  const ratio = maxScore > 0 ? score / maxScore : 0
  return Math.round(quiz.xpReward * ratio)
}

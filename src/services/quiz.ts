import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { XP_QUIZ_BASE } from "@/lib/constants"

export async function getPublishedQuizzes() {
  return prisma.quiz.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          questions: { where: { verificationStatus: "APPROVED" } },
          attempts: true,
        },
      },
    },
  })
}

export async function getQuizById(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        where: { verificationStatus: "APPROVED" },
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          question: true,
          options: true,
          points: true,
          orderIndex: true,
          correctIndex: true,
          explanation: true,
          regionalLanguage: true,
          wiseSayingText: true,
          wiseSayingMeaning: true,
          referenceSource: true,
          audioUrl: true,
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

export const getLeaderboard = unstable_cache(
  async ({
    quizId,
    schoolId,
    classId,
    limit = 20,
  }: {
    quizId?: string
    schoolId?: string
    classId?: string
    limit?: number
  }) => {
    return prisma.quizAttempt.findMany({
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
            school: { select: { name: true } },
          },
        },
      },
      orderBy: { score: "desc" },
      take: limit,
    })
  },
  ["leaderboard_quiz_ranks"],
  { tags: ["leaderboard"], revalidate: 30 }
)

export const getOverallLeaderboard = unstable_cache(
  async ({
    scope = "global",
    schoolId,
    classId,
    limit = 25,
  }: {
    scope?: "global" | "school" | "class"
    schoolId?: string
    classId?: string
    limit?: number
  }) => {
    const users = await prisma.masterUser.findMany({
      where: {
        role: "SISWA",
        isActive: true,
        ...(scope === "school" && schoolId ? { schoolId } : {}),
        ...(scope === "class" && classId ? { classId } : {}),
      },
      select: {
        id: true,
        fullName: true,
        xp: true,
        level: true,
        school: { select: { name: true } },
      },
      orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
      take: limit,
    })

    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.fullName,
      schoolName: u.school?.name ?? "Sulawesi Tengah",
      level: u.level,
      xp: u.xp,
    }))
  },
  ["overall_leaderboard_ranks"],
  { tags: ["leaderboard"], revalidate: 30 }
)

export async function calculateXPForAttempt(quizId: string, score: number, maxScore: number) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
  if (!quiz) return 0
  const ratio = maxScore > 0 ? score / maxScore : 0
  return Math.round(quiz.xpReward * ratio)
}

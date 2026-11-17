import { prisma } from "@/lib/prisma"

export async function getUserById(userId: string) {
  return prisma.masterUser.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      schoolId: true,
      classId: true,
      xp: true,
      level: true,
      isActive: true,
      createdAt: true,
    },
  })
}

export async function getUserBadgesWithDetail(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  })
}

export async function getUserCertificates(userId: string) {
  return prisma.userCertificate.findMany({
    where: { userId },
    include: { material: true, quizAttempt: true },
    orderBy: { issuedAt: "desc" },
  })
}

export async function getUserStats(userId: string) {
  const [user, materialsProgress, quizAttempts] = await Promise.all([
    getUserById(userId),
    prisma.userMaterialProgress.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.quizAttempt.aggregate({
      where: { userId },
      _avg: { score: true },
      _max: { score: true },
      _count: true,
    }),
  ])

  return { user, materialsProgress, quizAttempts }
}

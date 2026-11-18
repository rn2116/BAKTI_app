import { prisma } from "@/lib/prisma"
import { Category } from "@/lib/constants"

export async function getPublishedMaterials() {
  return prisma.learningMaterial.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      description: true,
      thumbnail: true,
      readingTime: true,
      orderIndex: true,
      isPublished: true,
      createdAt: true,
      _count: { select: { quizzes: true, progress: true } },
    },
  })
}

export async function getMaterialBySlug(slug: string) {
  return prisma.learningMaterial.findUnique({
    where: { slug },
    include: {
      quizzes: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
          questions: { select: { id: true } },
        },
      },
    },
  })
}

export async function getMaterialProgress(userId: string, materialId: string) {
  return prisma.userMaterialProgress.findUnique({
    where: { userId_materialId: { userId, materialId } },
  })
}

export async function getUserMaterialProgress(userId: string) {
  return prisma.userMaterialProgress.findMany({
    where: { userId },
    include: { material: true },
  })
}

export async function getUserCompletedMaterialIds(userId: string) {
  const rows = await prisma.userMaterialProgress.findMany({
    where: { userId, status: "SELESAI" },
    select: { materialId: true },
  })
  return new Set(rows.map((r) => r.materialId))
}

export async function getCategoryStats(userId: string) {
  const [materials, progress] = await Promise.all([
    prisma.learningMaterial.findMany({
      where: { isPublished: true },
      select: { id: true, category: true },
    }),
    prisma.userMaterialProgress.findMany({
      where: { userId, status: "SELESAI" },
      select: { materialId: true },
    }),
  ])
  const completedIds = new Set(progress.map((p) => p.materialId))

  const stats = Object.values(Category).map((category) => {
    const total = materials.filter((m) => m.category === category).length
    const done = materials.filter(
      (m) => m.category === category && completedIds.has(m.id)
    ).length
    return { category, total, done }
  })

  return stats
}

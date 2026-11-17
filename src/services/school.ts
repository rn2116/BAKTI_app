import { prisma } from "@/lib/prisma"

export async function getSchools() {
  return prisma.masterSchool.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}

export async function getClassesBySchool(schoolId: string) {
  return prisma.masterClass.findMany({
    where: { schoolId, isActive: true },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  })
}

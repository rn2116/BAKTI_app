import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const getSchools = unstable_cache(
  async () => {
    return prisma.masterSchool.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
  },
  ["active_schools_list"],
  { tags: ["master_schools"], revalidate: 3600 }
)

export async function getClassesBySchool(schoolId: string) {
  return prisma.masterClass.findMany({
    where: { schoolId, isActive: true },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  })
}

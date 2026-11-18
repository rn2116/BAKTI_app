import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { Category, Role } from "@prisma/client"

// ========================
// GURU - KELAS & REKAP
// ========================

export async function getTeacherClasses(schoolId: string) {
  return prisma.masterClass.findMany({
    where: { schoolId, isActive: true },
    include: {
      _count: { select: { users: true } },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  })
}

export async function getClassWithStudents(classId: string) {
  return prisma.masterClass.findUnique({
    where: { id: classId },
    include: {
      school: true,
      users: {
        where: { role: Role.SISWA, isActive: true },
        select: {
          id: true,
          fullName: true,
          email: true,
          nisn: true,
          xp: true,
          level: true,
          quizAttempts: {
            select: {
              id: true,
              quizId: true,
              score: true,
              maxScore: true,
              passed: true,
              quiz: { select: { title: true } },
            },
          },
          materialProgress: {
            where: { status: "SELESAI" },
            select: { materialId: true },
          },
        },
        orderBy: { fullName: "asc" },
      },
    },
  })
}

// Rekap Nilai untuk Guru
export async function getQuizRecapBySchoolOrTeacher(schoolId?: string, teacherId?: string) {
  return prisma.quizAttempt.findMany({
    where: {
      ...(schoolId ? { user: { schoolId } } : {}),
      ...(teacherId ? { quiz: { createdBy: teacherId } } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          nisn: true,
          class: { select: { name: true, grade: true } },
          school: { select: { name: true } },
        },
      },
      quiz: {
        select: {
          id: true,
          title: true,
          category: true,
          passingScore: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  })
}

// ========================
// GURU/ADMIN - MATERI CRUD
// ========================

export async function getMaterialsForManagement(userId?: string, isAdmin = false) {
  return prisma.learningMaterial.findMany({
    where: isAdmin ? {} : { createdBy: userId },
    include: {
      creator: { select: { fullName: true } },
      _count: { select: { quizzes: true, progress: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ========================
// GURU/ADMIN - KUIS CRUD
// ========================

export async function getQuizzesForManagement(userId?: string, isAdmin = false) {
  return prisma.quiz.findMany({
    where: isAdmin ? {} : { createdBy: userId },
    include: {
      creator: { select: { fullName: true } },
      material: { select: { title: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getQuizWithQuestions(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
      },
      material: { select: { id: true, title: true } },
    },
  })
}

// ========================
// ADMIN - STATISTIK SISTEM
// ========================

export async function getAdminSystemStats() {
  const [
    totalSchools,
    totalClasses,
    totalUsers,
    totalStudents,
    totalTeachers,
    totalMaterials,
    totalQuizzes,
    totalAttempts,
    materialBahasa,
    materialKarakter,
    materialBudaya,
  ] = await Promise.all([
    prisma.masterSchool.count({ where: { isActive: true } }),
    prisma.masterClass.count({ where: { isActive: true } }),
    prisma.masterUser.count({ where: { isActive: true } }),
    prisma.masterUser.count({ where: { role: Role.SISWA, isActive: true } }),
    prisma.masterUser.count({ where: { role: Role.GURU, isActive: true } }),
    prisma.learningMaterial.count(),
    prisma.quiz.count(),
    prisma.quizAttempt.count(),
    prisma.learningMaterial.count({ where: { category: Category.BAHASA_INDONESIA } }),
    prisma.learningMaterial.count({ where: { category: Category.KARAKTER } }),
    prisma.learningMaterial.count({ where: { category: Category.BUDAYA_SULTENG } }),
  ])

  return {
    totalSchools,
    totalClasses,
    totalUsers,
    totalStudents,
    totalTeachers,
    totalMaterials,
    totalQuizzes,
    totalAttempts,
    pillars: {
      bahasa: materialBahasa,
      karakter: materialKarakter,
      budaya: materialBudaya,
    },
  }
}

export async function getAdminRegencyStats() {
  const regencies = await prisma.masterRegency.findMany({
    include: {
      schools: {
        include: {
          users: {
            where: { role: Role.SISWA, isActive: true },
            select: {
              id: true,
              quizAttempts: {
                select: {
                  score: true,
                  maxScore: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return regencies.map((reg) => {
    let studentCount = 0
    let totalScore = 0
    let totalMaxScore = 0
    let attemptCount = 0

    for (const school of reg.schools) {
      studentCount += school.users.length
      for (const u of school.users) {
        for (const att of u.quizAttempts) {
          if (att.maxScore > 0) {
            totalScore += att.score
            totalMaxScore += att.maxScore
            attemptCount++
          }
        }
      }
    }

    const avgScore =
      totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0

    return {
      id: reg.id,
      name: reg.name.replace("Kabupaten ", "Kab. "),
      fullName: reg.name,
      code: reg.code,
      schoolCount: reg.schools.length,
      studentCount,
      attemptCount,
      avgScore,
    }
  })
}

// ========================
// ADMIN - SEKOLAH & REGENCY
// ========================

export const getAllSchoolsAdmin = unstable_cache(
  async () => {
    return prisma.masterSchool.findMany({
      include: {
        regency: true,
        _count: { select: { classes: true, users: true } },
      },
      orderBy: { name: "asc" },
    })
  },
  ["all_schools_admin"],
  { tags: ["master_schools"], revalidate: 3600 }
)

export const getAllRegencies = unstable_cache(
  async () => {
    return prisma.masterRegency.findMany({
      orderBy: { name: "asc" },
    })
  },
  ["all_regencies_list"],
  { tags: ["master_regencies"], revalidate: 3600 }
)

// ========================
// ADMIN - KELAS
// ========================

export async function getAllClassesAdmin() {
  return prisma.masterClass.findMany({
    include: {
      school: { select: { id: true, name: true } },
      _count: { select: { users: true } },
    },
    orderBy: [{ school: { name: "asc" } }, { grade: "asc" }, { name: "asc" }],
  })
}

// ========================
// ADMIN - PENGGUNA
// ========================

export async function getAllUsersAdmin() {
  return prisma.masterUser.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      nisn: true,
      nip: true,
      isActive: true,
      createdAt: true,
      school: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, grade: true } },
      xp: true,
      level: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

// ========================
// ADMIN - MODERASI KONTEN
// ========================

export async function getAllContentForModeration() {
  const [materials, quizzes] = await Promise.all([
    prisma.learningMaterial.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        readingTime: true,
        isPublished: true,
        createdAt: true,
        creator: { select: { fullName: true, role: true } },
        _count: { select: { quizzes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quiz.findMany({
      include: {
        creator: { select: { fullName: true, role: true } },
        material: { select: { title: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return { materials, quizzes }
}

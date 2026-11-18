import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { Category, Role } from "@/types"

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
  return (prisma.quizAttempt.findMany as any)({
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

// ========================
// ADMIN - BANK SOAL & KUIS
// ========================

export async function getAdminQuizzes() {
  return prisma.quiz.findMany({
    include: {
      creator: { select: { fullName: true } },
      material: { select: { id: true, title: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAdminQuizDetail(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      creator: { select: { fullName: true } },
      material: { select: { id: true, title: true } },
      questions: {
        orderBy: { orderIndex: "asc" },
      },
    },
  })
}

// ========================
// MATRIKS KARAKTER 9 BAHASA
// ========================

export async function getCharacterMatrices() {
  return (prisma as any).characterMatrix.findMany({
    include: {
      creator: { select: { fullName: true } },
    },
    orderBy: [{ regionalLanguage: "asc" }, { indonesianCharacter: "asc" }],
  })
}

// ========================
// ADMIN - LAPORAN NILAI RESMI BBPST
// ========================

export async function getAllStudentRecapReport(regencyId?: string, schoolId?: string) {
  const students = await (prisma.masterUser.findMany as any)({
    where: {
      role: Role.SISWA,
      isActive: true,
      ...(schoolId ? { schoolId } : {}),
      ...(regencyId ? { school: { regencyId } } : {}),
    },
    select: {
      id: true,
      fullName: true,
      nisn: true,
      xp: true,
      level: true,
      school: { select: { id: true, name: true, regency: { select: { name: true } } } },
      class: { select: { id: true, name: true, grade: true } },
      quizAttempts: {
        select: {
          id: true,
          score: true,
          maxScore: true,
          passed: true,
          startedAt: true,
          violationCount: true,
          isAutoSubmitted: true,
          quiz: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: [{ school: { name: "asc" } }, { fullName: "asc" }],
  })

  return (students as any[]).map((student: any) => {
    let scoreBahasa = 0, maxBahasa = 0
    let scoreKarakter = 0, maxKarakter = 0
    let scoreBudaya = 0, maxBudaya = 0
    let totalViolations = 0
    let autoSubmittedCount = 0

    for (const att of (student.quizAttempts || [])) {
      totalViolations += att.violationCount ?? 0
      if (att.isAutoSubmitted) {
        autoSubmittedCount++
      }

      if (att.quiz.category === Category.BAHASA_INDONESIA) {
        scoreBahasa += att.score
        maxBahasa += att.maxScore
      } else if (att.quiz.category === Category.KARAKTER) {
        scoreKarakter += att.score
        maxKarakter += att.maxScore
      } else if (att.quiz.category === Category.BUDAYA_SULTENG) {
        scoreBudaya += att.score
        maxBudaya += att.maxScore
      }
    }

    const pctBahasa = maxBahasa > 0 ? Math.round((scoreBahasa / maxBahasa) * 100) : null
    const pctKarakter = maxKarakter > 0 ? Math.round((scoreKarakter / maxKarakter) * 100) : null
    const pctBudaya = maxBudaya > 0 ? Math.round((scoreBudaya / maxBudaya) * 100) : null

    const validPcts = [pctBahasa, pctKarakter, pctBudaya].filter((p): p is number => p !== null)
    const avgScore = validPcts.length > 0 ? Math.round(validPcts.reduce((a, b) => a + b, 0) / validPcts.length) : 0

    let predikat = "Mulai Berkembang (MB)"
    if (avgScore >= 85) {
      predikat = "Sangat Berkembang (SB)"
    } else if (avgScore >= 70) {
      predikat = "Berkembang Sesuai Harapan (BSH)"
    }

    return {
      id: student.id,
      fullName: student.fullName,
      nisn: student.nisn || "-",
      schoolName: student.school?.name || "-",
      regencyName: student.school?.regency?.name || "-",
      className: student.class ? `Kelas ${student.class.grade} - ${student.class.name}` : "-",
      scoreBahasa: pctBahasa !== null ? pctBahasa : 0,
      scoreKarakter: pctKarakter !== null ? pctKarakter : 0,
      scoreBudaya: pctBudaya !== null ? pctBudaya : 0,
      avgScore,
      xp: student.xp,
      level: student.level,
      predikat,
      totalAttempts: (student.quizAttempts || []).length,
      totalViolations,
      autoSubmittedCount,
    }
  })
}

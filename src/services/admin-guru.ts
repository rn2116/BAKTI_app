import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { REGIONAL_LANGUAGES, REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import { Category, RegionalLanguage, Role } from "@/types"

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
        include: {
          creator: { select: { id: true, fullName: true, role: true } },
          verifier: { select: { fullName: true } },
        },
      },
    },
  })
}

export async function getPendingVerificationCount(): Promise<number> {
  return prisma.quizQuestion.count({
    where: { verificationStatus: "PENDING_REVIEW" },
  })
}

export async function getQuestionsForVerification() {
  const [questions, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.quizQuestion.findMany({
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: true,
            regionalLanguage: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            role: true,
            school: { select: { name: true } },
          },
        },
        verifier: {
          select: { fullName: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.quizQuestion.count({ where: { verificationStatus: "PENDING_REVIEW" } }),
    prisma.quizQuestion.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.quizQuestion.count({ where: { verificationStatus: "REJECTED" } }),
  ])

  return {
    questions,
    counts: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      total: pendingCount + approvedCount + rejectedCount,
    },
  }
}

export async function getQuizzesForTeacherContribution(teacherId: string) {
  const quizzes = await prisma.quiz.findMany({
    include: {
      creator: { select: { id: true, fullName: true, role: true } },
      material: { select: { title: true } },
      _count: {
        select: {
          questions: { where: { verificationStatus: "APPROVED" } },
          attempts: true,
        },
      },
      questions: {
        where: { createdBy: teacherId },
        select: { id: true, verificationStatus: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return quizzes.map((q) => ({
    ...q,
    teacherSubmissionStats: {
      pending: q.questions.filter((item) => item.verificationStatus === "PENDING_REVIEW").length,
      approved: q.questions.filter((item) => item.verificationStatus === "APPROVED").length,
      rejected: q.questions.filter((item) => item.verificationStatus === "REJECTED").length,
    },
  }))
}

export async function getTeacherQuizDetail(quizId: string, teacherId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      creator: { select: { id: true, fullName: true, role: true } },
      material: { select: { id: true, title: true } },
      questions: {
        where: {
          OR: [
            { verificationStatus: "APPROVED" },
            { createdBy: teacherId },
          ],
        },
        orderBy: { orderIndex: "asc" },
        include: {
          creator: { select: { id: true, fullName: true, role: true } },
          verifier: { select: { fullName: true } },
        },
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

// ========================
// ADMIN - ANALITIK INSTANSI BBPST (TUGAS 5)
// ========================

export interface RegencyAnalyticsRow {
  regencyId: string
  regencyName: string
  schoolsCount: number
  studentsCount: number
  teachersCount: number
  certificatesCount: number
}

export interface RegionalLanguageAnalyticsRow {
  code: RegionalLanguage
  name: string
  attemptsCount: number
  avgScore: number
  passRate: number
  moduleStarters: number
  certificatesCount: number
}

export interface ExpressionPerformanceItem {
  questionId: string
  label: string
  meaning: string | null
  languageName: string
  totalAnswered: number
  correctCount: number
  accuracyPercent: number
}

export interface AdminAgencyAnalyticsData {
  summary: {
    totalActiveUsers: number
    totalStudents: number
    totalTeachers: number
    activeLearnersCount: number
    totalSchools: number
    totalRegencies: number
    totalQuizAttempts: number
    totalRegionalCertificates: number
    totalMaterialCertificates: number
    overallAvgScore: number
  }
  regencyDistribution: RegencyAnalyticsRow[]
  schoolDistribution: Array<{
    schoolId: string
    schoolName: string
    regencyName: string
    studentsCount: number
    teachersCount: number
    attemptsCount: number
    avgScore: number
  }>
  languagePerformance: RegionalLanguageAnalyticsRow[]
  mostMasteredExpressions: ExpressionPerformanceItem[]
  hardestExpressions: ExpressionPerformanceItem[]
}

export async function getAdminAgencyAnalytics(): Promise<AdminAgencyAnalyticsData> {
  const [
    users,
    regencies,
    schools,
    attempts,
    answers,
    moduleProgressRows,
    regionalCerts,
    materialCertCount,
  ] = await Promise.all([
    prisma.masterUser.findMany({
      where: { isActive: true },
      select: {
        id: true,
        role: true,
        schoolId: true,
        xp: true,
      },
    }),
    prisma.masterRegency.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.masterSchool.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        regencyId: true,
        regency: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.quizAttempt.findMany({
      select: {
        id: true,
        userId: true,
        score: true,
        maxScore: true,
        passed: true,
        user: { select: { schoolId: true } },
        quiz: { select: { regionalLanguage: true } },
      },
    }),
    prisma.quizAttemptAnswer.findMany({
      select: {
        isCorrect: true,
        questionId: true,
        question: {
          select: {
            id: true,
            question: true,
            wiseSayingText: true,
            wiseSayingMeaning: true,
            regionalLanguage: true,
            quiz: { select: { regionalLanguage: true } },
          },
        },
      },
    }),
    prisma.regionalModuleProgress.findMany({
      select: {
        userId: true,
        regionalLanguage: true,
        stage3Completed: true,
        bestQuizScore: true,
      },
    }),
    prisma.sertifikat.findMany({
      select: {
        id: true,
        bahasaDaerah: true,
        user: { select: { school: { select: { regencyId: true } } } },
      },
    }),
    prisma.userCertificate.count(),
  ])

  const students = users.filter((u) => u.role === Role.SISWA)
  const teachers = users.filter((u) => u.role === Role.GURU)

  const learnerIds = new Set<string>()
  for (const a of attempts) learnerIds.add(a.userId)
  for (const m of moduleProgressRows) learnerIds.add(m.userId)
  for (const s of students) {
    if (s.xp > 0) learnerIds.add(s.id)
  }

  let totalPctSum = 0
  let validAttemptCount = 0
  for (const a of attempts) {
    if (a.maxScore > 0) {
      totalPctSum += (a.score / a.maxScore) * 100
      validAttemptCount++
    }
  }
  const overallAvgScore =
    validAttemptCount > 0 ? Math.round(totalPctSum / validAttemptCount) : 0

  // Map Regency Distribution
  const schoolById = new Map(schools.map((s) => [s.id, s]))
  const regencyDistribution: RegencyAnalyticsRow[] = regencies.map((reg) => {
    const regSchools = schools.filter((s) => s.regencyId === reg.id)
    const regSchoolIds = new Set(regSchools.map((s) => s.id))
    const regStudents = students.filter(
      (u) => u.schoolId && regSchoolIds.has(u.schoolId)
    ).length
    const regTeachers = teachers.filter(
      (u) => u.schoolId && regSchoolIds.has(u.schoolId)
    ).length
    const regCerts = regionalCerts.filter(
      (c) => c.user?.school?.regencyId === reg.id
    ).length

    return {
      regencyId: reg.id,
      regencyName: reg.name,
      schoolsCount: regSchools.length,
      studentsCount: regStudents,
      teachersCount: regTeachers,
      certificatesCount: regCerts,
    }
  })

  // Top School Distribution
  const schoolDistribution = schools.map((sch) => {
    const schStudents = students.filter((u) => u.schoolId === sch.id).length
    const schTeachers = teachers.filter((u) => u.schoolId === sch.id).length
    const schAttempts = attempts.filter((a) => a.user?.schoolId === sch.id)
    let schPctSum = 0
    let schValid = 0
    for (const a of schAttempts) {
      if (a.maxScore > 0) {
        schPctSum += (a.score / a.maxScore) * 100
        schValid++
      }
    }

    return {
      schoolId: sch.id,
      schoolName: sch.name,
      regencyName: sch.regency?.name ?? schoolById.get(sch.id)?.regency?.name ?? "-",
      studentsCount: schStudents,
      teachersCount: schTeachers,
      attemptsCount: schAttempts.length,
      avgScore: schValid > 0 ? Math.round(schPctSum / schValid) : 0,
    }
  })

  // Regional Language Performance (9 Bahasa Daerah)
  const languagePerformance: RegionalLanguageAnalyticsRow[] = REGIONAL_LANGUAGES.map(
    (langMeta) => {
      const langAttempts = attempts.filter(
        (a) => a.quiz.regionalLanguage === langMeta.code
      )
      const langMods = moduleProgressRows.filter(
        (m) => m.regionalLanguage === langMeta.code
      )
      const langCerts = regionalCerts.filter(
        (c) => c.bahasaDaerah === langMeta.code
      ).length

      let pctSum = 0
      let validCnt = 0
      let passedCnt = 0
      for (const a of langAttempts) {
        if (a.maxScore > 0) {
          pctSum += (a.score / a.maxScore) * 100
          validCnt++
        }
        if (a.passed) passedCnt++
      }

      // Include module progress scores when dedicated quiz attempts are still empty
      if (validCnt === 0 && langMods.length > 0) {
        const modScores = langMods.filter((m) => m.bestQuizScore > 0)
        if (modScores.length > 0) {
          pctSum = modScores.reduce((acc, m) => acc + m.bestQuizScore, 0)
          validCnt = modScores.length
        }
      }

      return {
        code: langMeta.code,
        name: langMeta.name,
        attemptsCount: langAttempts.length,
        avgScore: validCnt > 0 ? Math.round(pctSum / validCnt) : 0,
        passRate:
          langAttempts.length > 0
            ? Math.round((passedCnt / langAttempts.length) * 100)
            : 0,
        moduleStarters: langMods.length,
        certificatesCount: langCerts,
      }
    }
  )

  // Ungkapan Paling Dikuasai vs Paling Sulit
  const questionStatsMap = new Map<
    string,
    {
      questionId: string
      label: string
      meaning: string | null
      languageName: string
      totalAnswered: number
      correctCount: number
    }
  >()

  for (const ans of answers) {
    const q = ans.question
    if (!q) continue
    const langCode = q.regionalLanguage ?? q.quiz?.regionalLanguage
    const languageName = langCode
      ? REGIONAL_LANGUAGE_LABELS[langCode] ?? langCode
      : "Literasi & Karakter"

    const label = q.wiseSayingText ? `"${q.wiseSayingText}"` : q.question
    const existingStat = questionStatsMap.get(q.id)
    if (existingStat) {
      existingStat.totalAnswered += 1
      if (ans.isCorrect) existingStat.correctCount += 1
    } else {
      questionStatsMap.set(q.id, {
        questionId: q.id,
        label,
        meaning: q.wiseSayingMeaning,
        languageName,
        totalAnswered: 1,
        correctCount: ans.isCorrect ? 1 : 0,
      })
    }
  }

  const allExpressionPerf: ExpressionPerformanceItem[] = Array.from(
    questionStatsMap.values()
  ).map((item) => ({
    ...item,
    accuracyPercent:
      item.totalAnswered > 0
        ? Math.round((item.correctCount / item.totalAnswered) * 100)
        : 0,
  }))

  const mostMasteredExpressions = [...allExpressionPerf]
    .sort((a, b) => {
      if (b.accuracyPercent !== a.accuracyPercent) {
        return b.accuracyPercent - a.accuracyPercent
      }
      return b.totalAnswered - a.totalAnswered
    })
    .slice(0, 5)

  const hardestExpressions = [...allExpressionPerf]
    .sort((a, b) => {
      if (a.accuracyPercent !== b.accuracyPercent) {
        return a.accuracyPercent - b.accuracyPercent
      }
      return b.totalAnswered - a.totalAnswered
    })
    .slice(0, 5)

  return {
    summary: {
      totalActiveUsers: users.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      activeLearnersCount: learnerIds.size,
      totalSchools: schools.length,
      totalRegencies: regencies.length,
      totalQuizAttempts: attempts.length,
      totalRegionalCertificates: regionalCerts.length,
      totalMaterialCertificates: materialCertCount,
      overallAvgScore,
    },
    regencyDistribution,
    schoolDistribution,
    languagePerformance,
    mostMasteredExpressions,
    hardestExpressions,
  }
}

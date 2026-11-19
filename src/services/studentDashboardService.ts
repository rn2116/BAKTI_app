import { prisma } from "@/lib/prisma"
import {
  getAllRegionalLanguagesSummary,
  type RegionalLanguageSummaryItem,
} from "@/services/regionalLearningService"

export interface PillarProgress {
  category: "BAHASA_INDONESIA" | "KARAKTER" | "BUDAYA_SULTENG"
  label: string
  total: number
  completed: number
  percent: number
  color: string
}

export interface DayActivity {
  dayName: string // Sen, Sel, Rab, Kam, Jum, Sab, Min
  dateString: string
  points: number
  hasActivity: boolean
}

export interface StudentDashboardData {
  user: {
    id: string
    fullName: string
    xp: number
    level: number
    levelTitle: string
    xpCurrentLevel: number
    xpNextLevel: number
  }
  streakDays: number
  completedMaterialsCount: number
  totalMaterialsCount: number
  totalQuizzesCount: number
  passedQuizzesCount: number
  overallProgressPercent: number
  pillarProgress: PillarProgress[]
  weeklyPoints: DayActivity[]
  userBadgesCount: number
  badgesSummary: Array<{ id: string; name: string; earned: boolean; earnedAt?: Date }>
  lastMaterial: { id: string; title: string; slug: string; category: string } | null
  lastQuizAttempt: { id: string; title: string; score: number; maxScore: number; passed: boolean } | null
  popularMaterials: Array<{
    id: string
    title: string
    slug: string
    category: string
    readingTime: number
    orderIndex: number
    isCompleted: boolean
  }>
  recentActivities: Array<{
    id: string
    type: "MATERI" | "KUIS"
    title: string
    scoreOrXp: string
    date: Date
    status: string
  }>
  dailyWiseSaying: {
    wiseSayingText: string
    wiseSayingMeaning: string
    characterValue: string
    referenceSource: string
    audioUrl: string | null
    quizId: string | null
  } | null
  regionalLanguagesSummary: RegionalLanguageSummaryItem[]
}

function getLevelTitle(level: number): string {
  if (level <= 1) return "Pemula Literasi"
  if (level === 2) return "Sahabat Bahasa"
  if (level === 3) return "Penutur Santun"
  if (level === 4) return "Ksatria Karakter"
  if (level === 5) return "Penjaga Budaya"
  return "Tadulako Cendekia"
}

export async function getStudentDashboardData(userId: string): Promise<StudentDashboardData> {
  // Parallel Queries (Promise.all) & Selective Field Fetching untuk Kecepatan Maksimal
  const [
    user,
    allMaterials,
    userMaterialProgress,
    userQuizAttempts,
    totalQuizzesCount,
    masterBadges,
    userBadges,
    kailiWiseSayings,
    regionalLanguagesSummary,
  ] = await Promise.all([
    prisma.masterUser.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, xp: true, level: true },
    }),
    prisma.learningMaterial.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        readingTime: true,
        orderIndex: true,
      },
    }),
    prisma.userMaterialProgress.findMany({
      where: { userId },
      select: {
        id: true,
        materialId: true,
        status: true,
        completedAt: true,
        xpEarned: true,
        updatedAt: true,
        material: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      select: {
        id: true,
        score: true,
        maxScore: true,
        passed: true,
        xpEarned: true,
        startedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.quiz.count({ where: { isPublished: true } }),
    prisma.masterBadge.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      take: 4,
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, earnedAt: true },
    }),
    prisma.quizQuestion.findMany({
      where: {
        verificationStatus: "APPROVED",
        regionalLanguage: "KAILI",
        wiseSayingText: { not: null },
        quiz: { isPublished: true },
      },
      select: {
        id: true,
        quizId: true,
        wiseSayingText: true,
        wiseSayingMeaning: true,
        referenceSource: true,
        audioUrl: true,
        options: true,
        correctIndex: true,
      },
      orderBy: { orderIndex: "asc" },
    }),
    getAllRegionalLanguagesSummary(userId),
  ])

  if (!user) {
    throw new Error("Pengguna tidak ditemukan")
  }

  // Menghitung batas XP per level (100 XP per level)
  const xpPerLevel = 100
  const xpInCurrentLevel = user.xp % xpPerLevel
  const xpNeeded = xpPerLevel

  const completedMaterialIds = new Set(
    userMaterialProgress
      .filter((p) => p.status === "SELESAI")
      .map((p) => p.materialId)
  )

  const passedQuizzesCount = userQuizAttempts.filter((a) => a.passed).length

  // Progres per pilar materi
  const pilarCategories = [
    { cat: "BAHASA_INDONESIA" as const, label: "Bahasa Indonesia", color: "#0284C7" },
    { cat: "KARAKTER" as const, label: "Pendidikan Karakter", color: "#059669" },
    { cat: "BUDAYA_SULTENG" as const, label: "Budaya Sulteng", color: "#0D9488" },
  ]

  const pillarProgress: PillarProgress[] = pilarCategories.map((p) => {
    const total = allMaterials.filter((m) => m.category === p.cat).length
    const completed = allMaterials.filter(
      (m) => m.category === p.cat && completedMaterialIds.has(m.id)
    ).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return {
      category: p.cat,
      label: p.label,
      total,
      completed,
      percent,
      color: p.color,
    }
  })

  const overallPercent =
    allMaterials.length > 0
      ? Math.round((completedMaterialIds.size / allMaterials.length) * 100)
      : 0

  // Menghitung Streak Hari Aktif dari riwayat materi & kuis
  const activityDates = new Set<string>()
  userMaterialProgress.forEach((p) => {
    if (p.completedAt) {
      activityDates.add(new Date(p.completedAt).toISOString().split("T")[0])
    }
  })
  userQuizAttempts.forEach((q) => {
    activityDates.add(new Date(q.startedAt).toISOString().split("T")[0])
  })

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split("T")[0]
    if (activityDates.has(dateStr)) {
      streak++
    } else {
      // Jika hari ini belum aktivitas, periksa apakah kemarin ada aktivitas
      if (i === 0) continue
      break
    }
  }

  // Data 7 Hari Terakhir untuk grafik batang poin
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
  const weeklyPoints: DayActivity[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]

    // Hitung poin yang diraih pada tanggal ini
    const matPoints = userMaterialProgress
      .filter((p) => p.completedAt && new Date(p.completedAt).toISOString().split("T")[0] === dateStr)
      .reduce((sum, p) => sum + (p.xpEarned || 0), 0)

    const quizPoints = userQuizAttempts
      .filter((q) => new Date(q.startedAt).toISOString().split("T")[0] === dateStr)
      .reduce((sum, q) => sum + (q.xpEarned || 0), 0)

    const totalPts = matPoints + quizPoints
    weeklyPoints.push({
      dayName: dayNames[d.getDay()],
      dateString: dateStr,
      points: totalPts,
      hasActivity: totalPts > 0,
    })
  }

  // Lencana (Badge)
  const userBadgeIds = new Map(userBadges.map((b) => [b.badgeId, b.earnedAt]))

  const badgesSummary = masterBadges.map((b) => ({
    id: b.id,
    name: b.name,
    earned: userBadgeIds.has(b.id),
    earnedAt: userBadgeIds.get(b.id),
  }))

  // Materi terakhir yang dipelajari
  const lastMaterialProgress = userMaterialProgress[0]
  const lastMaterial = lastMaterialProgress
    ? {
        id: lastMaterialProgress.material.id,
        title: lastMaterialProgress.material.title,
        slug: lastMaterialProgress.material.slug,
        category: lastMaterialProgress.material.category,
      }
    : null

  // Kuis terakhir yang dikerjakan
  const lastAttempt = userQuizAttempts[0]
  const lastQuizAttempt = lastAttempt
    ? {
        id: lastAttempt.quiz.id,
        title: lastAttempt.quiz.title,
        score: lastAttempt.score,
        maxScore: lastAttempt.maxScore,
        passed: lastAttempt.passed,
      }
    : null

  // Materi terpopuler (maksimal 3)
  const popularMaterials = allMaterials.slice(0, 3).map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    category: m.category,
    readingTime: m.readingTime,
    orderIndex: m.orderIndex,
    isCompleted: completedMaterialIds.has(m.id),
  }))

  // Aktivitas gabungan terkini
  const combinedActivities: Array<{
    id: string
    type: "MATERI" | "KUIS"
    title: string
    scoreOrXp: string
    date: Date
    status: string
  }> = []

  userMaterialProgress.slice(0, 3).forEach((p) => {
    combinedActivities.push({
      id: p.id,
      type: "MATERI",
      title: p.material.title,
      scoreOrXp: `+${p.xpEarned} XP`,
      date: p.completedAt || p.updatedAt,
      status: p.status === "SELESAI" ? "Selesai" : "Membaca",
    })
  })

  userQuizAttempts.slice(0, 3).forEach((q) => {
    combinedActivities.push({
      id: q.id,
      type: "KUIS",
      title: q.quiz.title,
      scoreOrXp: `${q.score}/${q.maxScore}`,
      date: q.startedAt,
      status: q.passed ? "Lulus" : "Remidi",
    })
  })

  combinedActivities.sort((a, b) => b.date.getTime() - a.date.getTime())

  // Petuah Bijak To Kaili Hari Ini (rotasi harian dari data MySQL)
  let dailyWiseSaying: StudentDashboardData["dailyWiseSaying"] = null
  if (kailiWiseSayings.length > 0) {
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86400000)
    const chosen = kailiWiseSayings[Math.abs(dayOfYear) % kailiWiseSayings.length]
    let characterValue = "Kearifan Karakter To Kaili"
    try {
      const parsedOpts: unknown = JSON.parse(chosen.options)
      if (Array.isArray(parsedOpts) && parsedOpts[chosen.correctIndex]) {
        characterValue = String(parsedOpts[chosen.correctIndex])
      }
    } catch {
      // Gunakan nilai bawaan jika gagal parse
    }

    if (chosen.wiseSayingText) {
      dailyWiseSaying = {
        wiseSayingText: chosen.wiseSayingText,
        wiseSayingMeaning: chosen.wiseSayingMeaning || "",
        characterValue,
        referenceSource:
          chosen.referenceSource || "Dr. H. Suaib Djafar, M.Si — Ungkapan Bijak Masyarakat Kaili",
        audioUrl: chosen.audioUrl ?? null,
        quizId: chosen.quizId,
      }
    }
  }

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      xp: user.xp,
      level: user.level,
      levelTitle: getLevelTitle(user.level),
      xpCurrentLevel: xpInCurrentLevel,
      xpNextLevel: xpNeeded,
    },
    streakDays: streak,
    completedMaterialsCount: completedMaterialIds.size,
    totalMaterialsCount: allMaterials.length,
    totalQuizzesCount,
    passedQuizzesCount,
    overallProgressPercent: overallPercent,
    pillarProgress,
    weeklyPoints,
    userBadgesCount: userBadges.length,
    badgesSummary,
    lastMaterial,
    lastQuizAttempt,
    popularMaterials,
    recentActivities: combinedActivities.slice(0, 4),
    dailyWiseSaying,
    regionalLanguagesSummary,
  }
}

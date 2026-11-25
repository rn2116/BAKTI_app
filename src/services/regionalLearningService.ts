import { prisma } from "@/lib/prisma"
import {
  getActiveRegionalLanguages,
  getRegionalLanguageByCode,
  getRegionalLanguageLabelMap,
} from "@/services/regionalLanguageService"
import type { RegionalLanguage } from "@/types"

export interface RegionalFlashcardItem {
  id: string
  regionalLanguage: RegionalLanguage
  text: string
  literalMeaning: string
  characterValue: string
  philosophicalMeaning: string
  referenceSource: string
  audioUrl: string | null
}

export interface RegionalMatchingPair {
  id: string
  expression: string
  meaning: string
  audioUrl: string | null
}

export interface RegionalLanguageModuleData {
  language: RegionalLanguage
  languageName: string
  region: string
  flashcards: RegionalFlashcardItem[]
  matchingPairs: RegionalMatchingPair[]
  quiz: {
    id: string
    title: string
    description: string | null
    timeLimit: number
    passingScore: number
    xpReward: number
    questionCount: number
    bestAttempt: {
      score: number
      maxScore: number
      passed: boolean
      percent: number
    } | null
  } | null
  progress: {
    learnedCardIds: string[]
    stage1Completed: boolean
    stage2Completed: boolean
    stage2Score: number
    stage3Completed: boolean
    bestQuizScore: number
  }
  certificate: {
    nomorSertifikat: string
    tanggalTerbit: Date
    skorAkhir: number
  } | null
}

export interface RegionalLanguageSummaryItem {
  code: RegionalLanguage
  name: string
  region: string
  expressionCount: number
  hasQuiz: boolean
  quizId: string | null
  stage1Completed: boolean
  stage2Completed: boolean
  stage3Completed: boolean
  progressPercent: number
  hasCertificate: boolean
}

export async function getRegionalLanguageModuleData(
  userId: string,
  lang: RegionalLanguage
): Promise<RegionalLanguageModuleData> {
  const [langMeta, labelMap, matrices, allMatrices, approvedWiseQuestions, quiz, moduleProgress, certificate] =
    await Promise.all([
      getRegionalLanguageByCode(lang),
      getRegionalLanguageLabelMap(),
      prisma.characterMatrix.findMany({
        where: { regionalLanguage: lang },
        orderBy: { id: "asc" },
      }),
      prisma.characterMatrix.findMany({
        where: { regionalLanguage: { not: lang } },
        take: 4,
        orderBy: { id: "asc" },
      }),
      prisma.quizQuestion.findMany({
        where: {
          regionalLanguage: lang,
          verificationStatus: "APPROVED",
          wiseSayingText: { not: null },
        },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.quiz.findFirst({
        where: {
          isPublished: true,
          OR: [{ regionalLanguage: lang }, { category: "BUDAYA_SULTENG", regionalLanguage: null }],
        },
        orderBy: [{ regionalLanguage: "desc" }, { createdAt: "desc" }],
        include: {
          _count: {
            select: {
              questions: { where: { verificationStatus: "APPROVED" } },
            },
          },
          attempts: {
            where: { userId },
            orderBy: { score: "desc" },
            take: 1,
          },
        },
      }),
      prisma.regionalModuleProgress.findUnique({
        where: { userId_regionalLanguage: { userId, regionalLanguage: lang } },
      }),
      prisma.sertifikat.findUnique({
        where: { userId_bahasaDaerah: { userId, bahasaDaerah: lang } },
      }),
    ])

  // Bangun daftar kartu ungkapan (gabungan matriks karakter & soal ungkapan bijak)
  const seenTexts = new Set<string>()
  const flashcards: RegionalFlashcardItem[] = []

  for (const q of approvedWiseQuestions) {
    const cleanText = (q.wiseSayingText || "").trim()
    if (!cleanText || seenTexts.has(cleanText.toLowerCase())) continue
    seenTexts.add(cleanText.toLowerCase())

    let charValue = "Kearifan Karakter Lokal"
    try {
      const parsedOpts: unknown = JSON.parse(q.options)
      if (Array.isArray(parsedOpts) && parsedOpts[q.correctIndex]) {
        charValue = String(parsedOpts[q.correctIndex])
      }
    } catch {
      // Abaikan parse error
    }

    flashcards.push({
      id: `q-${q.id}`,
      regionalLanguage: lang,
      text: cleanText,
      literalMeaning: q.wiseSayingMeaning || q.explanation || charValue,
      characterValue: charValue,
      philosophicalMeaning: q.explanation || q.wiseSayingMeaning || charValue,
      referenceSource: q.referenceSource || "Balai Bahasa Provinsi Sulawesi Tengah",
      audioUrl: q.audioUrl ?? null,
    })
  }

  for (const m of matrices) {
    const cleanText = m.regionalTerm.trim()
    if (!cleanText || seenTexts.has(cleanText.toLowerCase())) continue
    seenTexts.add(cleanText.toLowerCase())

    flashcards.push({
      id: `m-${m.id}`,
      regionalLanguage: lang,
      text: cleanText,
      literalMeaning: m.indonesianCharacter,
      characterValue: m.indonesianCharacter,
      philosophicalMeaning: `${m.characterSource} Penerapan: ${m.implementation}`,
      referenceSource: m.characterSource,
      audioUrl: m.audioUrl ?? null,
    })
  }

  // Pasangan untuk Tahap 2 (Matching Game): minimal 3 pasangan agar interaktif
  const matchingPairs: RegionalMatchingPair[] = flashcards.slice(0, 5).map((f) => ({
    id: f.id,
    expression: f.text,
    meaning: `${f.characterValue}${f.literalMeaning && f.literalMeaning !== f.characterValue ? ` — ${f.literalMeaning}` : ""}`,
    audioUrl: f.audioUrl,
  }))

  if (matchingPairs.length < 3) {
    for (const extra of allMatrices) {
      if (matchingPairs.length >= 4) break
      matchingPairs.push({
        id: `extra-${extra.id}`,
        expression: `${extra.regionalTerm} (${labelMap[extra.regionalLanguage] ?? extra.regionalLanguage})`,
        meaning: extra.indonesianCharacter,
        audioUrl: extra.audioUrl ?? null,
      })
    }
  }

  let learnedIds: string[] = []
  if (moduleProgress?.learnedCardIds) {
    try {
      const parsed: unknown = JSON.parse(moduleProgress.learnedCardIds)
      if (Array.isArray(parsed)) {
        learnedIds = parsed.map((x) => String(x))
      }
    } catch {
      learnedIds = []
    }
  }

  const bestAttemptRow = quiz?.attempts[0] ?? null
  const bestPct =
    bestAttemptRow && bestAttemptRow.maxScore > 0
      ? Math.round((bestAttemptRow.score / bestAttemptRow.maxScore) * 100)
      : 0

  return {
    language: lang,
    languageName: langMeta?.name ?? labelMap[lang] ?? lang,
    region: langMeta?.regencyCoverage ?? "Sulawesi Tengah",
    flashcards,
    matchingPairs,
    quiz: quiz
      ? {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          xpReward: quiz.xpReward,
          questionCount: quiz._count.questions,
          bestAttempt: bestAttemptRow
            ? {
                score: bestAttemptRow.score,
                maxScore: bestAttemptRow.maxScore,
                passed: bestAttemptRow.passed,
                percent: bestPct,
              }
            : null,
        }
      : null,
    progress: {
      learnedCardIds: learnedIds,
      stage1Completed: moduleProgress?.stage1Completed ?? false,
      stage2Completed: moduleProgress?.stage2Completed ?? false,
      stage2Score: moduleProgress?.stage2Score ?? 0,
      stage3Completed: moduleProgress?.stage3Completed ?? false,
      bestQuizScore: moduleProgress?.bestQuizScore ?? 0,
    },
    certificate: certificate
      ? {
          nomorSertifikat: certificate.nomorSertifikat,
          tanggalTerbit: certificate.tanggalTerbit,
          skorAkhir: certificate.skorAkhir,
        }
      : null,
  }
}

export async function getAllRegionalLanguagesSummary(
  userId: string
): Promise<RegionalLanguageSummaryItem[]> {
  const [activeLanguages, matrixCounts, wiseCounts, quizzes, progressRows, certificates] = await Promise.all([
    getActiveRegionalLanguages(),
    prisma.characterMatrix.groupBy({
      by: ["regionalLanguage"],
      _count: { id: true },
    }),
    prisma.quizQuestion.groupBy({
      by: ["regionalLanguage"],
      where: {
        verificationStatus: "APPROVED",
        wiseSayingText: { not: null },
        regionalLanguage: { not: null },
      },
      _count: { id: true },
    }),
    prisma.quiz.findMany({
      where: { isPublished: true, regionalLanguage: { not: null } },
      select: { id: true, regionalLanguage: true },
    }),
    prisma.regionalModuleProgress.findMany({
      where: { userId },
    }),
    prisma.sertifikat.findMany({
      where: { userId },
      select: { bahasaDaerah: true },
    }),
  ])

  const matrixMap = new Map(matrixCounts.map((m) => [m.regionalLanguage, m._count.id]))
  const wiseMap = new Map(
    wiseCounts
      .filter((w) => w.regionalLanguage !== null)
      .map((w) => [w.regionalLanguage!, w._count.id])
  )
  const quizMap = new Map(
    quizzes
      .filter((q) => q.regionalLanguage !== null)
      .map((q) => [q.regionalLanguage!, q.id])
  )
  const progressMap = new Map(progressRows.map((p) => [p.regionalLanguage, p]))
  const certSet = new Set(certificates.map((c) => c.bahasaDaerah))

  return activeLanguages.map((lang) => {
    const code = lang.code
    const prog = progressMap.get(code)
    const s1 = prog?.stage1Completed ?? false
    const s2 = prog?.stage2Completed ?? false
    const s3 = prog?.stage3Completed ?? false
    const completedStages = (s1 ? 1 : 0) + (s2 ? 1 : 0) + (s3 ? 1 : 0)
    const progressPercent = Math.round((completedStages / 3) * 100)
    const expressionCount = Math.max(matrixMap.get(code) ?? 0, wiseMap.get(code) ?? 0)
    const quizId = quizMap.get(code) ?? null

    return {
      code,
      name: lang.name,
      region: lang.regencyCoverage,
      expressionCount,
      hasQuiz: Boolean(quizId),
      quizId,
      stage1Completed: s1,
      stage2Completed: s2,
      stage3Completed: s3,
      progressPercent,
      hasCertificate: certSet.has(code),
    }
  })
}

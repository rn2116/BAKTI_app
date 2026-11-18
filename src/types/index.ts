import type { Prisma } from "@prisma/client"

export const Category = {
  BAHASA_INDONESIA: "BAHASA_INDONESIA",
  KARAKTER: "KARAKTER",
  BUDAYA_SULTENG: "BUDAYA_SULTENG",
} as const
export type Category = (typeof Category)[keyof typeof Category]

export const Role = {
  SISWA: "SISWA",
  GURU: "GURU",
  ADMIN: "ADMIN",
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const RegionalLanguage = {
  KAILI: "KAILI",
  PAMONA: "PAMONA",
  BANGGAI: "BANGGAI",
  BUNGKU: "BUNGKU",
  TOLITOLI: "TOLITOLI",
  BUOL: "BUOL",
  SALUAN: "SALUAN",
  MORI: "MORI",
  TAA: "TAA",
} as const
export type RegionalLanguage = (typeof RegionalLanguage)[keyof typeof RegionalLanguage]

export type CharacterMatrix = {
  id: number
  indonesianCharacter: string
  regionalLanguage: RegionalLanguage
  regionalTerm: string
  characterSource: string
  implementation: string
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

export type CharacterMatrixWithCreator = CharacterMatrix & {
  creator?: { fullName: string } | null
}

export type MasterUser = Prisma.MasterUserGetPayload<{}>
export type MasterUserWithRelations = Prisma.MasterUserGetPayload<{
  include: { school: true; class: true }
}>
export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: Role
  schoolId: string | null
  classId: string | null
  xp: number
  level: number
}

export type LearningMaterial = Prisma.LearningMaterialGetPayload<{}>
export type Quiz = Prisma.QuizGetPayload<{}>
export type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: { questions: { orderBy: { orderIndex: "asc" } } }
}>
export type QuizQuestion = Prisma.QuizQuestionGetPayload<{}>
export type QuizAttempt = Prisma.QuizAttemptGetPayload<{}>
export type QuizAttemptWithAnswers = Prisma.QuizAttemptGetPayload<{
  include: { answers: true }
}>
export type UserMaterialProgress = Prisma.UserMaterialProgressGetPayload<{}>
export type MasterBadge = Prisma.MasterBadgeGetPayload<{}>
export type UserBadgeWithBadge = Prisma.UserBadgeGetPayload<{
  include: { badge: true }
}>
export type UserCertificate = Prisma.UserCertificateGetPayload<{}>
export type JWTPayload = { userId: string; email: string; role: string }

export type FormResult<T> = { success: true; data: T } | { success: false; error: string }

export type QuizOptionAnswer = {
  questionId: string
  selectedIndex: number
}

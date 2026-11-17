import type { Prisma } from "@prisma/client"

export type Category = "BAHASA_INDONESIA" | "KARAKTER" | "BUDAYA_SULTENG"
export type Role = "SISWA" | "GURU" | "ADMIN"

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

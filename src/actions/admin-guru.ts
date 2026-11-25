"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"
import { sanitizePlainText, sanitizeAudioUrl } from "@/lib/sanitize"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { Category, Role, RegionalLanguage, QuestionVerificationStatus, ExpertVerificationStatus } from "@/types"

type ActionState = { success: boolean; error?: string; message?: string }

// ---------------------------
// GURU: KELAS
// ---------------------------
const classSchema = z.object({
  name: z.string().min(1, "Nama kelas diperlukan"),
  grade: z.coerce.number().min(1).max(12, "Tingkat kelas harus 1-12"),
  schoolId: z.string().min(1, "Sekolah diperlukan"),
})

export async function createClass(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.GURU && session.role !== Role.ADMIN)) {
    return { success: false, error: "Akses tidak diizinkan" }
  }

  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    grade: formData.get("grade"),
    schoolId: formData.get("schoolId"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Input tidak valid" }
  }

  try {
    let targetSchoolId = parsed.data.schoolId
    if (session.role === Role.GURU) {
      const guru = await prisma.masterUser.findUnique({
        where: { id: session.userId },
        select: { schoolId: true },
      })
      if (!guru?.schoolId || guru.schoolId !== targetSchoolId) {
        return { success: false, error: "Anda hanya berwenang menambah kelas di sekolah Anda sendiri" }
      }
      targetSchoolId = guru.schoolId
    }

    await prisma.masterClass.create({
      data: {
        id: randomUUID(),
        name: sanitizePlainText(parsed.data.name, 50),
        grade: parsed.data.grade,
        schoolId: targetSchoolId,
        isActive: true,
      },
    })
    revalidatePath("/guru/kelas")
    revalidatePath("/admin/kelas")
    return { success: true, message: "Kelas berhasil ditambahkan" }
  } catch (error) {
    console.error("Gagal buat kelas:", error)
    return { success: false, error: "Gagal menyimpan data kelas" }
  }
}

export async function deleteClass(classId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.GURU && session.role !== Role.ADMIN)) {
    return { success: false, error: "Akses tidak diizinkan" }
  }

  try {
    if (session.role === Role.GURU) {
      const [guru, targetClass] = await Promise.all([
        prisma.masterUser.findUnique({
          where: { id: session.userId },
          select: { schoolId: true },
        }),
        prisma.masterClass.findUnique({
          where: { id: classId },
          select: { schoolId: true },
        }),
      ])
      if (!targetClass || !guru?.schoolId || targetClass.schoolId !== guru.schoolId) {
        return { success: false, error: "Anda tidak berwenang menghapus kelas dari sekolah lain" }
      }
    }

    await prisma.masterClass.delete({ where: { id: classId } })
    revalidatePath("/guru/kelas")
    revalidatePath("/admin/kelas")
    return { success: true, message: "Kelas berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus kelas (mungkin memiliki relasi data)" }
  }
}

// ---------------------------
// GURU/ADMIN: MATERI CRUD
// ---------------------------
const materialSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  category: z.nativeEnum(Category, { errorMap: () => ({ message: "Kategori tidak valid" }) }),
  regionalLanguage: z.string().optional().nullable(),
  referenceSource: z.string().optional().nullable(),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  content: z.string().min(10, "Isi konten minimal 10 karakter"),
  readingTime: z.coerce.number().min(1, "Estimasi waktu baca minimal 1 menit"),
  orderIndex: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
})

export async function saveMaterial(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Administrator Balai Bahasa yang berwenang mengelola materi literasi" }
  }

  const id = formData.get("id") as string | undefined
  const regLang = (formData.get("regionalLanguage") as string | null)?.trim() || null
  const refSrc = (formData.get("referenceSource") as string | null)?.trim() || null
  const raw = {
    id: id || undefined,
    title: formData.get("title"),
    category: formData.get("category"),
    regionalLanguage: regLang ? regLang.toUpperCase() : null,
    referenceSource: refSrc,
    description: formData.get("description"),
    content: formData.get("content"),
    readingTime: formData.get("readingTime"),
    orderIndex: formData.get("orderIndex") || 0,
    isPublished: formData.get("isPublished") === "true",
  }

  const parsed = materialSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Input tidak valid" }
  }

  const slug = parsed.data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

  try {
    if (parsed.data.id) {
      await prisma.learningMaterial.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          category: parsed.data.category,
          regionalLanguage: parsed.data.regionalLanguage ?? null,
          referenceSource: parsed.data.referenceSource ?? null,
          description: parsed.data.description,
          content: parsed.data.content,
          readingTime: parsed.data.readingTime,
          orderIndex: parsed.data.orderIndex,
          isPublished: parsed.data.isPublished,
        },
      })
    } else {
      await prisma.learningMaterial.create({
        data: {
          id: randomUUID(),
          title: parsed.data.title,
          slug,
          category: parsed.data.category,
          regionalLanguage: parsed.data.regionalLanguage ?? null,
          referenceSource: parsed.data.referenceSource ?? null,
          description: parsed.data.description,
          content: parsed.data.content,
          readingTime: parsed.data.readingTime,
          orderIndex: parsed.data.orderIndex,
          isPublished: parsed.data.isPublished,
          createdBy: session.userId,
        },
      })
    }

    revalidatePath("/admin/materi")
    revalidatePath("/guru/materi")
    revalidatePath("/siswa/materi")
    revalidatePath("/admin/konten")
    return { success: true, message: "Materi berhasil disimpan" }
  } catch (error) {
    console.error("Gagal simpan materi:", error)
    return { success: false, error: "Gagal menyimpan materi" }
  }
}

export async function deleteMaterial(materialId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Administrator Balai Bahasa yang berwenang menghapus materi" }
  }

  try {
    await prisma.learningMaterial.delete({ where: { id: materialId } })
    revalidatePath("/admin/materi")
    revalidatePath("/guru/materi")
    revalidatePath("/siswa/materi")
    revalidatePath("/admin/konten")
    return { success: true, message: "Materi berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus materi" }
  }
}

// ---------------------------
// ADMIN: KUIS & BANK SOAL CRUD
// ---------------------------
const quizHeaderSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Judul kuis minimal 3 karakter"),
  description: z.string().optional().default(""),
  category: z.nativeEnum(Category),
  regionalLanguage: z.string().trim().max(50).optional().nullable(),
  referenceSource: z.string().optional().nullable(),
  materialId: z.string().optional().nullable(),
  timeLimit: z.coerce.number().min(1, "Waktu minimal 1 menit").default(30),
  passingScore: z.coerce.number().min(0).max(100, "KKM antara 0-100").default(75),
  xpReward: z.coerce.number().min(0).default(50),
  isPublished: z.boolean().default(true),
})

type QuizHeaderData = {
  id?: string
  title: string
  description: string
  category: Category
  regionalLanguage?: RegionalLanguage | null
  referenceSource?: string | null
  materialId?: string | null
  timeLimit: number
  passingScore: number
  xpReward: number
  isPublished: boolean
}

export async function saveQuizHeader(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState & { quizId?: string }> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin yang berwenang mengelola kuis" }
  }

  const id = (formData.get("id") as string) || undefined
  const raw = {
    id,
    title: formData.get("title"),
    description: (formData.get("description") as string) || "",
    category: formData.get("category"),
    regionalLanguage: (formData.get("regionalLanguage") as RegionalLanguage) || null,
    referenceSource: (formData.get("referenceSource") as string) || null,
    materialId: (formData.get("materialId") as string) || null,
    timeLimit: formData.get("timeLimit") || 30,
    passingScore: formData.get("passingScore") || 75,
    xpReward: formData.get("xpReward") || 50,
    isPublished: formData.get("isPublished") === "true",
  }

  const parsed = quizHeaderSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Input tidak valid" }
  }

  const quizData = parsed.data as QuizHeaderData

  try {
    let quizId = quizData.id
    if (quizId) {
      await prisma.quiz.update({
        where: { id: quizId },
        data: {
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          regionalLanguage: quizData.regionalLanguage || null,
          referenceSource: quizData.referenceSource?.trim() || null,
          materialId: quizData.materialId || null,
          timeLimit: quizData.timeLimit,
          passingScore: quizData.passingScore,
          xpReward: quizData.xpReward,
          isPublished: quizData.isPublished,
        },
      })
    } else {
      quizId = randomUUID()
      await prisma.quiz.create({
        data: {
          id: quizId,
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          regionalLanguage: quizData.regionalLanguage || null,
          referenceSource: quizData.referenceSource?.trim() || null,
          materialId: quizData.materialId || null,
          timeLimit: quizData.timeLimit,
          passingScore: quizData.passingScore,
          xpReward: quizData.xpReward,
          isPublished: quizData.isPublished,
          createdBy: session.userId,
        },
      })
    }

    revalidatePath("/admin/kuis")
    revalidatePath(`/admin/kuis/${quizId}/soal`)
    revalidatePath("/siswa/kuis")
    return { success: true, message: "Kuis berhasil disimpan", quizId }
  } catch (error) {
    console.error("Gagal simpan kuis:", error)
    return { success: false, error: "Gagal menyimpan kuis" }
  }
}

export async function saveQuizWithQuestions(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.GURU)) {
    return { success: false, error: "Akses tidak diizinkan untuk mengelola kuis" }
  }

  const isGuru = session.role === Role.GURU
  const id = formData.get("id") as string | undefined
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || ""
  const category = formData.get("category") as Category
  const regionalLanguage = (formData.get("regionalLanguage") as RegionalLanguage) || null
  const materialId = (formData.get("materialId") as string) || null
  const timeLimit = parseInt((formData.get("timeLimit") as string) || "30", 10)
  const passingScore = parseInt((formData.get("passingScore") as string) || "75", 10)
  const xpReward = parseInt((formData.get("xpReward") as string) || "50", 10)
  const isPublished = formData.get("isPublished") === "true"
  const questionsJson = formData.get("questions") as string

  if (!title || !category) {
    return { success: false, error: "Judul dan kategori wajib diisi" }
  }

  let questions: Array<{
    id?: string
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
    points?: number
    regionalLanguage?: RegionalLanguage | null
    wiseSayingText?: string | null
    wiseSayingMeaning?: string | null
    referenceSource?: string | null
    audioUrl?: string | null
  }> = []

  try {
    questions = JSON.parse(questionsJson || "[]")
  } catch {
    return { success: false, error: "Format daftar soal tidak valid" }
  }

  if (questions.length === 0) {
    return { success: false, error: "Harus memiliki minimal 1 soal dalam kuis" }
  }

  try {
    if (id && isGuru) {
      const existingQuiz = await prisma.quiz.findUnique({
        where: { id },
        select: { createdBy: true },
      })
      if (!existingQuiz || existingQuiz.createdBy !== session.userId) {
        return { success: false, error: "Anda tidak memiliki izin mengubah paket kuis ini" }
      }
    }

    await prisma.$transaction(async (tx) => {
      let quizId = id
      if (quizId) {
        await tx.quiz.update({
          where: { id: quizId },
          data: {
            title,
            description,
            category,
            regionalLanguage,
            materialId: materialId || null,
            timeLimit,
            passingScore,
            xpReward,
            isPublished,
          },
        })
        await tx.quizQuestion.deleteMany({ where: { quizId } })
      } else {
        quizId = randomUUID()
        await tx.quiz.create({
          data: {
            id: quizId,
            title,
            description,
            category,
            regionalLanguage,
            materialId: materialId || null,
            timeLimit,
            passingScore,
            xpReward,
            isPublished,
            createdBy: session.userId,
          },
        })
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await tx.quizQuestion.create({
          data: {
            id: randomUUID(),
            quizId,
            question: q.question,
            options: JSON.stringify(q.options),
            correctIndex: q.correctIndex,
            explanation: q.explanation || null,
            points: q.points || 10,
            regionalLanguage: q.regionalLanguage || regionalLanguage || null,
            wiseSayingText: q.wiseSayingText?.trim() || null,
            wiseSayingMeaning: q.wiseSayingMeaning?.trim() || null,
            referenceSource: q.referenceSource?.trim() || null,
            verificationStatus: isGuru
              ? QuestionVerificationStatus.PENDING_REVIEW
              : QuestionVerificationStatus.APPROVED,
            createdBy: session.userId,
            verifiedBy: isGuru ? null : session.userId,
            orderIndex: i + 1,
          },
        })
      }
    })

    revalidatePath("/admin/kuis")
    revalidatePath("/guru/kuis")
    revalidatePath("/admin/verifikasi-soal")
    revalidatePath("/siswa/kuis")
    revalidatePath("/admin/konten")
    revalidatePath("/", "layout")
    return {
      success: true,
      message: isGuru
        ? "Kuis berhasil dibuat dan butir soal diajukan untuk verifikasi Admin"
        : "Kuis dan bank soal berhasil disimpan",
    }
  } catch (error) {
    console.error("Gagal simpan kuis:", error)
    return { success: false, error: "Gagal menyimpan kuis" }
  }
}

export async function deleteQuiz(quizId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.GURU)) {
    return { success: false, error: "Akses tidak diizinkan untuk menghapus kuis" }
  }

  try {
    if (session.role === Role.GURU) {
      const existing = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: { createdBy: true },
      })
      if (!existing || existing.createdBy !== session.userId) {
        return { success: false, error: "Anda hanya dapat menghapus kuis yang Anda buat sendiri" }
      }
    }

    await prisma.quiz.delete({ where: { id: quizId } })
    revalidatePath("/admin/kuis")
    revalidatePath("/guru/kuis")
    revalidatePath("/admin/verifikasi-soal")
    revalidatePath("/siswa/kuis")
    revalidatePath("/admin/konten")
    revalidatePath("/", "layout")
    return { success: true, message: "Kuis berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus kuis" }
  }
}

export async function saveQuizQuestion(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.GURU)) {
    return { success: false, error: "Hanya Guru atau Admin yang berwenang menambah/mengubah butir soal" }
  }

  const isGuru = session.role === Role.GURU
  const id = (formData.get("id") as string) || undefined
  const quizId = formData.get("quizId") as string
  const question = (formData.get("question") as string) || ""
  const explanation = (formData.get("explanation") as string) || null
  const points = parseInt((formData.get("points") as string) || "10", 10)
  const correctIndex = parseInt((formData.get("correctIndex") as string) || "0", 10)
  const regionalLanguage = (formData.get("regionalLanguage") as RegionalLanguage) || null
  const wiseSayingText = (formData.get("wiseSayingText") as string) || null
  const wiseSayingMeaning = (formData.get("wiseSayingMeaning") as string) || null
  const referenceSource = (formData.get("referenceSource") as string) || null
  const audioUrl = (formData.get("audioUrl") as string) || null
  const approveOnSave = formData.get("approveOnSave") === "true"

  const optA = (formData.get("optionA") as string) || ""
  const optB = (formData.get("optionB") as string) || ""
  const optC = (formData.get("optionC") as string) || ""
  const optD = (formData.get("optionD") as string) || ""

  if (!quizId || !question.trim()) {
    return { success: false, error: "Pertanyaan dan ID Kuis wajib diisi" }
  }
  if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
    return { success: false, error: "Semua 4 opsi pilihan jawaban (A, B, C, D) wajib diisi" }
  }

  const options = [optA.trim(), optB.trim(), optC.trim(), optD.trim()]

  try {
    if (id) {
      const existing = await prisma.quizQuestion.findUnique({
        where: { id },
        select: { createdBy: true, verificationStatus: true },
      })
      if (!existing) {
        return { success: false, error: "Butir soal tidak ditemukan" }
      }
      if (isGuru && existing.createdBy !== session.userId) {
        return { success: false, error: "Anda hanya dapat mengubah butir soal yang Anda ajukan sendiri" }
      }

      await prisma.quizQuestion.update({
        where: { id },
        data: {
          question: question.trim(),
          options: JSON.stringify(options),
          correctIndex,
          explanation: explanation ? explanation.trim() : null,
          points,
          regionalLanguage,
          wiseSayingText: wiseSayingText ? wiseSayingText.trim() : null,
          wiseSayingMeaning: wiseSayingMeaning ? wiseSayingMeaning.trim() : null,
          referenceSource: referenceSource ? referenceSource.trim() : null,
          audioUrl: audioUrl ? audioUrl.trim() : null,
          ...(isGuru
            ? {
                verificationStatus: QuestionVerificationStatus.PENDING_REVIEW,
                verifiedBy: null,
                reviewNotes: null,
              }
            : approveOnSave
              ? {
                  verificationStatus: QuestionVerificationStatus.APPROVED,
                  verifiedBy: session.userId,
                  reviewNotes: null,
                }
              : {}),
        },
      })
    } else {
      const highestOrder = await prisma.quizQuestion.findFirst({
        where: { quizId },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      })
      const nextOrder = (highestOrder?.orderIndex ?? 0) + 1

      await prisma.quizQuestion.create({
        data: {
          id: randomUUID(),
          quizId,
          question: question.trim(),
          options: JSON.stringify(options),
          correctIndex,
          explanation: explanation ? explanation.trim() : null,
          points,
          regionalLanguage,
          wiseSayingText: wiseSayingText ? wiseSayingText.trim() : null,
          wiseSayingMeaning: wiseSayingMeaning ? wiseSayingMeaning.trim() : null,
          referenceSource: referenceSource ? referenceSource.trim() : null,
          audioUrl: audioUrl ? audioUrl.trim() : null,
          verificationStatus: isGuru
            ? QuestionVerificationStatus.PENDING_REVIEW
            : QuestionVerificationStatus.APPROVED,
          createdBy: session.userId,
          verifiedBy: isGuru ? null : session.userId,
          orderIndex: nextOrder,
        },
      })
    }

    revalidatePath(`/admin/kuis/${quizId}/soal`)
    revalidatePath(`/guru/kuis/${quizId}/soal`)
    revalidatePath("/admin/kuis")
    revalidatePath("/guru/kuis")
    revalidatePath("/admin/verifikasi-soal")
    revalidatePath("/siswa/kuis")
    revalidatePath("/", "layout")
    return {
      success: true,
      message: isGuru
        ? "Butir soal berhasil diajukan dan menunggu verifikasi Admin"
        : "Butir soal berhasil disimpan & tayang",
    }
  } catch (error) {
    console.error("Gagal simpan butir soal:", error)
    return { success: false, error: "Gagal menyimpan butir soal" }
  }
}

export async function deleteQuizQuestion(questionId: string, quizId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.GURU)) {
    return { success: false, error: "Akses tidak diizinkan untuk menghapus butir soal" }
  }

  try {
    if (session.role === Role.GURU) {
      const existing = await prisma.quizQuestion.findUnique({
        where: { id: questionId },
        select: { createdBy: true },
      })
      if (!existing || existing.createdBy !== session.userId) {
        return { success: false, error: "Anda hanya dapat menghapus butir soal yang Anda ajukan sendiri" }
      }
    }

    await prisma.quizQuestion.delete({ where: { id: questionId } })
    revalidatePath(`/admin/kuis/${quizId}/soal`)
    revalidatePath(`/guru/kuis/${quizId}/soal`)
    revalidatePath("/admin/kuis")
    revalidatePath("/guru/kuis")
    revalidatePath("/admin/verifikasi-soal")
    revalidatePath("/siswa/kuis")
    revalidatePath("/", "layout")
    return { success: true, message: "Butir soal berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus butir soal" }
  }
}

const importedQuizQuestionRowSchema = z.object({
  question: z.string().min(3, "Teks pertanyaan minimal 3 karakter"),
  options: z.array(z.string().min(1)).length(4, "Setiap soal harus memiliki 4 pilihan jawaban"),
  correctIndex: z.coerce.number().int().min(0).max(3),
  explanation: z.string().optional().nullable(),
  points: z.coerce.number().int().min(1).max(1000).optional(),
  regionalLanguage: z.string().trim().max(50).optional().nullable(),
  wiseSayingText: z.string().optional().nullable(),
  wiseSayingMeaning: z.string().optional().nullable(),
  referenceSource: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
})

export async function importQuizQuestionsAction(
  quizId: string,
  questionsJson: string
): Promise<ActionState & { count?: number }> {
  const session = await getSession()
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.GURU)) {
    return { success: false, error: "Hanya Guru atau Admin yang berwenang mengimpor soal" }
  }

  const isGuru = session.role === Role.GURU

  if (!quizId) {
    return { success: false, error: "ID Kuis tidak ditemukan" }
  }

  let rawItems: unknown
  try {
    rawItems = JSON.parse(questionsJson)
  } catch {
    return { success: false, error: "Format data butir soal tidak valid (JSON error)" }
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { success: false, error: "Daftar butir soal kosong" }
  }
  if (rawItems.length > 500) {
    return { success: false, error: "Maksimal 500 butir soal per sekali impor" }
  }

  try {
    const targetQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true },
    })
    if (!targetQuiz) {
      return { success: false, error: "Paket kuis tujuan tidak ditemukan" }
    }

    const highestOrder = await prisma.quizQuestion.findFirst({
      where: { quizId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    })
    let currentOrder = highestOrder?.orderIndex ?? 0

    const validatedRows: Array<z.infer<typeof importedQuizQuestionRowSchema>> = []
    for (let i = 0; i < rawItems.length; i++) {
      const parsedRow = importedQuizQuestionRowSchema.safeParse(rawItems[i])
      if (!parsedRow.success) {
        return {
          success: false,
          error: `Baris soal ke-${i + 1} tidak valid: ${parsedRow.error.errors[0]?.message ?? "periksa format kolom"}`,
        }
      }
      validatedRows.push(parsedRow.data)
    }

    const createData = validatedRows.map((item) => {
      currentOrder += 1
      const cleanQuestion = sanitizePlainText(item.question, 2000)
      const cleanOptions = item.options.map((opt) => sanitizePlainText(opt, 500))
      const cleanExplanation = item.explanation ? sanitizePlainText(item.explanation, 2000) : null
      const cleanWiseText = item.wiseSayingText ? sanitizePlainText(item.wiseSayingText, 1000) : null
      const cleanWiseMeaning = item.wiseSayingMeaning
        ? sanitizePlainText(item.wiseSayingMeaning, 1000)
        : null
      const cleanRefSource = item.referenceSource ? sanitizePlainText(item.referenceSource, 255) : null

      return {
        id: randomUUID(),
        quizId,
        question: cleanQuestion,
        options: JSON.stringify(cleanOptions),
        correctIndex: item.correctIndex,
        explanation: cleanExplanation || null,
        points: item.points && item.points > 0 ? item.points : 10,
        regionalLanguage: item.regionalLanguage || null,
        wiseSayingText: cleanWiseText || null,
        wiseSayingMeaning: cleanWiseMeaning || null,
        referenceSource: cleanRefSource || null,
        audioUrl: sanitizeAudioUrl(item.audioUrl),
        verificationStatus: isGuru
          ? QuestionVerificationStatus.PENDING_REVIEW
          : QuestionVerificationStatus.APPROVED,
        createdBy: session.userId,
        verifiedBy: isGuru ? null : session.userId,
        orderIndex: currentOrder,
      }
    })

    await prisma.quizQuestion.createMany({
      data: createData,
    })

    revalidatePath(`/admin/kuis/${quizId}/soal`)
    revalidatePath(`/guru/kuis/${quizId}/soal`)
    revalidatePath("/admin/kuis")
    revalidatePath("/guru/kuis")
    revalidatePath("/admin/verifikasi-soal")
    revalidatePath("/siswa/kuis")
    revalidatePath("/", "layout")
    return {
      success: true,
      message: isGuru
        ? `Berhasil mengimpor ${createData.length} soal pengajuan! Menunggu verifikasi Admin.`
        : `Berhasil mengimpor ${createData.length} butir soal ke kuis!`,
      count: createData.length,
    }
  } catch (error) {
    console.error("Gagal impor soal:", error)
    return { success: false, error: "Gagal menyimpan daftar soal ke database" }
  }
}

const verifyQuestionSchema = z.object({
  questionId: z.string().min(1, "ID soal diperlukan"),
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional(),
  question: z.string().optional(),
  options: z.array(z.string()).length(4).optional(),
  correctIndex: z.number().min(0).max(3).optional(),
  explanation: z.string().nullable().optional(),
  points: z.number().min(1).optional(),
  regionalLanguage: z.string().trim().max(50).nullable().optional(),
  wiseSayingText: z.string().nullable().optional(),
  wiseSayingMeaning: z.string().nullable().optional(),
  referenceSource: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
})

export async function verifyQuizQuestionAction(input: {
  questionId: string
  decision: "APPROVED" | "REJECTED"
  reviewNotes?: string
  question?: string
  options?: string[]
  correctIndex?: number
  explanation?: string | null
  points?: number
  regionalLanguage?: RegionalLanguage | null
  wiseSayingText?: string | null
  wiseSayingMeaning?: string | null
  referenceSource?: string | null
  audioUrl?: string | null
}): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin Balai Bahasa yang berwenang memverifikasi soal" }
  }

  const parsed = verifyQuestionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Input verifikasi tidak valid" }
  }

  const data = parsed.data
  if (data.decision === "REJECTED" && (!data.reviewNotes || !data.reviewNotes.trim())) {
    return { success: false, error: "Catatan revisi wajib diisi saat menolak/meminta revisi soal" }
  }

  try {
    const existing = await prisma.quizQuestion.findUnique({
      where: { id: data.questionId },
      select: { id: true, quizId: true },
    })
    if (!existing) {
      return { success: false, error: "Butir soal tidak ditemukan" }
    }

    await prisma.quizQuestion.update({
      where: { id: data.questionId },
      data: {
        verificationStatus:
          data.decision === "APPROVED"
            ? QuestionVerificationStatus.APPROVED
            : QuestionVerificationStatus.REJECTED,
        verifiedBy: session.userId,
        reviewNotes: data.decision === "REJECTED" ? data.reviewNotes!.trim() : null,
        ...(data.question !== undefined ? { question: data.question.trim() } : {}),
        ...(data.options !== undefined
          ? { options: JSON.stringify(data.options.map((o) => o.trim())) }
          : {}),
        ...(data.correctIndex !== undefined ? { correctIndex: data.correctIndex } : {}),
        ...(data.explanation !== undefined
          ? { explanation: data.explanation ? data.explanation.trim() : null }
          : {}),
        ...(data.points !== undefined ? { points: data.points } : {}),
        ...(data.regionalLanguage !== undefined ? { regionalLanguage: data.regionalLanguage } : {}),
        ...(data.wiseSayingText !== undefined
          ? { wiseSayingText: data.wiseSayingText ? data.wiseSayingText.trim() : null }
          : {}),
        ...(data.wiseSayingMeaning !== undefined
          ? { wiseSayingMeaning: data.wiseSayingMeaning ? data.wiseSayingMeaning.trim() : null }
          : {}),
        ...(data.referenceSource !== undefined
          ? { referenceSource: data.referenceSource ? data.referenceSource.trim() : null }
          : {}),
        ...(data.audioUrl !== undefined
          ? { audioUrl: data.audioUrl ? data.audioUrl.trim() : null }
          : {}),
      },
    })

    revalidatePath("/admin/verifikasi-soal")
    revalidatePath(`/admin/kuis/${existing.quizId}/soal`)
    revalidatePath(`/guru/kuis/${existing.quizId}/soal`)
    revalidatePath("/admin/kuis")
    revalidatePath("/guru/kuis")
    revalidatePath("/siswa/kuis")
    revalidatePath("/siswa")
    revalidatePath("/", "layout")

    return {
      success: true,
      message:
        data.decision === "APPROVED"
          ? "Soal berhasil disetujui dan diterbitkan ke kuis siswa!"
          : "Soal dikembalikan ke Guru untuk revisi dengan catatan.",
    }
  } catch (error) {
    console.error("Gagal memverifikasi soal:", error)
    return { success: false, error: "Gagal menyimpan keputusan verifikasi soal" }
  }
}

// ---------------------------
// ADMIN & AHLI BAHASA: KAMUS BESAR KEARIFAN LOKAL SULAWESI TENGAH
// ---------------------------
const characterMatrixSchema = z.object({
  id: z.coerce.number().optional(),
  indonesianCharacter: z.string().min(2, "Nilai karakter padanan minimal 2 karakter"),
  regionalLanguage: z.string().trim().min(2, "Bahasa daerah wajib dipilih").max(50),
  regionalTerm: z.string().min(2, "Kosakata atau ungkapan daerah minimal 2 karakter"),
  characterSource: z.string().min(3, "Makna filosofis / sumber rujukan minimal 3 karakter"),
  implementation: z.string().min(5, "Contoh penerapan minimal 5 karakter"),
  audioUrl: z.string().optional().nullable(),
})

type CharacterMatrixData = {
  id?: number
  indonesianCharacter: string
  regionalLanguage: string
  regionalTerm: string
  characterSource: string
  implementation: string
  audioUrl?: string | null
}

async function isAuthorizedDictionaryEditor(userId: string, role: string): Promise<boolean> {
  if (role === Role.ADMIN) return true
  if (role === Role.AHLI_BAHASA) {
    const u = await prisma.masterUser.findUnique({
      where: { id: userId },
      select: { isActive: true, expertStatus: true },
    })
    return Boolean(u?.isActive && u.expertStatus === ExpertVerificationStatus.APPROVED)
  }
  return false
}

export async function saveCharacterMatrixAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || !(await isAuthorizedDictionaryEditor(session.userId, session.role))) {
    return {
      success: false,
      error: "Hanya Admin BBPST atau Ahli Bahasa Daerah terverifikasi yang berwenang menyunting kamus.",
    }
  }

  const idVal = formData.get("id") as string | undefined
  const raw = {
    id: idVal ? parseInt(idVal, 10) : undefined,
    indonesianCharacter: formData.get("indonesianCharacter"),
    regionalLanguage: formData.get("regionalLanguage"),
    regionalTerm: formData.get("regionalTerm"),
    characterSource: formData.get("characterSource"),
    implementation: formData.get("implementation"),
    audioUrl: (formData.get("audioUrl") as string) || null,
  }

  const parsed = characterMatrixSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Masukan tidak valid." }
  }

  const matrixData = parsed.data as CharacterMatrixData
  const normalizedLangCode = sanitizePlainText(matrixData.regionalLanguage, 50).toUpperCase()

  try {
    const activeLangs = await getActiveRegionalLanguages()
    const validCodes = new Set(activeLangs.map((l) => l.code.toUpperCase()))
    if (!validCodes.has(normalizedLangCode)) {
      return { success: false, error: `Kode bahasa daerah '${normalizedLangCode}' belum terdaftar.` }
    }

    if (matrixData.id) {
      await prisma.characterMatrix.update({
        where: { id: matrixData.id },
        data: {
          indonesianCharacter: sanitizePlainText(matrixData.indonesianCharacter, 150),
          regionalLanguage: normalizedLangCode,
          regionalTerm: sanitizePlainText(matrixData.regionalTerm, 200),
          characterSource: sanitizePlainText(matrixData.characterSource, 2000),
          implementation: sanitizePlainText(matrixData.implementation, 2000),
          audioUrl: sanitizeAudioUrl(matrixData.audioUrl),
        },
      })
    } else {
      await prisma.characterMatrix.create({
        data: {
          indonesianCharacter: sanitizePlainText(matrixData.indonesianCharacter, 150),
          regionalLanguage: normalizedLangCode,
          regionalTerm: sanitizePlainText(matrixData.regionalTerm, 200),
          characterSource: sanitizePlainText(matrixData.characterSource, 2000),
          implementation: sanitizePlainText(matrixData.implementation, 2000),
          audioUrl: sanitizeAudioUrl(matrixData.audioUrl),
          createdBy: session.userId,
        },
      })
    }

    revalidatePath("/admin/matriks-karakter")
    revalidatePath("/ahli-bahasa")
    revalidatePath("/ahli-bahasa/kamus")
    revalidatePath("/siswa/budaya-bahasa")
    revalidatePath("/siswa")
    return { success: true, message: "Entri Kamus Besar Kearifan Lokal berhasil disimpan." }
  } catch (error) {
    console.error("Gagal simpan entri kamus:", error)
    return { success: false, error: "Gagal menyimpan entri Kamus Besar Kearifan Lokal." }
  }
}

export async function deleteCharacterMatrixAction(matrixId: number): Promise<ActionState> {
  const session = await getSession()
  if (!session || !(await isAuthorizedDictionaryEditor(session.userId, session.role))) {
    return {
      success: false,
      error: "Hanya Admin BBPST atau Ahli Bahasa Daerah terverifikasi yang berwenang menghapus entri kamus.",
    }
  }

  try {
    await prisma.characterMatrix.delete({
      where: { id: matrixId },
    })
    revalidatePath("/admin/matriks-karakter")
    revalidatePath("/ahli-bahasa")
    revalidatePath("/ahli-bahasa/kamus")
    revalidatePath("/siswa/budaya-bahasa")
    revalidatePath("/siswa")
    return { success: true, message: "Entri kamus berhasil dihapus." }
  } catch {
    return { success: false, error: "Gagal menghapus entri kamus." }
  }
}

const importedMatrixRowSchema = z.object({
  indonesianCharacter: z.string().min(1, "Nilai karakter wajib diisi"),
  regionalLanguage: z.string().min(1, "Kode bahasa daerah wajib diisi"),
  regionalTerm: z.string().min(1, "Istilah daerah wajib diisi"),
  characterSource: z.string().optional().nullable(),
  implementation: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
})

export async function importCharacterMatrixAction(
  matricesJson: string
): Promise<ActionState & { count?: number }> {
  const session = await getSession()
  if (!session || !(await isAuthorizedDictionaryEditor(session.userId, session.role))) {
    return {
      success: false,
      error: "Hanya Admin BBPST atau Ahli Bahasa Daerah terverifikasi yang berwenang mengimpor entri kamus.",
    }
  }

  let rawItems: unknown
  try {
    rawItems = JSON.parse(matricesJson)
  } catch {
    return { success: false, error: "Format data tidak valid (JSON error)" }
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { success: false, error: "Data impor kamus kosong" }
  }
  if (rawItems.length > 500) {
    return { success: false, error: "Maksimal 500 baris entri per sekali impor" }
  }

  try {
    const activeLangs = await getActiveRegionalLanguages()
    const validLanguages = new Set(activeLangs.map((l) => l.code.toUpperCase()))
    const validData: Array<{
      indonesianCharacter: string
      regionalLanguage: string
      regionalTerm: string
      characterSource: string
      implementation: string
      audioUrl: string | null
      createdBy: string
    }> = []

    for (const rawRow of rawItems) {
      const parsedRow = importedMatrixRowSchema.safeParse(rawRow)
      if (!parsedRow.success) continue
      const item = parsedRow.data

      const langUpper = sanitizePlainText(item.regionalLanguage, 50).toUpperCase()
      if (!validLanguages.has(langUpper)) continue

      const cleanIndo = sanitizePlainText(item.indonesianCharacter, 150)
      const cleanTerm = sanitizePlainText(item.regionalTerm, 200)
      if (!cleanIndo || !cleanTerm) continue

      validData.push({
        indonesianCharacter: cleanIndo,
        regionalLanguage: langUpper,
        regionalTerm: cleanTerm,
        characterSource: sanitizePlainText(item.characterSource || "-", 1500) || "-",
        implementation: sanitizePlainText(item.implementation || "-", 1500) || "-",
        audioUrl: sanitizeAudioUrl(item.audioUrl),
        createdBy: session.userId,
      })
    }

    if (validData.length === 0) {
      return { success: false, error: "Tidak ada baris data yang valid untuk diimpor" }
    }

    await prisma.characterMatrix.createMany({
      data: validData,
    })

    revalidatePath("/admin/matriks-karakter")
    revalidatePath("/ahli-bahasa/kamus")
    revalidatePath("/siswa/budaya-bahasa")
    revalidatePath("/siswa")
    return {
      success: true,
      message: `Berhasil mengimpor ${validData.length} entri Kamus Besar Kearifan Lokal.`,
      count: validData.length,
    }
  } catch (error) {
    console.error("Gagal impor matriks karakter:", error)
    return { success: false, error: "Gagal menyimpan data matriks karakter ke database" }
  }
}

// ---------------------------
// ADMIN: SEKOLAH CRUD
// ---------------------------
const schoolSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama sekolah minimal 2 karakter"),
  npsn: z.string().length(8, "NPSN harus 8 karakter"),
  regencyId: z.string().min(1, "Kabupaten/Kota wajib dipilih"),
  address: z.string().min(3, "Alamat wajib diisi"),
  phone: z.string().min(5, "Nomor telepon wajib diisi"),
  isActive: z.boolean().default(true),
})

export async function saveSchool(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin yang dapat mengelola sekolah" }
  }

  const id = (formData.get("id") as string) || undefined
  const raw = {
    id,
    name: formData.get("name"),
    npsn: formData.get("npsn"),
    regencyId: formData.get("regencyId"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    isActive: formData.get("isActive") !== "false",
  }

  const parsed = schoolSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Input tidak valid" }
  }

  try {
    if (parsed.data.id) {
      await prisma.masterSchool.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          npsn: parsed.data.npsn,
          regencyId: parsed.data.regencyId,
          address: parsed.data.address,
          phone: parsed.data.phone,
          isActive: parsed.data.isActive,
        },
      })
    } else {
      await prisma.masterSchool.create({
        data: {
          id: randomUUID(),
          name: parsed.data.name,
          npsn: parsed.data.npsn,
          regencyId: parsed.data.regencyId,
          address: parsed.data.address,
          phone: parsed.data.phone,
          isActive: parsed.data.isActive,
        },
      })
    }

    revalidateTag("master_schools")
    revalidatePath("/admin/sekolah")
    return { success: true, message: "Data sekolah berhasil disimpan" }
  } catch (error) {
    console.error("Gagal simpan sekolah:", error)
    return { success: false, error: "Gagal menyimpan sekolah (NPSN mungkin sudah dipakai)" }
  }
}

export async function deleteSchool(schoolId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin yang diizinkan" }
  }

  try {
    await prisma.masterSchool.delete({ where: { id: schoolId } })
    revalidateTag("master_schools")
    revalidatePath("/admin/sekolah")
    return { success: true, message: "Sekolah berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus sekolah" }
  }
}

// ---------------------------
// ADMIN: PENGGUNA CRUD
// ---------------------------
const userAdminSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().optional(),
  role: z.nativeEnum(Role),
  schoolId: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
  nisn: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function saveUserAdmin(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin yang diizinkan" }
  }

  const id = (formData.get("id") as string) || undefined
  const password = formData.get("password") as string
  const raw = {
    id,
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: password || undefined,
    role: formData.get("role"),
    schoolId: (formData.get("schoolId") as string) || null,
    classId: (formData.get("classId") as string) || null,
    nisn: (formData.get("nisn") as string) || null,
    nip: (formData.get("nip") as string) || null,
    isActive: formData.get("isActive") !== "false",
  }

  const parsed = userAdminSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Input tidak valid" }
  }

  try {
    if (parsed.data.id) {
      const updateData: any = {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        role: parsed.data.role,
        schoolId: parsed.data.schoolId,
        classId: parsed.data.classId,
        nisn: parsed.data.nisn,
        nip: parsed.data.nip,
        isActive: parsed.data.isActive,
        ...(parsed.data.role === Role.AHLI_BAHASA && parsed.data.isActive
          ? { expertStatus: ExpertVerificationStatus.APPROVED }
          : {}),
      }
      if (parsed.data.password && parsed.data.password.length >= 6) {
        updateData.passwordHash = await hashPassword(parsed.data.password)
      }
      await prisma.masterUser.update({
        where: { id: parsed.data.id },
        data: updateData,
      })
    } else {
      if (!parsed.data.password || parsed.data.password.length < 6) {
        return { success: false, error: "Kata sandi minimal 6 karakter untuk pengguna baru" }
      }
      const passwordHash = await hashPassword(parsed.data.password)
      await prisma.masterUser.create({
        data: {
          id: randomUUID(),
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          passwordHash,
          role: parsed.data.role,
          schoolId: parsed.data.schoolId,
          classId: parsed.data.classId,
          nisn: parsed.data.nisn,
          nip: parsed.data.nip,
          isActive: parsed.data.isActive,
          emailVerified: true,
          ...(parsed.data.role === Role.AHLI_BAHASA
            ? {
                expertStatus: parsed.data.isActive
                  ? ExpertVerificationStatus.APPROVED
                  : ExpertVerificationStatus.PENDING_EXPERT,
              }
            : {}),
        },
      })
    }

    revalidatePath("/admin/pengguna")
    return { success: true, message: "Pengguna berhasil disimpan" }
  } catch (error) {
    console.error("Gagal simpan pengguna:", error)
    return { success: false, error: "Gagal menyimpan pengguna (Email/NISN/NIP mungkin duplikat)" }
  }
}

export async function deleteUserAdmin(userId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin yang diizinkan" }
  }

  try {
    await prisma.masterUser.delete({ where: { id: userId } })
    revalidatePath("/admin/pengguna")
    return { success: true, message: "Pengguna berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus pengguna" }
  }
}

// ---------------------------
// ADMIN: MODERASI TOGGLE STATUS
// ---------------------------
export async function toggleMaterialPublish(materialId: string, isPublished: boolean): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin yang diizinkan" }
  }

  try {
    await prisma.learningMaterial.update({
      where: { id: materialId },
      data: { isPublished },
    })
    revalidatePath("/admin/konten")
    revalidatePath("/siswa/materi")
    return { success: true, message: `Status materi diperbarui menjadi ${isPublished ? "Terbit" : "Draft"}` }
  } catch {
    return { success: false, error: "Gagal memperbarui status publikasi materi" }
  }
}

export async function toggleQuizPublish(quizId: string, isPublished: boolean): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return { success: false, error: "Hanya Admin yang diizinkan" }
  }

  try {
    await prisma.quiz.update({
      where: { id: quizId },
      data: { isPublished },
    })
    revalidatePath("/admin/konten")
    revalidatePath("/siswa/kuis")
    return { success: true, message: `Status kuis diperbarui menjadi ${isPublished ? "Terbit" : "Draft"}` }
  } catch {
    return { success: false, error: "Gagal memperbarui status publikasi kuis" }
  }
}

// ---------------------------
// ADMIN & AHLI BAHASA: MASTER BAHASA DAERAH DINAMIS
// ---------------------------
const regionalLanguageSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .trim()
    .min(2, "Kode bahasa minimal 2 huruf")
    .max(50, "Kode bahasa maksimal 50 karakter"),
  name: z.string().trim().min(3, "Nama bahasa daerah minimal 3 karakter").max(100),
  regencyCoverage: z.string().trim().min(2, "Cakupan wilayah kabupaten/kota wajib diisi").max(255),
  description: z.string().trim().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function saveRegionalLanguageAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || !(await isAuthorizedDictionaryEditor(session.userId, session.role))) {
    return {
      success: false,
      error: "Hanya Admin BBPST atau Ahli Bahasa Daerah terverifikasi yang berwenang mengelola daftar bahasa daerah.",
    }
  }

  const rawCode = sanitizePlainText(formData.get("code"), 50)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "")

  const raw = {
    id: (formData.get("id") as string) || undefined,
    code: rawCode,
    name: sanitizePlainText(formData.get("name"), 100),
    regencyCoverage: sanitizePlainText(formData.get("regencyCoverage"), 255),
    description: formData.get("description")
      ? sanitizePlainText(formData.get("description"), 1000)
      : null,
    isActive: formData.get("isActive") !== "false",
  }

  const parsed = regionalLanguageSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Masukan bahasa tidak valid." }
  }

  try {
    if (parsed.data.id) {
      await prisma.masterRegionalLanguage.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          regencyCoverage: parsed.data.regencyCoverage,
          description: parsed.data.description,
          isActive: parsed.data.isActive,
        },
      })
    } else {
      const existingCode = await prisma.masterRegionalLanguage.findUnique({
        where: { code: parsed.data.code },
        select: { id: true },
      })
      if (existingCode) {
        return {
          success: false,
          error: `Kode bahasa daerah "${parsed.data.code}" sudah terdaftar.`,
        }
      }
      await prisma.masterRegionalLanguage.create({
        data: {
          id: randomUUID(),
          code: parsed.data.code,
          name: parsed.data.name,
          regencyCoverage: parsed.data.regencyCoverage,
          description: parsed.data.description,
          isActive: parsed.data.isActive,
          createdBy: session.userId,
        },
      })
    }

    revalidatePath("/ahli-bahasa")
    revalidatePath("/ahli-bahasa/bahasa")
    revalidatePath("/ahli-bahasa/kamus")
    revalidatePath("/admin/matriks-karakter")
    revalidatePath("/admin/analitik")
    revalidatePath("/siswa")
    revalidatePath("/siswa/budaya-bahasa")
    return { success: true, message: "Daftar bahasa daerah berhasil disimpan." }
  } catch (err) {
    console.error("Gagal menyimpan bahasa daerah:", err)
    return { success: false, error: "Gagal menyimpan data bahasa daerah." }
  }
}

export async function toggleRegionalLanguageStatusAction(
  languageId: string,
  isActive: boolean
): Promise<ActionState> {
  const session = await getSession()
  if (!session || !(await isAuthorizedDictionaryEditor(session.userId, session.role))) {
    return { success: false, error: "Akses ditolak." }
  }

  try {
    await prisma.masterRegionalLanguage.update({
      where: { id: languageId },
      data: { isActive },
    })
    revalidatePath("/ahli-bahasa")
    revalidatePath("/ahli-bahasa/bahasa")
    revalidatePath("/admin/matriks-karakter")
    revalidatePath("/siswa")
    revalidatePath("/siswa/budaya-bahasa")
    return {
      success: true,
      message: isActive ? "Bahasa daerah diaktifkan." : "Bahasa daerah dinonaktifkan.",
    }
  } catch {
    return { success: false, error: "Gagal memperbarui status bahasa daerah." }
  }
}

// ---------------------------
// ADMIN BBPST: VERIFIKASI AHLI BAHASA DAERAH
// ---------------------------
const verifyExpertSchema = z.object({
  userId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().max(1000).optional(),
})

export async function verifyExpertApplicantAction(input: {
  userId: string
  decision: "APPROVED" | "REJECTED"
  reviewNotes?: string
}): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return {
      success: false,
      error: "Hanya Administrator BBPST yang berwenang memverifikasi Ahli Bahasa Daerah.",
    }
  }

  const parsed = verifyExpertSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Data verifikasi tidak valid." }
  }

  const { userId, decision, reviewNotes } = parsed.data
  if (decision === "REJECTED" && (!reviewNotes || !reviewNotes.trim())) {
    return {
      success: false,
      error: "Harap cantumkan alasan penolakan atau catatan perbaikan untuk pendaftar.",
    }
  }

  try {
    const target = await prisma.masterUser.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, role: true, expertLanguage: true },
    })
    if (!target || target.role !== Role.AHLI_BAHASA) {
      return { success: false, error: "Akun pendaftar Ahli Bahasa Daerah tidak ditemukan." }
    }

    await prisma.$transaction(async (tx) => {
      if (decision === "APPROVED") {
        await tx.masterUser.update({
          where: { id: userId },
          data: {
            isActive: true,
            expertStatus: ExpertVerificationStatus.APPROVED,
            expertReviewNotes: reviewNotes?.trim() || null,
            emailVerified: true,
          },
        })

        await tx.notification.create({
          data: {
            id: randomUUID(),
            userId,
            title: "Akun Ahli Bahasa Daerah Disetujui!",
            message:
              "Selamat! Pendaftaran Anda sebagai Ahli Bahasa Daerah telah diverifikasi dan disetujui oleh Admin BBPST. Anda kini dapat memperkaya Kamus Besar Kearifan Lokal Sulawesi Tengah.",
            type: "system",
            link: "/ahli-bahasa",
            isPriority: true,
          },
        })
      } else {
        await tx.masterUser.update({
          where: { id: userId },
          data: {
            isActive: false,
            expertStatus: ExpertVerificationStatus.REJECTED,
            expertReviewNotes: sanitizePlainText(reviewNotes, 1000),
          },
        })
      }
    })

    revalidatePath("/admin/verifikasi-ahli")
    revalidatePath("/admin/pengguna")
    revalidatePath("/admin")
    revalidatePath("/", "layout")
    return {
      success: true,
      message:
        decision === "APPROVED"
          ? `Akun ${target.fullName} resmi disetujui dan diaktifkan sebagai Ahli Bahasa Daerah.`
          : `Pengajuan ${target.fullName} telah ditolak dengan catatan alasan.`,
    }
  } catch (err) {
    console.error("Gagal memverifikasi ahli bahasa:", err)
    return { success: false, error: "Gagal memproses keputusan verifikasi Ahli Bahasa Daerah." }
  }
}

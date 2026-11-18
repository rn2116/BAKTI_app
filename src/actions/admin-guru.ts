"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"
import { Category, Role } from "@prisma/client"

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
    await prisma.masterClass.create({
      data: {
        id: randomUUID(),
        name: parsed.data.name,
        grade: parsed.data.grade,
        schoolId: parsed.data.schoolId,
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
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  content: z.string().min(10, "Isi konten minimal 10 karakter"),
  readingTime: z.coerce.number().min(1, "Estimasi waktu baca minimal 1 menit"),
  orderIndex: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
})

export async function saveMaterial(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.GURU && session.role !== Role.ADMIN)) {
    return { success: false, error: "Akses tidak diizinkan" }
  }

  const id = formData.get("id") as string | undefined
  const raw = {
    id: id || undefined,
    title: formData.get("title"),
    category: formData.get("category"),
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
          description: parsed.data.description,
          content: parsed.data.content,
          readingTime: parsed.data.readingTime,
          orderIndex: parsed.data.orderIndex,
          isPublished: parsed.data.isPublished,
          createdBy: session.userId,
        },
      })
    }

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
  if (!session || (session.role !== Role.GURU && session.role !== Role.ADMIN)) {
    return { success: false, error: "Akses tidak diizinkan" }
  }

  try {
    await prisma.learningMaterial.delete({ where: { id: materialId } })
    revalidatePath("/guru/materi")
    revalidatePath("/siswa/materi")
    revalidatePath("/admin/konten")
    return { success: true, message: "Materi berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus materi" }
  }
}

// ---------------------------
// GURU/ADMIN: KUIS & BANK SOAL CRUD
// ---------------------------
export async function saveQuizWithQuestions(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.GURU && session.role !== Role.ADMIN)) {
    return { success: false, error: "Akses tidak diizinkan" }
  }

  const id = formData.get("id") as string | undefined
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || ""
  const category = formData.get("category") as Category
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
    await prisma.$transaction(async (tx) => {
      let quizId = id
      if (quizId) {
        await tx.quiz.update({
          where: { id: quizId },
          data: {
            title,
            description,
            category,
            materialId: materialId || null,
            timeLimit,
            passingScore,
            xpReward,
            isPublished,
          },
        })
        // Hapus soal lama dan buat baru
        await tx.quizQuestion.deleteMany({ where: { quizId } })
      } else {
        quizId = randomUUID()
        await tx.quiz.create({
          data: {
            id: quizId,
            title,
            description,
            category,
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
            orderIndex: i + 1,
          },
        })
      }
    })

    revalidatePath("/guru/kuis")
    revalidatePath("/siswa/kuis")
    revalidatePath("/admin/konten")
    return { success: true, message: "Kuis dan bank soal berhasil disimpan" }
  } catch (error) {
    console.error("Gagal simpan kuis:", error)
    return { success: false, error: "Gagal menyimpan kuis" }
  }
}

export async function deleteQuiz(quizId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || (session.role !== Role.GURU && session.role !== Role.ADMIN)) {
    return { success: false, error: "Akses tidak diizinkan" }
  }

  try {
    await prisma.quiz.delete({ where: { id: quizId } })
    revalidatePath("/guru/kuis")
    revalidatePath("/siswa/kuis")
    revalidatePath("/admin/konten")
    return { success: true, message: "Kuis berhasil dihapus" }
  } catch (error) {
    return { success: false, error: "Gagal menghapus kuis" }
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

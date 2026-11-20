"use server"
import { randomUUID } from "crypto"
import { compare } from "bcryptjs"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { signToken, setAuthCookie, clearAuthCookie, hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { loginSchema, registerSchema } from "@/validations/auth"

type ActionState = { success: boolean; error?: string }

const ROLE_PATH: Record<string, string> = {
  SISWA: "/siswa",
  GURU: "/guru",
  ADMIN: "/admin",
}

export async function login(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  "use server"
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: "Isi semua field dengan benar" }
  }

  const { email, password } = parsed.data
  const hdrs = await headers()
  const ip = getClientIp(hdrs)
  const ipLimit = checkRateLimit(`login-ip:${ip}`, 25, 60_000)
  const emailLimit = checkRateLimit(`login:${ip}:${email.toLowerCase()}`, 10, 60_000)
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const waitSec = Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
    return {
      success: false,
      error: `Terlalu banyak percobaan masuk. Silakan coba lagi dalam ${waitSec} detik.`,
    }
  }

  let userId = ""
  let role = ""

  try {
    const user = await prisma.masterUser.findUnique({ where: { email } })
    if (!user || !(await compare(password, user.passwordHash))) {
      return { success: false, error: "Email atau kata sandi salah" }
    }
    if (!user.isActive) {
      return { success: false, error: "Akun Anda tidak aktif" }
    }
    userId = user.id
    role = user.role

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    await setAuthCookie(token)
  } catch {
    return { success: false, error: "Terjadi kesalahan pada server" }
  }

  redirect(ROLE_PATH[role] ?? "/siswa")
}

export async function register(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  "use server"
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    schoolId: formData.get("schoolId") as string,
    classId: formData.get("classId") as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: "Isi semua field dengan benar" }
  }

  const { fullName, email, password, schoolId, classId } = parsed.data
  const hdrs = await headers()
  const ip = getClientIp(hdrs)
  const regLimit = checkRateLimit(`register:${ip}`, 10, 5 * 60_000)
  if (!regLimit.allowed) {
    return {
      success: false,
      error: `Terlalu banyak percobaan pendaftaran. Silakan tunggu ${regLimit.retryAfterSeconds} detik.`,
    }
  }

  try {
    const exists = await prisma.masterUser.findUnique({ where: { email } })
    if (exists) {
      return { success: false, error: "Email sudah terdaftar" }
    }

    const passwordHash = await hashPassword(password)
    await prisma.masterUser.create({
      data: {
        id: randomUUID(),
        email,
        passwordHash,
        fullName,
        role: "SISWA",
        schoolId,
        classId,
        isActive: true,
        emailVerified: false,
      },
    })

    const created = await prisma.masterUser.findUnique({ where: { email } })
    if (!created) {
      return { success: false, error: "Gagal membuat akun" }
    }

    const token = await signToken({
      userId: created.id,
      email: created.email,
      role: created.role,
    })
    await setAuthCookie(token)
  } catch {
    return { success: false, error: "Gagal mendaftarkan akun" }
  }

  redirect("/siswa")
}

export async function logout(): Promise<never> {
  "use server"
  await clearAuthCookie()
  redirect("/masuk")
}

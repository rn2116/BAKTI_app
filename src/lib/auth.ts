import { cache } from "react"
import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"
import { signToken, verifyToken, type JWTPayload } from "./auth-token"

export { signToken, verifyToken, type JWTPayload }
const COOKIE_NAME = "bk_token"

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed)
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session) return null
  return prisma.masterUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      schoolId: true,
      classId: true,
      domicileRegency: true,
      participantCategory: true,
      institutionName: true,
      expertStatus: true,
      expertLanguage: true,
      xp: true,
      level: true,
      isActive: true,
    },
  })
})

export type AuthUser = Awaited<ReturnType<typeof getCurrentUser>>

export async function requireDashboardUser(allowedRole?: string) {
  const user = await getCurrentUser()
  if (!user || !user.isActive) {
    redirect("/api/auth/clear-session")
  }
  if (allowedRole && user.role !== allowedRole) {
    const dashMap: Record<string, string> = {
      SISWA: "/siswa",
      GURU: "/guru",
      ADMIN: "/admin",
      AHLI_BAHASA: "/ahli-bahasa",
    }
    redirect(dashMap[user.role] ?? "/api/auth/clear-session")
  }
  return user
}

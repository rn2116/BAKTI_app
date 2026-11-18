import { cache } from "react"
import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
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
      xp: true,
      level: true,
      isActive: true,
    },
  })
})

export type AuthUser = Awaited<ReturnType<typeof getCurrentUser>>

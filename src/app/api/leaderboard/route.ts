import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-token"
import { getOverallLeaderboard } from "@/services/quiz"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const scope = (searchParams.get("scope") ?? "global") as "global" | "school" | "class"

  const cookieHeader = request.headers.get("cookie")
  const token = cookieHeader
    ?.split("; ")
    .find((row) => row.startsWith("bk_token="))
    ?.split("=")[1]

  const payload = token ? await verifyToken(token) : null
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let schoolId: string | undefined
  let classId: string | undefined

  if (scope === "school" || scope === "class") {
    const user = await prisma.masterUser.findUnique({
      where: { id: payload.userId },
      select: { schoolId: true, classId: true },
    })
    schoolId = user?.schoolId ?? undefined
    classId = user?.classId ?? undefined
  }

  const data = await getOverallLeaderboard({
    scope,
    schoolId,
    classId,
    limit: 30,
  })

  return NextResponse.json(data)
}

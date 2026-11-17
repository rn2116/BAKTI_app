import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getLeaderboard } from "@/services/quiz"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const scope = searchParams.get("scope") ?? "global"
  const schoolId = searchParams.get("schoolId") ?? undefined
  const classId = searchParams.get("classId") ?? undefined

  const token = request.headers.get("cookie")?.split("bk_token=")[1]?.split(";")[0]
  const payload = token ? await verifyToken(token) : null
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await getLeaderboard({
    schoolId: scope === "school" ? schoolId : undefined,
    classId: scope === "class" ? classId : undefined,
    limit: 20,
  })

  const data = rows.map((r, i) => ({
    rank: i + 1,
    name: r.user.fullName,
    score: r.score,
    maxScore: r.maxScore,
  }))

  return NextResponse.json(data)
}

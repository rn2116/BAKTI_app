import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth-token"

const AUTH_ROUTES = ["/masuk", "/daftar"]
const DASHBOARD_PREFIX: Record<string, string> = {
  SISWA: "/siswa",
  GURU: "/guru",
  ADMIN: "/admin",
}

export const config = {
  matcher: [
    "/",
    "/masuk",
    "/daftar",
    "/siswa/:path*",
    "/guru/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/upload/:path*",
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("bk_token")?.value
  const payload = token ? await verifyToken(token) : null

  // Proteksi API Admin & Upload di level Middleware
  if (pathname.startsWith("/api/admin")) {
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/upload")) {
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (payload.role !== "ADMIN" && payload.role !== "GURU") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.next()
  }

  // Alur Halaman Root (/)
  if (pathname === "/") {
    if (!payload) {
      return NextResponse.redirect(new URL("/masuk", request.url))
    }
    return NextResponse.redirect(
      new URL(DASHBOARD_PREFIX[payload.role] ?? "/siswa", request.url)
    )
  }

  if (AUTH_ROUTES.includes(pathname)) {
    const isExpired = request.nextUrl.searchParams.get("expired") === "1"
    if (payload && !isExpired) {
      return NextResponse.redirect(
        new URL(DASHBOARD_PREFIX[payload.role] ?? "/siswa", request.url)
      )
    }
    return NextResponse.next()
  }

  if (!payload) {
    return NextResponse.redirect(new URL("/masuk", request.url))
  }

  const prefix = DASHBOARD_PREFIX[payload.role]
  if (!prefix || !pathname.startsWith(prefix)) {
    return NextResponse.redirect(new URL(prefix ?? "/siswa", request.url))
  }

  return NextResponse.next()
}

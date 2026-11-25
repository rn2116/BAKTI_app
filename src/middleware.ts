import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth-token"

const AUTH_ROUTES = ["/masuk", "/daftar"]
const DASHBOARD_PREFIX: Record<string, string> = {
  SISWA: "/siswa",
  GURU: "/guru",
  ADMIN: "/admin",
  AHLI_BAHASA: "/ahli-bahasa",
}

export const config = {
  matcher: [
    "/",
    "/masuk",
    "/daftar",
    "/siswa/:path*",
    "/guru/:path*",
    "/admin/:path*",
    "/ahli-bahasa/:path*",
    "/api/admin/:path*",
    "/api/upload/:path*",
    "/api/dokumen-ahli/:path*",
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("bk_token")?.value
  const payload = token ? await verifyToken(token) : null

  // Unggah dokumen bukti kepakaran saat pendaftaran mandiri (/daftar) diperbolehkan tanpa sesi login
  if (pathname.startsWith("/api/upload/dokumen-ahli")) {
    return NextResponse.next()
  }

  // Akses pratinjau dokumen kepakaran hanya untuk Admin BBPST
  if (pathname.startsWith("/api/dokumen-ahli")) {
    if (!payload) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 })
    }
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
    }
    return NextResponse.next()
  }

  // Proteksi API Admin di level Middleware
  if (pathname.startsWith("/api/admin")) {
    if (!payload) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 })
    }
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
    }
    return NextResponse.next()
  }

  // Proteksi API Upload Audio untuk Admin, Pendidik, dan Ahli Bahasa Daerah
  if (pathname.startsWith("/api/upload")) {
    if (!payload) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 })
    }
    if (
      payload.role !== "ADMIN" &&
      payload.role !== "GURU" &&
      payload.role !== "AHLI_BAHASA"
    ) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
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

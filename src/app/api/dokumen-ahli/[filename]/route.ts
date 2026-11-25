import { NextRequest, NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import path from "path"
import { getSession } from "@/lib/auth"
import { Role } from "@/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json(
      { error: "Akses ditolak. Hanya Admin BBPST yang berwenang melihat dokumen verifikasi." },
      { status: 403 }
    )
  }

  const { filename } = await context.params
  const safeName = path.basename(filename || "")
  if (!safeName || !/^[a-zA-Z0-9._-]+$/.test(safeName)) {
    return NextResponse.json({ error: "Nama berkas tidak valid." }, { status: 400 })
  }

  const ext = path.extname(safeName).toLowerCase()
  const contentType = MIME_MAP[ext]
  if (!contentType) {
    return NextResponse.json({ error: "Format berkas tidak didukung." }, { status: 400 })
  }

  const baseDir = path.resolve(process.cwd(), "public", "uploads", "dokumen-ahli")
  const targetPath = path.resolve(baseDir, safeName)
  if (!targetPath.startsWith(`${baseDir}${path.sep}`)) {
    return NextResponse.json({ error: "Jalur berkas tidak valid." }, { status: 400 })
  }

  try {
    const fileStat = await stat(targetPath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 })
    }
    const buf = await readFile(targetPath)
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buf.length),
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch {
    return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 })
  }
}

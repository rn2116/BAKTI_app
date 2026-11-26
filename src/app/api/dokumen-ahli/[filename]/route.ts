import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readStoredFile } from "@/lib/file-storage"
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
  if (!session) {
    return NextResponse.json(
      { error: "Sesi tidak valid. Silakan masuk terlebih dahulu." },
      { status: 401 }
    )
  }

  const { filename } = await context.params
  const safeName = path.basename(filename || "")
  if (!safeName || !/^[a-zA-Z0-9._-]+$/.test(safeName)) {
    return NextResponse.json({ error: "Nama berkas tidak valid." }, { status: 400 })
  }

  const isAdmin = session.role === Role.ADMIN
  let isOwnerExpert = false

  if (session.role === Role.AHLI_BAHASA) {
    const owner = await prisma.masterUser.findUnique({
      where: { id: session.userId },
      select: { expertProofFileUrl: true },
    })
    isOwnerExpert = owner?.expertProofFileUrl === `/api/dokumen-ahli/${safeName}`
  }

  if (!isAdmin && !isOwnerExpert) {
    return NextResponse.json(
      { error: "Akses ditolak. Anda hanya berwenang melihat dokumen bukti kepakaran milik sendiri atau sebagai Admin BBPST." },
      { status: 403 }
    )
  }

  const ext = path.extname(safeName).toLowerCase()
  const contentType = MIME_MAP[ext]
  if (!contentType) {
    return NextResponse.json({ error: "Format berkas tidak didukung." }, { status: 400 })
  }

  try {
    const buf = await readStoredFile("dokumen-ahli", safeName)
    if (!buf) {
      return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 })
    }
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

import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { getSession } from "@/lib/auth"
import { Role } from "@/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".webm", ".m4a", ".aac"])

function resolveExtension(fileName: string, mimeType: string): string {
  const ext = path.extname(fileName || "").toLowerCase()
  if (ALLOWED_EXTENSIONS.has(ext)) return ext
  if (mimeType.includes("webm")) return ".webm"
  if (mimeType.includes("wav")) return ".wav"
  if (mimeType.includes("ogg")) return ".ogg"
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return ".m4a"
  return ".mp3"
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.GURU)) {
    return NextResponse.json(
      { success: false, error: "Akses ditolak. Hanya Guru atau Admin yang dapat mengunggah audio." },
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Berkas audio tidak ditemukan pada permintaan." },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Berkas audio kosong." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Ukuran berkas audio maksimal 10 MB." },
        { status: 400 }
      )
    }

    const ext = resolveExtension(file.name, file.type || "")
    if (!file.type.startsWith("audio/") && !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: "Format berkas harus berupa audio (.mp3, .wav, .ogg, .webm)." },
        { status: 400 }
      )
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "audio")
    await mkdir(uploadDir, { recursive: true })

    const safeFilename = `audio-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
    const targetPath = path.join(uploadDir, safeFilename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(targetPath, buffer)

    return NextResponse.json({
      success: true,
      url: `/api/audio/${safeFilename}`,
      publicPath: `/uploads/audio/${safeFilename}`,
      filename: safeFilename,
    })
  } catch (err) {
    console.error("Gagal mengunggah file audio:", err)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menyimpan berkas audio ke server." },
      { status: 500 }
    )
  }
}

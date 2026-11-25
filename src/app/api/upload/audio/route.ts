import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { getSession } from "@/lib/auth"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { Role } from "@/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // Maksimal 5 MB
const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".webm", ".m4a", ".aac"])
const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "video/webm",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
])

function resolveExtension(fileName: string, mimeType: string): string {
  const safeName = path.basename(fileName || "")
  const ext = path.extname(safeName).toLowerCase()
  if (ALLOWED_EXTENSIONS.has(ext)) return ext
  if (mimeType.includes("webm")) return ".webm"
  if (mimeType.includes("wav")) return ".wav"
  if (mimeType.includes("ogg")) return ".ogg"
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return ".m4a"
  if (mimeType.includes("aac")) return ".aac"
  return ".mp3"
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (
    !session ||
    (session.role !== Role.ADMIN &&
      session.role !== Role.GURU &&
      session.role !== Role.AHLI_BAHASA)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Akses ditolak. Hanya Guru, Ahli Bahasa Daerah, atau Admin yang dapat mengunggah audio.",
      },
      { status: 403 }
    )
  }

  const ip = getClientIp(request.headers)
  const rl = checkRateLimit(`upload-audio:${session.userId}:${ip}`, 15, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak unggahan audio. Silakan tunggu ${rl.retryAfterSeconds} detik.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      }
    )
  }

  try {
    const formData = await request.formData()
    const entry = formData.get("file")

    if (
      !entry ||
      typeof entry === "string" ||
      typeof (entry as Blob).arrayBuffer !== "function" ||
      typeof (entry as Blob).size !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Berkas audio tidak ditemukan pada permintaan." },
        { status: 400 }
      )
    }

    const file = entry as Blob & { name?: string }
    const originalName = typeof file.name === "string" && file.name ? file.name : "audio.mp3"

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Berkas audio kosong." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Ukuran berkas audio maksimal 5 MB." },
        { status: 400 }
      )
    }

    const normalizedMime = (file.type || "").split(";")[0].trim().toLowerCase()
    const rawExt = path.extname(path.basename(originalName)).toLowerCase()
    const isMimeAllowed = normalizedMime ? ALLOWED_MIME_TYPES.has(normalizedMime) : false
    const isExtAllowed = rawExt ? ALLOWED_EXTENSIONS.has(rawExt) : false

    if (!isMimeAllowed && !isExtAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Format berkas tidak diizinkan. Gunakan audio MP3, WAV, OGG, atau WebM.",
        },
        { status: 400 }
      )
    }

    const ext = resolveExtension(originalName, normalizedMime)
    const uploadDir = path.resolve(process.cwd(), "public", "uploads", "audio")
    await mkdir(uploadDir, { recursive: true })

    const safeFilename = `audio-${Date.now()}-${randomUUID()}${ext}`
    const targetPath = path.resolve(uploadDir, safeFilename)

    if (!targetPath.startsWith(`${uploadDir}${path.sep}`)) {
      return NextResponse.json(
        { success: false, error: "Jalur penyimpanan berkas tidak valid." },
        { status: 400 }
      )
    }

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

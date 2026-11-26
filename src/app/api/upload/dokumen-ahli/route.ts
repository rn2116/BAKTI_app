import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { randomUUID } from "crypto"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { saveStoredFile } from "@/lib/file-storage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_DOC_SIZE_BYTES = 5 * 1024 * 1024 // Maksimal 5 MB
const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png"])
const ALLOWED_MIMES = new Set(["application/pdf", "image/jpeg", "image/jpg", "image/png"])

const MIME_BY_EXT: Record<".pdf" | ".jpg" | ".png", string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".png": "image/png",
}

function detectMagicType(buffer: Buffer): ".pdf" | ".jpg" | ".png" | null {
  if (buffer.length < 4) return null
  // PDF: %PDF
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return ".pdf"
  }
  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return ".png"
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return ".jpg"
  }
  return null
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rl = checkRateLimit(`upload-dokumen-ahli:${ip}`, 10, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak unggahan dokumen. Silakan tunggu ${rl.retryAfterSeconds} detik.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
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
        { success: false, error: "Berkas bukti kepakaran tidak ditemukan pada permintaan." },
        { status: 400 }
      )
    }

    const file = entry as Blob & { name?: string }
    const originalName = typeof file.name === "string" && file.name ? file.name : "bukti.pdf"

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Berkas dokumen tidak boleh kosong." },
        { status: 400 }
      )
    }

    if (file.size > MAX_DOC_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Ukuran berkas bukti kepakaran maksimal 5 MB." },
        { status: 400 }
      )
    }

    const normalizedMime = (file.type || "").split(";")[0].trim().toLowerCase()
    const rawExt = path.extname(path.basename(originalName)).toLowerCase()

    if (
      (normalizedMime && !ALLOWED_MIMES.has(normalizedMime)) ||
      (rawExt && !ALLOWED_EXTENSIONS.has(rawExt))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Format berkas harus berupa PDF, JPG, atau PNG.",
        },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const detectedExt = detectMagicType(buffer)
    if (!detectedExt) {
      return NextResponse.json(
        {
          success: false,
          error: "Isi berkas tidak valid. Pastikan Anda mengunggah berkas PDF, JPG, atau PNG asli.",
        },
        { status: 400 }
      )
    }

    const safeFilename = `dokumen-${Date.now()}-${randomUUID()}${detectedExt}`
    await saveStoredFile({
      folder: "dokumen-ahli",
      safeFilename,
      buffer,
      contentType: MIME_BY_EXT[detectedExt],
    })

    return NextResponse.json({
      success: true,
      url: `/api/dokumen-ahli/${safeFilename}`,
      filename: safeFilename,
    })
  } catch (err) {
    console.error("Gagal mengunggah dokumen kepakaran:", err)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menyimpan berkas bukti kepakaran." },
      { status: 500 }
    )
  }
}

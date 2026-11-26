import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { readStoredFile } from "@/lib/file-storage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".webm": "audio/webm",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params
  const safeName = path.basename(filename || "")

  if (!safeName || !/^[a-zA-Z0-9._-]+$/.test(safeName)) {
    return NextResponse.json({ error: "Nama berkas audio tidak valid." }, { status: 400 })
  }

  const ext = path.extname(safeName).toLowerCase()
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream"

  try {
    const fileBuffer = await readStoredFile("audio", safeName)
    if (!fileBuffer) {
      return NextResponse.json({ error: "Berkas audio tidak ditemukan." }, { status: 404 })
    }

    const totalSize = fileBuffer.length
    const rangeHeader = request.headers.get("range")

    if (rangeHeader) {
      const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader)
      if (match) {
        const start = parseInt(match[1], 10)
        const end = match[2] ? Math.min(parseInt(match[2], 10), totalSize - 1) : totalSize - 1

        if (start >= totalSize || start > end) {
          return new NextResponse(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${totalSize}` },
          })
        }

        const chunk = fileBuffer.subarray(start, end + 1)
        return new NextResponse(new Uint8Array(chunk), {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunk.length),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      }
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(totalSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "Berkas audio tidak ditemukan." }, { status: 404 })
  }
}

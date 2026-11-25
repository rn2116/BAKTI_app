import { NextRequest, NextResponse } from "next/server"
import { createHash, randomUUID } from "crypto"
import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises"
import path from "path"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TTS_CACHE_DIR = path.resolve(process.cwd(), "public", "uploads", "tts-cache")
const ALLOWED_LANGS = new Set(["id", "en"])
const inFlightSynthesis = new Map<string, Promise<Buffer>>()

function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (!cleaned) return []
  if (cleaned.length <= maxLen) return [cleaned]

  const chunks: string[] = []
  let remaining = cleaned

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }

    const slice = remaining.slice(0, maxLen)
    let splitIdx = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf(", "),
      slice.lastIndexOf("; "),
      slice.lastIndexOf(" ")
    )
    if (splitIdx < 30) {
      splitIdx = maxLen
    }

    chunks.push(remaining.slice(0, splitIdx).trim())
    remaining = remaining.slice(splitIdx).trim()
  }

  return chunks.filter(Boolean)
}

async function synthesizeSpeechMp3(
  text: string,
  lang = "id"
): Promise<{ buffer: Buffer; cacheHit: boolean }> {
  const safeLang = ALLOWED_LANGS.has(lang.toLowerCase()) ? lang.toLowerCase() : "id"
  const normalizedText = text.replace(/\s+/g, " ").trim().slice(0, 2400)
  const hashKey = createHash("md5")
    .update(`${safeLang}:${normalizedText}`)
    .digest("hex")
  const cachePath = path.resolve(TTS_CACHE_DIR, `${hashKey}.mp3`)

  // 1. Cek cache berkas MD5 di server terlebih dahulu
  if (cachePath.startsWith(`${TTS_CACHE_DIR}${path.sep}`)) {
    try {
      const cached = await readFile(cachePath)
      if (cached.length > 0) {
        return { buffer: cached, cacheHit: true }
      }
    } catch {
      // Cache miss, lanjut sintesis upstream
    }
  }

  // 2. Deduplikasi permintaan serentak (singleflight) agar tidak terjadi race condition penulisan berkas
  const existingTask = inFlightSynthesis.get(hashKey)
  if (existingTask) {
    const sharedBuffer = await existingTask
    return { buffer: sharedBuffer, cacheHit: true }
  }

  const synthesisPromise = (async (): Promise<Buffer> => {
    const chunks = splitTextIntoChunks(normalizedText, 180)
    const buffers: Buffer[] = []

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
        safeLang
      )}&client=tw-ob&q=${encodeURIComponent(chunk)}`

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error(`TTS upstream error: ${res.status}`)
      }

      const arrayBuf = await res.arrayBuffer()
      buffers.push(Buffer.from(arrayBuf))
    }

    const combined = Buffer.concat(buffers)

    // Penulisan atomik melalui berkas sementara + rename() untuk mencegah korup saat konkurensi tinggi
    if (combined.length > 0 && cachePath.startsWith(`${TTS_CACHE_DIR}${path.sep}`)) {
      const tmpPath = `${cachePath}.${randomUUID()}.tmp`
      try {
        await mkdir(TTS_CACHE_DIR, { recursive: true })
        await writeFile(tmpPath, combined)
        await rename(tmpPath, cachePath)
      } catch {
        try {
          await unlink(tmpPath)
        } catch {
          // Abaikan kegagalan hapus berkas sementara
        }
      }
    }

    return combined
  })()

  inFlightSynthesis.set(hashKey, synthesisPromise)
  try {
    const combined = await synthesisPromise
    return { buffer: combined, cacheHit: false }
  } finally {
    inFlightSynthesis.delete(hashKey)
  }
}

function buildAudioResponse(buffer: Buffer, cacheHit: boolean): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.length),
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      "X-TTS-Cache": cacheHit ? "HIT" : "MISS",
    },
  })
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rl = checkRateLimit(`tts:${ip}`, 45, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan audio. Silakan tunggu sebentar." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    )
  }

  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text")?.trim() ?? ""
  const lang = searchParams.get("lang")?.trim() || "id"

  if (!text) {
    return NextResponse.json({ error: "Parameter teks audio kosong." }, { status: 400 })
  }

  try {
    const { buffer, cacheHit } = await synthesizeSpeechMp3(text, lang)
    return buildAudioResponse(buffer, cacheHit)
  } catch (err) {
    console.error("TTS synthesis gagal:", err)
    return NextResponse.json(
      { error: "Gagal menghasilkan suara pelafalan dari server TTS." },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rl = checkRateLimit(`tts:${ip}`, 45, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan audio. Silakan tunggu sebentar." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    )
  }

  try {
    const body = (await request.json()) as { text?: string; lang?: string }
    const text = body.text?.trim() ?? ""
    const lang = body.lang?.trim() || "id"

    if (!text) {
      return NextResponse.json({ error: "Teks audio wajib diisi." }, { status: 400 })
    }

    const { buffer, cacheHit } = await synthesizeSpeechMp3(text, lang)
    return buildAudioResponse(buffer, cacheHit)
  } catch (err) {
    console.error("TTS POST synthesis gagal:", err)
    return NextResponse.json(
      { error: "Gagal menghasilkan suara pelafalan dari server TTS." },
      { status: 502 }
    )
  }
}

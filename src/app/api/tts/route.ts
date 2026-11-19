import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

async function synthesizeSpeechMp3(text: string, lang = "id"): Promise<Buffer> {
  const limitedText = text.slice(0, 2400)
  const chunks = splitTextIntoChunks(limitedText, 180)
  const buffers: Buffer[] = []

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      lang
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

  return Buffer.concat(buffers)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text")?.trim() ?? ""
  const lang = searchParams.get("lang")?.trim() || "id"

  if (!text) {
    return NextResponse.json({ error: "Parameter teks audio kosong." }, { status: 400 })
  }

  try {
    const audioBuffer = await synthesizeSpeechMp3(text, lang)
    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    console.error("TTS synthesis gagal:", err)
    return NextResponse.json(
      { error: "Gagal menghasilkan suara pelafalan dari server TTS." },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string; lang?: string }
    const text = body.text?.trim() ?? ""
    const lang = body.lang?.trim() || "id"

    if (!text) {
      return NextResponse.json({ error: "Teks audio wajib diisi." }, { status: 400 })
    }

    const audioBuffer = await synthesizeSpeechMp3(text, lang)
    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    console.error("TTS POST synthesis gagal:", err)
    return NextResponse.json(
      { error: "Gagal menghasilkan suara pelafalan dari server TTS." },
      { status: 502 }
    )
  }
}

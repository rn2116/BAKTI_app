"use client"

import React from "react"
import { Bookmark, Info, BookOpen } from "lucide-react"

interface MaterialContentRendererProps {
  content: string
  className?: string
  fontSize?: "sm" | "base" | "lg"
  readSegmentCount?: number
  protectCopy?: boolean
  onCopyAttempt?: () => void
}

interface ContentBlock {
  type: "heading" | "callout" | "list" | "paragraph"
  title?: string
  items?: Array<{ term?: string; text: string }>
  text?: string
}

/**
 * Normalisasi konten mentah (HTML atau Markdown) menjadi teks bersih terstruktur
 */
function normalizeContentToBlocks(rawContent: string): ContentBlock[] {
  if (!rawContent) return []

  // 1. Transformasi tag HTML umum ke format teks bersih
  let normalized = rawContent
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n## $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n\n### $1\n\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n\n> $1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, "\n\n$1\n\n")
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, "\n\n$1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n")

  // Bersihkan tag HTML pembungkus inline yang tersisa namun pertahankan kontennya
  normalized = normalized
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    .replace(/<[^>]+>/g, "") // Hapus sisa tag HTML lain jika ada

  const rawParagraphs = normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  const blocks: ContentBlock[] = []

  for (let i = 0; i < rawParagraphs.length; i++) {
    const p = rawParagraphs[i]

    // 1. Cek apakah ini Subjudul Bagian (## atau ### atau baris pendek tanpa titik)
    if (p.startsWith("## ") || p.startsWith("### ")) {
      const title = p.replace(/^#+\s*/, "").trim()
      blocks.push({
        type: "heading",
        text: title,
      })
      continue
    }

    // Cek apakah judul tanpa tanda titik dan pendek (maks 60 karakter)
    const isHeadingLike =
      p.length < 60 &&
      !p.includes("\n") &&
      !p.endsWith(".") &&
      !p.startsWith("-") &&
      !p.startsWith("*") &&
      !p.startsWith(">") &&
      i < rawParagraphs.length - 1

    if (isHeadingLike) {
      blocks.push({
        type: "heading",
        text: p,
      })
      continue
    }

    // 2. Cek apakah ini Kotak Sorotan ("Contoh Aturan", "Catatan Penting", "Tips", atau > blockquote)
    const isCallout =
      p.startsWith(">") ||
      /^(\*\*)?(contoh aturan|catatan penting|tips literasi|falsafah lokal|perhatian)/i.test(
        p
      )

    if (isCallout) {
      const cleanText = p.replace(/^>\s*/, "").trim()
      let calloutTitle = "Catatan Penting"

      if (/contoh aturan/i.test(cleanText)) calloutTitle = "Contoh Aturan"
      else if (/tips literasi/i.test(cleanText)) calloutTitle = "Tips Literasi"
      else if (/falsafah/i.test(cleanText)) calloutTitle = "Kearifan Lokal"

      // Cek jika ada list di dalam callout
      const lines = cleanText.split("\n").map((l) => l.trim())
      const listItems: Array<{ term?: string; text: string }> = []
      let bodyText = ""

      lines.forEach((line) => {
        if (/^[-*•]|\d+\./.test(line)) {
          const itemContent = line.replace(/^[-*•]|\d+\.\s*/, "").trim()
          const colonIdx = itemContent.indexOf(":")
          if (colonIdx > 0 && colonIdx < 40) {
            listItems.push({
              term: itemContent.substring(0, colonIdx + 1).replace(/\*\*/g, ""),
              text: itemContent.substring(colonIdx + 1).trim(),
            })
          } else {
            listItems.push({ text: itemContent })
          }
        } else {
          if (!bodyText) bodyText = line
          else bodyText += " " + line
        }
      })

      blocks.push({
        type: "callout",
        title: calloutTitle,
        text: bodyText,
        items: listItems.length > 0 ? listItems : undefined,
      })
      continue
    }

    // 3. Cek apakah ini Daftar Poin (List)
    const lines = p.split("\n").map((l) => l.trim())
    const isList = lines.some((l) => /^[-*•]|\d+\./.test(l))

    if (isList) {
      const listItems: Array<{ term?: string; text: string }> = []
      lines.forEach((line) => {
        const itemContent = line.replace(/^[-*•]|\d+\.\s*/, "").trim()
        if (!itemContent) return

        const colonIdx = itemContent.indexOf(":")
        if (colonIdx > 0 && colonIdx < 45) {
          listItems.push({
            term: itemContent.substring(0, colonIdx + 1).replace(/\*\*/g, ""),
            text: itemContent.substring(colonIdx + 1).trim(),
          })
        } else {
          listItems.push({ text: itemContent })
        }
      })

      if (listItems.length > 0) {
        blocks.push({
          type: "list",
          items: listItems,
        })
        continue
      }
    }

    // 4. Paragraf biasa
    blocks.push({
      type: "paragraph",
      text: p,
    })
  }

  return blocks
}

/**
 * Helper untuk merender teks dengan penekanan bold (**text**)
 */
function renderInlineFormatted(text: string) {
  if (!text) return null
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-zinc-950">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="italic text-zinc-800">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

function groupBlocksIntoSegments(blocks: ContentBlock[]): ContentBlock[][] {
  if (blocks.length === 0) return []
  const segments: ContentBlock[][] = []
  let current: ContentBlock[] = []

  for (const block of blocks) {
    const shouldSplitAtHeading = block.type === "heading" && current.length > 0
    const shouldSplitForSize = current.length >= 3

    if (shouldSplitAtHeading || shouldSplitForSize) {
      segments.push(current)
      current = []
    }
    current.push(block)
  }

  if (current.length > 0) {
    segments.push(current)
  }

  return segments
}

export function MaterialContentRenderer({
  content,
  className = "",
  fontSize = "base",
  readSegmentCount,
  protectCopy = true,
  onCopyAttempt,
}: MaterialContentRendererProps) {
  const blocks = React.useMemo(() => normalizeContentToBlocks(content), [content])
  const segments = React.useMemo(() => groupBlocksIntoSegments(blocks), [blocks])

  const textSizeClass =
    fontSize === "sm"
      ? "text-[15px] sm:text-[16px]"
      : fontSize === "lg"
        ? "text-[18px] sm:text-[19px]"
        : "text-[16px] sm:text-[17px]"

  function renderBlock(block: ContentBlock, index: number) {
    if (block.type === "heading") {
      return (
        <div key={index} className="pt-2 first:pt-0">
          <h3 className="text-lg sm:text-xl font-black text-[#1E135E] pb-2 border-b border-zinc-200/80 flex items-center gap-2.5 font-sans tracking-tight">
            <Bookmark className="w-5 h-5 text-[#3C22BB] shrink-0" />
            <span>{block.text}</span>
          </h3>
        </div>
      )
    }

    if (block.type === "callout") {
      return (
        <div
          key={index}
          className="bg-indigo-50/70 border-l-4 border-[#3C22BB] p-4 sm:p-5 rounded-r-2xl my-4 text-zinc-850 shadow-2xs space-y-2.5 font-sans"
        >
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-[#3C22BB] uppercase tracking-wider">
            <Info className="w-4 h-4 text-[#3C22BB] shrink-0" />
            <span>{block.title ?? "Catatan Penting"}</span>
          </div>
          {block.text && (
            <p className="text-[15px] sm:text-[16px] text-zinc-800 leading-relaxed font-serif">
              {renderInlineFormatted(block.text)}
            </p>
          )}
          {block.items && block.items.length > 0 && (
            <ul className="space-y-2 pt-1 font-serif text-[15px] sm:text-[16px]">
              {block.items.map((it, itIdx) => (
                <li key={itIdx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3C22BB] mt-2 shrink-0" />
                  <div>
                    {it.term && (
                      <span className="font-bold text-zinc-950 mr-1.5 font-sans">
                        {it.term}
                      </span>
                    )}
                    <span className="text-zinc-800">
                      {renderInlineFormatted(it.text)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )
    }

    if (block.type === "list" && block.items) {
      return (
        <ul key={index} className="space-y-3 pl-2 sm:pl-3 my-4">
          {block.items.map((it, itIdx) => (
            <li key={itIdx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-100/70 text-[#3C22BB] flex items-center justify-center text-[10px] font-bold mt-1 shrink-0">
                {itIdx + 1}
              </div>
              <div className="text-[16px] sm:text-[17px] leading-relaxed text-zinc-800">
                {it.term && (
                  <span className="font-bold text-zinc-950 mr-1.5 font-sans">
                    {it.term}
                  </span>
                )}
                <span>{renderInlineFormatted(it.text)}</span>
              </div>
            </li>
          ))}
        </ul>
      )
    }

    return (
      <p
        key={index}
        className="leading-relaxed text-[16px] sm:text-[17px] text-zinc-800 text-justify sm:text-left"
      >
        {renderInlineFormatted(block.text ?? "")}
      </p>
    )
  }

  return (
    <div
      onCopy={(e) => {
        if (protectCopy) {
          e.preventDefault()
          onCopyAttempt?.()
        }
      }}
      onCut={(e) => {
        if (protectCopy) {
          e.preventDefault()
          onCopyAttempt?.()
        }
      }}
      onContextMenu={(e) => {
        if (protectCopy) {
          e.preventDefault()
          onCopyAttempt?.()
        }
      }}
      className={`font-serif space-y-6 leading-relaxed ${textSizeClass} ${
        protectCopy ? "select-none" : "select-text"
      } ${className}`}
      style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
    >
      {segments.map((segBlocks, segIdx) => {
        const isTracked = readSegmentCount !== undefined
        const isSegRead = isTracked && segIdx < readSegmentCount
        const isSegActive = isTracked && segIdx === readSegmentCount

        const borderClass = !isTracked
          ? ""
          : isSegRead
            ? "border-l-2 border-emerald-500/80 pl-3.5 sm:pl-5 transition-colors duration-300"
            : isSegActive
              ? "border-l-2 border-[#3C22BB]/70 pl-3.5 sm:pl-5 transition-colors duration-300"
              : "border-l-2 border-zinc-200/70 pl-3.5 sm:pl-5 transition-colors duration-300"

        return (
          <section
            key={segIdx}
            data-reading-segment={segIdx}
            className={`space-y-4 ${borderClass}`}
          >
            {segBlocks.map((block, bIdx) => renderBlock(block, bIdx))}
          </section>
        )
      })}
    </div>
  )
}

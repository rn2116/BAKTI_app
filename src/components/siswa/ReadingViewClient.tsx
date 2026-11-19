"use client"

import { useState, useEffect, useCallback } from "react"
import { markMaterialComplete } from "@/actions/material"
import { notify } from "@/lib/notify"
import { MaterialContentRenderer } from "@/components/shared/MaterialContentRenderer"
import {
  ReadingEngagementGate,
  type ReadingClaimPayload,
} from "@/components/shared/ReadingEngagementGate"
import {
  ReaderToolbar,
  type ReaderFontSize,
  type ReaderTheme,
} from "@/components/shared/ReaderToolbar"
import { TextToSpeechPlayer } from "@/components/shared/TextToSpeechPlayer"
import confetti from "canvas-confetti"

interface ReadingViewClientProps {
  materialId: string
  initialIsDone: boolean
  title: string
  summary: string
  contentHtml: string
  readingToken: string
}

export function ReadingViewClient({
  materialId,
  initialIsDone,
  title,
  summary,
  contentHtml,
  readingToken,
}: ReadingViewClientProps) {
  const [isDone, setIsDone] = useState(initialIsDone)
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState<ReaderFontSize>("base")
  const [theme, setTheme] = useState<ReaderTheme>("clean")
  const [readSegmentCount, setReadSegmentCount] = useState(0)

  // Muat preferensi kenyamanan membaca dari localStorage
  useEffect(() => {
    try {
      const savedSize = localStorage.getItem("bk_reader_font_size") as ReaderFontSize
      if (savedSize && ["sm", "base", "lg"].includes(savedSize)) {
        setFontSize(savedSize)
      }
      const savedTheme = localStorage.getItem("bk_reader_theme") as ReaderTheme
      if (savedTheme && ["clean", "sepia"].includes(savedTheme)) {
        setTheme(savedTheme)
      }
    } catch {
      // Abaikan jika localStorage tidak diizinkan
    }
  }, [])

  const handleSegmentProgressChange = useCallback((count: number) => {
    setReadSegmentCount(count)
  }, [])

  async function handleClaimPoints(payload: ReadingClaimPayload) {
    setLoading(true)
    const formData = new FormData()
    formData.append("materialId", materialId)
    formData.append("startedAt", String(payload.startedAt))
    formData.append("readingToken", payload.readingToken)
    formData.append("checkVerified", String(payload.checkVerified))
    formData.append("segmentsCompleted", String(payload.segmentsCompleted))
    formData.append("totalSegments", String(payload.totalSegments))

    const result = await markMaterialComplete(null, formData)
    setLoading(false)

    if (result.success) {
      setIsDone(true)
      notify.success("Hebat! Materi telah selesai dipelajari (+100 XP)")
      notify.reward("Poin XP Literasi Diraih!", 100, `Materi: ${title}`)

      // Trigger efek konfeti perayaan
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3C22BB", "#065F46", "#D97706", "#FDE047"],
      })
    } else {
      notify.error(result.error ?? "Gagal menyimpan progres")
    }
  }

  const containerThemeClass =
    theme === "sepia"
      ? "bg-[#FBF7EE] text-[#2C241B] border-amber-200/80 shadow-sm"
      : "bg-white text-zinc-800 border-zinc-200/90 shadow-xs"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Bilah Kontrol Kenyamanan Membaca & Pemutar Suara Otomatis */}
      <div className="space-y-3">
        <ReaderToolbar
          fontSize={fontSize}
          setFontSize={setFontSize}
          theme={theme}
          setTheme={setTheme}
        />

        <TextToSpeechPlayer textToRead={contentHtml} title={title} />
      </div>

      {/* 2. Konten Bacaan Utama Berstruktur dengan Pelacakan Segmen */}
      <div
        className={`p-6 sm:p-10 rounded-3xl border transition-colors duration-200 ${containerThemeClass}`}
      >
        <MaterialContentRenderer
          content={contentHtml}
          fontSize={fontSize}
          readSegmentCount={isDone ? undefined : readSegmentCount}
          className={theme === "sepia" ? "text-[#2C241B]" : "text-zinc-850"}
        />

        {/* 3. Sistem Penjaminan Engagement Membaca 3 Lapis */}
        <ReadingEngagementGate
          title={title}
          summary={summary}
          contentHtml={contentHtml}
          readingToken={readingToken}
          isDone={isDone}
          onClaim={handleClaimPoints}
          onSegmentProgressChange={handleSegmentProgressChange}
          loading={loading}
        />
      </div>
    </div>
  )
}

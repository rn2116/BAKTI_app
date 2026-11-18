"use client"

import { useState, useEffect } from "react"
import { markMaterialComplete } from "@/actions/material"
import { toast } from "@/components/ui/use-toast"
import { MaterialContentRenderer } from "@/components/shared/MaterialContentRenderer"
import { ReadingEngagementGate } from "@/components/shared/ReadingEngagementGate"
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
  contentHtml: string
}

export function ReadingViewClient({
  materialId,
  initialIsDone,
  title,
  contentHtml,
}: ReadingViewClientProps) {
  const [isDone, setIsDone] = useState(initialIsDone)
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState<ReaderFontSize>("base")
  const [theme, setTheme] = useState<ReaderTheme>("clean")

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

  async function handleClaimPoints(startedAt?: number) {
    setLoading(true)
    const formData = new FormData()
    formData.append("materialId", materialId)
    if (startedAt) {
      formData.append("startedAt", String(startedAt))
    }

    const result = await markMaterialComplete(null, formData)
    setLoading(false)

    if (result.success) {
      setIsDone(true)
      toast.success("Hebat! Materi telah selesai dipelajari (+100 XP)")

      // Trigger efek konfeti perayaan
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3C22BB", "#065F46", "#D97706", "#FDE047"],
      })
    } else {
      toast.error(result.error ?? "Gagal menyimpan progres")
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
        {/* Reader Comfort Toolbar (Font Size & Tema Kertas) */}
        <ReaderToolbar
          fontSize={fontSize}
          setFontSize={setFontSize}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Pemutar Suara Pelafalan Cerdas (Web Speech API id-ID) */}
        <TextToSpeechPlayer textToRead={contentHtml} title={title} />
      </div>

      {/* 2. Konten Bacaan Utama Berstruktur dengan Tipografi Lora & Tema Kertas Pilihan */}
      <div
        className={`p-6 sm:p-10 rounded-3xl border transition-colors duration-200 ${containerThemeClass}`}
      >
        <MaterialContentRenderer
          content={contentHtml}
          fontSize={fontSize}
          className={theme === "sepia" ? "text-[#2C241B]" : "text-zinc-850"}
        />

        {/* 3. Sistem Penjaminan Engagement Membaca (Reading Engagement Gate) */}
        <ReadingEngagementGate
          contentHtml={contentHtml}
          isDone={isDone}
          onClaim={handleClaimPoints}
          loading={loading}
        />
      </div>
    </div>
  )
}

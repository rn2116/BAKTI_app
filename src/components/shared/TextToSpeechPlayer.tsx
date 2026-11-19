"use client"

import { useState } from "react"
import { Volume2, Square, Gauge, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"

interface TextToSpeechPlayerProps {
  textToRead: string
  title?: string
  audioUrl?: string | null
}

function cleanTextForSpeech(raw: string): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/[-*•]\s+/g, ". ")
    .replace(/\s+/g, " ")
    .trim()
}

export function TextToSpeechPlayer({
  textToRead,
  title,
  audioUrl,
}: TextToSpeechPlayerProps) {
  const [rate, setRate] = useState<number>(1.0)
  const cleaned = cleanTextForSpeech(textToRead)
  const fullText = title ? `${title}. ${cleaned}` : cleaned

  const { isPlaying, isLoading, error, play, stop } = useAudioPlayer({
    audioUrl,
    text: fullText,
    lang: "id",
    rate,
  })

  function handleRateChange(newRate: number) {
    setRate(newRate)
    if (isPlaying) {
      stop()
      setTimeout(() => {
        void play()
      }, 60)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 shadow-2xs">
      {/* Sisi Kiri: Tombol Putar / Hentikan & Animasi Audio Wave */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isPlaying && !isLoading ? (
          <button
            type="button"
            onClick={() => void play()}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold transition-all shadow-xs min-h-[36px]"
          >
            <Volume2 className="w-4 h-4" />
            <span>Dengarkan Bacaan</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold transition-colors min-h-[36px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memuat Audio...</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Hentikan</span>
              </>
            )}
          </button>
        )}

        {error && !isPlaying && !isLoading && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{error}</span>
          </span>
        )}

        {/* Indikator Gelombang Suara */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1 h-5 px-1.5"
            >
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8].map((ratio, i) => (
                <motion.span
                  key={i}
                  className="w-1 bg-[#3C22BB] rounded-full"
                  animate={{
                    height: ["4px", `${ratio * 16}px`, "4px"],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.12,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sisi Kanan: Pengatur Kecepatan Suara */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
        <Gauge className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-[11px] text-zinc-500 hidden sm:inline">Kecepatan:</span>
        <div className="inline-flex rounded-lg bg-white/80 p-0.5 border border-indigo-100 shadow-2xs">
          {[
            { val: 0.85, label: "0.85x" },
            { val: 1.0, label: "1.0x" },
            { val: 1.15, label: "1.15x" },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => handleRateChange(item.val)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                rate === item.val
                  ? "bg-[#3C22BB] text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

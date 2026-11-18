"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Pause, Play, Square, Gauge } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TextToSpeechPlayerProps {
  textToRead: string
  title?: string
}

function cleanTextForSpeech(raw: string): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]+>/g, " ") // Hapus tag HTML
    .replace(/^#+\s+/gm, "") // Hapus header markdown
    .replace(/[*_~`]/g, "") // Hapus markdown formatting
    .replace(/[-*•]\s+/g, ". ") // Jadwalkan jeda pada list
    .replace(/\s+/g, " ")
    .trim()
}

export function TextToSpeechPlayer({
  textToRead,
  title,
}: TextToSpeechPlayerProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [rate, setRate] = useState<number>(1.0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function startSpeech() {
    if (!isSupported) return
    window.speechSynthesis.cancel()

    const cleaned = cleanTextForSpeech(textToRead)
    const textToSpeak = title ? `${title}. ${cleaned}` : cleaned
    if (!textToSpeak) return

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = "id-ID"
    utterance.rate = rate

    // Coba temukan suara bahasa Indonesia jika tersedia di sistem
    const voices = window.speechSynthesis.getVoices()
    const idVoice = voices.find(
      (v) => v.lang === "id-ID" || v.lang.startsWith("id")
    )
    if (idVoice) {
      utterance.voice = idVoice
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onpause = () => {
      setIsPaused(true)
    }

    utterance.onresume = () => {
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function togglePause() {
    if (!isSupported) return
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  function stopSpeech() {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  function handleRateChange(newRate: number) {
    setRate(newRate)
    if (isPlaying) {
      // Re-trigger dengan kecepatan baru
      startSpeech()
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 border border-zinc-200/60 rounded-xl px-3 py-2">
        <VolumeX className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>Pelafalan audio suara tidak didukung browser ini.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 shadow-2xs">
      {/* Sisi Kiri: Tombol Play/Pause/Stop & Animasi Audio Wave */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isPlaying ? (
          <button
            type="button"
            onClick={startSpeech}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold transition-all shadow-xs min-h-[36px]"
          >
            <Volume2 className="w-4 h-4" />
            <span>Dengarkan Bacaan</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#3C22BB] border border-indigo-200 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-2xs min-h-[36px]"
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lanjutkan</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Jeda</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={stopSpeech}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold transition-colors min-h-[36px]"
              title="Hentikan bacaan"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Hentikan</span>
            </button>
          </div>
        )}

        {/* Indikator Gelombang Suara (Voice Wave Visualizer) */}
        <AnimatePresence>
          {isPlaying && !isPaused && (
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

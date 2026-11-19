"use client"

import { Volume2, Square, Loader2, AlertCircle } from "lucide-react"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { cn } from "@/lib/utils"

interface AudioButtonProps {
  audioUrl?: string | null
  text?: string | null
  lang?: string
  rate?: number
  label?: string
  playingLabel?: string
  variant?: "indigo" | "light" | "ghost"
  size?: "sm" | "md"
  className?: string
  showTextOnMobile?: boolean
}

export function AudioButton({
  audioUrl,
  text,
  lang = "id",
  rate = 0.95,
  label = "Dengarkan",
  playingLabel = "Hentikan",
  variant = "indigo",
  size = "sm",
  className,
  showTextOnMobile = false,
}: AudioButtonProps) {
  const { isPlaying, isLoading, error, toggle } = useAudioPlayer({
    audioUrl,
    text,
    lang,
    rate,
  })

  const baseStyles =
    variant === "light"
      ? isPlaying
        ? "bg-amber-400 text-zinc-950 border-amber-300"
        : "bg-white/15 hover:bg-white/25 text-white border-white/20"
      : variant === "ghost"
        ? isPlaying
          ? "bg-[#3C22BB] text-white border-[#3C22BB]"
          : "bg-zinc-50 hover:bg-[#3C22BB]/10 text-[#3C22BB] border-zinc-200"
        : isPlaying
          ? "bg-[#3C22BB] text-white border-[#3C22BB] shadow-xs"
          : "bg-white text-[#3C22BB] border-[#3C22BB]/25 hover:bg-[#3C22BB]/10"

  const sizeStyles =
    size === "md" ? "px-3.5 py-2 text-xs min-h-[38px]" : "px-3 py-1.5 text-[11px] min-h-[34px]"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isPlaying ? playingLabel : label}
      title={error ?? (isPlaying ? playingLabel : label)}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl font-bold border transition-all shrink-0",
        baseStyles,
        sizeStyles,
        error && "border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span className={showTextOnMobile ? "inline" : "hidden sm:inline"}>Memuat...</span>
        </>
      ) : isPlaying ? (
        <>
          <Square className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{playingLabel}</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className={showTextOnMobile ? "inline" : "hidden sm:inline"}>Ulangi</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 shrink-0" />
          <span className={showTextOnMobile ? "inline" : "hidden sm:inline"}>{label}</span>
        </>
      )}
    </button>
  )
}

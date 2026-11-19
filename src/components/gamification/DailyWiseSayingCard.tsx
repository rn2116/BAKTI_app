"use client"

import Link from "next/link"
import { Quote, Sparkles, ArrowRight, BookOpen } from "lucide-react"
import { AudioButton } from "@/components/shared/AudioButton"

interface DailyWiseSayingCardProps {
  wiseSayingText: string
  wiseSayingMeaning: string
  characterValue: string
  referenceSource: string
  audioUrl?: string | null
  quizId: string | null
}

export function DailyWiseSayingCard({
  wiseSayingText,
  wiseSayingMeaning,
  characterValue,
  referenceSource,
  audioUrl,
  quizId,
}: DailyWiseSayingCardProps) {
  const spokenText = `${wiseSayingText}. Artinya: ${wiseSayingMeaning}. Nilai karakter: ${characterValue}.`

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#3C22BB]/25 bg-gradient-to-br from-[#1E135E] via-[#2B1B80] to-[#3C22BB] p-5 sm:p-6 text-white shadow-md space-y-4">
      {/* Ornamen Motif Tenun Donggala */}
      <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none select-none">
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          <polygon
            points="90,12 168,90 90,168 12,90"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <polygon points="90,34 146,90 90,146 34,90" stroke="#FDE047" strokeWidth="1.75" />
          <polygon points="90,58 122,90 90,122 58,90" fill="#F59E0B" fillOpacity="0.35" />
        </svg>
      </div>

      {/* Header Widget */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold text-amber-300 backdrop-blur-xs">
          <Quote className="w-3.5 h-3.5" />
          <span>Petuah Bijak To Kaili Hari Ini</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            {characterValue}
          </span>

          <AudioButton
            audioUrl={audioUrl}
            text={spokenText}
            label="Dengarkan"
            playingLabel="Stop"
            variant="light"
            size="sm"
            className="rounded-full"
          />
        </div>
      </div>

      {/* Kutipan Ungkapan Kaili */}
      <div className="relative z-10 space-y-2">
        <p className="font-serif italic font-bold text-lg sm:text-2xl text-white leading-snug break-words">
          &ldquo;{wiseSayingText}&rdquo;
        </p>

        {wiseSayingMeaning && (
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-indigo-100 leading-relaxed flex items-start gap-2 backdrop-blur-xs">
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Artinya: </span>
              {wiseSayingMeaning}
            </div>
          </div>
        )}
      </div>

      {/* Footer Rujukan & CTA Kuis */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-indigo-200/90 font-medium">
          Rujukan: {referenceSource}
        </span>

        <Link
          href={quizId ? `/siswa/kuis/${quizId}/mulai` : "/siswa/kuis"}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs shadow-sm transition-all min-h-[40px] shrink-0"
        >
          <span>Uji Pemahaman di Kuis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

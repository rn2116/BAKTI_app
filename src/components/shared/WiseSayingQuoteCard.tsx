"use client"

import { Quote, BookOpen } from "lucide-react"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import { AudioButton } from "@/components/shared/AudioButton"

interface WiseSayingQuoteCardProps {
  wiseSayingText: string
  wiseSayingMeaning?: string | null
  referenceSource?: string | null
  regionalLanguage?: string | null
  audioUrl?: string | null
}

export function WiseSayingQuoteCard({
  wiseSayingText,
  wiseSayingMeaning,
  referenceSource,
  regionalLanguage,
  audioUrl,
}: WiseSayingQuoteCardProps) {
  const languageTitle =
    regionalLanguage === "KAILI" || !regionalLanguage
      ? "Ungkapan Bijak To Kaili"
      : `Ungkapan Bijak ${REGIONAL_LANGUAGE_LABELS[regionalLanguage] ?? regionalLanguage}`

  const sourceLabel = referenceSource || "Dr. H. Suaib Djafar, M.Si"
  const spokenText = wiseSayingMeaning
    ? `${wiseSayingText}. Artinya: ${wiseSayingMeaning}`
    : wiseSayingText

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#3C22BB]/25 bg-gradient-to-br from-[#F6F4FF] via-white to-amber-50/40 p-4 sm:p-5 shadow-xs space-y-3">
      {/* Ornamen Geometris Motif Tenun Donggala */}
      <div className="absolute -right-5 -top-5 opacity-15 pointer-events-none select-none">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <polygon
            points="60,8 112,60 60,112 8,60"
            stroke="#3C22BB"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <polygon
            points="60,24 96,60 60,96 24,60"
            stroke="#D97706"
            strokeWidth="1.75"
          />
          <polygon
            points="60,40 80,60 60,80 40,60"
            fill="#3C22BB"
            fillOpacity="0.2"
          />
        </svg>
      </div>

      {/* Label Sumber Rujukan & Tombol Audio Hybrid */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3C22BB]/10 border border-[#3C22BB]/20 text-[10px] sm:text-[11px] font-bold text-[#3C22BB] whitespace-normal break-words">
          <Quote className="w-3 h-3 shrink-0" />
          <span className="break-words">
            {languageTitle} &bull; Rujukan: {sourceLabel}
          </span>
        </span>

        <AudioButton
          audioUrl={audioUrl}
          text={spokenText}
          label="Dengarkan"
          playingLabel="Hentikan"
          variant="indigo"
          size="sm"
          showTextOnMobile={true}
        />
      </div>

      {/* Teks Ungkapan Bahasa Daerah */}
      <div className="relative z-10 py-1">
        <p className="font-serif italic font-bold text-lg sm:text-xl text-[#1E135E] leading-relaxed break-words">
          &ldquo;{wiseSayingText}&rdquo;
        </p>
      </div>

      {/* Kotak Terjemahan Arti Harfiah */}
      {wiseSayingMeaning && (
        <div className="relative z-10 p-3 rounded-xl bg-white/90 border border-zinc-200/80 flex items-start gap-2 text-xs text-zinc-700 leading-relaxed">
          <BookOpen className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-zinc-900">Arti Harfiah: </span>
            <span>{wiseSayingMeaning}</span>
          </div>
        </div>
      )}
    </div>
  )
}

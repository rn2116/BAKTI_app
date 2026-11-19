"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { RegionalLanguageSummaryItem } from "@/services/regionalLearningService"
import type { RegionalLanguage } from "@/types"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Award,
  ArrowRight,
  Languages,
  Compass,
  PlayCircle,
} from "lucide-react"

interface SultengLanguageMapExplorerProps {
  languages: RegionalLanguageSummaryItem[]
}

interface MapPinCoordinate {
  x: number
  y: number
  labelX: number
  labelY: number
  anchor: "start" | "middle" | "end"
  tagline: string
  highlightWord: string
}

const LANGUAGE_MAP_COORDS: Record<RegionalLanguage, MapPinCoordinate> = {
  TOLITOLI: {
    x: 138,
    y: 44,
    labelX: 138,
    labelY: 28,
    anchor: "middle",
    tagline: "Bahasa maritim pesisir utara Sulawesi Tengah di Kabupaten Tolitoli.",
    highlightWord: "Santun Bertutur & Ramah",
  },
  BUOL: {
    x: 204,
    y: 36,
    labelX: 218,
    labelY: 32,
    anchor: "start",
    tagline: "Bahasa daerah masyarakat Buol di ujung utara Sulawesi Tengah.",
    highlightWord: "Amanah & Kebersamaan",
  },
  KAILI: {
    x: 108,
    y: 118,
    labelX: 90,
    labelY: 114,
    anchor: "end",
    tagline: "Bahasa utama Lembah Palu, Donggala, Sigi, dan Parigi Moutong.",
    highlightWord: "Nosarara Nosabatutu",
  },
  PAMONA: {
    x: 186,
    y: 162,
    labelX: 186,
    labelY: 184,
    anchor: "middle",
    tagline: "Bahasa wilayah Danau Poso & Tojo dengan nilai persatuan luhur.",
    highlightWord: "Sintuwu Maroso",
  },
  TAA: {
    x: 244,
    y: 122,
    labelX: 244,
    labelY: 105,
    anchor: "middle",
    tagline: "Bahasa penutur kawasan Teluk Tomini, Ampana, & Tojo Una-Una.",
    highlightWord: "Ketulusan & Gotong Royong",
  },
  SALUAN: {
    x: 316,
    y: 114,
    labelX: 316,
    labelY: 97,
    anchor: "middle",
    tagline: "Bahasa daerah wilayah Luwuk dan semenanjung timur Kabupaten Banggai.",
    highlightWord: "Budi Pekerti Luhur",
  },
  BANGGAI: {
    x: 374,
    y: 132,
    labelX: 374,
    labelY: 154,
    anchor: "middle",
    tagline: "Bahasa kepulauan Banggai & Banggai Laut yang kaya tradisi lisan.",
    highlightWord: "Montolutusan",
  },
  MORI: {
    x: 234,
    y: 212,
    labelX: 218,
    labelY: 228,
    anchor: "end",
    tagline: "Bahasa tanah leluhur masyarakat Morowali Utara.",
    highlightWord: "Keberanian & Kesetiaan",
  },
  BUNGKU: {
    x: 288,
    y: 224,
    labelX: 304,
    labelY: 234,
    anchor: "start",
    tagline: "Bahasa pesisir timur Kabupaten Morowali.",
    highlightWord: "Kejujuran & Tanggung Jawab",
  },
}

export function SultengLanguageMapExplorer({ languages }: SultengLanguageMapExplorerProps) {
  const [selectedCode, setSelectedCode] = useState<RegionalLanguage>(
    languages[0]?.code ?? "KAILI"
  )

  const selected =
    languages.find((l) => l.code === selectedCode) ?? languages[0]

  if (!selected) return null

  const meta = LANGUAGE_MAP_COORDS[selected.code]
  const totalMastered = languages.filter((l) => l.stage3Completed).length
  const totalExpressions = languages.reduce((acc, item) => acc + item.expressionCount, 0)

  return (
    <section
      aria-labelledby="peta-bahasa-sulteng-heading"
      className="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header Peta Eksplorasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3C22BB] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            <Compass className="w-3.5 h-3.5" />
            <span>Peta Eksplorasi BBPST Sulawesi Tengah</span>
          </div>
          <h2
            id="peta-bahasa-sulteng-heading"
            className="text-lg sm:text-xl font-extrabold text-[#1E135E] tracking-tight"
          >
            Jelajahi 9 Bahasa Daerah Sulawesi Tengah
          </h2>
          <p className="text-xs text-zinc-600">
            Ketuk wilayah pada peta atau pilih kartu bahasa untuk melihat progres belajar 3 tahap dan kosakata karakternya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-2xl bg-[#FAFAF8] border border-zinc-200 text-xs">
            <span className="text-zinc-500">Total Entri: </span>
            <strong className="text-[#1E135E]">{totalExpressions} Ungkapan</strong>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-emerald-700">Tuntas: </span>
            <strong className="text-emerald-900">{totalMastered}/9 Bahasa</strong>
          </div>
        </div>
      </div>

      {/* Main Explorer Grid: SVG Map + Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Interactive SVG Map Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#F4F1FF] via-[#FAFAF8] to-emerald-50/40 rounded-2xl border border-indigo-100 p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-[11px] font-bold text-[#1E135E] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#3C22BB]" />
              Peta Interaktif Wilayah Penutur Sulteng
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 hidden sm:inline">
              Klik titik bahasa untuk memilih
            </span>
          </div>

          <div className="w-full flex items-center justify-center">
            <svg
              viewBox="0 0 430 270"
              role="img"
              aria-label="Peta interaktif 9 bahasa daerah di Provinsi Sulawesi Tengah"
              className="w-full h-auto max-h-[290px] select-none drop-shadow-xs"
            >
              <defs>
                <linearGradient id="sultengLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DDD6FE" />
                  <stop offset="50%" stopColor="#C7D2FE" />
                  <stop offset="100%" stopColor="#A7F3D0" />
                </linearGradient>
                <linearGradient id="seaGridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ECFDF5" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Soft Background Sea Box */}
              <rect
                x="6"
                y="6"
                width="418"
                height="258"
                rx="18"
                fill="url(#seaGridGrad)"
                stroke="#E0E7FF"
                strokeWidth="1"
              />

              {/* Subtle Decorative Compass Rose */}
              <g transform="translate(38, 226)" opacity="0.55">
                <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1" />
                <path d="M0,-10 L3,0 L0,10 L-3,0 Z" fill="#3C22BB" />
                <text
                  x="0"
                  y="-16"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="700"
                  fill="#1E135E"
                >
                  U
                </text>
              </g>

              {/* Main Stylized Sulawesi Tengah Mainland */}
              <path
                d="M 122 36 C 148 22, 182 22, 222 28 C 236 30, 240 42, 224 52 C 194 60, 152 68, 134 94 C 126 106, 128 122, 146 130 C 172 142, 206 134, 242 114 C 276 96, 314 96, 344 108 C 354 114, 350 128, 332 132 C 296 140, 266 154, 262 178 C 260 194, 294 210, 312 224 C 316 234, 300 246, 276 244 C 246 240, 222 226, 204 204 C 186 184, 156 182, 128 172 C 98 160, 84 134, 90 102 C 96 72, 108 46, 122 36 Z"
                fill="url(#sultengLandGrad)"
                stroke="#3C22BB"
                strokeOpacity="0.45"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Banggai & Kepulauan Islands */}
              <path
                d="M 358 124 C 374 118, 392 126, 394 140 C 392 150, 372 152, 358 142 Z"
                fill="url(#sultengLandGrad)"
                stroke="#3C22BB"
                strokeOpacity="0.45"
                strokeWidth="1.8"
              />
              <ellipse
                cx="374"
                cy="164"
                rx="13"
                ry="7"
                fill="url(#sultengLandGrad)"
                stroke="#3C22BB"
                strokeOpacity="0.4"
                strokeWidth="1.5"
              />
              {/* Togean Islands in Gulf of Tomini */}
              <ellipse
                cx="268"
                cy="84"
                rx="14"
                ry="5"
                fill="#DDD6FE"
                stroke="#3C22BB"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              {/* Danau Poso Accent */}
              <ellipse
                cx="176"
                cy="168"
                rx="7"
                ry="11"
                fill="#BAE6FD"
                stroke="#0284C7"
                strokeWidth="1"
                opacity="0.85"
              />

              {/* Gulf / Region Watermarks */}
              <text
                x="230"
                y="74"
                textAnchor="middle"
                fontSize="8"
                fontWeight="600"
                fill="#3C22BB"
                opacity="0.4"
                letterSpacing="1.5"
              >
                TELUK TOMINI
              </text>

              {/* 9 Interactive Language Pins */}
              {languages.map((lang) => {
                const pos = LANGUAGE_MAP_COORDS[lang.code]
                if (!pos) return null
                const isSelected = lang.code === selected.code
                const isDone = lang.stage3Completed

                return (
                  <g
                    key={lang.code}
                    role="button"
                    tabIndex={0}
                    aria-label={`Pilih ${lang.name} (${lang.region})`}
                    onClick={() => setSelectedCode(lang.code)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedCode(lang.code)
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="14"
                        fill="#3C22BB"
                        fillOpacity="0.2"
                      />
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 8.5 : 6.5}
                      fill={
                        isSelected
                          ? "#3C22BB"
                          : isDone
                            ? "#065F46"
                            : "#FFFFFF"
                      }
                      stroke={
                        isSelected
                          ? "#FFFFFF"
                          : isDone
                            ? "#A7F3D0"
                            : "#3C22BB"
                      }
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    {isDone && !isSelected && (
                      <circle cx={pos.x} cy={pos.y} r="2.5" fill="#FFFFFF" />
                    )}
                    <text
                      x={pos.labelX}
                      y={pos.labelY}
                      textAnchor={pos.anchor}
                      fontSize={isSelected ? "10" : "8.5"}
                      fontWeight={isSelected ? "800" : "700"}
                      fill={isSelected ? "#1E135E" : "#334155"}
                      className="pointer-events-none"
                    >
                      {lang.name.replace("Bahasa ", "")}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* 9 Language Quick Selector Chips */}
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-indigo-100/80">
            {languages.map((lang) => {
              const isSelected = lang.code === selected.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedCode(lang.code)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#3C22BB] text-white shadow-xs"
                      : "bg-white text-zinc-700 border border-zinc-200 hover:border-[#3C22BB]/50 hover:text-[#3C22BB]"
                  }`}
                >
                  <span>{lang.name.replace("Bahasa ", "")}</span>
                  {lang.stage3Completed && (
                    <CheckCircle2
                      className={`w-3 h-3 ${
                        isSelected ? "text-emerald-300" : "text-emerald-600"
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Language Detail Card (5 Cols) */}
        <motion.div
          key={selected.code}
          initial={{ opacity: 0.6, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-5 bg-[#FAFAF8] border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            {/* Title + Status */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#065F46] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1.5">
                  <MapPin className="w-3 h-3" />
                  <span>{selected.region}</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#1E135E]">
                  {selected.name}
                </h3>
              </div>

              {selected.hasCertificate && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  <Award className="w-3.5 h-3.5 text-[#D97706]" />
                  Bersertifikat
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">{meta.tagline}</p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-zinc-200/80">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                  <Languages className="w-3 h-3 text-[#3C22BB]" /> Kosakata / Nilai
                </div>
                <div className="text-base font-extrabold text-zinc-900 mt-0.5">
                  {selected.expressionCount} Ungkapan
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-zinc-200/80">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D97706]" /> Ungkapan Khas
                </div>
                <div className="text-xs font-bold text-[#1E135E] mt-1 truncate">
                  {meta.highlightWord}
                </div>
              </div>
            </div>

            {/* 3-Stage Progress Tracker */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-800">Progres Belajar Anda</span>
                <span className="font-extrabold text-[#3C22BB]">
                  {selected.progressPercent}%
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3C22BB] to-[#065F46] transition-all duration-300"
                  style={{ width: `${selected.progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { label: "1. Kartu", done: selected.stage1Completed },
                  { label: "2. Gim", done: selected.stage2Completed },
                  { label: "3. Kuis", done: selected.stage3Completed },
                ].map((st) => (
                  <div
                    key={st.label}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border ${
                      st.done
                        ? "bg-emerald-50 border-emerald-200 text-[#065F46]"
                        : "bg-zinc-50 border-zinc-200 text-zinc-500"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3 h-3 ${
                        st.done ? "text-[#065F46]" : "text-zinc-300"
                      }`}
                    />
                    <span>{st.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              asChild
              className="flex-1 bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl h-10 text-xs font-bold shadow-xs"
            >
              <Link href={`/siswa/belajar-bahasa/${selected.code}`}>
                <PlayCircle className="w-4 h-4 mr-1.5" />
                {selected.progressPercent === 0
                  ? "Mulai Belajar"
                  : selected.progressPercent === 100
                    ? "Ulas Kembali"
                    : "Lanjutkan Belajar"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-xl h-10 text-xs font-bold border-zinc-200 hover:border-[#3C22BB] hover:text-[#3C22BB]"
            >
              <Link href="/siswa/bahasa-daerah">
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                Kamus
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AudioButton } from "@/components/shared/AudioButton"
import { notify } from "@/lib/notify"
import { REGIONAL_LANGUAGES, REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import {
  Search,
  Sparkles,
  Compass,
  Copy,
  BookOpen,
  Heart,
  Check,
  Languages,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Layers,
} from "lucide-react"
import type { RegionalLanguage } from "@/types"

interface MatrixItem {
  id: number
  indonesianCharacter: string
  regionalLanguage: RegionalLanguage
  regionalTerm: string
  characterSource: string
  implementation: string
  audioUrl?: string | null
  createdAt?: Date
}

interface RegionalLanguageDictionaryClientProps {
  matrices: MatrixItem[]
}

const LANGUAGE_TABS = [
  { code: "ALL", label: "Semua Bahasa", region: "Sulawesi Tengah" },
  { code: "KAILI", label: "Kaili", region: "Palu, Sigi, Donggala, Parimo" },
  { code: "PAMONA", label: "Pamona", region: "Poso" },
  { code: "BANGGAI", label: "Banggai", region: "Banggai Kepulauan & Laut" },
  { code: "BUNGKU", label: "Bungku", region: "Morowali" },
  { code: "TOLITOLI", label: "Tolitoli", region: "Tolitoli" },
  { code: "BUOL", label: "Buol", region: "Buol" },
  { code: "SALUAN", label: "Saluan", region: "Banggai" },
  { code: "MORI", label: "Mori", region: "Morowali Utara" },
  { code: "TAA", label: "Taa", region: "Tojo Una-Una" },
]

export function RegionalLanguageDictionaryClient({
  matrices,
}: RegionalLanguageDictionaryClientProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  function handleCopy(id: number, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      notify.success(`Ungkapan "${text}" disalin ke clipboard!`)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const filteredMatrices = matrices.filter((item) => {
    const matchTab = activeTab === "ALL" || item.regionalLanguage === activeTab
    const matchSearch =
      item.regionalTerm.toLowerCase().includes(search.toLowerCase()) ||
      item.indonesianCharacter.toLowerCase().includes(search.toLowerCase()) ||
      item.characterSource.toLowerCase().includes(search.toLowerCase()) ||
      item.implementation.toLowerCase().includes(search.toLowerCase())

    return matchTab && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Hero Banner Inspiratif BBPST */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E135E] via-[#3C22BB] to-[#0284C7] p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            Matriks Karakter Resmi Balai Bahasa Provinsi Sulawesi Tengah
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Kamus Karakter 9 Bahasa Daerah Sulawesi Tengah
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Jelajahi kearifan lokal, petuah luhur nenek moyang, dan falsafah budi pekerti dalam 9 bahasa daerah Sulawesi Tengah (Kaili, Pamona, Banggai, Bungku, Tolitoli, Buol, Saluan, Mori, dan Taa) untuk membentuk generasi berkarakter unggul.
          </p>
        </div>

        {/* Decorative background vectors */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Languages className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari istilah daerah, nilai karakter, atau pepatah..."
            className="pl-10 h-11 text-xs rounded-2xl bg-white border-zinc-200 shadow-xs"
          />
        </div>

        {/* 10 Language Filter Tabs (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LANGUAGE_TABS.map((tab) => {
            const isActive = activeTab === tab.code
            return (
              <button
                key={tab.code}
                onClick={() => setActiveTab(tab.code)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-[#3C22BB] text-white shadow-md shadow-[#3C22BB]/20 scale-102"
                    : "bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 shadow-xs"
                }`}
              >
                <span>{tab.label}</span>
                {tab.code !== "ALL" && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tab.code}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {/* CTA Alur Belajar Bertahap 3 Tahap saat memilih bahasa */}
        {activeTab !== "ALL" && (
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-[#3C22BB]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#1E135E]">
              <Layers className="w-4 h-4 text-[#3C22BB] shrink-0" />
              <span>
                Ingin belajar <strong>{REGIONAL_LANGUAGE_LABELS[activeTab] ?? activeTab}</strong> secara bertahap (Kartu Ungkapan → Latihan Mencocokkan → Kuis & Sertifikat)?
              </span>
            </div>
            <Link
              href={`/siswa/belajar-bahasa/${activeTab}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold shadow-xs shrink-0 transition-colors"
            >
              <span>Mulai Belajar 3 Tahap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredMatrices.map((item) => {
          const isCopied = copiedId === item.id

          return (
            <div
              key={item.id}
              className="bg-white border border-zinc-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-[#3C22BB]/50 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="space-y-4">
                {/* Card Top: Regional Badge & Copy */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      <Languages className="w-3 h-3 text-teal-600" />
                      Bahasa {REGIONAL_LANGUAGE_LABELS[item.regionalLanguage] ?? item.regionalLanguage}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.regionalTerm)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                      title="Salin Istilah"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Regional Term & Pronunciation */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-extrabold text-zinc-900 group-hover:text-[#3C22BB] transition-colors tracking-tight break-words">
                      &ldquo;{item.regionalTerm}&rdquo;
                    </h3>
                    <AudioButton
                      audioUrl={item.audioUrl}
                      text={item.regionalTerm}
                      label="Lafalkan"
                      variant="indigo"
                      size="sm"
                      className="rounded-full"
                    />
                  </div>

                  {/* Indonesian Character Value Badge */}
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Nilai: {item.indonesianCharacter}</span>
                  </div>
                </div>

                {/* Cultural Source Callout */}
                <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-100 text-xs space-y-1">
                  <div className="font-semibold text-zinc-700 flex items-center gap-1.5 text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-[#3C22BB]" />
                    <span>Sumber Tradisi / Pepatah:</span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed line-clamp-3">
                    {item.characterSource}
                  </p>
                </div>

                {/* Practical Implementation Callout */}
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/70 text-xs space-y-1">
                  <div className="font-semibold text-indigo-900 flex items-center gap-1.5 text-[11px]">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Penerapan Siswa Sehari-hari:</span>
                  </div>
                  <p className="text-indigo-800 leading-relaxed line-clamp-3">
                    {item.implementation}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-4 border-t border-zinc-100 flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                <Link
                  href={`/siswa/belajar-bahasa/${item.regionalLanguage}`}
                  className="inline-flex items-center gap-1 font-bold text-[#3C22BB] hover:underline"
                >
                  <Layers className="w-3 h-3" /> Belajar 3 Tahap
                </Link>
                <AudioButton
                  text={`${item.regionalTerm}. Maknanya adalah nilai ${item.indonesianCharacter}. ${item.implementation}`}
                  label="Dengar Makna"
                  variant="ghost"
                  size="sm"
                  showTextOnMobile={true}
                />
              </div>
            </div>
          )
        })}

        {filteredMatrices.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-zinc-200 rounded-3xl p-8">
            <Compass className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-zinc-800">
              Tidak Ada Istilah Ditemukan
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              Coba gunakan kata kunci pencarian lain atau pilih tab bahasa daerah lainnya.
            </p>
            <Button
              onClick={() => {
                setSearch("")
                setActiveTab("ALL")
              }}
              variant="outline"
              className="text-xs rounded-xl"
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

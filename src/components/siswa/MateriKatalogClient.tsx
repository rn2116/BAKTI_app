"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Clock,
  BookOpen,
  CheckCircle2,
  Hourglass,
  CircleDashed,
  Sparkles,
  Languages,
  BookMarked,
  ArrowRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import {
  SultengIllustration,
  getThemeByIndexAndCategory,
} from "@/components/shared/SultengIllustration"

interface MaterialItem {
  id: string
  title: string
  slug: string
  category: string
  regionalLanguage?: string | null
  referenceSource?: string | null
  description: string
  readingTime: number
  orderIndex: number
  _count: { quizzes: number; progress: number }
}

interface LanguageOption {
  code: string
  name: string
}

interface MateriKatalogClientProps {
  materials: MaterialItem[]
  progressMap: Record<string, string>
  languages?: LanguageOption[]
  initialCategory?: string
  initialLanguage?: string
}

const CATEGORY_TABS = [
  { key: "ALL", label: "Semua Kategori" },
  { key: "BAHASA_INDONESIA", label: "Bahasa Indonesia" },
  { key: "KARAKTER", label: "Pendidikan Karakter" },
  { key: "BUDAYA_SULTENG", label: "Kearifan Lokal Sulawesi Tengah" },
]

export function MateriKatalogClient({
  materials,
  progressMap,
  languages = [],
  initialCategory = "ALL",
  initialLanguage = "ALL",
}: MateriKatalogClientProps) {
  const [activeTab, setActiveTab] = useState(initialCategory)
  const [selectedLang, setSelectedLang] = useState(initialLanguage)
  const [search, setSearch] = useState("")

  const languageLabelMap: Record<string, string> = Object.fromEntries(
    languages.map((l) => [l.code, l.name])
  )

  const filtered = materials.filter((m) => {
    const matchCategory = activeTab === "ALL" || m.category === activeTab
    const matchLang =
      selectedLang === "ALL" ||
      (selectedLang === "GENERAL" ? !m.regionalLanguage : m.regionalLanguage === selectedLang)
    const q = search.toLowerCase().trim()
    const matchSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (m.referenceSource || "").toLowerCase().includes(q)
    return matchCategory && matchLang && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Bilah Pencarian & Filter Cepat */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs">
        {/* Tab Kategori */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#3C22BB] text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bahasa Daerah + Pencarian */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          {languages.length > 0 && (
            <select
              aria-label="Filter Bahasa Daerah"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="h-9 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB] focus:ring-1 focus:ring-[#3C22BB]"
            >
              <option value="ALL">Semua Bahasa Daerah</option>
              <option value="GENERAL">Materi Umum (Nasional / Lintas Daerah)</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kartu materi atau rujukan..."
              className="pl-9 h-9 text-xs rounded-xl border-zinc-200"
            />
          </div>
        </div>
      </div>

      {/* Kisi Kartu Materi Interaktif */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, idx) => {
          const status = progressMap[m.id]
          const isDone = status === "SELESAI"
          const isInProgress = status === "IN_PROGRESS"
          const illustrationTheme = getThemeByIndexAndCategory(m.category, idx)

          const actionLabel = isDone
            ? "Baca Ulang"
            : isInProgress
              ? "Lanjutkan"
              : "Mulai Baca"

          return (
            <Card
              key={m.id}
              className="rounded-2xl border-zinc-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-[#3C22BB]/35 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Banner Ilustrasi Khas Sulawesi Tengah */}
                <div className="relative">
                  <SultengIllustration theme={illustrationTheme} className="h-32" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[70%]">
                    <CategoryBadge category={m.category} variant="overlay" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-amber-200/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-300 shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-600" /> +100 XP
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  {/* Lencana Bahasa Daerah & Status Progres */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {m.regionalLanguage && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          <Languages className="w-3 h-3" />
                          {languageLabelMap[m.regionalLanguage] ?? m.regionalLanguage}
                        </span>
                      )}
                    </div>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#065F46] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Tuntas
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Hourglass className="w-3 h-3" /> Sedang Dibaca
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                        <CircleDashed className="w-3 h-3" /> Belum Dibaca
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#3C22BB] transition-colors">
                    {m.title}
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Lencana Sumber Rujukan Resmi */}
                  {m.referenceSource && (
                    <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[10px] font-semibold text-[#1E135E]">
                      <BookMarked className="w-3.5 h-3.5 text-[#3C22BB] shrink-0 mt-0.5" />
                      <span className="line-clamp-1" title={m.referenceSource}>
                        Rujukan: {m.referenceSource}
                      </span>
                    </div>
                  )}

                  {/* Estimasi Waktu Baca & Kuis */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" /> {m.readingTime} Menit Baca
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400" /> {m._count.quizzes} Kuis Terkait
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  href={`/siswa/materi/${m.slug}`}
                  className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    isDone
                      ? "bg-emerald-50 text-[#065F46] border border-emerald-200 hover:bg-emerald-100"
                      : isInProgress
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        : "bg-[#3C22BB] text-white hover:bg-[#2E1994] shadow-xs"
                  }`}
                >
                  <span>{actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center rounded-2xl border border-dashed border-zinc-200 bg-white">
          <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-zinc-700">Tidak ada kartu materi ditemukan</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Coba ubah kata kunci pencarian, filter bahasa daerah, atau pilih kategori lainnya.
          </p>
        </div>
      )}
    </div>
  )
}

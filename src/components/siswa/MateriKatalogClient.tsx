"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Clock, BookOpen, CheckCircle, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { SultengIllustration, getThemeByIndexAndCategory } from "@/components/shared/SultengIllustration"

interface MaterialItem {
  id: string
  title: string
  slug: string
  category: string
  description: string
  readingTime: number
  orderIndex: number
  _count: { quizzes: number; progress: number }
}

interface MateriKatalogClientProps {
  materials: MaterialItem[]
  progressMap: Record<string, string>
  initialCategory?: string
}

const CATEGORY_TABS = [
  { key: "ALL", label: "Semua Kategori" },
  { key: "BAHASA_INDONESIA", label: "Bahasa Indonesia" },
  { key: "KARAKTER", label: "Pendidikan Karakter" },
  { key: "BUDAYA_SULTENG", label: "Budaya Sulteng" },
]

export function MateriKatalogClient({
  materials,
  progressMap,
  initialCategory = "ALL",
}: MateriKatalogClientProps) {
  const [activeTab, setActiveTab] = useState(initialCategory)
  const [search, setSearch] = useState("")

  const filtered = materials.filter((m) => {
    const matchCategory = activeTab === "ALL" || m.category === activeTab
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Kontrol Filter & Bilah Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-xs">
        {/* Tab Kategori */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-[#3C22BB] text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi literasi..."
            className="pl-9 h-9 text-xs rounded-xl border-zinc-200"
          />
        </div>
      </div>

      {/* Grid Katalog Materi */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, idx) => {
          const isDone = progressMap[m.id] === "SELESAI"
          const illustrationTheme = getThemeByIndexAndCategory(m.category, idx)

          return (
            <Card
              key={m.id}
              className="rounded-2xl border-zinc-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Banner Ilustrasi Khas Sulawesi Tengah */}
                <div className="relative">
                  <SultengIllustration theme={illustrationTheme} className="h-32" />
                  <div className="absolute top-3 left-3">
                    <CategoryBadge category={m.category} variant="overlay" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-amber-200/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-300 shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-600" /> +20 Poin
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" /> {m.readingTime} Menit Baca
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400" /> {m._count.quizzes} Kuis Terkait
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#3C22BB] transition-colors">
                    {m.title}
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/siswa/materi/${m.slug}`}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all ${
                      isDone
                        ? "bg-emerald-50 text-[#065F46] border border-emerald-200 hover:bg-emerald-100"
                        : "bg-[#3C22BB] text-white hover:bg-[#2E1994] shadow-xs"
                    }`}
                  >
                    {isDone ? "Baca Ulang" : "Mulai Belajar"}
                  </Link>

                  {isDone && (
                    <div className="h-8 w-8 rounded-xl bg-emerald-100 text-[#065F46] flex items-center justify-center shrink-0 border border-emerald-200" title="Materi Tuntas">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center rounded-2xl border border-dashed border-zinc-200 bg-white">
          <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-zinc-700">Tidak ada materi ditemukan</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Coba ubah kata kunci pencarian atau pilih kategori yang lain.
          </p>
        </div>
      )}
    </div>
  )
}

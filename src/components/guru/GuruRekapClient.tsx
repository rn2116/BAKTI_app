"use client"

import { useState } from "react"
import { ExportExcelButton } from "@/components/guru/ExportExcelButton"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Search, Filter, Award } from "lucide-react"

interface RecapAttemptItem {
  id: string
  score: number
  maxScore: number
  passed: boolean
  startedAt: Date
  user: {
    fullName: string
    nisn: string | null
    school?: { name: string } | null
    class?: { name: string; grade: number } | null
  }
  quiz: {
    id: string
    title: string
    category: string
    passingScore: number
  }
}

interface GuruRekapClientProps {
  recapAttempts: RecapAttemptItem[]
  classList: string[]
}

function getPredikat(scorePercent: number): { label: string; badgeClass: string } {
  if (scorePercent >= 85) {
    return { label: "Sangat Berkembang (SB)", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" }
  }
  if (scorePercent >= 70) {
    return { label: "Berkembang Sesuai Harapan (BSH)", badgeClass: "bg-blue-100 text-blue-800 border-blue-200" }
  }
  return { label: "Mulai Berkembang (MB)", badgeClass: "bg-amber-100 text-amber-800 border-amber-200" }
}

export function GuruRekapClient({ recapAttempts, classList }: GuruRekapClientProps) {
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState("ALL")
  const [selectedCategory, setSelectedCategory] = useState("ALL")

  const filtered = recapAttempts.filter((row) => {
    const matchName =
      row.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (row.user.nisn && row.user.nisn.includes(search)) ||
      row.quiz.title.toLowerCase().includes(search.toLowerCase())

    const matchClass =
      selectedClass === "ALL" || (row.user.class && row.user.class.name === selectedClass)

    const matchCategory =
      selectedCategory === "ALL" || row.quiz.category === selectedCategory

    return matchName && matchClass && matchCategory
  })

  const exportData = filtered.map((item) => {
    const pct = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0
    const predikat = getPredikat(pct)

    return {
      nama: item.user.fullName,
      nisn: item.user.nisn ?? "-",
      sekolah: item.user.school?.name ?? "Sekolah",
      kelas: item.user.class ? `Kelas ${item.user.class.grade} - ${item.user.class.name}` : "-",
      kuis: item.quiz.title,
      kategori: item.quiz.category,
      skor: item.score,
      skorMaksimal: item.maxScore,
      status: item.passed ? `LULUS (${predikat.label})` : "REMIDI",
      tanggal: new Date(item.startedAt).toLocaleString("id-ID"),
    }
  })

  return (
    <div className="space-y-5">
      {/* Kontrol Filter, Pencarian, dan Tombol Ekspor */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Input Pencarian */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari siswa / kuis..."
              className="pl-9 h-10 text-xs rounded-xl border-zinc-200"
            />
          </div>

          {/* Filter Kelas */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
          >
            <option value="ALL">Semua Kelas</option>
            {classList.map((c) => (
              <option key={c} value={c}>
                Kelas {c}
              </option>
            ))}
          </select>

          {/* Filter Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="BAHASA_INDONESIA">Bahasa Indonesia</option>
            <option value="KARAKTER">Pendidikan Karakter</option>
            <option value="BUDAYA_SULTENG">Budaya Sulteng</option>
          </select>
        </div>

        {/* Tombol Ekspor Hijau Zamrud */}
        <div className="shrink-0">
          <ExportExcelButton data={exportData} filename="rekap-nilai-evaluasi-siswa.xlsx" />
        </div>
      </div>

      {/* 1. Mobile Stacked Cards (< 768px) */}
      <div className="space-y-3 md:hidden">
        {filtered.map((row) => {
          const pct = row.maxScore > 0 ? Math.round((row.score / row.maxScore) * 100) : 0
          const predikat = getPredikat(pct)

          return (
            <Card key={row.id} className="p-4 border-zinc-200/90 shadow-xs space-y-3 rounded-2xl bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#18181B] truncate">
                    {row.user.fullName}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    NISN: {row.user.nisn ?? "-"} • {row.user.class?.name ?? "-"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      row.passed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.passed ? "Lulus" : "Remidi"}
                  </span>
                  {row.passed && (
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${predikat.badgeClass}`}>
                      {predikat.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-2 flex flex-col gap-1.5">
                <div className="text-xs font-semibold text-zinc-800 truncate">
                  {row.quiz.title}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={row.quiz.category} />
                  <div className="font-mono font-bold text-sm text-zinc-900">
                    {row.score} / {row.maxScore} ({pct}%)
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-400 text-right">
                {new Date(row.startedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-10 border border-dashed rounded-2xl text-center text-xs text-zinc-400 bg-white shadow-xs">
            Tidak ada data rekapitulasi nilai yang cocok dengan filter.
          </div>
        )}
      </div>

      {/* 2. Desktop Full Table (>= 768px) */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-bold">
              <th className="py-3 px-4">Nama Siswa</th>
              <th className="py-3 px-4">Kelas</th>
              <th className="py-3 px-4">Kuis</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-center">Nilai Akhir</th>
              <th className="py-3 px-4 text-center">Predikat Kelulusan</th>
              <th className="py-3 px-4 text-right">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {filtered.map((row) => {
              const pct = row.maxScore > 0 ? Math.round((row.score / row.maxScore) * 100) : 0
              const predikat = getPredikat(pct)

              return (
                <tr key={row.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-zinc-900">{row.user.fullName}</div>
                    <div className="text-[10px] text-zinc-500">NISN: {row.user.nisn ?? "-"}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 font-medium">
                    {row.user.class ? `${row.user.class.name}` : "-"}
                  </td>
                  <td className="py-3 px-4 max-w-[220px] truncate font-medium text-zinc-800">
                    {row.quiz.title}
                  </td>
                  <td className="py-3 px-4">
                    <CategoryBadge category={row.quiz.category} />
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-zinc-900">
                    {row.score} / {row.maxScore} ({pct}%)
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center gap-0.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.passed ? "Lulus" : "Remidi"}
                      </span>
                      {row.passed && (
                        <span className={`text-[9px] font-bold px-2 rounded-full border ${predikat.badgeClass}`}>
                          {predikat.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 text-[11px] text-right">
                    {new Date(row.startedAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  Tidak ada data rekapitulasi nilai yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>
    </div>
  )
}

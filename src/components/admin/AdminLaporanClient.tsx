"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { exportOfficialBBPSTExcel } from "@/lib/export-excel-bbpst"
import { notify } from "@/lib/notify"
import {
  Search,
  Download,
  FileSpreadsheet,
  Award,
  Users,
  TrendingUp,
  Sparkles,
  Building,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

export interface StudentRecapReportItem {
  id: string
  fullName: string
  nisn: string
  schoolName: string
  regencyName: string
  className: string
  scoreBahasa: number
  scoreKarakter: number
  scoreBudaya: number
  avgScore: number
  xp: number
  level: number
  predikat: string
  totalAttempts: number
  totalViolations?: number
  autoSubmittedCount?: number
}

interface AdminLaporanClientProps {
  reports: StudentRecapReportItem[]
  regencies: Array<{ id: string; name: string }>
  schools: Array<{ id: string; name: string }>
}

export function AdminLaporanClient({
  reports,
  regencies,
  schools,
}: AdminLaporanClientProps) {
  const [search, setSearch] = useState("")
  const [selectedRegency, setSelectedRegency] = useState("ALL")
  const [selectedSchool, setSelectedSchool] = useState("ALL")
  const [selectedPredicate, setSelectedPredicate] = useState("ALL")

  const filteredReports = reports.filter((item) => {
    const matchSearch =
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.nisn.includes(search) ||
      item.schoolName.toLowerCase().includes(search.toLowerCase())

    const matchRegency =
      selectedRegency === "ALL" || item.regencyName.includes(selectedRegency)

    const matchSchool =
      selectedSchool === "ALL" || item.schoolName === selectedSchool

    const matchPredicate =
      selectedPredicate === "ALL" || item.predikat.includes(selectedPredicate)

    return matchSearch && matchRegency && matchSchool && matchPredicate
  })

  // Summary Metrics
  const totalStudents = filteredReports.length
  const avgOverall =
    totalStudents > 0
      ? Math.round(
          filteredReports.reduce((acc, r) => acc + r.avgScore, 0) / totalStudents
        )
      : 0
  const countSB = filteredReports.filter((r) => r.predikat.includes("SB")).length
  const countBSH = filteredReports.filter((r) => r.predikat.includes("BSH")).length
  const countMB = filteredReports.filter((r) => r.predikat.includes("MB")).length

  function handleExportExcel() {
    if (filteredReports.length === 0) {
      notify.warning("Tidak ada data siswa untuk diekspor")
      return
    }

    const scope =
      selectedSchool !== "ALL"
        ? `Sekolah: ${selectedSchool}`
        : selectedRegency !== "ALL"
        ? `Wilayah: ${selectedRegency}`
        : "Seluruh Wilayah Sulawesi Tengah"

    exportOfficialBBPSTExcel(
      filteredReports,
      scope,
      `Laporan_Capaian_Literasi_BBPST_${Date.now().toString().slice(-4)}.xlsx`
    )
    notify.success("Laporan resmi BBPST berhasil diekspor ke Excel (.xlsx)")
  }

  function getPredicateBadge(predikat: string) {
    if (predikat.includes("SB")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          Sangat Berkembang (SB)
        </span>
      )
    }
    if (predikat.includes("BSH")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          Berkembang Sesuai Harapan (BSH)
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
        <TrendingUp className="w-3 h-3 text-amber-600" />
        Mulai Berkembang (MB)
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Official BBPST Letterhead Presentation */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-[11px] font-extrabold tracking-widest text-[#3C22BB] uppercase">
            Kementerian Pendidikan Tinggi, Sains, dan Teknologi
          </div>
          <h2 className="text-lg font-bold text-zinc-900">
            Balai Bahasa Provinsi Sulawesi Tengah
          </h2>
          <p className="text-xs text-zinc-500">
            Laporan Rekapitulasi Nilai Capaian Literasi Bahasa, Pendidikan Karakter, dan Kearifan Lokal Sulawesi Tengah
          </p>
        </div>

        <Button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 h-10 shadow-xs flex items-center gap-2 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Unduh Laporan Excel Resmi (.xlsx)
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#3C22BB]" /> Total Peserta
          </div>
          <div className="text-xl font-extrabold text-zinc-900 mt-1">
            {totalStudents} Peserta
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-sky-600" /> Rata-rata Literasi
          </div>
          <div className="text-xl font-extrabold text-sky-700 mt-1">
            {avgOverall} <span className="text-xs font-normal text-zinc-400">/ 100</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Sangat Berkembang
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {countSB} <span className="text-xs font-normal text-zinc-400">({totalStudents ? Math.round((countSB / totalStudents) * 100) : 0}%)</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Sesuai Harapan
          </div>
          <div className="text-xl font-extrabold text-blue-700 mt-1">
            {countBSH} <span className="text-xs font-normal text-zinc-400">({totalStudents ? Math.round((countBSH / totalStudents) * 100) : 0}%)</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Mulai Berkembang
          </div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">
            {countMB} <span className="text-xs font-normal text-zinc-400">({totalStudents ? Math.round((countMB / totalStudents) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NISN, atau sekolah..."
            className="pl-9 h-10 text-xs rounded-xl border-zinc-200"
          />
        </div>

        {/* Regency Filter */}
        <select
          value={selectedRegency}
          onChange={(e) => setSelectedRegency(e.target.value)}
          className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB]"
        >
          <option value="ALL">Semua Kabupaten/Kota</option>
          {regencies.map((reg) => (
            <option key={reg.id} value={reg.name}>
              {reg.name}
            </option>
          ))}
        </select>

        {/* School Filter */}
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB]"
        >
          <option value="ALL">Semua Sekolah</option>
          {schools.map((sch) => (
            <option key={sch.id} value={sch.name}>
              {sch.name}
            </option>
          ))}
        </select>

        {/* Predicate Filter */}
        <select
          value={selectedPredicate}
          onChange={(e) => setSelectedPredicate(e.target.value)}
          className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB]"
        >
          <option value="ALL">Semua Predikat</option>
          <option value="SB">Sangat Berkembang (SB &ge; 85)</option>
          <option value="BSH">Berkembang Sesuai Harapan (BSH 70-84)</option>
          <option value="MB">Mulai Berkembang (MB &lt; 70)</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-xs overflow-hidden w-full min-w-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">No</th>
                <th className="px-4 py-3.5">Nama Peserta &amp; Identitas</th>
                <th className="px-4 py-3.5">Instansi / Sekolah</th>
                <th className="px-4 py-3.5 text-center">Bhs. Indonesia</th>
                <th className="px-4 py-3.5 text-center">P. Karakter</th>
                <th className="px-4 py-3.5 text-center">Kearifan Lokal Sulteng</th>
                <th className="px-4 py-3.5 text-center">Rata-rata</th>
                <th className="px-4 py-3.5 text-center">XP / Level</th>
                <th className="px-4 py-3.5">Predikat Karakter</th>
                <th className="px-4 py-3.5 text-center">Integritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredReports.map((item, idx) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-center text-zinc-400 font-medium">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-zinc-900">{item.fullName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      NISN: {item.nisn}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-zinc-800">{item.schoolName}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {item.className} &bull; {item.regencyName}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-sky-700">
                    {item.scoreBahasa}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-700">
                    {item.scoreKarakter}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-teal-700">
                    {item.scoreBudaya}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-extrabold text-sm text-[#3C22BB]">
                      {item.avgScore}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="font-bold text-zinc-800">{item.xp} XP</div>
                    <div className="text-[10px] text-zinc-400">Level {item.level}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {getPredicateBadge(item.predikat)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {(item.totalViolations ?? 0) === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Jujur ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {item.totalViolations}x Pindah Tab
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400 text-xs">
                    Tidak ada data capaian literasi siswa yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import type { AdminAgencyAnalyticsData } from "@/services/admin-guru"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { notify } from "@/lib/notify"
import { loadOfficialLogoForExport } from "@/lib/pdf-logo"
import {
  Users,
  Building2,
  Award,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Sparkles,
  AlertTriangle,
  Languages,
  MapPin,
  School,
  CheckCircle2,
  Loader2,
} from "lucide-react"

interface AdminAnalitikClientProps {
  analytics: AdminAgencyAnalyticsData
}

export function AdminAnalitikClient({ analytics }: AdminAnalitikClientProps) {
  const [selectedRegency, setSelectedRegency] = useState<string>("ALL")
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const { summary, regencyDistribution, schoolDistribution, languagePerformance } = analytics

  const filteredSchools =
    selectedRegency === "ALL"
      ? schoolDistribution
      : schoolDistribution.filter((s) => s.regencyName === selectedRegency)

  function handleExportExcel() {
    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Ringkasan Instansi
      const wsSummary = XLSX.utils.json_to_sheet([
        { Indikator: "Total Pengguna Aktif", Nilai: summary.totalActiveUsers },
        { Indikator: "Jumlah Siswa Aktif", Nilai: summary.totalStudents },
        { Indikator: "Jumlah Guru Aktif", Nilai: summary.totalTeachers },
        { Indikator: "Siswa Dengan Aktivitas Belajar", Nilai: summary.activeLearnersCount },
        { Indikator: "Sekolah Terdaftar", Nilai: summary.totalSchools },
        { Indikator: "Kabupaten / Kota Terdaftar", Nilai: summary.totalRegencies },
        { Indikator: "Total Sesi Kuis Selesai", Nilai: summary.totalQuizAttempts },
        { Indikator: "Rata-rata Skor Kuis Nasional/Daerah (%)", Nilai: summary.overallAvgScore },
        { Indikator: "Sertifikat Bahasa Daerah Terbit", Nilai: summary.totalRegionalCertificates },
        { Indikator: "Sertifikat Materi Literasi Terbit", Nilai: summary.totalMaterialCertificates },
      ])
      wsSummary["!cols"] = [{ wch: 42 }, { wch: 16 }]
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan_BBPST")

      // Sheet 2: Capaian 9 Bahasa Daerah
      const wsLang = XLSX.utils.json_to_sheet(
        languagePerformance.map((item) => ({
          Kode: item.code,
          Bahasa_Daerah: item.name,
          Peserta_Modul: item.moduleStarters,
          Percobaan_Kuis: item.attemptsCount,
          Rata_Rata_Skor_Persen: item.avgScore,
          Tingkat_Kelulusan_Persen: item.passRate,
          Sertifikat_Terbit: item.certificatesCount,
        }))
      )
      wsLang["!cols"] = [
        { wch: 12 },
        { wch: 24 },
        { wch: 16 },
        { wch: 16 },
        { wch: 22 },
        { wch: 24 },
        { wch: 18 },
      ]
      XLSX.utils.book_append_sheet(wb, wsLang, "Capaian_9_Bahasa")

      // Sheet 3: Sebaran Kabupaten/Kota
      const wsReg = XLSX.utils.json_to_sheet(
        regencyDistribution.map((r) => ({
          Kabupaten_Kota: r.regencyName,
          Jumlah_Sekolah: r.schoolsCount,
          Jumlah_Siswa: r.studentsCount,
          Jumlah_Guru: r.teachersCount,
          Sertifikat_Daerah: r.certificatesCount,
        }))
      )
      wsReg["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }]
      XLSX.utils.book_append_sheet(wb, wsReg, "Sebaran_Kabupaten")

      // Sheet 4: Sebaran Sekolah
      const wsSchool = XLSX.utils.json_to_sheet(
        schoolDistribution.map((s) => ({
          Nama_Sekolah: s.schoolName,
          Kabupaten_Kota: s.regencyName,
          Jumlah_Siswa: s.studentsCount,
          Jumlah_Guru: s.teachersCount,
          Total_Kuis_Dikerjakan: s.attemptsCount,
          Rata_Rata_Skor_Persen: s.avgScore,
        }))
      )
      wsSchool["!cols"] = [
        { wch: 36 },
        { wch: 26 },
        { wch: 14 },
        { wch: 14 },
        { wch: 22 },
        { wch: 22 },
      ]
      XLSX.utils.book_append_sheet(wb, wsSchool, "Sebaran_Sekolah")

      // Sheet 5: Analisis Ungkapan
      const combinedExp = [
        ...analytics.mostMasteredExpressions.map((e) => ({
          Kategori: "Paling Dikuasai",
          Bahasa_Daerah: e.languageName,
          Ungkapan_atau_Soal: e.label,
          Arti: e.meaning ?? "-",
          Dijawab: e.totalAnswered,
          Benar: e.correctCount,
          Akurasi_Persen: e.accuracyPercent,
        })),
        ...analytics.hardestExpressions.map((e) => ({
          Kategori: "Paling Sulit",
          Bahasa_Daerah: e.languageName,
          Ungkapan_atau_Soal: e.label,
          Arti: e.meaning ?? "-",
          Dijawab: e.totalAnswered,
          Benar: e.correctCount,
          Akurasi_Persen: e.accuracyPercent,
        })),
      ]
      const wsExp = XLSX.utils.json_to_sheet(combinedExp)
      wsExp["!cols"] = [
        { wch: 18 },
        { wch: 22 },
        { wch: 48 },
        { wch: 36 },
        { wch: 12 },
        { wch: 12 },
        { wch: 16 },
      ]
      XLSX.utils.book_append_sheet(wb, wsExp, "Analisis_Ungkapan")

      const dateTag = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(wb, `Laporan_Analitik_BBPST_Sulteng_${dateTag}.xlsx`)
      notify.success("Laporan Excel BBPST berhasil diunduh!")
    } catch (err) {
      console.error("Gagal ekspor Excel analitik:", err)
      notify.error("Gagal membuat file Excel analitik.")
    }
  }

  async function handleExportPDF() {
    try {
      setIsExportingPdf(true)
      const officialLogo = await loadOfficialLogoForExport()
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      const pageWidth = 210
      let y = 18

      // Kop Surat Resmi Instansi Berlatar Putih + Aksen Garis Ganda
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageWidth, 34, "F")

      if (officialLogo) {
        const logoH = 14
        const logoW = logoH * officialLogo.aspectRatio
        doc.addImage(officialLogo.dataUrl, "PNG", 14, 7, logoW, logoH)
      } else {
        doc.setTextColor(30, 19, 94)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.text("BALAI BAHASA PROVINSI SULAWESI TENGAH", 14, 15)
      }

      const printedDate = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })

      doc.setTextColor(30, 19, 94)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10.5)
      doc.text("LAPORAN ANALITIK EKSEKUTIF", pageWidth - 14, 12, { align: "right" })
      doc.setFontSize(8.5)
      doc.setTextColor(60, 34, 187)
      doc.text("LMS BAHASA & KARAKTER (BAKTI)", pageWidth - 14, 17.5, { align: "right" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(82, 82, 91)
      doc.text(`Dicetak pada: ${printedDate}`, pageWidth - 14, 22.5, { align: "right" })

      // Garis Pemisah Kop Surat (Royal Indigo & Emas)
      doc.setDrawColor(60, 34, 187)
      doc.setLineWidth(0.9)
      doc.line(14, 28, pageWidth - 14, 28)
      doc.setDrawColor(217, 119, 6)
      doc.setLineWidth(0.4)
      doc.line(14, 29.6, pageWidth - 14, 29.6)

      y = 40
      doc.setTextColor(24, 24, 27)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("1. Ringkasan Eksekutif Pangkalan Data", 14, y)
      y += 6

      const summaryRows = [
        ["Pengguna Aktif", `${summary.totalActiveUsers} akun (${summary.totalStudents} siswa, ${summary.totalTeachers} guru)`],
        ["Cakupan Wilayah", `${summary.totalSchools} sekolah di ${summary.totalRegencies} kabupaten/kota`],
        ["Evaluasi & Skor", `${summary.totalQuizAttempts} percobaan kuis | Rata-rata skor ${summary.overallAvgScore}%`],
        ["Sertifikat Terbit", `${summary.totalRegionalCertificates} sertifikat bahasa daerah, ${summary.totalMaterialCertificates} sertifikat materi`],
      ]

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9.5)
      for (const [k, v] of summaryRows) {
        doc.setFont("helvetica", "bold")
        doc.text(`• ${k}:`, 16, y)
        doc.setFont("helvetica", "normal")
        doc.text(v, 58, y)
        y += 6
      }

      y += 4
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("2. Capaian 9 Bahasa Daerah Sulawesi Tengah", 14, y)
      y += 6

      // Table Header
      doc.setFillColor(244, 241, 255)
      doc.rect(14, y - 4, pageWidth - 28, 7, "F")
      doc.setFontSize(8.5)
      doc.setTextColor(30, 19, 94)
      doc.text("Bahasa Daerah", 16, y)
      doc.text("Peserta Modul", 72, y)
      doc.text("Kuis", 104, y)
      doc.text("Rata-rata", 128, y)
      doc.text("Lulus", 156, y)
      doc.text("Sertifikat", 178, y)
      y += 6

      doc.setTextColor(39, 39, 42)
      doc.setFont("helvetica", "normal")
      for (const row of languagePerformance) {
        doc.text(row.name, 16, y)
        doc.text(String(row.moduleStarters), 78, y)
        doc.text(String(row.attemptsCount), 106, y)
        doc.text(`${row.avgScore}%`, 132, y)
        doc.text(`${row.passRate}%`, 158, y)
        doc.text(String(row.certificatesCount), 184, y)
        y += 5.5
      }

      y += 6
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(24, 24, 27)
      doc.text("3. Ungkapan Paling Dikuasai & Paling Sulit", 14, y)
      y += 6

      doc.setFontSize(9)
      doc.setTextColor(6, 95, 70)
      doc.text("Ungkapan Paling Dikuasai:", 16, y)
      y += 5
      doc.setFont("helvetica", "normal")
      doc.setTextColor(39, 39, 42)
      if (analytics.mostMasteredExpressions.length === 0) {
        doc.text("- Belum ada data jawaban evaluasi siswa.", 18, y)
        y += 5
      } else {
        for (const item of analytics.mostMasteredExpressions.slice(0, 4)) {
          const shortText =
            item.label.length > 68 ? `${item.label.slice(0, 65)}...` : item.label
          doc.text(
            `- [${item.accuracyPercent}% benar | ${item.languageName}] ${shortText}`,
            18,
            y
          )
          y += 5
        }
      }

      y += 3
      doc.setFont("helvetica", "bold")
      doc.setTextColor(180, 83, 9)
      doc.text("Ungkapan Paling Sulit (Perlu Penguatan):", 16, y)
      y += 5
      doc.setFont("helvetica", "normal")
      doc.setTextColor(39, 39, 42)
      if (analytics.hardestExpressions.length === 0) {
        doc.text("- Belum ada data jawaban evaluasi siswa.", 18, y)
        y += 5
      } else {
        for (const item of analytics.hardestExpressions.slice(0, 4)) {
          const shortText =
            item.label.length > 68 ? `${item.label.slice(0, 65)}...` : item.label
          doc.text(
            `- [${item.accuracyPercent}% benar | ${item.languageName}] ${shortText}`,
            18,
            y
          )
          y += 5
        }
      }

      y += 6
      if (y < 255) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(24, 24, 27)
        doc.text("4. Sebaran Kabupaten / Kota", 14, y)
        y += 6
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8.5)
        for (const reg of regencyDistribution.slice(0, 8)) {
          doc.text(
            `• ${reg.regencyName}: ${reg.schoolsCount} sekolah, ${reg.studentsCount} siswa, ${reg.certificatesCount} sertifikat`,
            16,
            y
          )
          y += 5
        }
      }

      const dateTag = new Date().toISOString().slice(0, 10)
      doc.save(`Laporan_Eksekutif_BBPST_${dateTag}.pdf`)
      notify.success("Laporan PDF eksekutif BBPST berhasil diunduh!")
    } catch (err) {
      console.error("Gagal membuat PDF analitik:", err)
      notify.error("Gagal membuat dokumen PDF laporan.")
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar Ekspor */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-[#3C22BB] uppercase tracking-wider">
            Pusat Data Balai Bahasa Provinsi Sulawesi Tengah
          </div>
          <p className="text-xs text-zinc-600">
            Pantau keterlibatan sekolah, penguasaan 9 bahasa daerah, dan analisis butir ungkapan untuk perumusan program literasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={handleExportExcel}
            variant="outline"
            className="text-xs font-bold rounded-xl border-emerald-300 text-[#065F46] hover:bg-emerald-50 h-9 gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </Button>
          <Button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="text-xs font-bold rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white h-9 gap-1.5 shadow-xs"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-amber-300" />
            )}
            <span>Ekspor Laporan PDF</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Pengguna Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3C22BB] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1E135E]">
            {summary.totalActiveUsers}
          </div>
          <div className="text-[11px] text-zinc-500">
            {summary.totalStudents} Siswa ({summary.activeLearnersCount} aktif belajar) •{" "}
            {summary.totalTeachers} Guru
          </div>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Sekolah &amp; Wilayah</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#065F46] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#065F46]">
            {summary.totalSchools} Sekolah
          </div>
          <div className="text-[11px] text-zinc-500">
            Tersebar di {summary.totalRegencies} Kabupaten/Kota Sulteng
          </div>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Rata-rata Skor Kuis</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#D97706]">
            {summary.overallAvgScore}%
          </div>
          <div className="text-[11px] text-zinc-500">
            Dari total {summary.totalQuizAttempts} sesi evaluasi tersimpan
          </div>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Sertifikat Digital</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3C22BB] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1E135E]">
            {summary.totalRegionalCertificates + summary.totalMaterialCertificates}
          </div>
          <div className="text-[11px] text-zinc-500">
            {summary.totalRegionalCertificates} Bahasa Daerah •{" "}
            {summary.totalMaterialCertificates} Literasi
          </div>
        </Card>
      </div>

      {/* Capaian 9 Bahasa Daerah */}
      <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#3C22BB]" />
            <h2 className="text-sm font-bold text-[#1E135E] uppercase tracking-wider">
              Rata-Rata Nilai &amp; Aktivitas per Bahasa Daerah
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500">
            9 Bahasa Daerah Prioritas Sulawesi Tengah
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {languagePerformance.map((lang) => (
            <div
              key={lang.code}
              className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-zinc-200/80 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#1E135E] truncate">
                  {lang.name}
                </span>
                <span className="text-xs font-extrabold text-[#3C22BB]">
                  {lang.avgScore}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-200/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3C22BB] to-[#065F46]"
                  style={{ width: `${Math.min(100, Math.max(4, lang.avgScore))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>{lang.moduleStarters} peserta modul</span>
                <span>{lang.attemptsCount} kuis</span>
                <span className="font-semibold text-[#065F46]">
                  {lang.certificatesCount} sertifikat
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ungkapan Paling Dikuasai vs Paling Sulit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Paling Dikuasai */}
        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#065F46]" />
              <h2 className="text-sm font-bold text-[#065F46] uppercase tracking-wider">
                Ungkapan Paling Dikuasai
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500">Akurasi Tertinggi</span>
          </div>

          <div className="space-y-2.5">
            {analytics.mostMasteredExpressions.length > 0 ? (
              analytics.mostMasteredExpressions.map((item) => (
                <div
                  key={item.questionId}
                  className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <span className="inline-block text-[10px] font-bold text-[#065F46] bg-emerald-100 px-2 py-0.5 rounded-full">
                      {item.languageName}
                    </span>
                    <p className="text-xs font-bold text-zinc-900 line-clamp-2">
                      {item.label}
                    </p>
                    {item.meaning && (
                      <p className="text-[11px] text-zinc-600 line-clamp-1">
                        Arti: {item.meaning}
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-500">
                      {item.correctCount} benar dari {item.totalAnswered} jawaban
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#065F46] bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.accuracyPercent}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-zinc-400 border border-dashed rounded-xl">
                Belum ada data pengerjaan kuis siswa untuk dianalisis.
              </div>
            )}
          </div>
        </Card>

        {/* Paling Sulit */}
        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <h2 className="text-sm font-bold text-[#D97706] uppercase tracking-wider">
                Ungkapan Paling Sulit
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500">Perlu Penguatan Materi</span>
          </div>

          <div className="space-y-2.5">
            {analytics.hardestExpressions.length > 0 ? (
              analytics.hardestExpressions.map((item) => (
                <div
                  key={item.questionId}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      {item.languageName}
                    </span>
                    <p className="text-xs font-bold text-zinc-900 line-clamp-2">
                      {item.label}
                    </p>
                    {item.meaning && (
                      <p className="text-[11px] text-zinc-600 line-clamp-1">
                        Arti: {item.meaning}
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-500">
                      {item.correctCount} benar dari {item.totalAnswered} jawaban
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-white px-2.5 py-1 rounded-xl border border-amber-200">
                      {item.accuracyPercent}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-zinc-400 border border-dashed rounded-xl">
                Belum ada data pengerjaan kuis siswa untuk dianalisis.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Sebaran Kabupaten/Kota & Sekolah */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Sebaran Kabupaten (5 cols) */}
        <Card className="lg:col-span-5 rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <MapPin className="w-4 h-4 text-[#3C22BB]" />
            <h2 className="text-sm font-bold text-[#1E135E] uppercase tracking-wider">
              Sebaran per Kabupaten / Kota
            </h2>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {regencyDistribution.map((reg) => (
              <div
                key={reg.regencyId}
                className="p-3 rounded-xl bg-[#FAFAF8] border border-zinc-200/80 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 truncate">
                    {reg.regencyName}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {reg.schoolsCount} sekolah • {reg.teachersCount} guru
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-[#3C22BB]">
                    {reg.studentsCount} siswa
                  </div>
                  <div className="text-[10px] font-semibold text-[#065F46]">
                    {reg.certificatesCount} sertifikat
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sebaran Sekolah (7 cols) */}
        <Card className="lg:col-span-7 rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-[#065F46]" />
              <h2 className="text-sm font-bold text-[#1E135E] uppercase tracking-wider">
                Partisipasi per Satuan Pendidikan
              </h2>
            </div>

            <select
              value={selectedRegency}
              onChange={(e) => setSelectedRegency(e.target.value)}
              className="h-8 text-xs rounded-xl border border-zinc-200 bg-white px-2.5 text-zinc-700"
            >
              <option value="ALL">Semua Kabupaten/Kota</option>
              {regencyDistribution.map((r) => (
                <option key={r.regencyId} value={r.regencyName}>
                  {r.regencyName}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-bold">
                  <th className="py-2 pr-3">Sekolah</th>
                  <th className="py-2 px-2">Kab/Kota</th>
                  <th className="py-2 px-2 text-center">Siswa</th>
                  <th className="py-2 px-2 text-center">Kuis</th>
                  <th className="py-2 pl-2 text-right">Rata-rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSchools.map((sch) => (
                  <tr key={sch.schoolId} className="hover:bg-zinc-50/70">
                    <td className="py-2.5 pr-3 font-bold text-zinc-900">
                      {sch.schoolName}
                    </td>
                    <td className="py-2.5 px-2 text-zinc-600">{sch.regencyName}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">
                      {sch.studentsCount}
                    </td>
                    <td className="py-2.5 px-2 text-center text-zinc-600">
                      {sch.attemptsCount}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-extrabold text-[#3C22BB]">
                      {sch.avgScore}%
                    </td>
                  </tr>
                ))}
                {filteredSchools.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      Tidak ada sekolah pada kabupaten/kota terpilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

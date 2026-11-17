"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  TrendingUp,
  Award,
  Users,
  Building2,
  BarChart3,
  CheckCircle2,
} from "lucide-react"

export interface RegencyStatItem {
  id: string
  name: string
  fullName: string
  code: string
  schoolCount: number
  studentCount: number
  attemptCount: number
  avgScore: number
}

interface RegencyAnalyticsChartProps {
  regencies: RegencyStatItem[]
}

export function RegencyAnalyticsChart({ regencies }: RegencyAnalyticsChartProps) {
  const [metric, setMetric] = useState<"STUDENTS" | "SCORE">("STUDENTS")

  // Hitung ringkasan provinsi
  const totalSchools = regencies.reduce((acc, r) => acc + r.schoolCount, 0)
  const totalStudents = regencies.reduce((acc, r) => acc + r.studentCount, 0)
  const totalAttempts = regencies.reduce((acc, r) => acc + r.attemptCount, 0)

  const activeWithAttempts = regencies.filter((r) => r.attemptCount > 0)
  const provAvgScore =
    activeWithAttempts.length > 0
      ? Math.round(
          activeWithAttempts.reduce((acc, r) => acc + r.avgScore, 0) /
            activeWithAttempts.length
        )
      : 0

  // Cari kabupaten paling aktif
  const mostActive = [...regencies].sort((a, b) => b.studentCount - a.studentCount)[0]

  // Nilai maksimum untuk skala bar
  const maxStudents = Math.max(...regencies.map((r) => r.studentCount), 1)

  // Urutkan data berdasarkan metrik yang dipilih
  const sortedRegencies = [...regencies].sort((a, b) => {
    if (metric === "STUDENTS") {
      return b.studentCount - a.studentCount || b.schoolCount - a.schoolCount
    }
    return b.avgScore - a.avgScore || b.attemptCount - a.attemptCount
  })

  return (
    <Card className="border border-zinc-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
      <CardHeader className="p-5 sm:p-6 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#3C22BB]/10 text-[#3C22BB]">
                <MapPin className="w-4 h-4" />
              </span>
              <CardTitle className="text-base sm:text-lg font-bold text-[#18181B]">
                Sebaran Literasi & Partisipasi Wilayah Sulawesi Tengah
              </CardTitle>
            </div>
            <p className="text-xs text-zinc-500">
              Perbandingan partisipasi siswa dan capaian kuis di 13 Kabupaten & Kota
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
            <Button
              type="button"
              variant={metric === "STUDENTS" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMetric("STUDENTS")}
              className={`h-8 text-xs font-semibold rounded-lg transition-all ${
                metric === "STUDENTS"
                  ? "bg-[#3C22BB] text-white hover:bg-[#2E1994] shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Siswa Aktif
            </Button>
            <Button
              type="button"
              variant={metric === "SCORE" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMetric("SCORE")}
              className={`h-8 text-xs font-semibold rounded-lg transition-all ${
                metric === "SCORE"
                  ? "bg-[#3C22BB] text-white hover:bg-[#2E1994] shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Rata-rata Nilai
            </Button>
          </div>
        </div>

        {/* Ringkasan Indikator Wilayah */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="text-[11px] font-medium text-blue-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Satuan Pendidikan
            </div>
            <div className="text-lg font-black text-blue-950 mt-0.5">
              {totalSchools}{" "}
              <span className="text-[11px] font-normal text-blue-700">Sekolah</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
            <div className="text-[11px] font-medium text-purple-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Siswa Terdaftar
            </div>
            <div className="text-lg font-black text-purple-950 mt-0.5">
              {totalStudents}{" "}
              <span className="text-[11px] font-normal text-purple-700">Siswa</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Rata-Rata Provinsi
            </div>
            <div className="text-lg font-black text-emerald-950 mt-0.5">
              {provAvgScore > 0 ? `${provAvgScore}%` : "—"}{" "}
              <span className="text-[11px] font-normal text-emerald-700">Ketuntasan</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <div className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Wilayah Teraktif
            </div>
            <div className="text-sm font-bold text-amber-950 truncate mt-1">
              {mostActive?.name ?? "Belum ada"}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-3.5">
        <div className="space-y-3">
          {sortedRegencies.map((reg, index) => {
            const studentBarWidth = Math.max(
              Math.round((reg.studentCount / maxStudents) * 100),
              reg.studentCount > 0 ? 6 : 0
            )
            const scoreBarWidth = reg.avgScore

            return (
              <div
                key={reg.id}
                className="p-3 rounded-xl bg-zinc-50/70 hover:bg-zinc-100/70 border border-zinc-200/60 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-white border border-zinc-200 text-[10px] font-bold text-zinc-500 flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-zinc-800 truncate">
                      {reg.fullName}
                    </span>
                    <span className="hidden sm:inline-block text-[10px] text-zinc-400 font-mono">
                      (Kode {reg.code})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px]">
                    <span className="text-zinc-500">
                      {reg.schoolCount} Sek.
                    </span>

                    {metric === "STUDENTS" ? (
                      <span className="font-bold text-[#3C22BB] font-mono">
                        {reg.studentCount} Siswa
                      </span>
                    ) : (
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded-full text-[10px] ${
                          reg.avgScore >= 80
                            ? "bg-emerald-100 text-emerald-800"
                            : reg.avgScore >= 60
                            ? "bg-blue-100 text-blue-800"
                            : reg.avgScore > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {reg.avgScore > 0 ? `${reg.avgScore}%` : "0% (Belum ada kuis)"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar visualisasi */}
                <div className="w-full bg-zinc-200/70 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metric === "STUDENTS"
                        ? "bg-gradient-to-r from-[#3C22BB] to-[#0284C7]"
                        : reg.avgScore >= 80
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : reg.avgScore >= 60
                        ? "bg-gradient-to-r from-blue-500 to-sky-400"
                        : "bg-gradient-to-r from-amber-500 to-orange-400"
                    }`}
                    style={{
                      width: `${metric === "STUDENTS" ? studentBarWidth : scoreBarWidth}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100">
          <span>* Data terhimpun otomatis dari seluruh akun siswa terverifikasi di Provinsi Sulawesi Tengah</span>
          <span className="hidden sm:inline-block font-medium text-zinc-600">
            Total 13 Wilayah
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

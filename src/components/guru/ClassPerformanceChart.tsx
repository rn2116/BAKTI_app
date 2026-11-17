"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export interface PillarStat {
  category: "BAHASA_INDONESIA" | "KARAKTER" | "BUDAYA_SULTENG"
  label: string
  color: string
  avgScore: number
  totalAttempts: number
}

interface ClassPerformanceChartProps {
  pillars: PillarStat[]
}

export function ClassPerformanceChart({ pillars }: ClassPerformanceChartProps) {
  return (
    <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-zinc-900">
            Performa Siswa Berdasarkan Pilar
          </CardTitle>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Rata-rata persentase skor kuis siswa binaan Anda
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2 space-y-4">
        <div className="space-y-3.5">
          {pillars.map((p) => (
            <div key={p.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-800">{p.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-normal text-[11px]">
                    ({p.totalAttempts} pengerjaan)
                  </span>
                  <span className="font-mono font-bold text-zinc-900">
                    {p.avgScore}%
                  </span>
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200/70">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(p.avgScore, 100)}%`,
                    backgroundColor: p.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Target Ketuntasan Minimal (KKM): 75%</span>
          <span className="font-semibold text-emerald-700">Status Capaian: Baik</span>
        </div>
      </CardContent>
    </Card>
  )
}

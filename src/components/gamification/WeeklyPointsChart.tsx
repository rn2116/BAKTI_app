"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DayActivity } from "@/services/studentDashboardService"

interface WeeklyPointsChartProps {
  data: DayActivity[]
}

const BAR_COLORS = [
  "#0284C7", // Sky
  "#059669", // Emerald
  "#3C22BB", // Royal Indigo
  "#EA580C", // Orange
  "#0D9488", // Teal
  "#E11D48", // Rose
  "#D97706", // Amber
]

export function WeeklyPointsChart({ data }: WeeklyPointsChartProps) {
  const maxPoints = Math.max(...data.map((d) => d.points), 50)
  const totalWeekly = data.reduce((acc, curr) => acc + curr.points, 0)

  return (
    <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-zinc-900">
            Perkembangan Poin Mingguan
          </CardTitle>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Aktivitas 7 hari terakhir
          </p>
        </div>
        <div className="text-right">
          <span className="text-base font-black text-[#3C22BB] font-mono">
            +{totalWeekly}
          </span>
          <span className="text-[10px] text-zinc-400 block -mt-0.5">Poin Minggu Ini</span>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-3">
        {/* Grafik Batang 7 Hari */}
        <div className="flex items-end justify-between gap-2 h-36 pt-4 border-b border-zinc-100">
          {data.map((day, idx) => {
            const heightPercent = Math.max(Math.round((day.points / maxPoints) * 100), 8)
            const color = BAR_COLORS[idx % BAR_COLORS.length]

            return (
              <div key={day.dateString} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                {/* Nilai Poin Popover */}
                <span className="text-[10px] font-mono font-bold text-zinc-600 opacity-80 group-hover:opacity-100 transition-opacity">
                  {day.points > 0 ? `+${day.points}` : "0"}
                </span>

                {/* Batang Visual */}
                <div className="w-full max-w-[28px] bg-zinc-100 rounded-t-lg overflow-hidden flex items-end h-24">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: day.points > 0 ? color : "#E4E4E7",
                    }}
                  />
                </div>

                {/* Nama Hari */}
                <span className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors mt-1">
                  {day.dayName}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

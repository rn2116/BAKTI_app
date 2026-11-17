"use client"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Trophy, Sparkles } from "lucide-react"

type Scope = "global" | "school" | "class"

interface LeaderboardRowProps {
  rank: number
  name: string
  score: number
  maxScore: number
  isTop3: boolean
}

function LeaderboardRow({ rank, name, score, maxScore, isTop3 }: LeaderboardRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150",
        isTop3
          ? "bg-amber-50/70 border-amber-200 shadow-xs"
          : "bg-white border-zinc-200 hover:bg-zinc-50/50"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
            rank === 1
              ? "bg-amber-100 text-[#D97706] border border-amber-300"
              : rank === 2
              ? "bg-zinc-100 text-zinc-700 border border-zinc-300"
              : rank === 3
              ? "bg-orange-100 text-orange-700 border border-orange-300"
              : "bg-zinc-50 text-zinc-500 font-medium"
          )}
        >
          {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
        </div>
        <div className="truncate text-xs sm:text-sm font-semibold text-zinc-900">
          {name}
        </div>
      </div>
      <div className="text-right shrink-0 font-mono text-xs sm:text-sm font-bold text-zinc-800">
        {score} <span className="text-[10px] text-zinc-400 font-normal">/ {maxScore}</span>
      </div>
    </div>
  )
}

export default function PeringkatSiswaPage() {
  const [scope, setScope] = useState<Scope>("global")
  const [rows, setRows] = useState<Array<{ rank: number; name: string; score: number; maxScore: number }>>([])

  useEffect(() => {
    ;(async () => {
      const res = await fetch(`/api/leaderboard?scope=${scope}`)
      if (!res.ok) return
      const data = await res.json()
      setRows(data)
    })()
  }, [scope])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Papan Peringkat"
        description="Lihat capaian nilai dan posisi Anda di antara sesama peserta didik."
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 w-full sm:w-auto shadow-xs">
          {(["global", "school", "class"] as Scope[]).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150",
                scope === s
                  ? "bg-[#3C22BB] text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              )}
            >
              {s === "global" ? "Global" : s === "school" ? "Sekolah" : "Kelas"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <Trophy className="w-4 h-4 text-[#D97706]" />
          <span>{rows.length === 0 ? "Belum ada data" : `${rows.length} Peserta Terdaftar`}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.length === 0 ? (
          <div className="p-12 border border-dashed border-zinc-200 rounded-2xl text-center text-xs text-zinc-500 bg-white shadow-xs">
            Belum ada data peringkat untuk cakupan yang dipilih.
          </div>
        ) : (
          rows.map((row) => (
            <LeaderboardRow key={row.name} {...row} isTop3={row.rank <= 3} />
          ))
        )}
      </div>
    </div>
  )
}

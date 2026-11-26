"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn } from "@/lib/utils"
import { Trophy, Sparkles, School, Users, Globe2 } from "lucide-react"
import {
  LeaderboardPodium,
  type PodiumUser,
} from "@/components/gamification/LeaderboardPodium"

type Scope = "global" | "school" | "class"

interface LeaderboardEntry extends PodiumUser {
  score?: number
  maxScore?: number
}

function LeaderboardRow({
  rank,
  name,
  schoolName,
  level,
  xp,
}: {
  rank: number
  name: string
  schoolName?: string
  level: number
  xp: number
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-zinc-200/90 bg-white hover:bg-zinc-50/70 transition-all shadow-2xs">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Nomor Peringkat */}
        <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-600 font-extrabold text-xs flex items-center justify-center shrink-0 border border-zinc-200">
          #{rank}
        </div>

        {/* Avatar Inisial */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E135E] to-[#3C22BB] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Nama & Sekolah */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs sm:text-sm font-bold text-zinc-900 leading-tight">
            {name}
          </div>
          <div className="text-[11px] text-zinc-500 truncate mt-0.5 flex items-center gap-1.5">
            <span className="font-medium">{schoolName || "Sulawesi Tengah"}</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Lvl {level}</span>
          </div>
        </div>
      </div>

      {/* Nilai XP */}
      <div className="text-right shrink-0">
        <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{xp} XP</span>
        </div>
      </div>
    </div>
  )
}

export default function PeringkatSiswaPage() {
  const [scope, setScope] = useState<Scope>("global")
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    fetch(`/api/leaderboard?scope=${scope}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active) {
          setRows(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setRows([])
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [scope])

  const topThree = rows.slice(0, 3)
  const remainingRows = rows.slice(3)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Papan Peringkat Pelajar"
        description="Pantau posisi prestasi literasi, capaian poin XP, dan tingkat level Anda di Sulawesi Tengah."
      />

      {/* Filter Cakupan Peringkat: Global, Sekolah, Kelas */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between min-w-0">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-zinc-200 bg-white p-1.5 w-full sm:w-auto shadow-2xs">
          {[
            { id: "global" as Scope, label: "Semua Wilayah", icon: Globe2 },
            { id: "school" as Scope, label: "Sekolah Saya", icon: School },
            { id: "class" as Scope, label: "Kelas Saya", icon: Users },
          ].map((item) => {
            const IconComp = item.icon
            const active = scope === item.id
            return (
              <button
                key={item.id}
                onClick={() => setScope(item.id)}
                className={cn(
                  "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 min-h-11 whitespace-nowrap",
                  active
                    ? "bg-[#3C22BB] text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                )}
              >
                <IconComp className={cn("w-3.5 h-3.5", active ? "text-white" : "text-zinc-400")} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
          <Trophy className="w-4 h-4 text-[#D97706]" />
          <span>
            {loading ? "Memuat data..." : `${rows.length} Peserta Terdaftar`}
          </span>
        </div>
      </div>

      {/* State Loading Skeleton Ringan */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-48 rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/80" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200/80" />
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-300 rounded-3xl text-center text-xs text-zinc-500 bg-white shadow-xs space-y-2">
          <Trophy className="w-8 h-8 text-zinc-300 mx-auto" />
          <p className="font-bold text-sm text-zinc-700">Belum Ada Data Peringkat</p>
          <p className="text-zinc-500">
            Selesaikan materi dan kuis untuk menjadi yang pertama mencatatkan poin di cakupan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visualisasi Panggung Podium Juara 1, 2, 3 */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                ⭐ Tiga Terbaik (Top 3)
              </span>
            </div>
            <LeaderboardPodium topThree={topThree} />
          </div>

          {/* Daftar Peringkat Posisi ke-4 dan Seterusnya */}
          {remainingRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                  Peringkat Selanjutnya (Urutan 4+)
                </h3>
                <span className="text-xs text-zinc-400 font-medium">
                  {remainingRows.length} Siswa
                </span>
              </div>

              <div className="space-y-2">
                {remainingRows.map((row) => (
                  <LeaderboardRow
                    key={row.userId || row.name}
                    rank={row.rank}
                    name={row.name}
                    schoolName={row.schoolName}
                    level={row.level}
                    xp={row.xp}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

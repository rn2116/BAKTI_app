"use client"

import Link from "next/link"
import { Star, Flame, Trophy, Coins, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { AnimatedProgressBar } from "@/components/gamification/AnimatedProgressBar"

interface GamificationStatsRowProps {
  level: number
  levelTitle: string
  xpInLevel: number
  xpNeeded: number
  totalPoints: number
  streakDays: number
  badgesCount: number
}

export function GamificationStatsRow({
  level,
  levelTitle,
  xpInLevel,
  xpNeeded,
  totalPoints,
  streakDays,
  badgesCount,
}: GamificationStatsRowProps) {
  const xpPercent = Math.min(Math.round((xpInLevel / (xpNeeded || 1)) * 100), 100)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Level Pembelajar */}
      <Card className="p-4 sm:p-5 border-zinc-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all bg-white rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-[#D97706] shrink-0">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
            Tingkat
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
            Level {level}
          </div>
          <div className="text-xs font-semibold text-zinc-600 truncate">
            {levelTitle}
          </div>
        </div>

        <div className="mt-3">
          <AnimatedProgressBar
            value={xpPercent}
            label={`${xpInLevel}/${xpNeeded} XP`}
            color="accent"
            className="w-full"
          />
        </div>
      </Card>

      {/* 2. Total Poin (XP) */}
      <Card className="p-4 sm:p-5 border-zinc-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all bg-white rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-2xl bg-[#3C22BB]/10 border border-[#3C22BB]/20 flex items-center justify-center text-[#3C22BB] shrink-0">
            <Coins className="w-5 h-5 text-[#3C22BB]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#3C22BB] bg-[#3C22BB]/10 px-2 py-0.5 rounded-full">
            Koin XP
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
            {totalPoints.toLocaleString("id-ID")}
          </div>
          <div className="text-xs font-semibold text-zinc-600">
            Total Poin Diraih
          </div>
        </div>

        <Link
          href="/siswa/peringkat"
          className="mt-3 text-[11px] font-bold text-[#3C22BB] hover:text-[#2E1994] flex items-center gap-0.5 transition-colors"
        >
          Lihat peringkat <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </Card>

      {/* 3. Streak Hari Belajar */}
      <Card className="p-4 sm:p-5 border-zinc-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all bg-white rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-300 flex items-center justify-center text-orange-600 shrink-0">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-full">
            Streak
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
            {streakDays} Hari
          </div>
          <div className="text-xs font-semibold text-zinc-600">
            {streakDays > 0 ? "Hari Beruntun Aktif" : "Mulai Hari Ini!"}
          </div>
        </div>

        <div className="mt-3 text-[11px] font-bold text-orange-600 flex items-center gap-1">
          <span>{streakDays > 0 ? "Pertahankan! 🔥" : "Ayo raih streak pertamamu!"}</span>
        </div>
      </Card>

      {/* 4. Koleksi Lencana (Badge) */}
      <Card className="p-4 sm:p-5 border-zinc-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all bg-white rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            Lencana
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-zinc-900 font-mono">
            {badgesCount}
          </div>
          <div className="text-xs font-semibold text-zinc-600">
            Lencana Terbuka
          </div>
        </div>

        <Link
          href="/siswa/sertifikat"
          className="mt-3 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition-colors"
        >
          Lihat semua lencana <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </Card>
    </div>
  )
}

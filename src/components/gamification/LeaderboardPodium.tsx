"use client"

import { motion } from "framer-motion"
import { Crown, Sparkles, Medal } from "lucide-react"

export interface PodiumUser {
  rank: number
  name: string
  userId?: string
  schoolName?: string
  level: number
  xp: number
  score?: number
}

interface LeaderboardPodiumProps {
  topThree: PodiumUser[]
}

export function LeaderboardPodium({ topThree }: LeaderboardPodiumProps) {
  if (!topThree || topThree.length === 0) return null

  const first = topThree.find((u) => u.rank === 1) || topThree[0]
  const second = topThree.find((u) => u.rank === 2) || topThree[1]
  const third = topThree.find((u) => u.rank === 3) || topThree[2]

  return (
    <div className="w-full pt-6 pb-4">
      {/* Grid 3 Kolom Podium: Juara 2 (Kiri), Juara 1 (Tengah), Juara 3 (Kanan) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-xl mx-auto">
        {/* ========================================================
            JUARA 2 (KIRI - PERAK)
            ======================================================== */}
        {second ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col items-center text-center"
          >
            {/* Avatar & Identitas */}
            <div className="relative mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-300 via-slate-100 to-white border-2 border-slate-300 text-slate-700 flex items-center justify-center font-black text-sm sm:text-lg shadow-sm">
                {second.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                2
              </span>
            </div>

            <div className="px-1 w-full space-y-0.5 mb-2">
              <div className="font-extrabold text-xs sm:text-sm text-zinc-900 truncate leading-tight">
                {second.name}
              </div>
              {second.schoolName && (
                <div className="text-[10px] text-zinc-500 truncate leading-tight">
                  {second.schoolName}
                </div>
              )}
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Sparkles className="w-3 h-3 text-slate-500" />
                <span>{second.xp} XP</span>
              </div>
            </div>

            {/* Pilar Podium Perak */}
            <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-slate-200 to-slate-300/40 border-t-4 border-slate-400 p-2 sm:p-3 flex flex-col items-center justify-between shadow-2xs">
              <div className="text-[11px] font-extrabold text-slate-600 tracking-wider uppercase">
                Juara 2
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center text-slate-600 shadow-2xs">
                <Medal className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-[10px] font-semibold text-slate-600">
                Lvl {second.level}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-28" />
        )}

        {/* ========================================================
            JUARA 1 (TENGAH - EMAS MAHKOTA)
            ======================================================== */}
        {first && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="flex flex-col items-center text-center -mt-6 sm:-mt-8 z-10"
          >
            {/* Mahkota Emas Berkilau */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#D97706] mb-1 drop-shadow-xs"
            >
              <Crown className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500 fill-amber-400" />
            </motion.div>

            {/* Avatar & Cincin Emas */}
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-100 border-4 border-amber-400 text-amber-950 flex items-center justify-center font-black text-base sm:text-2xl shadow-md">
                {first.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black border-2 border-white shadow-xs">
                1
              </span>
            </div>

            <div className="px-1 w-full space-y-0.5 mb-2">
              <div className="font-black text-xs sm:text-base text-zinc-950 truncate leading-tight">
                {first.name}
              </div>
              {first.schoolName && (
                <div className="text-[10px] sm:text-[11px] text-zinc-500 truncate leading-tight font-medium">
                  {first.schoolName}
                </div>
              )}
              <div className="inline-flex items-center gap-1 text-xs font-black text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{first.xp} XP</span>
              </div>
            </div>

            {/* Pilar Podium Emas Paling Tinggi */}
            <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-b from-amber-200 via-amber-100/60 to-yellow-50/20 border-t-4 border-amber-500 p-2 sm:p-3 flex flex-col items-center justify-between shadow-md">
              <div className="text-xs font-black text-amber-800 tracking-wider uppercase">
                Pemenang #1
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#D97706] flex items-center justify-center text-white shadow-xs">
                <Crown className="w-5 h-5 fill-white" />
              </div>
              <div className="text-[11px] font-bold text-amber-900 bg-white/80 px-2 py-0.5 rounded-md">
                Level {first.level}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            JUARA 3 (KANAN - PERUNGGU)
            ======================================================== */}
        {third ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col items-center text-center"
          >
            {/* Avatar & Identitas */}
            <div className="relative mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-700/30 via-orange-100 to-amber-50 border-2 border-amber-700/40 text-amber-900 flex items-center justify-center font-black text-sm sm:text-lg shadow-sm">
                {third.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                3
              </span>
            </div>

            <div className="px-1 w-full space-y-0.5 mb-2">
              <div className="font-extrabold text-xs sm:text-sm text-zinc-900 truncate leading-tight">
                {third.name}
              </div>
              {third.schoolName && (
                <div className="text-[10px] text-zinc-500 truncate leading-tight">
                  {third.schoolName}
                </div>
              )}
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>{third.xp} XP</span>
              </div>
            </div>

            {/* Pilar Podium Perunggu */}
            <div className="w-full h-24 sm:h-32 rounded-t-2xl bg-gradient-to-b from-amber-700/20 to-orange-200/20 border-t-4 border-amber-700/80 p-2 sm:p-3 flex flex-col items-center justify-between shadow-2xs">
              <div className="text-[11px] font-extrabold text-amber-900 tracking-wider uppercase">
                Juara 3
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center text-amber-800 shadow-2xs">
                <Medal className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-[10px] font-semibold text-amber-900">
                Lvl {third.level}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-24" />
        )}
      </div>
    </div>
  )
}

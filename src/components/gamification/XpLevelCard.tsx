"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sparkles, Trophy } from "lucide-react"

interface XpLevelCardProps {
  xp: number
  level: number
  xpToNext: number
  badgeCount?: number
}

export function XpLevelCard({
  xp,
  level,
  xpToNext,
  badgeCount = 0,
}: XpLevelCardProps) {
  const progress = Math.min(Math.round((xp / (xpToNext || 1)) * 100), 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-[#D97706] font-bold text-xl shadow-xs">
          {level}
        </div>
        <div>
          <div className="text-[11px] font-semibold tracking-wider text-amber-800 uppercase">
            Tingkat Kecakapan
          </div>
          <div className="text-base font-bold text-zinc-900">
            Level {level} Pembelajar
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-amber-900 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Poin Pengalaman (XP)
          </span>
          <span className="text-[#D97706] font-bold font-mono">
            {xp} / {xpToNext} XP
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-amber-100 border border-amber-200">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-[#D97706] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-500 text-right mt-1">
          {Math.max(xpToNext - xp, 0)} XP lagi untuk naik level berikutnya
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-[#D97706] shadow-xs">
          <Trophy className="w-4 h-4 text-[#D97706]" />
          <span>{badgeCount} Lencana Diraih</span>
        </div>
      </div>
    </motion.div>
  )
}

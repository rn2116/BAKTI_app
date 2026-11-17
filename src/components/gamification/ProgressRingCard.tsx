"use client"

import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PillarProgress } from "@/services/studentDashboardService"

interface ProgressRingCardProps {
  overallPercent: number
  completedCount: number
  totalCount: number
  pillars: PillarProgress[]
}

export function ProgressRingCard({
  overallPercent,
  completedCount,
  totalCount,
  pillars,
}: ProgressRingCardProps) {
  // SVG Ring Math
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (overallPercent / 100) * circumference

  return (
    <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-zinc-900">
            Progres Belajar Menyeluruh
          </CardTitle>
          <span className="text-[11px] font-bold text-[#3C22BB] bg-[#3C22BB]/10 px-2 py-0.5 rounded-full">
            {completedCount} / {totalCount} Modul
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2 flex flex-col sm:flex-row items-center gap-6">
        {/* Diagram Lingkaran Animasi SVG */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            {/* Lingkaran Background */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#F4F4F5"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Lingkaran Animasi Progres */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#3C22BB"
              strokeWidth="12"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Label Tengah Lingkaran */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
              {overallPercent}%
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Tuntas
            </span>
          </div>
        </div>

        {/* 3 Bilah Progres Mini Per Pilar */}
        <div className="flex-1 w-full space-y-3">
          {pillars.map((p) => (
            <div key={p.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-700 truncate max-w-[140px] sm:max-w-none">
                  {p.label}
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  {p.completed}/{p.total} ({p.percent}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200/60">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: p.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

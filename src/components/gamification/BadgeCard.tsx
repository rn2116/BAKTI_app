"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Award, Lock } from "lucide-react"

interface BadgeCardProps {
  name: string
  description?: string
  imageUrl?: string
  earnedAt?: Date
  earned?: boolean
}

export function BadgeCard({
  name,
  description,
  imageUrl,
  earnedAt,
  earned = false,
}: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-xl border p-4 flex flex-col items-center justify-center gap-2.5 transition-all duration-200 shadow-xs",
        earned
          ? "bg-amber-50/70 border-amber-200 text-zinc-900"
          : "bg-white border-zinc-200 opacity-60 text-zinc-400"
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs border transition-colors",
          earned
            ? "bg-gradient-to-tr from-amber-100 to-amber-50 border-amber-300 text-[#D97706]"
            : "bg-zinc-100 border-zinc-200 text-zinc-400"
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-10 h-10 object-contain rounded-lg" />
        ) : earned ? (
          <Award className="w-7 h-7 text-[#D97706]" />
        ) : (
          <Lock className="w-6 h-6 text-zinc-400" />
        )}
      </div>

      <div className="text-center">
        <h3 className="text-xs font-bold leading-tight line-clamp-1">{name}</h3>
        {description && (
          <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
            {description}
          </p>
        )}
      </div>

      {earned && earnedAt && (
        <span className="text-[10px] font-semibold text-[#D97706] bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-200">
          Diraih {new Date(earnedAt).toLocaleDateString("id-ID")}
        </span>
      )}
    </motion.div>
  )
}

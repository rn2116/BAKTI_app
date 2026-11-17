"use client"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface AnimatedProgressBarProps {
  value: number // 0-100
  label?: string
  showValue?: boolean
  className?: string
  color?: "secondary" | "primary" | "accent"
}

const COLOR_CLASSES: Record<string, string> = {
  secondary: "bg-secondary",
  primary: "bg-primary",
  accent: "bg-accent",
}

export function AnimatedProgressBar({
  value,
  label,
  showValue = true,
  className,
  color = "secondary",
}: AnimatedProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const rounded = Math.round(displayValue)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1.5">
        {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
        {showValue && (
          <span className="text-xs font-semibold">{rounded}%</span>
        )}
      </div>
      <div className="relative w-full h-2 rounded-full overflow-hidden border border-input">
        <motion.div
          className={cn("h-full rounded-full transition-colors duration-300", COLOR_CLASSES[color])}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  )
}

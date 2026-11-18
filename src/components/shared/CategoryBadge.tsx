import { cn } from "@/lib/utils"
import { CATEGORY_BADGE_CLASSES } from "@/lib/constants"

interface CategoryBadgeProps {
  category: string
  variant?: "default" | "overlay"
  className?: string
}

function labelFromCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

// Styling khusus lencana kontras tinggi di atas ilustrasi/banner gelap
const OVERLAY_CATEGORY_CLASSES: Record<string, string> = {
  BAHASA_INDONESIA: "bg-white/95 text-[#0369A1] border-sky-200",
  KARAKTER: "bg-white/95 text-[#047857] border-emerald-200",
  BUDAYA_SULTENG: "bg-white/95 text-[#0F766E] border-teal-200",
}

export function CategoryBadge({
  category,
  variant = "default",
  className,
}: CategoryBadgeProps) {
  if (variant === "overlay") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] sm:text-xs font-bold tracking-tight uppercase transition-colors shadow-xs backdrop-blur-xs",
          OVERLAY_CATEGORY_CLASSES[category] ??
            "bg-white/95 text-zinc-800 border-zinc-200",
          className
        )}
      >
        {labelFromCategory(category)}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight uppercase transition-colors",
        CATEGORY_BADGE_CLASSES[category] ?? "border-zinc-200 text-zinc-700 bg-zinc-50",
        className
      )}
    >
      {labelFromCategory(category)}
    </span>
  )
}

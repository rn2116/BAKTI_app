import { cn } from "@/lib/utils"
import { CATEGORY_BADGE_CLASSES } from "@/lib/constants"

interface CategoryBadgeProps {
  category: string
}

function labelFromCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight uppercase transition-colors",
        CATEGORY_BADGE_CLASSES[category] ?? "border-gray-200 text-gray-600"
      )}
    >
      {labelFromCategory(category)}
    </span>
  )
}

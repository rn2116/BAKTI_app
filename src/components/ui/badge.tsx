import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#3C22BB] text-white hover:bg-[#2E1994]",
        secondary:
          "border-transparent bg-[#065F46] text-white hover:bg-[#044a36]",
        accent:
          "border-amber-200 bg-amber-50 text-[#D97706]",
        soft:
          "border-[#3C22BB]/20 bg-[#3C22BB]/10 text-[#3C22BB]",
        destructive:
          "border-transparent bg-red-600 text-white",
        outline: "text-zinc-800 border-zinc-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs",
        className
      )}
    >
      <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
        {children}
      </table>
    </div>
  )
}

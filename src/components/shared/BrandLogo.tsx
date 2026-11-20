import * as React from "react"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  collapsed?: boolean
  showSubtitle?: boolean
  light?: boolean
  size?: "sm" | "md" | "lg"
  stacked?: boolean
}

const LOGO_HEIGHT_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "h-7 sm:h-8",
  md: "h-9 sm:h-10",
  lg: "h-12 sm:h-14",
}

export function BrandLogo({
  className,
  collapsed = false,
  showSubtitle = false,
  light = false,
  size = "md",
  stacked = false,
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "select-none",
        stacked
          ? "flex flex-col items-start gap-2.5"
          : "flex items-center gap-2.5 sm:gap-3",
        light && "bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border border-zinc-200/80",
        className
      )}
    >
      <img
        src="/images/logo-bbpst-kemendikdasmen.png"
        alt="Logo Kemendikdasmen — Balai Bahasa Provinsi Sulawesi Tengah"
        width={1024}
        height={194}
        decoding="async"
        className={cn("w-auto object-contain shrink-0", LOGO_HEIGHT_CLASS[size])}
      />

      {!collapsed && (
        <div
          className={cn(
            "min-w-0",
            stacked
              ? "border-t border-zinc-200 pt-2 w-full"
              : "border-l border-zinc-200 pl-2.5 sm:pl-3"
          )}
        >
          <div className="font-black text-xs sm:text-sm tracking-tight uppercase leading-tight text-[#1E135E] truncate">
            Bahasa &amp; Karakter
          </div>
          {showSubtitle && (
            <div className="text-[10px] sm:text-[11px] font-medium leading-snug mt-0.5 text-zinc-500 truncate">
              LMS Pendidikan Bahasa &amp; Budaya
            </div>
          )}
        </div>
      )}
    </div>
  )
}

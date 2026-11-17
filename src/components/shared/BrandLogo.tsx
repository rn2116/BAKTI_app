import * as React from "react"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  collapsed?: boolean
  showSubtitle?: boolean
  light?: boolean
}

export function BrandLogo({
  className,
  collapsed = false,
  showSubtitle = true,
  light = true,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Vektor SVG Buku Terbuka dengan Motif Sulur / Tenun Sulawesi Tengah */}
      <div className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#4F35D6] to-[#3C22BB] p-2 shadow-sm border border-white/20">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Halaman Buku Kiri */}
          <path
            d="M5 8.5C9 7.5 13.5 8 16 10V26.5C13.5 24.8 9 24.2 5 25V8.5Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          {/* Halaman Buku Kanan */}
          <path
            d="M27 8.5C23 7.5 18.5 8 16 10V26.5C18.5 24.8 23 24.2 27 25V8.5Z"
            fill="currentColor"
            fillOpacity="0.8"
          />
          {/* Sulur Tenun Bomba / Aksen Emas Tengah */}
          <path
            d="M16 10V26.5M16 6.5L14 9.5H18L16 6.5Z"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ornamen Sulur Donggala Halus */}
          <path
            d="M9 13C11 13 12.5 14.5 12.5 16.5"
            stroke="#FDE68A"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M23 13C21 13 19.5 14.5 19.5 16.5"
            stroke="#FDE68A"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="overflow-hidden min-w-0">
          <div
            className={cn(
              "font-extrabold text-sm tracking-tight uppercase truncate leading-none",
              light ? "text-white" : "text-[#18181B]"
            )}
          >
            Bahasa & Karakter
          </div>
          {showSubtitle && (
            <div
              className={cn(
                "text-[11px] font-medium truncate mt-1 leading-none",
                light ? "text-indigo-200" : "text-zinc-500"
              )}
            >
              Belajar Bahasa, Berkarakter, Berbudaya
            </div>
          )}
        </div>
      )}
    </div>
  )
}

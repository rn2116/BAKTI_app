import * as React from "react"
import { cn } from "@/lib/utils"

export type SultengTheme =
  | "danau-poso"
  | "lore-lindu"
  | "tenun-donggala"
  | "kaledo-kuliner"
  | "teluk-palu"

interface SultengIllustrationProps {
  theme?: SultengTheme
  className?: string
  width?: number | string
  height?: number | string
}

export function SultengIllustration({
  theme = "teluk-palu",
  className,
}: SultengIllustrationProps) {
  switch (theme) {
    case "danau-poso":
      return (
        <div className={cn("relative overflow-hidden w-full h-36 bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#075985]", className)}>
          <svg viewBox="0 0 360 144" fill="none" className="w-full h-full object-cover">
            {/* Mentari Terbit Danau Poso */}
            <circle cx="180" cy="54" r="28" fill="#FDE047" fillOpacity="0.85" />
            <circle cx="180" cy="54" r="38" stroke="#FEF08A" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4 4" />
            {/* Perbukitan Danau Poso */}
            <path d="M0 90 Q70 60 150 82 T300 70 Q340 76 360 84 V144 H0 Z" fill="#047857" fillOpacity="0.8" />
            <path d="M0 102 Q80 84 180 98 T360 92 V144 H0 Z" fill="#065F46" />
            {/* Riak Air Danau Poso */}
            <path d="M0 114 Q90 108 180 114 T360 112 V144 H0 Z" fill="#0284C7" fillOpacity="0.9" />
            <path d="M20 126 C60 124 100 128 140 126" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M220 124 C260 122 300 126 340 124" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
            {/* Perahu Tradisional Poso */}
            <path d="M120 108 L142 108 L138 114 L118 114 Z" fill="#78350F" />
            <path d="M130 96 L130 108 M130 98 L138 104 L130 106" stroke="#FEF3C7" strokeWidth="1" fill="#FEF3C7" />
          </svg>
        </div>
      )

    case "lore-lindu":
      return (
        <div className={cn("relative overflow-hidden w-full h-36 bg-gradient-to-br from-[#065F46] via-[#047857] to-[#022C22]", className)}>
          <svg viewBox="0 0 360 144" fill="none" className="w-full h-full object-cover">
            {/* Langit & Awan Lore Lindu */}
            <circle cx="60" cy="36" r="18" fill="#FDE68A" fillOpacity="0.6" />
            <ellipse cx="260" cy="30" rx="36" ry="10" fill="#FFFFFF" fillOpacity="0.25" />
            <ellipse cx="280" cy="26" rx="24" ry="12" fill="#FFFFFF" fillOpacity="0.25" />
            {/* Lembah Hijau Bada / Lore Lindu */}
            <path d="M0 80 Q90 50 200 75 T360 65 V144 H0 Z" fill="#059669" fillOpacity="0.7" />
            <path d="M0 96 Q110 80 220 90 T360 85 V144 H0 Z" fill="#047857" />
            {/* Patung Megalit Palindo Khas Lembah Bada */}
            <g transform="translate(162, 58)">
              <rect x="10" y="10" width="22" height="42" rx="11" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
              {/* Mata bulat khas Palindo */}
              <circle cx="16" cy="20" r="2.5" fill="#374151" />
              <circle cx="26" cy="20" r="2.5" fill="#374151" />
              {/* Hidung memanjang & mulut */}
              <line x1="21" y1="20" x2="21" y2="28" stroke="#374151" strokeWidth="1.2" />
              <ellipse cx="21" cy="32" rx="3" ry="1" fill="#374151" />
              {/* Ukiran Tangan Melingkar */}
              <path d="M12 36 Q21 44 30 36" stroke="#4B5563" strokeWidth="1.2" fill="none" />
            </g>
            <path d="M0 120 Q120 110 240 122 T360 118 V144 H0 Z" fill="#065F46" />
          </svg>
        </div>
      )

    case "tenun-donggala":
      return (
        <div className={cn("relative overflow-hidden w-full h-36 bg-gradient-to-br from-[#1E135E] via-[#3C22BB] to-[#701A75]", className)}>
          <svg viewBox="0 0 360 144" fill="none" className="w-full h-full object-cover">
            {/* Pola Geometris Tenun Bomba / Donggala */}
            <defs>
              <pattern id="bomba-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 20 L20 40 L0 20 Z" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                <path d="M20 8 L32 20 L20 32 L8 20 Z" fill="#E11D48" fillOpacity="0.25" stroke="#FBBF24" strokeWidth="0.8" />
                <circle cx="20" cy="20" r="3" fill="#FDE68A" />
                <line x1="0" y1="0" x2="40" y2="40" stroke="#818CF8" strokeWidth="0.5" strokeOpacity="0.3" />
                <line x1="40" y1="0" x2="0" y2="40" stroke="#818CF8" strokeWidth="0.5" strokeOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="360" height="144" fill="url(#bomba-pattern)" />
            {/* Lencana Sentral Tenun */}
            <circle cx="180" cy="72" r="32" fill="#1E135E" stroke="#F59E0B" strokeWidth="2" />
            <path d="M180 48 L198 72 L180 96 L162 72 Z" fill="#3C22BB" stroke="#FDE68A" strokeWidth="1.5" />
            <circle cx="180" cy="72" r="6" fill="#F59E0B" />
          </svg>
        </div>
      )

    case "kaledo-kuliner":
      return (
        <div className={cn("relative overflow-hidden w-full h-36 bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#C2410C]", className)}>
          <svg viewBox="0 0 360 144" fill="none" className="w-full h-full object-cover">
            {/* Uap Hangat Kaledo */}
            <path d="M165 40 Q160 30 166 22 T164 12" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" opacity="0.8" />
            <path d="M180 38 Q175 26 182 18 T178 8" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" opacity="0.8" />
            <path d="M195 40 Q190 30 196 22 T194 12" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" opacity="0.8" />
            {/* Meja / Latar */}
            <ellipse cx="180" cy="115" rx="100" ry="20" fill="#431407" fillOpacity="0.6" />
            {/* Mangkok Kaledo Palu */}
            <path d="M130 78 Q180 68 230 78 Q226 112 180 114 Q134 112 130 78 Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="2" />
            {/* Kaldu Kuning Asam Pedas & Daging Tulang Sumsum */}
            <ellipse cx="180" cy="80" rx="46" ry="12" fill="#D97706" />
            <circle cx="180" cy="80" r="10" fill="#78350F" stroke="#FDE68A" strokeWidth="2" />
            <circle cx="180" cy="80" r="4" fill="#FEF3C7" />
            {/* Jeruk Nipis & Cabai Rawit Palu */}
            <circle cx="155" cy="78" r="6" fill="#84CC16" />
            <path d="M200 76 Q206 72 210 78" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )

    case "teluk-palu":
    default:
      return (
        <div className={cn("relative overflow-hidden w-full h-36 bg-gradient-to-br from-[#1E135E] via-[#3C22BB] to-[#0284C7]", className)}>
          <svg viewBox="0 0 360 144" fill="none" className="w-full h-full object-cover">
            {/* Pegunungan Gawalise & Teluk Palu */}
            <path d="M0 65 L70 32 L150 72 L230 24 L310 68 L360 48 V144 H0 Z" fill="#312E81" fillOpacity="0.8" />
            <path d="M0 80 L80 50 L160 84 L250 44 L360 80 V144 H0 Z" fill="#1E1B4B" fillOpacity="0.9" />
            {/* Perairan Teluk Palu */}
            <path d="M0 96 Q180 88 360 96 V144 H0 Z" fill="#0284C7" />
            {/* Lengkungan Jembatan Lalove Palu / Ikon Teluk */}
            <path d="M100 102 Q180 62 260 102" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <line x1="140" y1="102" x2="140" y2="80" stroke="#FDE68A" strokeWidth="1.5" />
            <line x1="180" y1="102" x2="180" y2="72" stroke="#FDE68A" strokeWidth="1.5" />
            <line x1="220" y1="102" x2="220" y2="80" stroke="#FDE68A" strokeWidth="1.5" />
            {/* Pantulan Cahaya Teluk */}
            <path d="M40 120 C100 118 160 122 220 120" stroke="#7DD3FC" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M140 130 C200 128 260 132 320 130" stroke="#7DD3FC" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>
      )
  }
}

export function getThemeByIndexAndCategory(category: string, index: number): SultengTheme {
  if (category === "BUDAYA_SULTENG") {
    const list: SultengTheme[] = ["tenun-donggala", "lore-lindu", "kaledo-kuliner"]
    return list[index % list.length]
  }
  if (category === "KARAKTER") {
    const list: SultengTheme[] = ["danau-poso", "lore-lindu", "teluk-palu"]
    return list[index % list.length]
  }
  const defaultList: SultengTheme[] = ["teluk-palu", "danau-poso", "tenun-donggala"]
  return defaultList[index % defaultList.length]
}

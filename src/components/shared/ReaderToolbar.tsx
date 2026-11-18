"use client"

import { Sun, Coffee } from "lucide-react"

export type ReaderFontSize = "sm" | "base" | "lg"
export type ReaderTheme = "clean" | "sepia"

interface ReaderToolbarProps {
  fontSize: ReaderFontSize
  setFontSize: (size: ReaderFontSize) => void
  theme: ReaderTheme
  setTheme: (theme: ReaderTheme) => void
}

export function ReaderToolbar({
  fontSize,
  setFontSize,
  theme,
  setTheme,
}: ReaderToolbarProps) {
  function handleSizeChange(size: ReaderFontSize) {
    setFontSize(size)
    try {
      localStorage.setItem("bk_reader_font_size", size)
    } catch {
      // Ignore localStorage errors
    }
  }

  function handleThemeChange(newTheme: ReaderTheme) {
    setTheme(newTheme)
    try {
      localStorage.setItem("bk_reader_theme", newTheme)
    } catch {
      // Ignore localStorage errors
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-zinc-100/70 border border-zinc-200/80">
      {/* 1. Pengatur Ukuran Huruf (Font Size) */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pl-1">
          Ukuran:
        </span>
        <div className="inline-flex rounded-xl bg-white p-0.5 border border-zinc-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => handleSizeChange("sm")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              fontSize === "sm"
                ? "bg-[#3C22BB] text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
            title="Ukuran Huruf Kecil (15px)"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => handleSizeChange("base")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              fontSize === "base"
                ? "bg-[#3C22BB] text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
            title="Ukuran Huruf Normal (17px)"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => handleSizeChange("lg")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              fontSize === "lg"
                ? "bg-[#3C22BB] text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
            title="Ukuran Huruf Besar (19px)"
          >
            A+
          </button>
        </div>
      </div>

      {/* 2. Pilihan Tema Kertas Baca (Putih vs Sepia) */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Tema:
        </span>
        <div className="inline-flex rounded-xl bg-white p-0.5 border border-zinc-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => handleThemeChange("clean")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              theme === "clean"
                ? "bg-[#3C22BB] text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Putih</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange("sepia")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              theme === "sepia"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-800 hover:text-amber-950"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Sepia Hangat</span>
          </button>
        </div>
      </div>
    </div>
  )
}

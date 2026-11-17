"use client"

import { motion } from "framer-motion"
import { Sparkles, Compass } from "lucide-react"

interface StudentHeroBannerProps {
  fullName: string
}

export function StudentHeroBanner({ fullName }: StudentHeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3C22BB] via-[#4F35D6] to-[#0284C7] p-6 sm:p-8 text-white shadow-lg border border-white/10"
    >
      {/* Ilustrasi Vektor Latar Belakang Pelajar & Lanskap Sulawesi Tengah */}
      <svg
        viewBox="0 0 500 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-0 bottom-0 h-full w-auto opacity-20 sm:opacity-25 pointer-events-none select-none"
      >
        {/* Siluet Pegunungan Gawalise & Teluk Palu */}
        <path
          d="M120 160 L200 70 L280 125 L360 45 L440 110 L500 80 V160 H120 Z"
          fill="#FFFFFF"
        />
        {/* Siluet Matahari */}
        <circle cx="360" cy="50" r="28" fill="#FDE047" fillOpacity="0.4" />
        {/* Siluet Buku & Pelajar Berkarakter */}
        <path
          d="M320 120 C340 105 380 105 400 120 V160 H320 Z"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
      </svg>

      <div className="relative z-10 max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 text-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Berbahasa Santun, Berkarakter Unggul</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Halo, {fullName}! 👋
        </h1>

        <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-xl">
          Terus belajar, tingkatkan kemampuan bahasa, tumbuhkan karakter baik, dan lestarikan kearifan budaya Sulawesi Tengah untuk masa depan yang gemilang!
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/90">
          <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
            <Compass className="w-3.5 h-3.5 text-amber-300" /> Balai Bahasa Sulawesi Tengah
          </span>
          <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
            Tadulako Cendekia Muda
          </span>
        </div>
      </div>
    </motion.div>
  )
}

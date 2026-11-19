import * as React from "react"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { Sparkles, ShieldCheck, BookOpen, Heart, Compass, Trophy } from "lucide-react"

export function AuthVisualPanel() {
  return (
    <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#1E135E] via-[#3C22BB] to-[#0284C7] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden select-none">
      {/* Vektor Geometris Tenun & Siluet Teluk Palu Halus di Latar Belakang */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -right-24 -bottom-24 w-[480px] h-[480px] opacity-10 pointer-events-none"
      >
        <circle cx="300" cy="300" r="240" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="8 8" />
        <circle cx="300" cy="300" r="180" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M120 400 L240 250 L360 380 L480 220 L580 340 V600 H120 Z" fill="#FFFFFF" />
      </svg>

      {/* Bagian Atas: Logo Resmi BBPST Kemendikdasmen */}
      <div className="relative z-10">
        <div className="bg-white rounded-2xl px-4 py-3 shadow-md inline-flex flex-wrap items-center gap-3 max-w-full">
          <img
            src="/images/logo-bbpst-kemendikdasmen.png"
            alt="Logo Kemendikdasmen — Balai Bahasa Provinsi Sulawesi Tengah"
            className="h-12 sm:h-14 w-auto object-contain shrink-0"
          />
          <div className="border-l border-zinc-200 pl-3 min-w-0">
            <div className="text-sm font-black tracking-tight uppercase text-[#1E135E]">
              Bahasa &amp; Karakter
            </div>
            <div className="text-[11px] font-medium text-zinc-500">
              Platform LMS Resmi BBPST
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Tengah: Headline & Kartu Pratinjau 3 Pilar + Gamifikasi */}
      <div className="relative z-10 max-w-lg space-y-6 my-auto py-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 text-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Platform Edukasi Karakter & Kebudayaan</span>
        </div>

        <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-snug text-white">
          Merawat Bahasa Indonesia, Membentuk Karakter Generasi Sulawesi Tengah.
        </h1>

        <p className="text-sm text-indigo-100/90 leading-relaxed">
          Ruang belajar digital interaktif persembahan Balai Bahasa Provinsi Sulawesi Tengah untuk melatih kemahiran berbahasa, menanamkan nilai budi pekerti luhur, dan menjaga warisan tutur kearifan lokal.
        </p>

        {/* 4 Kartu Mini Pratinjau Fitur */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Literasi Bahasa</div>
              <div className="text-[10px] text-indigo-200">Kaidah baku & santun</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Pendidikan Karakter</div>
              <div className="text-[10px] text-indigo-200">Nilai moral & integritas</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Budaya Sulteng</div>
              <div className="text-[10px] text-indigo-200">Kaili, Saluan, Banggai</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Gamifikasi Poin</div>
              <div className="text-[10px] text-indigo-200">Level, lencana, kuis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Kredit Resmi Instansi BBPST */}
      <div className="relative z-10 pt-6 border-t border-white/15 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-white">
            Bakti by Balai Bahasa Provinsi Sulawesi Tengah
          </div>
          <div className="text-[10px] text-indigo-200">
            Kementerian Pendidikan Dasar dan Menengah Republik Indonesia
          </div>
        </div>
      </div>
    </div>
  )
}

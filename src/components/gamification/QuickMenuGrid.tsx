"use client"

import Link from "next/link"
import {
  BookOpen,
  Heart,
  ClipboardList,
  Target,
  Compass,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const MENU_ITEMS = [
  {
    title: "Belajar Bahasa",
    description: "Kaidah tata bahasa & literasi santun",
    href: "/siswa/materi?kategori=BAHASA_INDONESIA",
    bgColor: "bg-[#0284C7]",
    hoverColor: "hover:bg-[#0369A1]",
    icon: BookOpen,
  },
  {
    title: "Pendidikan Karakter",
    description: "Budi pekerti & integritas mulia",
    href: "/siswa/materi?kategori=KARAKTER",
    bgColor: "bg-[#059669]",
    hoverColor: "hover:bg-[#047857]",
    icon: Heart,
  },
  {
    title: "Kuis Interaktif",
    description: "Uji wawasan & raih poin XP",
    href: "/siswa/kuis",
    bgColor: "bg-[#3C22BB]",
    hoverColor: "hover:bg-[#2E1994]",
    icon: ClipboardList,
  },
  {
    title: "Tantangan Harian",
    description: "Bersaing sehat di papan peringkat",
    href: "/siswa/peringkat",
    bgColor: "bg-[#EA580C]",
    hoverColor: "hover:bg-[#C2410C]",
    icon: Target,
  },
  {
    title: "Bahasa & Budaya Sulteng",
    description: "Kearifan lokal Kaili, Saluan, Banggai",
    href: "/siswa/materi?kategori=BUDAYA_SULTENG",
    bgColor: "bg-[#0D9488]",
    hoverColor: "hover:bg-[#0F766E]",
    icon: Compass,
  },
  {
    title: "Prestasi & Sertifikat",
    description: "Klaim sertifikat resmi kelulusan",
    href: "/siswa/sertifikat",
    bgColor: "bg-[#E11D48]",
    hoverColor: "hover:bg-[#BE123C]",
    icon: Award,
  },
]

export function QuickMenuGrid() {
  return (
    <div className="space-y-4">
      {/* 1. TANTANGAN HARI INI */}
      <Card className="rounded-2xl border-l-4 border-l-[#EA580C] border-zinc-200/90 bg-white p-5 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-xl">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-200 flex items-center justify-center text-[#EA580C] shrink-0 mt-0.5">
            <Target className="w-6 h-6 text-[#EA580C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EA580C] bg-orange-100/70 px-2 py-0.5 rounded-full">
                Misi Harian Spesial
              </span>
              <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> +25 Poin Bonus
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 mt-1">
              Jelajahi Bahasa & Budaya Sulawesi Tengah Hari Ini!
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Selesaikan minimal 1 materi Budaya Sulteng hari ini untuk mempertahankan streak belajar dan mengklaim lencana Tadulako.
            </p>
          </div>
        </div>

        <Link href="/siswa/materi?kategori=BUDAYA_SULTENG" className="shrink-0">
          <Button className="w-full sm:w-auto bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl gap-2 shadow-xs h-10 px-4">
            Mulai Tantangan <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>

      {/* 2. ENAM MENU KATEGORI CERAH */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
            Eksplorasi Pembelajaran
          </h2>
          <span className="text-[11px] font-medium text-zinc-500">
            6 Jalur Pilihan
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative block rounded-2xl p-4 sm:p-5 text-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{ backgroundColor: item.bgColor.replace("bg-[", "").replace("]", "") }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xs border border-white/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base leading-snug tracking-tight text-white line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-white/80 line-clamp-2 mt-1 leading-normal font-medium">
                  {item.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

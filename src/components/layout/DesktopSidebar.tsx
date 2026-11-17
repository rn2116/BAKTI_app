"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  NAVIGATION_ITEMS_SISWA,
  NAVIGATION_ITEMS_GURU,
  NAVIGATION_ITEMS_ADMIN,
} from "@/lib/constants"
import { AuthUser } from "@/types"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import { BrandLogo } from "@/components/shared/BrandLogo"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  User,
  Building2,
  FileText,
  Building,
  Users,
  ShieldAlert,
  LogOut,
  Sparkles,
  Heart,
  Compass,
  Award,
} from "lucide-react"

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  User,
  Building2,
  FileText,
  Building,
  Users,
  ShieldAlert,
  Heart,
  Compass,
  Award,
}

// Navigasi yang lebih lengkap & menarik khusus Siswa
const SISWA_MENU_ITEMS = [
  { label: "Beranda", href: "/siswa", icon: "LayoutDashboard", color: "text-indigo-400" },
  { label: "Materi Belajar", href: "/siswa/materi", icon: "BookOpen", color: "text-sky-400" },
  { label: "Kuis Interaktif", href: "/siswa/kuis", icon: "ClipboardList", color: "text-amber-400" },
  { label: "Papan Peringkat", href: "/siswa/peringkat", icon: "Trophy", color: "text-yellow-400" },
  { label: "Prestasi & Sertifikat", href: "/siswa/sertifikat", icon: "Award", color: "text-rose-400" },
]

interface DesktopSidebarProps {
  user: AuthUser
}

export default function DesktopSidebar({ user }: DesktopSidebarProps) {
  const pathname = usePathname()
  const isSiswa = user.role === "SISWA"

  const items =
    user.role === "GURU"
      ? NAVIGATION_ITEMS_GURU
      : user.role === "ADMIN"
        ? NAVIGATION_ITEMS_ADMIN
        : SISWA_MENU_ITEMS

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-[#1E135E] text-white z-40 justify-between h-full select-none shadow-xl border-r border-[#2E1994]">
      {/* 1. BAGIAN ATAS: LOGO & BRANDING DENGAN VEKTOR SULTENG */}
      <div>
        <div className="p-5 border-b border-white/10">
          <BrandLogo light={true} />
        </div>

        {/* 2. BAGIAN TENGAH: DAFTAR NAVIGASI */}
        <div className="p-3">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-indigo-300/80 uppercase">
            Menu Utama
          </div>
          <nav className="space-y-1.5">
            {items.map((item) => {
              const active = pathname === item.href
              const IconComp =
                ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? LayoutDashboard

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                    active
                      ? "bg-[#3C22BB] text-white shadow-md border border-white/20"
                      : "text-indigo-100/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <IconComp className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-indigo-300")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Kartu Kutipan Motivasi Sulawesi Tengah di Desktop Sidebar Siswa */}
        {isSiswa && (
          <div className="mx-3 mt-2 p-3.5 rounded-2xl bg-gradient-to-br from-[#3C22BB]/60 to-[#4F35D6]/40 border border-white/10 relative overflow-hidden">
            {/* Latar siluet pegunungan mini */}
            <svg
              viewBox="0 0 200 60"
              fill="none"
              className="absolute bottom-0 right-0 w-32 h-12 opacity-20 pointer-events-none"
            >
              <path d="M0 45 L50 20 L100 48 L150 15 L200 40 V60 H0 Z" fill="#FFFFFF" />
            </svg>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1 mb-1">
              <span>🌟</span> Falsafah Kaili
            </div>
            <p className="text-[11px] text-white/90 italic leading-snug">
              &quot;Masintuvu Kita Maroso, Morambanga Kita Marisi&quot;
            </p>
            <p className="text-[9px] text-indigo-200 mt-1">
              Bersatu kita kuat, bersama kita teguh.
            </p>
          </div>
        )}
      </div>

      {/* 3. BAGIAN BAWAH: KARTU PROFIL & TOMBOL KELUAR */}
      <div className="p-4 border-t border-white/10 bg-[#160D47] space-y-3">
        {/* Ringkasan Profil Pengguna */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-[#D97706] text-zinc-900 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {user.fullName}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-200">
              <span className="capitalize font-medium">{user.role.toLowerCase()}</span>
              {isSiswa && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-amber-300 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {user.xp} XP
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Keluar */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-200 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </form>

        {/* Kredit Resmi Instansi di Bawah Sidebar */}
        <div className="pt-2 border-t border-white/10 text-center">
          <p className="text-[10px] text-indigo-300/70 font-medium leading-tight">
            Bakti by Balai Bahasa Provinsi Sulawesi Tengah
          </p>
        </div>
      </div>
    </aside>
  )
}

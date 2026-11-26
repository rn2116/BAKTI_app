"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  NAVIGATION_ITEMS_SISWA,
  NAVIGATION_ITEMS_GURU,
  NAVIGATION_ITEMS_ADMIN,
  NAVIGATION_ITEMS_AHLI_BAHASA,
  ROLE_LABELS,
} from "@/lib/constants"
import { AuthUser } from "@/types"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
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
  ShieldCheck,
  LogOut,
  Sparkles,
  Heart,
  Compass,
  Award,
  BarChart3,
  UserCheck,
  Languages,
  Settings,
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
  ShieldCheck,
  Heart,
  Compass,
  Award,
  BarChart3,
  UserCheck,
  Languages,
  Settings,
}

interface DesktopSidebarProps {
  user: AuthUser
  pendingQuestionCount?: number
  pendingExpertCount?: number
  pendingCurationCount?: number
}

export default function DesktopSidebar({
  user,
  pendingQuestionCount = 0,
  pendingExpertCount = 0,
  pendingCurationCount = 0,
}: DesktopSidebarProps) {
  const pathname = usePathname()
  const isSiswa = user.role === "SISWA"
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleConfirmLogout() {
    setIsLoggingOut(true)
    await logout()
  }

  const items =
    user.role === "GURU"
      ? NAVIGATION_ITEMS_GURU
      : user.role === "ADMIN"
        ? NAVIGATION_ITEMS_ADMIN
        : user.role === "AHLI_BAHASA"
          ? NAVIGATION_ITEMS_AHLI_BAHASA
          : NAVIGATION_ITEMS_SISWA

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-72 bg-[#1E135E] text-white z-40 justify-between h-full select-none shadow-xl border-r border-[#2E1994]">
        {/* 1. BAGIAN ATAS: LOGO RESMI BERLATAR PUTIH UNTUK KONTRAS MAKSIMAL */}
        <div className="bg-white px-4 py-4 border-b border-zinc-200">
          <BrandLogo light={false} stacked={true} showSubtitle={true} size="md" />
        </div>

        {/* 2. BAGIAN TENGAH: DAFTAR NAVIGASI & KARTU FALSAFAH KELOKALAN */}
        <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-indigo-300/80 uppercase">
              Menu Utama
            </div>
            <nav className="space-y-1.5">
              {items.map((item) => {
                const isRootDash =
                  item.href === "/siswa" ||
                  item.href === "/guru" ||
                  item.href === "/admin" ||
                  item.href === "/ahli-bahasa"
                const active =
                  pathname === item.href ||
                  (!isRootDash && pathname.startsWith(`${item.href}/`))
                const IconComp =
                  ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? LayoutDashboard
                const showVerificationBadge =
                  item.href === "/admin/verifikasi-soal" && pendingQuestionCount > 0
                const showExpertBadge =
                  item.href === "/admin/verifikasi-ahli" && pendingExpertCount > 0
                const showCurationBadge =
                  item.href === "/ahli-bahasa/kurasi" && pendingCurationCount > 0
                const badgeValue = showVerificationBadge
                  ? pendingQuestionCount
                  : showExpertBadge
                    ? pendingExpertCount
                    : showCurationBadge
                      ? pendingCurationCount
                      : 0

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                      active
                        ? "bg-[#3C22BB] text-white shadow-md border border-white/20"
                        : "text-indigo-100/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComp
                        className={cn(
                          "w-5 h-5 shrink-0",
                          active ? "text-white" : "text-indigo-300"
                        )}
                      />
                      <span className="leading-snug">{item.label}</span>
                    </div>
                    {badgeValue > 0 && (
                      <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-zinc-950 shadow-xs">
                        {badgeValue > 99 ? "99+" : badgeValue}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Kartu Falsafah / Kutipan Budaya Sulawesi Tengah Bermotif Tenun Donggala */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3C22BB]/50 to-[#4F35D6]/30 border border-white/10 relative overflow-hidden space-y-1.5 shadow-xs">
            {/* Ornamen Motif Tenun Donggala / Geometris Sulteng Halus */}
            <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <polygon
                  points="50,10 90,50 50,90 10,50"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                <polygon
                  points="50,25 75,50 50,75 25,50"
                  stroke="#FDE047"
                  strokeWidth="1.5"
                />
                <circle cx="50" cy="50" r="8" fill="#F59E0B" fillOpacity="0.4" />
              </svg>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🌟</span>
              <span>Kearifan Lokal Sulawesi Tengah</span>
            </div>
            <p className="text-xs text-white/95 font-medium italic leading-relaxed">
              &quot;Masintuvu Kita Maroso, Morambanga Kita Marisi&quot;
            </p>
            <p className="text-[10px] text-indigo-200/80 leading-normal">
              Bersatu kita kuat, bersama kita teguh membangun karakter generasi bangsa.
            </p>
          </div>
        </div>

        {/* 3. BAGIAN BAWAH: KARTU PROFIL PENGGUNA & TOMBOL KELUAR */}
        <div className="p-4 border-t border-white/10 bg-[#160D47] space-y-3">
          {/* Ringkasan Profil Pengguna */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-[#D97706] text-zinc-950 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {user.fullName}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-200 mt-0.5">
                <span className="font-medium">{ROLE_LABELS[user.role] ?? user.role}</span>
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

          {/* Tombol Keluar Akun */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-red-200 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-white transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>

          {/* Kredit Resmi Instansi di Bawah Sidebar */}
          <div className="pt-2 border-t border-white/10 text-center">
            <p className="text-[10px] text-indigo-300/70 font-medium leading-tight">
              Bakti by Balai Bahasa Provinsi Sulawesi Tengah
            </p>
          </div>
        </div>
      </aside>

      {/* Modal Konfirmasi Keluar Akun Desktop */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        variant="warning"
        title="Keluar dari Akun?"
        description="Sesi login Anda akan diakhiri. Anda dapat masuk kembali kapan saja dengan email dan kata sandi Anda."
        confirmText="Ya, Keluar Akun"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}

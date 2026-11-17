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
} from "lucide-react"

const ICON_MAP = {
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
}

interface DesktopSidebarProps {
  user: AuthUser
}

export default function DesktopSidebar({ user }: DesktopSidebarProps) {
  const pathname = usePathname()
  const items =
    user.role === "GURU"
      ? NAVIGATION_ITEMS_GURU
      : user.role === "ADMIN"
        ? NAVIGATION_ITEMS_ADMIN
        : NAVIGATION_ITEMS_SISWA

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white border-r border-zinc-200 z-40 justify-between h-full select-none shadow-xs">
      {/* 1. BAGIAN ATAS: LOGO & BRANDING */}
      <div>
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3C22BB] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0 border border-[#2E1994]">
              BK
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-[#18181B] truncate uppercase">
                  Bahasa & Karakter
                </span>
              </div>
              <div className="text-[11px] font-medium text-zinc-500 truncate">
                Balai Bahasa Prov. Sulteng
              </div>
            </div>
          </div>
          {/* Aksen garis Royal Indigo */}
          <div className="h-0.5 w-12 bg-[#3C22BB] rounded-full mt-3.5" />
        </div>

        {/* 2. BAGIAN TENGAH: DAFTAR NAVIGASI */}
        <div className="p-3">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-[#3C22BB] text-white font-medium shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  <IconComp className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-zinc-500")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* 3. BAGIAN BAWAH: KARTU PROFIL & TOMBOL KELUAR */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 space-y-3">
        {/* Ringkasan Profil Pengguna */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-sm shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="text-xs font-bold text-zinc-900 truncate">
              {user.fullName}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="capitalize font-medium">{user.role.toLowerCase()}</span>
              {user.role === "SISWA" && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-[#D97706] flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-[#D97706]" />
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
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </form>
      </div>
    </aside>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  Compass,
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
  ShieldCheck,
  Compass,
}

const ITEMS_SISWA = [
  { href: "/siswa", label: "Beranda", icon: "LayoutDashboard" },
  { href: "/siswa/materi", label: "Materi", icon: "BookOpen" },
  { href: "/siswa/kuis", label: "Kuis", icon: "ClipboardList" },
  { href: "/siswa/budaya-bahasa", label: "Kamus 9B", icon: "Compass" },
  { href: "/siswa/peringkat", label: "Peringkat", icon: "Trophy" },
]

const ITEMS_GURU = [
  { href: "/guru", label: "Beranda", icon: "LayoutDashboard" },
  { href: "/guru/kelas", label: "Kelas", icon: "Building2" },
  { href: "/guru/materi", label: "Materi", icon: "BookOpen" },
  { href: "/guru/kuis", label: "Bank Soal", icon: "ClipboardList" },
  { href: "/guru/rekap", label: "Rekap", icon: "FileText" },
]

const ITEMS_ADMIN = [
  { href: "/admin", label: "Beranda", icon: "LayoutDashboard" },
  { href: "/admin/kuis", label: "Bank Soal", icon: "ClipboardList" },
  { href: "/admin/verifikasi-soal", label: "Verifikasi", icon: "ShieldCheck" },
  { href: "/admin/materi", label: "Materi", icon: "BookOpen" },
  { href: "/admin/pengguna", label: "Pengguna", icon: "Users" },
]

export default function MobileBottomNav({
  userRole = "SISWA",
  pendingQuestionCount = 0,
}: {
  userRole?: string
  pendingQuestionCount?: number
}) {
  const pathname = usePathname()
  const items =
    userRole === "GURU"
      ? ITEMS_GURU
      : userRole === "ADMIN"
        ? ITEMS_ADMIN
        : ITEMS_SISWA

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-50 flex items-center justify-around px-2 md:hidden shadow-xs">
      {items.map((item) => {
        const isRootDash =
          item.href === "/siswa" || item.href === "/guru" || item.href === "/admin"
        const active =
          pathname === item.href ||
          (!isRootDash && pathname.startsWith(`${item.href}/`))
        const IconComp = ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? LayoutDashboard
        const showBadge =
          item.href === "/admin/verifikasi-soal" && pendingQuestionCount > 0

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg transition-all duration-150 min-w-[56px]",
              active
                ? "text-[#3C22BB] font-bold"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <div className="relative">
              <IconComp className={cn("h-5 w-5 transition-transform", active ? "scale-110 text-[#3C22BB]" : "text-zinc-500")} />
              {showBadge && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {pendingQuestionCount > 99 ? "99+" : pendingQuestionCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium leading-none tracking-tight">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

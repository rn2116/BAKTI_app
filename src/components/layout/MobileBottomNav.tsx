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
  Award,
  Languages,
  UserCheck,
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
  Award,
  Languages,
  UserCheck,
}

const ITEMS_PESERTA = [
  { href: "/siswa", label: "Beranda", title: "Beranda", icon: "LayoutDashboard" },
  { href: "/siswa/materi", label: "Materi", title: "Materi", icon: "BookOpen" },
  {
    href: "/siswa/budaya-bahasa",
    label: "Kamus",
    title: "Kamus Besar Kearifan Lokal Sulawesi Tengah",
    icon: "Compass",
  },
  { href: "/siswa/kuis", label: "Kuis", title: "Kuis", icon: "ClipboardList" },
  { href: "/siswa/peringkat", label: "Peringkat", title: "Peringkat", icon: "Trophy" },
  { href: "/siswa/sertifikat", label: "Sertifikat", title: "Sertifikat", icon: "Award" },
]

const ITEMS_GURU = [
  { href: "/guru", label: "Beranda", title: "Beranda", icon: "LayoutDashboard" },
  { href: "/guru/kelas", label: "Kelas", title: "Kelas Saya", icon: "Building2" },
  { href: "/guru/materi", label: "Materi", title: "Katalog Materi", icon: "BookOpen" },
  { href: "/guru/kuis", label: "Bank Soal", title: "Bank Soal & Kuis", icon: "ClipboardList" },
  { href: "/guru/rekap", label: "Rekap", title: "Rekap Nilai Peserta", icon: "FileText" },
]

const ITEMS_AHLI_BAHASA = [
  { href: "/ahli-bahasa", label: "Beranda", title: "Beranda", icon: "LayoutDashboard" },
  { href: "/ahli-bahasa/kamus", label: "Kamus", title: "Kamus Besar", icon: "Compass" },
  { href: "/ahli-bahasa/bahasa", label: "Bahasa", title: "Bahasa Daerah", icon: "Languages" },
  { href: "/ahli-bahasa/kurasi", label: "Kurasi", title: "Kurasi Usulan", icon: "ShieldCheck" },
  { href: "/ahli-bahasa/profil", label: "Profil", title: "Profil Pakar", icon: "UserCheck" },
]

const ITEMS_ADMIN = [
  { href: "/admin", label: "Beranda", title: "Beranda", icon: "LayoutDashboard" },
  { href: "/admin/kuis", label: "Bank Soal", title: "Bank Soal & Kuis", icon: "ClipboardList" },
  { href: "/admin/verifikasi-soal", label: "Verif Soal", title: "Verifikasi Soal", icon: "ShieldCheck" },
  { href: "/admin/verifikasi-ahli", label: "Ahli Bahasa", title: "Verifikasi Ahli Bahasa", icon: "UserCheck" },
  { href: "/admin/pengguna", label: "Pengguna", title: "Data Pengguna", icon: "Users" },
]

export default function MobileBottomNav({
  userRole = "SISWA",
  pendingQuestionCount = 0,
  pendingExpertCount = 0,
  pendingCurationCount = 0,
}: {
  userRole?: string
  pendingQuestionCount?: number
  pendingExpertCount?: number
  pendingCurationCount?: number
}) {
  const pathname = usePathname()
  const items =
    userRole === "GURU"
      ? ITEMS_GURU
      : userRole === "ADMIN"
        ? ITEMS_ADMIN
        : userRole === "AHLI_BAHASA"
          ? ITEMS_AHLI_BAHASA
          : ITEMS_PESERTA

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-50 flex items-center justify-around px-1 md:hidden shadow-xs">
      {items.map((item) => {
        const isRootDash =
          item.href === "/siswa" ||
          item.href === "/guru" ||
          item.href === "/admin" ||
          item.href === "/ahli-bahasa"
        const active =
          pathname === item.href ||
          (!isRootDash && pathname.startsWith(`${item.href}/`))
        const IconComp = ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? LayoutDashboard
        const badgeCount =
          item.href === "/admin/verifikasi-soal"
            ? pendingQuestionCount
            : item.href === "/admin/verifikasi-ahli"
              ? pendingExpertCount
              : item.href === "/ahli-bahasa/kurasi"
                ? pendingCurationCount
                : 0

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.title}
            aria-label={item.title}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-lg transition-all duration-150 flex-1 min-w-0",
              active
                ? "text-[#3C22BB] font-bold"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <div className="relative">
              <IconComp
                className={cn(
                  "h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform",
                  active ? "scale-110 text-[#3C22BB]" : "text-zinc-500"
                )}
              />
              {badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none tracking-tight truncate max-w-full">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

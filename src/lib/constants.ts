import { Role as PrismaRole, Category as PrismaCategory } from "@prisma/client"

export const APP_NAME = "Bahasa & Karakter"
export const APP_DESCRIPTION =
  "Platform Pembelajaran Interaktif Bahasa Indonesia, Pendidikan Karakter, dan Budaya Sulawesi Tengah"

export const COOKIE_NAME = "bk_token"

export const Role = PrismaRole
export const Category = PrismaCategory

export const CATEGORY_LABELS: Record<string, string> = {
  BAHASA_INDONESIA: "Bahasa Indonesia",
  KARAKTER: "Pendidikan Karakter",
  BUDAYA_SULTENG: "Budaya Sulawesi Tengah",
}

export const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  BAHASA_INDONESIA: "bg-sky-50 text-[#0369A1] border-sky-200",
  KARAKTER: "bg-emerald-50 text-[#047857] border-emerald-200",
  BUDAYA_SULTENG: "bg-teal-50 text-[#0F766E] border-teal-200",
}

export const XP_COMPLETE_MATERIAL = 100
export const XP_QUIZ_BASE = 50

export const NAVIGATION_ITEMS_SISWA = [
  { label: "Beranda", href: "/siswa", icon: "LayoutDashboard" },
  { label: "Materi", href: "/siswa/materi", icon: "BookOpen" },
  { label: "Kuis", href: "/siswa/kuis", icon: "ClipboardList" },
  { label: "Peringkat", href: "/siswa/peringkat", icon: "Trophy" },
  { label: "Profil", href: "/siswa/profil", icon: "User" },
] as const

export const NAVIGATION_ITEMS_GURU = [
  { label: "Beranda", href: "/guru", icon: "LayoutDashboard" },
  { label: "Kelas", href: "/guru/kelas", icon: "Building2" },
  { label: "Materi", href: "/guru/materi", icon: "BookOpen" },
  { label: "Kuis", href: "/guru/kuis", icon: "ClipboardList" },
  { label: "Rekap", href: "/guru/rekap", icon: "FileText" },
] as const

export const NAVIGATION_ITEMS_ADMIN = [
  { label: "Beranda", href: "/admin", icon: "LayoutDashboard" },
  { label: "Sekolah", href: "/admin/sekolah", icon: "Building" },
  { label: "Kelas", href: "/admin/kelas", icon: "Building2" },
  { label: "Pengguna", href: "/admin/pengguna", icon: "Users" },
  { label: "Moderasi", href: "/admin/konten", icon: "ShieldAlert" },
] as const

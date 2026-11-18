import { Role, Category } from "@/types"

export const APP_NAME = "Bahasa & Karakter"
export const APP_DESCRIPTION =
  "Platform Pembelajaran Interaktif Bahasa Indonesia, Pendidikan Karakter, dan Budaya Sulawesi Tengah"

export const COOKIE_NAME = "bk_token"

export { Role, Category }

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

export const REGIONAL_LANGUAGES = [
  { code: "KAILI", name: "Bahasa Kaili", region: "Palu, Sigi, Donggala, Parimo" },
  { code: "PAMONA", name: "Bahasa Pamona", region: "Poso" },
  { code: "BANGGAI", name: "Bahasa Banggai", region: "Banggai Laut & Bangkep" },
  { code: "BUNGKU", name: "Bahasa Bungku", region: "Morowali" },
  { code: "TOLITOLI", name: "Bahasa Tolitoli", region: "Tolitoli" },
  { code: "BUOL", name: "Bahasa Buol", region: "Buol" },
  { code: "SALUAN", name: "Bahasa Saluan", region: "Banggai" },
  { code: "MORI", name: "Bahasa Mori", region: "Morowali Utara" },
  { code: "TAA", name: "Bahasa Taa", region: "Tojo Una-Una" },
] as const

export const REGIONAL_LANGUAGE_LABELS: Record<string, string> = {
  KAILI: "Bahasa Kaili",
  PAMONA: "Bahasa Pamona",
  BANGGAI: "Bahasa Banggai",
  BUNGKU: "Bahasa Bungku",
  TOLITOLI: "Bahasa Tolitoli",
  BUOL: "Bahasa Buol",
  SALUAN: "Bahasa Saluan",
  MORI: "Bahasa Mori",
  TAA: "Bahasa Taa",
}

export const XP_COMPLETE_MATERIAL = 100
export const XP_QUIZ_BASE = 50

export const NAVIGATION_ITEMS_SISWA = [
  { label: "Beranda", href: "/siswa", icon: "LayoutDashboard" },
  { label: "Materi Belajar", href: "/siswa/materi", icon: "BookOpen" },
  { label: "Kuis Interaktif", href: "/siswa/kuis", icon: "ClipboardList" },
  { label: "Kamus Karakter 9 Bahasa", href: "/siswa/budaya-bahasa", icon: "Compass" },
  { label: "Papan Peringkat", href: "/siswa/peringkat", icon: "Trophy" },
  { label: "Prestasi & Sertifikat", href: "/siswa/sertifikat", icon: "Award" },
] as const

export const NAVIGATION_ITEMS_GURU = [
  { label: "Beranda", href: "/guru", icon: "LayoutDashboard" },
  { label: "Kelas Saya", href: "/guru/kelas", icon: "Building2" },
  { label: "Katalog Materi", href: "/guru/materi", icon: "BookOpen" },
  { label: "Rekap Nilai Siswa", href: "/guru/rekap", icon: "FileText" },
] as const

export const NAVIGATION_ITEMS_ADMIN = [
  { label: "Beranda", href: "/admin", icon: "LayoutDashboard" },
  { label: "Bank Soal & Kuis", href: "/admin/kuis", icon: "ClipboardList" },
  { label: "Matriks Karakter", href: "/admin/matriks-karakter", icon: "Compass" },
  { label: "Materi Literasi", href: "/admin/materi", icon: "BookOpen" },
  { label: "Data Sekolah", href: "/admin/sekolah", icon: "Building" },
  { label: "Data Kelas", href: "/admin/kelas", icon: "Building2" },
  { label: "Data Pengguna", href: "/admin/pengguna", icon: "Users" },
  { label: "Laporan Nilai", href: "/admin/laporan", icon: "FileText" },
] as const

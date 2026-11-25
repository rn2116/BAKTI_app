import { Role, Category } from "@/types"

export const APP_NAME = "Bahasa & Karakter"
export const APP_DESCRIPTION =
  "Platform Pembelajaran Interaktif Bahasa Indonesia, Pendidikan Karakter, dan Kearifan Lokal Sulawesi Tengah"

export const COOKIE_NAME = "bk_token"

export { Role, Category }

export const CATEGORY_LABELS: Record<string, string> = {
  BAHASA_INDONESIA: "Bahasa Indonesia",
  KARAKTER: "Pendidikan Karakter",
  BUDAYA_SULTENG: "Kearifan Lokal Sulawesi Tengah",
}

export const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  BAHASA_INDONESIA: "bg-sky-50 text-[#0369A1] border-sky-200",
  KARAKTER: "bg-emerald-50 text-[#047857] border-emerald-200",
  BUDAYA_SULTENG: "bg-teal-50 text-[#0F766E] border-teal-200",
}

export const REGIONAL_LANGUAGES = [
  {
    code: "KAILI",
    name: "Bahasa Kaili",
    region: "Kota Palu, Sigi, Donggala, Parigi Moutong",
    description: "Bahasa utama masyarakat Lembah Palu dan pesisir barat Sulawesi Tengah.",
  },
  {
    code: "PAMONA",
    name: "Bahasa Pamona",
    region: "Kabupaten Poso",
    description: "Bahasa tutur masyarakat wilayah Danau Poso dan sekitarnya.",
  },
  {
    code: "BANGGAI",
    name: "Bahasa Banggai",
    region: "Kabupaten Banggai Kepulauan & Banggai Laut",
    description: "Bahasa kepulauan timur Sulawesi Tengah yang kaya tradisi lisan.",
  },
  {
    code: "BUNGKU",
    name: "Bahasa Bungku",
    region: "Kabupaten Morowali",
    description: "Bahasa daerah pesisir tenggara Kabupaten Morowali.",
  },
  {
    code: "TOLITOLI",
    name: "Bahasa Tolitoli",
    region: "Kabupaten Tolitoli",
    description: "Bahasa maritim masyarakat pesisir utara Kabupaten Tolitoli.",
  },
  {
    code: "BUOL",
    name: "Bahasa Buol",
    region: "Kabupaten Buol",
    description: "Bahasa daerah masyarakat Kabupaten Buol di bagian utara Sulawesi Tengah.",
  },
  {
    code: "SALUAN",
    name: "Bahasa Saluan",
    region: "Kabupaten Banggai",
    description: "Bahasa daerah wilayah daratan Luwuk dan sekitarnya.",
  },
  {
    code: "MORI",
    name: "Bahasa Mori",
    region: "Kabupaten Morowali Utara",
    description: "Bahasa daerah masyarakat Kabupaten Morowali Utara.",
  },
  {
    code: "TAA",
    name: "Bahasa Taa",
    region: "Kabupaten Tojo Una-Una",
    description: "Bahasa daerah wilayah Ampana dan kawasan Tojo Una-Una.",
  },
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

export const SULTENG_DOMICILE_OPTIONS = [
  "Kota Palu",
  "Kabupaten Banggai",
  "Kabupaten Banggai Kepulauan",
  "Kabupaten Banggai Laut",
  "Kabupaten Buol",
  "Kabupaten Donggala",
  "Kabupaten Morowali",
  "Kabupaten Morowali Utara",
  "Kabupaten Parigi Moutong",
  "Kabupaten Poso",
  "Kabupaten Sigi",
  "Kabupaten Tojo Una-Una",
  "Kabupaten Toli-Toli",
  "Luar Sulawesi Tengah",
] as const

export const PARTICIPANT_CATEGORIES = [
  "Pelajar/Mahasiswa",
  "Pendidik/Akademisi",
  "ASN/Pegawai",
  "Pegiat Bahasa & Kearifan Lokal",
  "Masyarakat Umum",
] as const

export const ROLE_LABELS: Record<string, string> = {
  SISWA: "Peserta",
  GURU: "Pendidik",
  ADMIN: "Admin BBPST",
  AHLI_BAHASA: "Ahli Bahasa Daerah",
}

export const XP_COMPLETE_MATERIAL = 100
export const XP_QUIZ_BASE = 50

export const NAVIGATION_ITEMS_SISWA = [
  { label: "Beranda", href: "/siswa", icon: "LayoutDashboard" },
  { label: "Materi", href: "/siswa/materi", icon: "BookOpen" },
  { label: "Kamus Besar Kearifan Lokal Sulawesi Tengah", href: "/siswa/budaya-bahasa", icon: "Compass" },
  { label: "Kuis", href: "/siswa/kuis", icon: "ClipboardList" },
  { label: "Peringkat", href: "/siswa/peringkat", icon: "Trophy" },
  { label: "Sertifikat", href: "/siswa/sertifikat", icon: "Award" },
] as const

export const NAVIGATION_ITEMS_GURU = [
  { label: "Beranda", href: "/guru", icon: "LayoutDashboard" },
  { label: "Kelas Saya", href: "/guru/kelas", icon: "Building2" },
  { label: "Katalog Materi", href: "/guru/materi", icon: "BookOpen" },
  { label: "Bank Soal & Kuis", href: "/guru/kuis", icon: "ClipboardList" },
  { label: "Rekap Nilai Peserta", href: "/guru/rekap", icon: "FileText" },
] as const

export const NAVIGATION_ITEMS_AHLI_BAHASA = [
  { label: "Beranda Ahli Bahasa", href: "/ahli-bahasa", icon: "LayoutDashboard" },
  { label: "Kamus Besar Kearifan Lokal", href: "/ahli-bahasa/kamus", icon: "Compass" },
  { label: "Bahasa Daerah", href: "/ahli-bahasa/bahasa", icon: "Languages" },
] as const

export const NAVIGATION_ITEMS_ADMIN = [
  { label: "Beranda", href: "/admin", icon: "LayoutDashboard" },
  { label: "Analitik BBPST", href: "/admin/analitik", icon: "BarChart3" },
  { label: "Bank Soal & Kuis", href: "/admin/kuis", icon: "ClipboardList" },
  { label: "Verifikasi Soal", href: "/admin/verifikasi-soal", icon: "ShieldCheck" },
  { label: "Verifikasi Ahli Bahasa", href: "/admin/verifikasi-ahli", icon: "UserCheck" },
  { label: "Kamus Besar Kearifan Lokal", href: "/admin/matriks-karakter", icon: "Compass" },
  { label: "Materi Literasi", href: "/admin/materi", icon: "BookOpen" },
  { label: "Data Sekolah", href: "/admin/sekolah", icon: "Building" },
  { label: "Data Kelas", href: "/admin/kelas", icon: "Building2" },
  { label: "Data Pengguna", href: "/admin/pengguna", icon: "Users" },
  { label: "Laporan Nilai Peserta", href: "/admin/laporan", icon: "FileText" },
  { label: "Pengaturan Instansi", href: "/admin/pengaturan-instansi", icon: "Settings" },
] as const

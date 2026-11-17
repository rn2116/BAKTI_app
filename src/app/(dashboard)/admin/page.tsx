import { getCurrentUser } from "@/lib/auth"
import { getAdminSystemStats, getAdminRegencyStats } from "@/services/admin-guru"
import { RegencyAnalyticsChart } from "@/components/admin/RegencyAnalyticsChart"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

  const [stats, regencyStats] = await Promise.all([
    getAdminSystemStats(),
    getAdminRegencyStats(),
  ])

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner Eksekutif Administrator */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E135E] via-[#2A1882] to-[#3C22BB] p-6 sm:p-8 text-white shadow-lg border border-indigo-900/40">
        {/* Motif background vector halus */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 300" fill="none">
            <circle cx="700" cy="50" r="180" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
            <path
              d="M-50,220 C200,100 450,280 850,140"
              stroke="white"
              strokeWidth="2.5"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Lencana Resmi BBPST */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bakti by Balai Bahasa Provinsi Sulawesi Tengah</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Kendali Ekosistem BAKTI Se-Sulawesi Tengah
            </h1>

            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Monitoring terpusat implementasi literasi 3 pilar: Bahasa Indonesia, Pendidikan Karakter,
              dan Bahasa & Budaya Daerah di seluruh satuan pendidikan mitra 13 Kabupaten/Kota.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-indigo-200">
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-400/30 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Aktif & Terpantau
              </span>
              <span>•</span>
              <span>13 Kabupaten & Kota</span>
              <span>•</span>
              <span>Tahun Ajaran 2026/2027</span>
            </div>
          </div>

          <div className="shrink-0 flex md:flex-col gap-2.5">
            <Link
              href="/admin/konten"
              className="px-4 py-2.5 rounded-xl bg-white text-[#1E135E] hover:bg-zinc-100 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#3C22BB]" />
              Moderasi Konten
            </Link>
            <Link
              href="/admin/pengguna"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Kelola Pengguna
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Empat Kartu KPI Eksekutif */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sekolah */}
        <Card className="border border-zinc-200/90 shadow-xs bg-white rounded-2xl p-4 sm:p-5 hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Satuan Pendidikan</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] font-mono">
              {stats.totalSchools}
            </div>
            <div className="text-xs text-sky-700 font-medium mt-0.5">
              SMA/SMK Se-Sulteng
            </div>
          </div>
        </Card>

        {/* Siswa Terdaftar */}
        <Card className="border border-zinc-200/90 shadow-xs bg-white rounded-2xl p-4 sm:p-5 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Siswa Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] font-mono">
              {stats.totalStudents}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-0.5">
              Dari {stats.totalClasses} Rombel
            </div>
          </div>
        </Card>

        {/* Guru Pengajar */}
        <Card className="border border-zinc-200/90 shadow-xs bg-white rounded-2xl p-4 sm:p-5 hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Guru Pendamping</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3C22BB] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] font-mono">
              {stats.totalTeachers}
            </div>
            <div className="text-xs text-[#3C22BB] font-medium mt-0.5">
              Pendidik Terdaftar
            </div>
          </div>
        </Card>

        {/* Pengerjaan Kuis */}
        <Card className="border border-zinc-200/90 shadow-xs bg-white rounded-2xl p-4 sm:p-5 hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Pengerjaan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] font-mono">
              {stats.totalAttempts}
            </div>
            <div className="text-xs text-amber-700 font-medium mt-0.5">
              Dari {stats.totalQuizzes} Bank Kuis
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Distribusi Konten 3 Pilar Pembelajaran */}
      <Card className="border border-zinc-200/90 shadow-xs bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#18181B] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3C22BB]" />
              Sebaran Kurikulum 3 Pilar Pembelajaran
            </h2>
            <p className="text-xs text-zinc-500">
              Total {stats.totalMaterials} modul materi aktif dan {stats.totalQuizzes} paket kuis evaluasi
            </p>
          </div>
          <Link
            href="/admin/konten"
            className="text-xs font-semibold text-[#3C22BB] hover:text-[#2E1994] flex items-center gap-1 self-start sm:self-auto"
          >
            Moderasi Modul <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Pilar 1: Bahasa Indonesia */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900">1. Bahasa Indonesia</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200 text-sky-800">
                Pilar I
              </span>
            </div>
            <div className="text-2xl font-black text-sky-950 font-mono">
              {stats.pillars.bahasa}{" "}
              <span className="text-xs font-normal text-sky-700">Materi</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              Membina kemahiran tata bahasa, literasi kritis, dan penulisan karya ilmiah siswa.
            </p>
          </div>

          {/* Pilar 2: Pendidikan Karakter */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">2. Pendidikan Karakter</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                Pilar II
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-950 font-mono">
              {stats.pillars.karakter}{" "}
              <span className="text-xs font-normal text-emerald-700">Materi</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Penanaman integritas, keteladanan, gotong royong, dan etika komunikasi digital.
            </p>
          </div>

          {/* Pilar 3: Budaya Sulteng */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900">3. Budaya Sulawesi Tengah</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200 text-teal-800">
                Pilar III
              </span>
            </div>
            <div className="text-2xl font-black text-teal-950 font-mono">
              {stats.pillars.budaya}{" "}
              <span className="text-xs font-normal text-teal-700">Materi</span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              Revitalisasi bahasa daerah (Kaili, Pamona, Banggai, dll.) dan kearifan lokal Sulteng.
            </p>
          </div>
        </div>
      </Card>

      {/* 4. Grafik Analitik Wilayah Sulawesi Tengah */}
      <RegencyAnalyticsChart regencies={regencyStats} />

      {/* 5. Navigasi Cepat Master Data */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-[#18181B] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#3C22BB]" />
          Akses Cepat Pengelolaan Sistem
        </h2>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/sekolah"
            className="p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-[#3C22BB]/50 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#18181B]">Manajemen Sekolah</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  CRUD data satuan pendidikan, NPSN, nomor kontak, dan kabupaten/kota.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-[#3C22BB] group-hover:translate-x-1 transition-transform">
              Kelola {stats.totalSchools} Sekolah <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/admin/kelas"
            className="p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-[#3C22BB]/50 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3C22BB] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#18181B]">Manajemen Kelas</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  CRUD rombongan belajar seluruh sekolah dan penempatan siswa per kelas.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-[#3C22BB] group-hover:translate-x-1 transition-transform">
              Kelola {stats.totalClasses} Rombel <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/admin/pengguna"
            className="p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-[#3C22BB]/50 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#18181B]">Manajemen Pengguna</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Kelola akun siswa, guru, admin, reset password, dan aktivasi status.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-[#3C22BB] group-hover:translate-x-1 transition-transform">
              Kelola {stats.totalUsers} Akun <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/admin/konten"
            className="p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-[#3C22BB]/50 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#18181B]">Moderasi Konten</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Verifikasi dan publikasi modul bacaan dan bank kuis guru.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-[#3C22BB] group-hover:translate-x-1 transition-transform">
              Tinjau Modul & Kuis <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

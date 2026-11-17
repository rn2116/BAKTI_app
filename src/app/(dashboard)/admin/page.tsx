import { getCurrentUser } from "@/lib/auth"
import { getAdminSystemStats } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building, Users, BookOpen, ShieldAlert, ArrowRight, Building2, Trophy } from "lucide-react"

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") return null

  const stats = await getAdminSystemStats()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dasbor Administrator"
        description="Pusat kendali ekosistem platform BAKTI se-Sulawesi Tengah."
      />

      {/* Grid Statistik Keseluruhan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Sekolah" value={stats.totalSchools} />
        <StatCard title="Total Rombel" value={stats.totalClasses} />
        <StatCard title="Total Pengguna" value={stats.totalUsers} />
        <StatCard title="Siswa Terdaftar" value={stats.totalStudents} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Guru Pengajar" value={stats.totalTeachers} />
        <StatCard title="Materi Pembelajaran" value={stats.totalMaterials} />
        <StatCard title="Bank Kuis Aktif" value={stats.totalQuizzes} />
        <StatCard title="Pengerjaan Kuis" value={stats.totalAttempts} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-2">
        <Link
          href="/admin/sekolah"
          className="p-5 rounded-xl border border-input bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-sky-100 text-sky-700">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Manajemen Sekolah</h3>
              <p className="text-xs text-muted-foreground mt-1">
                CRUD data satuan pendidikan (NPSN, kabupaten, kontak).
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Kelola Sekolah <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/admin/kelas"
          className="p-5 rounded-xl border border-input bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-indigo-100 text-indigo-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Manajemen Kelas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                CRUD rombongan belajar seluruh sekolah dan penempatan siswa.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Kelola Kelas <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/admin/pengguna"
          className="p-5 rounded-xl border border-input bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-emerald-100 text-emerald-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Manajemen Pengguna</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Kelola akun siswa, guru, admin, reset password, dan status aktif.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Kelola Pengguna <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/admin/konten"
          className="p-5 rounded-xl border border-input bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-amber-100 text-amber-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Moderasi Konten</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Tinjau, terbitkan, atau cabut materi dan kuis yang dibuat guru.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Buka Moderasi <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  )
}

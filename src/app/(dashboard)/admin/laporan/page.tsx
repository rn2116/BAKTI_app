import { requireDashboardUser } from "@/lib/auth"
import {
  getAllStudentRecapReport,
  getAllRegencies,
  getAllSchoolsAdmin,
} from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminLaporanClient } from "@/components/admin/AdminLaporanClient"

export default async function AdminLaporanPage() {
  await requireDashboardUser("ADMIN")

  const [reports, regencies, schools] = await Promise.all([
    getAllStudentRecapReport(),
    getAllRegencies(),
    getAllSchoolsAdmin(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Capaian Nilai Peserta"
        description="Laporan rekapitulasi penilaian capaian literasi bahasa, pendidikan karakter, dan kearifan lokal Sulawesi Tengah resmi Balai Bahasa Provinsi Sulawesi Tengah."
      />
      <AdminLaporanClient
        reports={reports}
        regencies={regencies.map((r) => ({ id: r.id, name: r.name }))}
        schools={schools.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  )
}

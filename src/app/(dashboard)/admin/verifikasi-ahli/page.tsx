import { requireDashboardUser } from "@/lib/auth"
import { getExpertApplicantsAdmin } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminVerifikasiAhliClient } from "@/components/admin/AdminVerifikasiAhliClient"

export const dynamic = "force-dynamic"

export default async function AdminVerifikasiAhliPage() {
  await requireDashboardUser("ADMIN")
  const applicants = await getExpertApplicantsAdmin()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Ahli Bahasa Daerah"
        description="Tinjau berkas bukti kepakaran pendaftar Ahli Bahasa Daerah sebelum memberikan hak akses penyuntingan Kamus Besar Kearifan Lokal."
      />
      <AdminVerifikasiAhliClient applicants={applicants} />
    </div>
  )
}

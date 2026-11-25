import { requireDashboardUser } from "@/lib/auth"
import { getInstitutionSettings } from "@/services/institution"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminInstitutionSettingsClient } from "@/components/admin/AdminInstitutionSettingsClient"

export const dynamic = "force-dynamic"

export default async function AdminPengaturanInstansiPage() {
  await requireDashboardUser("ADMIN")

  const initialSettings = await getInstitutionSettings()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Instansi & Penandatangan Sertifikat"
        description="Kelola identitas pejabat penandatangan sertifikat digital serta kontak surel dan WhatsApp narahubung resmi Balai Bahasa Provinsi Sulawesi Tengah."
      />
      <AdminInstitutionSettingsClient initialSettings={initialSettings} />
    </div>
  )
}

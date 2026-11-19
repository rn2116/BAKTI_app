import { requireDashboardUser } from "@/lib/auth"
import { getCharacterMatrices } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminCharacterMatrixClient } from "@/components/admin/AdminCharacterMatrixClient"

export default async function AdminCharacterMatrixPage() {
  await requireDashboardUser("ADMIN")

  const matrices = await getCharacterMatrices()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matriks Karakter 9 Bahasa Daerah"
        description="Integrasi resmi nilai-nilai luhur dan kearifan lokal 9 bahasa daerah Sulawesi Tengah (Balai Bahasa Provinsi Sulawesi Tengah)."
      />
      <AdminCharacterMatrixClient matrices={matrices} />
    </div>
  )
}

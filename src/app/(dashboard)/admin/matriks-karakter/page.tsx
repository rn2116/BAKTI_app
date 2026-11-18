import { getCurrentUser } from "@/lib/auth"
import { getCharacterMatrices } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminCharacterMatrixClient } from "@/components/admin/AdminCharacterMatrixClient"
import { redirect } from "next/navigation"

export default async function AdminCharacterMatrixPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

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

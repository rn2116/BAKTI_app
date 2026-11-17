import { getCurrentUser } from "@/lib/auth"
import { getAllSchoolsAdmin, getAllRegencies } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { SekolahManagementClient } from "@/components/admin/SekolahManagementClient"
import { redirect } from "next/navigation"

export default async function AdminSekolahPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

  const [schools, regencies] = await Promise.all([
    getAllSchoolsAdmin(),
    getAllRegencies(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Satuan Pendidikan"
        description="Kelola data induk sekolah (SMA/SMK) di 13 kabupaten/kota Provinsi Sulawesi Tengah."
      />
      <SekolahManagementClient schools={schools} regencies={regencies} />
    </div>
  )
}

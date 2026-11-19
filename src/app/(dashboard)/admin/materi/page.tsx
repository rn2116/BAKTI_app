import { requireDashboardUser } from "@/lib/auth"
import { getMaterialsForManagement } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { MateriManagementClient } from "@/components/guru/MateriManagementClient"

export default async function AdminMateriPage() {
  await requireDashboardUser("ADMIN")

  const materials = await getMaterialsForManagement(undefined, true)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Materi Literasi"
        description="Kelola kurikulum resmi, modul literasi bahasa Indonesia, pembentukan karakter, dan budaya lokal Sulawesi Tengah."
      />
      <MateriManagementClient materials={materials} isTeacher={false} />
    </div>
  )
}

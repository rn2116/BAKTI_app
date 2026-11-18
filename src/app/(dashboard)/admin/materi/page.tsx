import { getCurrentUser } from "@/lib/auth"
import { getMaterialsForManagement } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { MateriManagementClient } from "@/components/guru/MateriManagementClient"
import { redirect } from "next/navigation"

export default async function AdminMateriPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

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

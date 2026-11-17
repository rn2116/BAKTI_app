import { getCurrentUser } from "@/lib/auth"
import { getMaterialsForManagement } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { MateriManagementClient } from "@/components/guru/MateriManagementClient"
import { redirect } from "next/navigation"

export default async function GuruMateriPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "GURU") {
    redirect("/masuk")
  }

  const materials = await getMaterialsForManagement(user.id, false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Materi Pembelajaran"
        description="Kelola materi ajar, modul karakter, dan literasi kebudayaan lokal."
      />
      <MateriManagementClient materials={materials} isTeacher={true} />
    </div>
  )
}

import { requireDashboardUser } from "@/lib/auth"
import { getMaterialsForManagement } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { MateriManagementClient } from "@/components/guru/MateriManagementClient"

export default async function GuruMateriPage() {
  await requireDashboardUser("GURU")

  const materials = await getMaterialsForManagement(undefined, true)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Katalog Materi Pembelajaran"
        description="Jelajahi dan telaah materi literasi bahasa, pembentukan karakter, dan budaya lokal resmi Balai Bahasa Sulawesi Tengah untuk referensi bimbingan siswa."
      />
      <MateriManagementClient materials={materials} isTeacher={true} />
    </div>
  )
}

import { requireDashboardUser } from "@/lib/auth"
import { getMaterialsForManagement } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { MateriManagementClient } from "@/components/guru/MateriManagementClient"

export default async function AdminMateriPage() {
  await requireDashboardUser("ADMIN")

  const [materials, languages] = await Promise.all([
    getMaterialsForManagement(undefined, true),
    getActiveRegionalLanguages(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Materi Literasi"
        description="Kelola kurikulum resmi, modul literasi bahasa Indonesia, pembentukan karakter, dan kearifan lokal Sulawesi Tengah."
      />
      <MateriManagementClient
        materials={materials}
        isTeacher={false}
        languages={languages.map((l) => ({ code: l.code, name: l.name }))}
      />
    </div>
  )
}

import { requireDashboardUser } from "@/lib/auth"
import { getCharacterMatrices } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminCharacterMatrixClient } from "@/components/admin/AdminCharacterMatrixClient"

export default async function AdminCharacterMatrixPage() {
  await requireDashboardUser("ADMIN")

  const [matrices, languages] = await Promise.all([
    getCharacterMatrices(),
    getActiveRegionalLanguages(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kamus Besar Kearifan Lokal Sulawesi Tengah"
        description="Pengelolaan kosakata, ungkapan bijak, dan nilai kearifan lokal Sulawesi Tengah (Balai Bahasa Provinsi Sulawesi Tengah)."
      />
      <AdminCharacterMatrixClient
        matrices={matrices}
        languages={languages.map((l) => ({ code: l.code, name: l.name }))}
      />
    </div>
  )
}

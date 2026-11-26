import { requireDashboardUser } from "@/lib/auth"
import { getCharacterMatrices } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminCharacterMatrixClient } from "@/components/admin/AdminCharacterMatrixClient"

export const dynamic = "force-dynamic"

export default async function AhliBahasaKamusPage() {
  await requireDashboardUser("AHLI_BAHASA")

  const [matrices, languages] = await Promise.all([
    getCharacterMatrices(),
    getActiveRegionalLanguages(),
  ])

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Kamus Besar Kearifan Lokal Sulawesi Tengah"
        description="Tambahkan dan sunting kosakata daerah, makna harfiah, makna filosofis, nilai karakter padanan, sumber rujukan, contoh penerapan, serta rekaman pelafalan asli."
      />
      <AdminCharacterMatrixClient
        matrices={matrices}
        languages={languages.map((l) => ({ code: l.code, name: l.name }))}
      />
    </div>
  )
}

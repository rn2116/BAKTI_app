import { requireDashboardUser } from "@/lib/auth"
import { getCharacterMatrices } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { getPendingDictionaryProposalsForCurator } from "@/services/dictionary"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminCharacterMatrixClient } from "@/components/admin/AdminCharacterMatrixClient"
import { DictionaryCurationPanel } from "@/components/ahli-bahasa/DictionaryCurationPanel"

export const dynamic = "force-dynamic"

export default async function AdminCharacterMatrixPage() {
  await requireDashboardUser("ADMIN")

  const [matrices, languages, proposalSummary] = await Promise.all([
    getCharacterMatrices(),
    getActiveRegionalLanguages(),
    getPendingDictionaryProposalsForCurator(),
  ])

  const langOptions = languages.map((l) => ({ code: l.code, name: l.name }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kamus Besar Kearifan Lokal Sulawesi Tengah"
        description="Pengelolaan kosakata, ungkapan bijak, kurasi usulan masyarakat, dan nilai kearifan lokal Sulawesi Tengah (Balai Bahasa Provinsi Sulawesi Tengah)."
      />
      <DictionaryCurationPanel
        summary={proposalSummary}
        languages={langOptions}
      />
      <AdminCharacterMatrixClient
        matrices={matrices}
        languages={langOptions}
      />
    </div>
  )
}

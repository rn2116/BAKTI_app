import { requireDashboardUser } from "@/lib/auth"
import {
  getApprovedDictionaryEntries,
  getUserProposedEntries,
} from "@/services/dictionary"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { RegionalLanguageDictionaryClient } from "@/components/siswa/RegionalLanguageDictionaryClient"

export const dynamic = "force-dynamic"

export default async function SiswaBudayaBahasaPage({
  searchParams,
}: {
  searchParams?: Promise<{ bahasa?: string }> | { bahasa?: string }
}) {
  const user = await requireDashboardUser("SISWA")
  const resolvedParams =
    searchParams instanceof Promise ? await searchParams : searchParams

  const [matrices, myProposals, languages] = await Promise.all([
    getApprovedDictionaryEntries(),
    getUserProposedEntries(user.id),
    getActiveRegionalLanguages(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kamus Besar Kearifan Lokal Sulawesi Tengah"
        description="Jelajahi kosakata, falsafah adat, petuah luhur, dan penerapan nilai kearifan lokal di Provinsi Sulawesi Tengah."
      />
      <RegionalLanguageDictionaryClient
        matrices={matrices}
        myProposals={myProposals}
        languages={languages.map((l) => ({
          code: l.code,
          name: l.name,
          regencyCoverage: l.regencyCoverage,
        }))}
        initialLanguage={resolvedParams?.bahasa?.toUpperCase() || "ALL"}
      />
    </div>
  )
}

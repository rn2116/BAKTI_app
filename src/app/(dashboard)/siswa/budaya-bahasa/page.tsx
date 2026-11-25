import { requireDashboardUser } from "@/lib/auth"
import { getCharacterMatricesForDictionary } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { RegionalLanguageDictionaryClient } from "@/components/siswa/RegionalLanguageDictionaryClient"

export default async function SiswaBudayaBahasaPage({
  searchParams,
}: {
  searchParams?: Promise<{ bahasa?: string }> | { bahasa?: string }
}) {
  await requireDashboardUser("SISWA")
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams

  const [matrices, languages] = await Promise.all([
    getCharacterMatricesForDictionary(),
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

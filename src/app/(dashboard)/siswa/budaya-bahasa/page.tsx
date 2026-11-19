import { requireDashboardUser } from "@/lib/auth"
import { getCharacterMatrices } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { RegionalLanguageDictionaryClient } from "@/components/siswa/RegionalLanguageDictionaryClient"

export default async function SiswaBudayaBahasaPage() {
  await requireDashboardUser("SISWA")

  const matrices = await getCharacterMatrices()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kamus Karakter 9 Bahasa Daerah"
        description="Jelajahi falsafah adat, petuah luhur, dan implementasi budi pekerti dalam 9 bahasa daerah resmi Sulawesi Tengah."
      />
      <RegionalLanguageDictionaryClient matrices={matrices} />
    </div>
  )
}

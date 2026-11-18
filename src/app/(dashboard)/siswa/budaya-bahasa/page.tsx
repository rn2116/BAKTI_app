import { getCurrentUser } from "@/lib/auth"
import { getCharacterMatrices } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { RegionalLanguageDictionaryClient } from "@/components/siswa/RegionalLanguageDictionaryClient"
import { redirect } from "next/navigation"

export default async function SiswaBudayaBahasaPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "SISWA") {
    redirect("/masuk")
  }

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

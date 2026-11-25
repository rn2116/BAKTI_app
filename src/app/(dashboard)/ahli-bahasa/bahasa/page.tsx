import { requireDashboardUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAllRegionalLanguagesForManagement } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { RegionalLanguageManagerClient } from "@/components/admin/RegionalLanguageManagerClient"

export const dynamic = "force-dynamic"

export default async function AhliBahasaDaftarBahasaPage() {
  await requireDashboardUser("AHLI_BAHASA")

  const [languages, counts] = await Promise.all([
    getAllRegionalLanguagesForManagement(),
    prisma.characterMatrix.groupBy({
      by: ["regionalLanguage"],
      _count: { id: true },
    }),
  ])

  const countMap = new Map(counts.map((c) => [c.regionalLanguage, c._count.id]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Daftar Bahasa Daerah Sulawesi Tengah"
        description="Tambahkan bahasa daerah baru atau perbarui keterangan wilayah penutur yang akan tampil di Kamus Besar dan Peta Eksplorasi."
      />
      <RegionalLanguageManagerClient
        languages={languages.map((l) => ({
          ...l,
          entryCount: countMap.get(l.code) ?? 0,
        }))}
      />
    </div>
  )
}

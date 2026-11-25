import { requireDashboardUser } from "@/lib/auth"
import { getPublishedMaterials, getUserMaterialProgress } from "@/services/material"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { MateriKatalogClient } from "@/components/siswa/MateriKatalogClient"

export default async function MateriSiswaPage({
  searchParams,
}: {
  searchParams?: Promise<{ kategori?: string; bahasa?: string }> | { kategori?: string; bahasa?: string }
}) {
  const user = await requireDashboardUser("SISWA")
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams

  const [materials, progress, languages] = await Promise.all([
    getPublishedMaterials(),
    getUserMaterialProgress(user.id),
    getActiveRegionalLanguages(),
  ])

  const progressMap: Record<string, string> = {}
  progress.forEach((p) => {
    progressMap[p.materialId] = p.status
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Katalog Kartu Materi Pembelajaran"
        description="Eksplorasi modul terstruktur Bahasa Indonesia, Pendidikan Karakter, dan Kearifan Lokal Sulawesi Tengah beserta seri Ungkapan Bijak To Kaili."
      />

      <MateriKatalogClient
        materials={materials}
        progressMap={progressMap}
        languages={languages.map((l) => ({ code: l.code, name: l.name }))}
        initialCategory={resolvedParams?.kategori ?? "ALL"}
        initialLanguage={resolvedParams?.bahasa ?? "ALL"}
      />
    </div>
  )
}

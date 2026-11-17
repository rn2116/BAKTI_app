import { getCurrentUser } from "@/lib/auth"
import { getPublishedMaterials, getUserMaterialProgress } from "@/services/material"
import { PageHeader } from "@/components/shared/PageHeader"
import { MateriKatalogClient } from "@/components/siswa/MateriKatalogClient"

export default async function MateriSiswaPage({
  searchParams,
}: {
  searchParams?: { kategori?: string }
}) {
  const user = await getCurrentUser()
  if (!user) return null

  const [materials, progress] = await Promise.all([
    getPublishedMaterials(),
    getUserMaterialProgress(user.id),
  ])

  const progressMap: Record<string, string> = {}
  progress.forEach((p) => {
    progressMap[p.materialId] = p.status
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Katalog Materi Pembelajaran"
        description="Eksplorasi modul literasi bahasa Indonesia, pendidikan karakter, dan kebudayaan Sulawesi Tengah."
      />

      <MateriKatalogClient
        materials={materials}
        progressMap={progressMap}
        initialCategory={searchParams?.kategori ?? "ALL"}
      />
    </div>
  )
}

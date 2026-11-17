import { getCurrentUser } from "@/lib/auth"
import { getPublishedMaterials, getUserMaterialProgress } from "@/services/material"
import { PageHeader } from "@/components/shared/PageHeader"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function MateriSiswaPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [materials, progress] = await Promise.all([
    getPublishedMaterials(),
    getUserMaterialProgress(user.id),
  ])

  const progressMap = new Map(
    progress.map((p) => [p.materialId, p.status])
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Katalog Materi"
        description="Pilih materi pembelajaran yang ingin Anda pelajari."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((m) => {
          const status = progressMap.get(m.id)
          const isDone = status === "SELESAI"
          return (
            <Card key={m.id} className={cn("group hover:shadow-md transition-shadow")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CategoryBadge category={m.category} />
                  {isDone && (
                    <span className="text-xs font-medium text-secondary">
                      Selesai
                    </span>
                  )}
                </div>
                <CardTitle className="text-base line-clamp-2">
                  {m.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {m.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{m.readingTime} menit baca</span>
                  <span>{m._count.quizzes} kuis</span>
                </div>
                <Link
                  href={`/siswa/materi/${m.slug}`}
                  className={cn(
                    "w-full inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isDone ? "opacity-60" : ""
                  )}
                >
                  {isDone ? "Selesai" : "Mulai Belajar"}
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {materials.length === 0 && (
        <div className="flex justify-center">
          <Card>
            <CardContent className="py-20 text-center">
              <h3 className="text-lg font-semibold">Belum ada materi tersedia</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Silakan tunggu hingga guru atau admin menambahkan materi pembelajaran.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

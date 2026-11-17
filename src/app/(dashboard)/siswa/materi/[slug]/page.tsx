import { getCurrentUser } from "@/lib/auth"
import { getMaterialBySlug, getMaterialProgress } from "@/services/material"
import { PageHeader } from "@/components/shared/PageHeader"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import MaterialCompleteForm from "@/components/siswa/MaterialCompleteForm"

export default async function MateriDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const [material] = [await getMaterialBySlug(slug)]
  if (!material) return null

  const progress = await getMaterialProgress(user.id, material.id)
  let isDone = false
  if (progress) {
    isDone = progress.status === "SELESAI"
  }

  const content = (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{material.title}</h1>
      <p className="text-muted-foreground">{material.description}</p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Progres Anda</CardTitle>
            </CardHeader>
            <CardContent className="pb-0 pt-0">
              <div className="text-sm font-semibold">{user.xp} XP</div>
              <div className="text-sm text-muted-foreground">
                Level {user.level}
              </div>
              <div className="mt-3 h-2 rounded-full overflow-hidden border border-input bg-secondary/10">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${isDone ? 100 : 0}%` }}
                />
              </div>
              {isDone && (
                <div className="mt-3 flex items-center gap-2 text-xs text-secondary">
                  Selesai
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-2/3 flex-1 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Isi Materi</CardTitle>
            </CardHeader>
            <CardContent
              className="pb-0 pt-0 flex-1 overflow-y-auto max-h-[60vh] leading-relaxed font-serif text-lg text-foreground"
            >
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: material.content }}
              />
            </CardContent>
          </Card>
          <MaterialCompleteForm materialId={material.id} isDone={isDone} />
        </div>
      </div>

      {material.quizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kuis Terkait</CardTitle>
          </CardHeader>
          <CardContent className="pb-0 pt-0 space-y-3">
            {material.quizzes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 rounded-lg border border-input bg-background hover:bg-accent/50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{q.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {q.questions.length} soal • {q.timeLimit} menit
                  </div>
                </div>
                <Link
                  href={`/siswa/kuis/${q.id}/mulai`}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Mulai Kuis
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )

  return content
}

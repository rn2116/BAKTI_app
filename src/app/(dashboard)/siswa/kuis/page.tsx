import { getCurrentUser } from "@/lib/auth"
import { getPublishedQuizzes } from "@/services/quiz"
import { PageHeader } from "@/components/shared/PageHeader"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function KuisSiswaPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const quizzes = await getPublishedQuizzes()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuis"
        description="Uji pemahaman Anda dengan mengikuti kuis yang tersedia."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((q) => (
          <Card key={q.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CategoryBadge category={q.category} />
                <span className="text-xs font-medium text-muted-foreground">
                  {q.timeLimit} menit
                </span>
              </div>
              <CardTitle className="text-base line-clamp-2">{q.title}</CardTitle>
              {q.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {q.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{q._count.questions} soal</span>
                <span>Skor lulus {q.passingScore}</span>
              </div>
              <Link
                href={`/siswa/kuis/${q.id}/mulai`}
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                )}
              >
                Mulai Kuis
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="flex justify-center">
          <Card>
            <CardContent className="py-20 text-center">
              <h3 className="text-lg font-semibold">Belum ada kuis tersedia</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Kuis akan ditampilkan setelah tersedia dalam sistem.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SiswaDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

  let progress: Array<{ id: string; status: string; material: { title: string } }> = []
  let attempts: Array<{ id: string; score: number; maxScore: number; startedAt: Date }> = []
  let error: string | null = null

  try {
    progress = await prisma.userMaterialProgress.findMany({
      where: { userId: user.id },
      include: { material: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    })
    attempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 5,
    })
  } catch {
    error = "Gagal memuat data dasbor. Silakan coba lagi nanti."
  }

  const completed = progress.filter((p) => p.status === "SELESAI").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dasbor Siswa"
        description={`Selamat datang, ${user.fullName}. Ayo teruskan belajar Anda.`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Poin (XP)" value={user.xp} />
        <StatCard title="Materi Selesai" value={completed} />
        <div className="col-span-2 sm:col-span-1">
          <StatCard title="Kuis Diikuti" value={attempts.length} />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Progres Materi</CardTitle>
          </CardHeader>
          <CardContent>
            {progress.length === 0 ? (
              <EmptyState
                title="Belum ada progres materi"
                description="Mulai pelajari materi pertama Anda dari katalog materi."
                action={
                  <a
                    href="/siswa/materi"
                    className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Lihat Katalog Materi
                  </a>
                }
              />
            ) : (
              <ul className="space-y-3">
                {progress.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 border-b border-input last:border-0">
                    <span className="text-sm">{p.material.title}</span>
                    <span className="text-xs font-medium capitalize">
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Riwayat Kuis Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <EmptyState
                title="Belum ada riwayat kuis"
                description="Ikuti kuis untuk mencatat hasil belajar Anda."
                action={
                  <a
                    href="/siswa/kuis"
                    className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Lihat Kuis
                  </a>
                }
              />
            ) : (
              <ul className="space-y-3">
                {attempts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2 border-b border-input last:border-0">
                    <div>
                      <div className="text-sm font-medium">Kuis #{a.id.slice(0, 6)}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.score} / {a.maxScore}
                      </div>
                    </div>
                    <span className="text-xs font-medium">
                      {a.score >= a.maxScore * 0.75 ? "Lulus" : "Belum Lulus"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

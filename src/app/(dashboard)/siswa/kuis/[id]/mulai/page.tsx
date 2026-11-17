import { getCurrentUser } from "@/lib/auth"
import { getQuizById, getUserQuizAttempts } from "@/services/quiz"
import { KuisMulaiForm } from "@/components/quiz/KuisMulaiForm"
import { PageHeader } from "@/components/shared/PageHeader"
import Link from "next/link"

export default async function KuisMulaiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const [quiz, existingAttempts] = await Promise.all([
    getQuizById(id),
    getUserQuizAttempts(user.id, id),
  ])

  if (!quiz) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Kuis tidak ditemukan</h1>
        <Link
          href="/siswa/kuis"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Kembali ke Daftar Kuis
        </Link>
      </div>
    )
  }

  const bestAttempt = existingAttempts
    .filter((a) => a.passed)
    .sort((a, b) => b.score - a.score)[0]

  if (bestAttempt) {
    return (
      <div className="space-y-6">
        <PageHeader title={quiz.title} description={quiz.description ?? ""} />
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1">
            <div className="rounded-xl border border-input bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Anda sudah lulus kuis ini</h2>
              <div className="mt-4 text-lg font-bold">
                {bestAttempt.score} / {bestAttempt.maxScore}
              </div>
              <div className="mt-1 text-sm text-secondary">
                XP diperoleh: {bestAttempt.xpEarned}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/siswa/kuis"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={quiz.title} description={quiz.description ?? ""} />
      <KuisMulaiForm quiz={quiz} userId={user.id} />
    </div>
  )
}

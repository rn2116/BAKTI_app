import { requireDashboardUser } from "@/lib/auth"
import { getAdminQuizzes, getPendingVerificationCount } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminQuizListClient } from "@/components/admin/AdminQuizListClient"

export default async function AdminQuizListPage() {
  await requireDashboardUser("ADMIN")

  const [quizzes, pendingCount, languages] = await Promise.all([
    getAdminQuizzes(),
    getPendingVerificationCount(),
    getActiveRegionalLanguages(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Soal & Kuis Pembelajaran"
        description="Kelola kuis interaktif, kuis bahasa daerah Sulawesi Tengah, verifikasi ajuan Guru, dan impor butir soal massal via Excel."
      />
      <AdminQuizListClient
        quizzes={quizzes}
        pendingCount={pendingCount}
        languages={languages.map((l) => ({ code: l.code, name: l.name }))}
      />
    </div>
  )
}

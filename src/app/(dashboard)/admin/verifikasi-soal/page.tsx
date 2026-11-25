import { requireDashboardUser } from "@/lib/auth"
import { getQuestionsForVerification } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminVerifikasiSoalClient } from "@/components/admin/AdminVerifikasiSoalClient"

export default async function AdminVerifikasiSoalPage() {
  await requireDashboardUser("ADMIN")

  const [{ questions, counts }, languages] = await Promise.all([
    getQuestionsForVerification(),
    getActiveRegionalLanguages(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Soal Pengajuan Guru"
        description="Tinjau, sunting kesesuaian EYD V dan materi, setujui, atau kirim catatan revisi untuk butir soal kiriman Guru sebelum tayang ke peserta."
      />
      <AdminVerifikasiSoalClient
        questions={questions}
        counts={counts}
        languages={languages.map((l) => ({ code: l.code, name: l.name }))}
      />
    </div>
  )
}

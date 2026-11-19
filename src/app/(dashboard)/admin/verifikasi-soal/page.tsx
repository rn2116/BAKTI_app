import { requireDashboardUser } from "@/lib/auth"
import { getQuestionsForVerification } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminVerifikasiSoalClient } from "@/components/admin/AdminVerifikasiSoalClient"

export default async function AdminVerifikasiSoalPage() {
  await requireDashboardUser("ADMIN")

  const { questions, counts } = await getQuestionsForVerification()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Soal Pengajuan Guru"
        description="Tinjau, sunting kesesuaian EYD V dan materi, setujui, atau kirim catatan revisi untuk butir soal kiriman Guru sebelum tayang ke siswa."
      />
      <AdminVerifikasiSoalClient questions={questions} counts={counts} />
    </div>
  )
}

import { requireDashboardUser } from "@/lib/auth"
import { getQuizzesForTeacherContribution } from "@/services/admin-guru"
import { getPublishedMaterials } from "@/services/material"
import { PageHeader } from "@/components/shared/PageHeader"
import { KuisManagementClient } from "@/components/guru/KuisManagementClient"

export default async function GuruKuisPage() {
  const user = await requireDashboardUser("GURU")

  const [quizzes, materials] = await Promise.all([
    getQuizzesForTeacherContribution(user.id),
    getPublishedMaterials(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Soal & Pengajuan Kuis"
        description="Pilih paket kuis yang tersedia untuk mengajukan butir soal baru (manual atau impor Excel) yang akan diverifikasi oleh Admin Balai Bahasa."
      />
      <KuisManagementClient
        quizzes={quizzes}
        materials={materials.map((m) => ({ id: m.id, title: m.title }))}
        currentUserId={user.id}
      />
    </div>
  )
}

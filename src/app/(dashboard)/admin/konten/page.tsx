import { requireDashboardUser } from "@/lib/auth"
import { getAllContentForModeration } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModerasiKontenClient } from "@/components/admin/ModerasiKontenClient"

export default async function AdminKontenPage() {
  await requireDashboardUser("ADMIN")

  const { materials, quizzes } = await getAllContentForModeration()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderasi & Verifikasi Konten"
        description="Kelola hak tayang materi pembelajaran dan bank kuis yang diajukan oleh guru pengajar."
      />
      <ModerasiKontenClient materials={materials} quizzes={quizzes} />
    </div>
  )
}

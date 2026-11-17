import { getCurrentUser } from "@/lib/auth"
import { getAllContentForModeration } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModerasiKontenClient } from "@/components/admin/ModerasiKontenClient"
import { redirect } from "next/navigation"

export default async function AdminKontenPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

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

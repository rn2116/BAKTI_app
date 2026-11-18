import { getCurrentUser } from "@/lib/auth"
import { getAdminQuizzes } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminQuizListClient } from "@/components/admin/AdminQuizListClient"
import { redirect } from "next/navigation"

export default async function AdminQuizListPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

  const quizzes = await getAdminQuizzes()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Soal & Kuis Pembelajaran"
        description="Kelola kuis interaktif, kuis 9 bahasa daerah Sulawesi Tengah, dan impor butir soal massal via Excel."
      />
      <AdminQuizListClient quizzes={quizzes} />
    </div>
  )
}

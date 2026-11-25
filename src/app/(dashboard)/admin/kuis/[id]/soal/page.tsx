import { requireDashboardUser } from "@/lib/auth"
import { getAdminQuizDetail } from "@/services/admin-guru"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { AdminQuizQuestionsClient } from "@/components/admin/AdminQuizQuestionsClient"
import { redirect } from "next/navigation"

export default async function AdminQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireDashboardUser("ADMIN")

  const { id } = await params
  const [quiz, languages] = await Promise.all([
    getAdminQuizDetail(id),
    getActiveRegionalLanguages(),
  ])
  if (!quiz) {
    redirect("/admin/kuis")
  }

  return (
    <div className="space-y-6">
      <AdminQuizQuestionsClient
        quiz={quiz}
        currentUserId={user.id}
        languages={languages.map((l) => ({ code: l.code, name: l.name }))}
      />
    </div>
  )
}

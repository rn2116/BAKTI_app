import { requireDashboardUser } from "@/lib/auth"
import { getTeacherQuizDetail } from "@/services/admin-guru"
import { QuizQuestionsManager } from "@/components/shared/QuizQuestionsManager"
import { redirect } from "next/navigation"

export default async function GuruQuizQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireDashboardUser("GURU")

  const { id } = await params
  const quiz = await getTeacherQuizDetail(id, user.id)
  if (!quiz) {
    redirect("/guru/kuis")
  }

  return (
    <div className="space-y-6">
      <QuizQuestionsManager
        quiz={quiz}
        userRole="GURU"
        currentUserId={user.id}
        backHref="/guru/kuis"
      />
    </div>
  )
}

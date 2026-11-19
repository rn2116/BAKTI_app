"use client"

import {
  QuizQuestionsManager,
  type ManagedQuizDetail,
} from "@/components/shared/QuizQuestionsManager"

interface AdminQuizQuestionsClientProps {
  quiz: ManagedQuizDetail
  currentUserId: string
}

export function AdminQuizQuestionsClient({
  quiz,
  currentUserId,
}: AdminQuizQuestionsClientProps) {
  return (
    <QuizQuestionsManager
      quiz={quiz}
      userRole="ADMIN"
      currentUserId={currentUserId}
      backHref="/admin/kuis"
    />
  )
}

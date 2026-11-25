"use client"

import {
  QuizQuestionsManager,
  type ManagedQuizDetail,
} from "@/components/shared/QuizQuestionsManager"

interface AdminQuizQuestionsClientProps {
  quiz: ManagedQuizDetail
  currentUserId: string
  languages?: Array<{ code: string; name: string }>
}

export function AdminQuizQuestionsClient({
  quiz,
  currentUserId,
  languages,
}: AdminQuizQuestionsClientProps) {
  return (
    <QuizQuestionsManager
      quiz={quiz}
      userRole="ADMIN"
      currentUserId={currentUserId}
      backHref="/admin/kuis"
      languages={languages}
    />
  )
}

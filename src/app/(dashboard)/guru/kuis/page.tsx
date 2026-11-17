import { getCurrentUser } from "@/lib/auth"
import { getQuizzesForManagement } from "@/services/admin-guru"
import { getPublishedMaterials } from "@/services/material"
import { PageHeader } from "@/components/shared/PageHeader"
import { KuisManagementClient } from "@/components/guru/KuisManagementClient"
import { redirect } from "next/navigation"

export default async function GuruKuisPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "GURU") {
    redirect("/masuk")
  }

  const [quizzes, materials] = await Promise.all([
    getQuizzesForManagement(user.id, false),
    getPublishedMaterials(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Soal & Kuis"
        description="Kelola kuis interaktif, butir soal pilihan ganda, dan kunci jawaban pembahasan."
      />
      <KuisManagementClient
        quizzes={quizzes}
        materials={materials.map((m) => ({ id: m.id, title: m.title }))}
      />
    </div>
  )
}

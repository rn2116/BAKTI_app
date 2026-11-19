import { requireDashboardUser } from "@/lib/auth"
import { getQuizRecapBySchoolOrTeacher, getTeacherClasses } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { GuruRekapClient } from "@/components/guru/GuruRekapClient"

export default async function GuruRekapPage() {
  const user = await requireDashboardUser("GURU")

  const recapAttempts = await getQuizRecapBySchoolOrTeacher(
    user.schoolId ?? undefined,
    user.id
  )

  let classList: string[] = []
  if (user.schoolId) {
    const classes = await getTeacherClasses(user.schoolId)
    classList = classes.map((c) => c.name)
  }
  if (classList.length === 0) {
    classList = Array.from(
      new Set(recapAttempts.map((a: any) => a.user.class?.name).filter(Boolean) as string[])
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekapitulasi Nilai Siswa"
        description="Pantau hasil pengerjaan kuis siswa per kelas & kategori, serta unduh laporan resmi dalam format Excel."
      />

      <GuruRekapClient recapAttempts={recapAttempts as any} classList={classList} />
    </div>
  )
}

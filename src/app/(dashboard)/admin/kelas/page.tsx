import { getCurrentUser } from "@/lib/auth"
import { getAllClassesAdmin, getAllSchoolsAdmin } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminKelasClient } from "@/components/admin/AdminKelasClient"
import { redirect } from "next/navigation"

export default async function AdminKelasPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

  const [classes, schools] = await Promise.all([
    getAllClassesAdmin(),
    getAllSchoolsAdmin(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Rombongan Belajar (Kelas)"
        description="Kelola kelas dan rombongan belajar tingkat SMA/SMK se-Sulawesi Tengah."
      />
      <AdminKelasClient
        classes={classes}
        schools={schools.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  )
}

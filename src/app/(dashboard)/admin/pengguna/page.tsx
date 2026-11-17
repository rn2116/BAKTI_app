import { getCurrentUser } from "@/lib/auth"
import { getAllUsersAdmin, getAllSchoolsAdmin, getAllClassesAdmin } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { PenggunaManagementClient } from "@/components/admin/PenggunaManagementClient"
import { redirect } from "next/navigation"

export default async function AdminPenggunaPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/masuk")
  }

  const [users, schools, classes] = await Promise.all([
    getAllUsersAdmin(),
    getAllSchoolsAdmin(),
    getAllClassesAdmin(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun hak akses administrator, guru pengajar, dan siswa di seluruh sekolah."
      />
      <PenggunaManagementClient
        users={users}
        schools={schools.map((s) => ({ id: s.id, name: s.name }))}
        classes={classes.map((c) => ({ id: c.id, name: c.name, schoolId: c.school.id }))}
      />
    </div>
  )
}

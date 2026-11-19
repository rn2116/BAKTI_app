import { requireDashboardUser } from "@/lib/auth"
import { getAllUsersAdmin, getAllSchoolsAdmin, getAllClassesAdmin } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { PenggunaManagementClient } from "@/components/admin/PenggunaManagementClient"

export default async function AdminPenggunaPage() {
  await requireDashboardUser("ADMIN")

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

import { getCurrentUser } from "@/lib/auth"
import { getTeacherClasses } from "@/services/admin-guru"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { KelasManagementClient } from "@/components/guru/KelasManagementClient"
import { redirect } from "next/navigation"

export default async function GuruKelasPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "GURU") {
    redirect("/masuk")
  }

  if (!user.schoolId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">Akun Guru belum ditautkan ke sekolah</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Hubungi Admin untuk menautkan akun sekolah Anda.
        </p>
      </div>
    )
  }

  const school = await prisma.masterSchool.findUnique({
    where: { id: user.schoolId },
    select: { name: true },
  })

  const classes = await getTeacherClasses(user.schoolId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kelas"
        description="Pantau dan kelola kelas di lingkungan sekolah Anda."
      />
      <KelasManagementClient
        classes={classes}
        schoolId={user.schoolId}
        schoolName={school?.name ?? "Sekolah"}
      />
    </div>
  )
}

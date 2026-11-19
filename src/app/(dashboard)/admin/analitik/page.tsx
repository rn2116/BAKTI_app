import { requireDashboardUser } from "@/lib/auth"
import { getAdminAgencyAnalytics } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { AdminAnalitikClient } from "@/components/admin/AdminAnalitikClient"

export const dynamic = "force-dynamic"

export default async function AdminAnalitikPage() {
  await requireDashboardUser("ADMIN")

  const analytics = await getAdminAgencyAnalytics()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitik Instansi &amp; Pangkalan Data BBPST"
        description="Statistik partisipasi sekolah, capaian 9 bahasa daerah Sulawesi Tengah, dan analisis ungkapan paling dikuasai hingga tersulit."
      />
      <AdminAnalitikClient analytics={analytics} />
    </div>
  )
}

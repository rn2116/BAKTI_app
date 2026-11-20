import nextDynamic from "next/dynamic"
import { requireDashboardUser } from "@/lib/auth"
import { getAdminAgencyAnalytics } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"

const AdminAnalitikClient = nextDynamic(
  () =>
    import("@/components/admin/AdminAnalitikClient").then(
      (mod) => mod.AdminAnalitikClient
    ),
  {
    loading: () => (
      <div className="h-[420px] rounded-2xl border border-zinc-200 bg-white animate-pulse" />
    ),
  }
)

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

import { redirect } from "next/navigation"
import { requireDashboardUser } from "@/lib/auth"
import { getExpertProfileSummary } from "@/services/expert"
import { PageHeader } from "@/components/shared/PageHeader"
import { ExpertProfileClient } from "@/components/ahli-bahasa/ExpertProfileClient"

export const dynamic = "force-dynamic"

export default async function AhliBahasaProfilPage() {
  const user = await requireDashboardUser("AHLI_BAHASA")
  const profile = await getExpertProfileSummary(user.id)

  if (!profile) {
    redirect("/api/auth/clear-session")
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Status & Profil Kepakaran"
        description="Informasi verifikasi resmi Balai Bahasa Provinsi Sulawesi Tengah, dokumen bukti kepakaran, ringkasan kontribusi, serta pembaruan rekam jejak Anda."
      />
      <ExpertProfileClient profile={profile} />
    </div>
  )
}

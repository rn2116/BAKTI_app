import { requireDashboardUser } from "@/lib/auth"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { getExpertCurationQueue } from "@/services/expert"
import { PageHeader } from "@/components/shared/PageHeader"
import { ExpertCurationClient } from "@/components/ahli-bahasa/ExpertCurationClient"

export const dynamic = "force-dynamic"

export default async function AhliBahasaKurasiPage() {
  const user = await requireDashboardUser("AHLI_BAHASA")

  const [queueData, activeLanguages] = await Promise.all([
    getExpertCurationQueue(user.expertLanguage),
    getActiveRegionalLanguages(),
  ])

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Antrean Kurasi Usulan Masyarakat"
        description="Tinjau, selaraskan ejaan kosakata, tambahkan rekaman pelafalan penutur jati, dan terbitkan usulan masyarakat ke Kamus Besar Kearifan Lokal Sulawesi Tengah."
      />
      <ExpertCurationClient
        queueData={queueData}
        languages={activeLanguages.map((l) => ({ code: l.code, name: l.name }))}
      />
    </div>
  )
}

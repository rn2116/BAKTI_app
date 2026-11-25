import { requireDashboardUser } from "@/lib/auth"
import { getRegionalLanguageModuleData } from "@/services/regionalLearningService"
import { getRegionalLanguageByCode } from "@/services/regionalLanguageService"
import { RegionalLearningFlowClient } from "@/components/siswa/RegionalLearningFlowClient"
import { redirect } from "next/navigation"

export default async function BelajarBahasaPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const user = await requireDashboardUser("SISWA")
  const { lang } = await params
  const upperLang = (lang || "").toUpperCase()

  const langRecord = await getRegionalLanguageByCode(upperLang)
  if (!langRecord || !langRecord.isActive) {
    redirect("/siswa/budaya-bahasa")
  }

  const data = await getRegionalLanguageModuleData(user.id, upperLang)

  return <RegionalLearningFlowClient data={data} />
}

import { requireDashboardUser } from "@/lib/auth"
import { getRegionalLanguageModuleData } from "@/services/regionalLearningService"
import { RegionalLearningFlowClient } from "@/components/siswa/RegionalLearningFlowClient"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import { redirect } from "next/navigation"
import type { RegionalLanguage } from "@/types"

export default async function BelajarBahasaPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const user = await requireDashboardUser("SISWA")
  const { lang } = await params
  const upperLang = (lang || "").toUpperCase()

  if (!(upperLang in REGIONAL_LANGUAGE_LABELS)) {
    redirect("/siswa/budaya-bahasa")
  }

  const data = await getRegionalLanguageModuleData(user.id, upperLang as RegionalLanguage)

  return <RegionalLearningFlowClient data={data} />
}

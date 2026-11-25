import { prisma } from "@/lib/prisma"
import { REGIONAL_LANGUAGES } from "@/lib/constants"

export interface DynamicRegionalLanguageItem {
  id: string
  code: string
  name: string
  regencyCoverage: string
  description: string | null
  isActive: boolean
}

export async function getActiveRegionalLanguages(): Promise<DynamicRegionalLanguageItem[]> {
  try {
    const rows = await prisma.masterRegionalLanguage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        regencyCoverage: true,
        description: true,
        isActive: true,
      },
    })

    if (rows.length > 0) return rows
  } catch {
    // Gunakan daftar awal jika tabel belum diinisialisasi
  }

  return REGIONAL_LANGUAGES.map((item) => ({
    id: item.code,
    code: item.code,
    name: item.name,
    regencyCoverage: item.region,
    description: item.description,
    isActive: true,
  }))
}

export async function getAllRegionalLanguagesForManagement() {
  return prisma.masterRegionalLanguage.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      creator: { select: { fullName: true } },
    },
  })
}

export async function getRegionalLanguageByCode(code: string) {
  const normalized = code.trim().toUpperCase()
  const found = await prisma.masterRegionalLanguage.findUnique({
    where: { code: normalized },
  })
  if (found && found.isActive) return found

  const fallback = REGIONAL_LANGUAGES.find((l) => l.code === normalized)
  if (fallback) {
    return {
      id: fallback.code,
      code: fallback.code,
      name: fallback.name,
      regencyCoverage: fallback.region,
      description: fallback.description,
      isActive: true,
    }
  }
  return null
}

export async function getRegionalLanguageLabelMap(): Promise<Record<string, string>> {
  const langs = await getActiveRegionalLanguages()
  const map: Record<string, string> = {}
  for (const lang of langs) {
    map[lang.code] = lang.name
  }
  return map
}

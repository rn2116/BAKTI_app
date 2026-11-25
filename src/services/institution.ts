import { prisma } from "@/lib/prisma"

export interface InstitutionSettingsDTO {
  id: string
  signerTitle: string
  signerName: string
  signerNip: string
  cityName: string
  contactEmail: string
  contactWhatsapp: string
  updatedAt: Date | null
}

function getEnvFallbackSettings(): InstitutionSettingsDTO {
  return {
    id: "default",
    signerTitle: "Kepala Balai Bahasa Provinsi Sulawesi Tengah",
    signerName:
      process.env.NEXT_PUBLIC_KEPALA_BALAI_NAMA?.trim() || "Dr. Asrif, M.Hum.",
    signerNip:
      process.env.NEXT_PUBLIC_KEPALA_BALAI_NIP?.trim() || "197412152002121002",
    cityName: "Palu",
    contactEmail:
      process.env.BBPST_CONTACT_EMAIL?.trim() ||
      "balaibahasasulteng@kemdikdasmen.go.id",
    contactWhatsapp: (
      process.env.BBPST_CONTACT_WHATSAPP?.trim() || "628110000000"
    ).replace(/\D/g, ""),
    updatedAt: null,
  }
}

export async function getInstitutionSettings(): Promise<InstitutionSettingsDTO> {
  try {
    const row = await prisma.institutionSetting.findUnique({
      where: { id: "default" },
      select: {
        id: true,
        signerTitle: true,
        signerName: true,
        signerNip: true,
        cityName: true,
        contactEmail: true,
        contactWhatsapp: true,
        updatedAt: true,
      },
    })

    if (!row) {
      return getEnvFallbackSettings()
    }

    return {
      id: row.id,
      signerTitle: row.signerTitle,
      signerName: row.signerName,
      signerNip: row.signerNip,
      cityName: row.cityName,
      contactEmail: row.contactEmail,
      contactWhatsapp: row.contactWhatsapp.replace(/\D/g, "") || "628110000000",
      updatedAt: row.updatedAt,
    }
  } catch {
    return getEnvFallbackSettings()
  }
}

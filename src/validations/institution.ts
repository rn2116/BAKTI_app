import { z } from "zod"

export const institutionSettingsSchema = z.object({
  signerTitle: z
    .string()
    .trim()
    .min(5, "Jabatan penandatangan minimal 5 karakter")
    .max(180, "Jabatan penandatangan maksimal 180 karakter"),
  signerName: z
    .string()
    .trim()
    .min(3, "Nama lengkap dan gelar penandatangan minimal 3 karakter")
    .max(150, "Nama lengkap maksimal 150 karakter"),
  signerNip: z
    .string()
    .trim()
    .min(8, "NIP penandatangan minimal 8 karakter")
    .max(50, "NIP penandatangan maksimal 50 karakter"),
  cityName: z
    .string()
    .trim()
    .min(2, "Kota penerbitan minimal 2 karakter")
    .max(80, "Kota penerbitan maksimal 80 karakter"),
  contactEmail: z
    .string()
    .trim()
    .email("Alamat surel narahubung tidak valid")
    .max(150, "Alamat surel maksimal 150 karakter"),
  contactWhatsapp: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{9,24}$/, "Nomor WhatsApp narahubung harus berisi 9–24 digit angka")
    .transform((val) => val.replace(/\D/g, "")),
})

export type InstitutionSettingsInput = z.infer<typeof institutionSettingsSchema>

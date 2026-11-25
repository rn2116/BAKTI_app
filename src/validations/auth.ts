import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Alamat surel tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
})

const baseRegisterFields = {
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  email: z.string().email("Alamat surel tidak valid").max(255),
  password: z.string().min(6, "Kata sandi minimal 6 karakter").max(100),
  domicileRegency: z.string().min(2, "Pilih kabupaten/kota domisili"),
  participantCategory: z.string().min(2, "Pilih kategori peserta"),
  institutionName: z.string().max(150).optional().nullable(),
}

export const registerGeneralSchema = z.object({
  accountType: z.literal("SISWA"),
  ...baseRegisterFields,
})

export const registerExpertSchema = z.object({
  accountType: z.literal("AHLI_BAHASA"),
  ...baseRegisterFields,
  expertLanguage: z.string().min(2, "Pilih atau tuliskan bahasa daerah keahlian").max(120),
  expertAffiliation: z.string().min(2, "Isi afiliasi lembaga atau komunitas adat").max(150),
  expertProofType: z.string().min(2, "Pilih jenis bukti kepakaran").max(100),
  expertProofNumber: z.string().min(2, "Isi nomor sertifikat/piagam/SK bukti kepakaran").max(120),
  expertProofFileUrl: z.string().min(5, "Unggah dokumen bukti kepakaran (PDF/JPG/PNG)"),
  expertTrackRecord: z.string().max(2000).optional().nullable(),
})

export const registerSchema = z.discriminatedUnion("accountType", [
  registerGeneralSchema,
  registerExpertSchema,
])

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

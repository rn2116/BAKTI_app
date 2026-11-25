import { z } from "zod"

export const proposeDictionarySchema = z.object({
  regionalLanguage: z
    .string()
    .trim()
    .min(2, "Pilih bahasa daerah terlebih dahulu")
    .max(50, "Kode bahasa daerah maksimal 50 karakter"),
  regionalTerm: z
    .string()
    .trim()
    .min(2, "Kosakata atau ungkapan daerah minimal 2 karakter")
    .max(200, "Kosakata atau ungkapan maksimal 200 karakter"),
  philosophicalMeaning: z
    .string()
    .trim()
    .min(8, "Arti harfiah dan makna filosofis minimal 8 karakter")
    .max(2000, "Arti harfiah dan makna filosofis maksimal 2000 karakter"),
  indonesianCharacter: z
    .string()
    .trim()
    .min(3, "Padanan nilai karakter Indonesia minimal 3 karakter")
    .max(150, "Padanan nilai karakter maksimal 150 karakter"),
  implementation: z
    .string()
    .trim()
    .min(8, "Contoh penerapan sehari-hari minimal 8 karakter")
    .max(2000, "Contoh penerapan maksimal 2000 karakter"),
  referenceSource: z
    .string()
    .trim()
    .min(3, "Sumber rujukan atau penutur asli minimal 3 karakter")
    .max(300, "Sumber rujukan maksimal 300 karakter"),
})

export const curateDictionarySchema = z.object({
  matrixId: z.coerce.number().int().positive("ID entri kamus tidak valid"),
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().trim().max(1000).optional().nullable(),
  regionalLanguage: z.string().trim().min(2).max(50).optional(),
  regionalTerm: z.string().trim().min(2).max(200).optional(),
  indonesianCharacter: z.string().trim().min(3).max(150).optional(),
  characterSource: z.string().trim().min(5).max(3000).optional(),
  implementation: z.string().trim().min(5).max(2000).optional(),
  audioUrl: z.string().trim().optional().nullable(),
})

export type ProposeDictionaryInput = z.infer<typeof proposeDictionarySchema>
export type CurateDictionaryInput = z.infer<typeof curateDictionarySchema>

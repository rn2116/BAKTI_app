import { z } from "zod"

export const updateExpertProfileSchema = z.object({
  expertAffiliation: z
    .string()
    .trim()
    .min(2, "Afiliasi atau lembaga adat minimal 2 karakter")
    .max(150, "Afiliasi atau lembaga adat maksimal 150 karakter"),
  expertTrackRecord: z
    .string()
    .trim()
    .max(2000, "Ringkasan rekam jejak kebahasaan maksimal 2000 karakter")
    .optional()
    .nullable(),
})

export type UpdateExpertProfileInput = z.infer<typeof updateExpertProfileSchema>

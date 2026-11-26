"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { sanitizePlainText } from "@/lib/sanitize"
import { Role } from "@/types"
import {
  updateExpertProfileSchema,
  type UpdateExpertProfileInput,
} from "@/validations/expert"
import type { ActionState } from "@/actions/auth"

export async function updateExpertProfileAction(
  input: UpdateExpertProfileInput
): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.AHLI_BAHASA) {
    return {
      success: false,
      error: "Hanya Ahli Bahasa Daerah yang berwenang memperbarui profil kepakaran.",
    }
  }

  const parsed = updateExpertProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.errors[0]?.message ??
        "Data pembaruan profil kepakaran tidak valid.",
    }
  }

  const cleanAffiliation = sanitizePlainText(parsed.data.expertAffiliation, 150)
  const cleanTrackRecord = parsed.data.expertTrackRecord
    ? sanitizePlainText(parsed.data.expertTrackRecord, 2000)
    : null

  if (cleanAffiliation.length < 2) {
    return {
      success: false,
      error: "Afiliasi atau lembaga adat minimal 2 karakter yang sah.",
    }
  }

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      const current = await tx.masterUser.findUnique({
        where: { id: session.userId },
        select: { id: true, role: true, isActive: true },
      })

      if (!current || current.role !== Role.AHLI_BAHASA || !current.isActive) {
        return null
      }

      return tx.masterUser.update({
        where: { id: current.id },
        data: {
          expertAffiliation: cleanAffiliation,
          expertTrackRecord: cleanTrackRecord || null,
        },
        select: { id: true },
      })
    })

    if (!updatedUser) {
      return {
        success: false,
        error: "Akun Ahli Bahasa Daerah tidak ditemukan atau tidak aktif.",
      }
    }

    revalidatePath("/ahli-bahasa/profil")
    revalidatePath("/ahli-bahasa")
    revalidatePath("/ahli-bahasa/kamus")
    revalidatePath("/siswa/budaya-bahasa")

    return {
      success: true,
      message: "Profil dan rekam jejak kepakaran berhasil diperbarui.",
    }
  } catch (error) {
    console.error("Gagal memperbarui profil kepakaran:", error)
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat menyimpan pembaruan profil.",
    }
  }
}

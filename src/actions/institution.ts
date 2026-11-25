"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { Role } from "@/types"
import { institutionSettingsSchema } from "@/validations/institution"
import type { ActionState } from "@/actions/auth"

export async function updateInstitutionSettingsAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== Role.ADMIN) {
    return {
      success: false,
      error: "Hanya Administrator BBPST yang berwenang mengubah pengaturan instansi.",
    }
  }

  const raw = {
    signerTitle: formData.get("signerTitle"),
    signerName: formData.get("signerName"),
    signerNip: formData.get("signerNip"),
    cityName: formData.get("cityName"),
    contactEmail: formData.get("contactEmail"),
    contactWhatsapp: formData.get("contactWhatsapp"),
  }

  const parsed = institutionSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Data pengaturan instansi tidak valid.",
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.institutionSetting.upsert({
        where: { id: "default" },
        update: {
          signerTitle: parsed.data.signerTitle,
          signerName: parsed.data.signerName,
          signerNip: parsed.data.signerNip,
          cityName: parsed.data.cityName,
          contactEmail: parsed.data.contactEmail,
          contactWhatsapp: parsed.data.contactWhatsapp,
          updatedBy: session.userId,
        },
        create: {
          id: "default",
          signerTitle: parsed.data.signerTitle,
          signerName: parsed.data.signerName,
          signerNip: parsed.data.signerNip,
          cityName: parsed.data.cityName,
          contactEmail: parsed.data.contactEmail,
          contactWhatsapp: parsed.data.contactWhatsapp,
          updatedBy: session.userId,
        },
      })
    })

    revalidatePath("/admin/pengaturan-instansi")
    revalidatePath("/siswa/sertifikat")
    revalidatePath("/daftar")

    return {
      success: true,
      message: "Pengaturan penandatangan sertifikat dan kontak instansi berhasil diperbarui.",
    }
  } catch (error) {
    console.error("Gagal memperbarui pengaturan instansi:", error)
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan pengaturan instansi ke basis data.",
    }
  }
}

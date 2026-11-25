"use server"
import { randomUUID } from "crypto"
import { compare } from "bcryptjs"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { signToken, setAuthCookie, clearAuthCookie, hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { sanitizePlainText } from "@/lib/sanitize"
import { sendBbpstNotificationEmail } from "@/lib/mailer"
import { getInstitutionSettings } from "@/services/institution"
import { loginSchema, registerSchema } from "@/validations/auth"
import { ExpertVerificationStatus, Role } from "@/types"

export type ActionState = {
  success: boolean
  error?: string
  message?: string
  pendingExpertApproval?: boolean
  whatsappUrl?: string
  contactEmail?: string
  applicantName?: string
  expertLanguage?: string
  expertProofNumber?: string
}

const ROLE_PATH: Record<string, string> = {
  SISWA: "/siswa",
  GURU: "/guru",
  ADMIN: "/admin",
  AHLI_BAHASA: "/ahli-bahasa",
}

export async function login(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  "use server"
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: "Isi semua kolom dengan benar." }
  }

  const { email, password } = parsed.data
  const hdrs = await headers()
  const ip = getClientIp(hdrs)
  const ipLimit = checkRateLimit(`login-ip:${ip}`, 25, 60_000)
  const emailLimit = checkRateLimit(`login:${ip}:${email.toLowerCase()}`, 10, 60_000)
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const waitSec = Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
    return {
      success: false,
      error: `Terlalu banyak percobaan masuk. Silakan coba lagi dalam ${waitSec} detik.`,
    }
  }

  let role = ""

  try {
    const user = await prisma.masterUser.findUnique({ where: { email } })
    if (!user || !(await compare(password, user.passwordHash))) {
      return { success: false, error: "Surel atau kata sandi salah." }
    }
    if (!user.isActive) {
      if (user.role === Role.AHLI_BAHASA) {
        if (user.expertStatus === ExpertVerificationStatus.PENDING_EXPERT) {
          return {
            success: false,
            error:
              "Pendaftaran Ahli Bahasa Daerah Anda sedang menunggu persetujuan Admin BBPST.",
          }
        }
        if (user.expertStatus === ExpertVerificationStatus.REJECTED) {
          return {
            success: false,
            error: `Pengajuan Ahli Bahasa Daerah Anda belum disetujui Admin BBPST${
              user.expertReviewNotes ? `: ${user.expertReviewNotes}` : "."
            }`,
          }
        }
      }
      return { success: false, error: "Akun Anda belum diaktifkan oleh administrator." }
    }

    role = user.role
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    await setAuthCookie(token)
  } catch {
    return { success: false, error: "Terjadi kesalahan pada server." }
  }

  redirect(ROLE_PATH[role] ?? "/siswa")
}

export async function register(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  "use server"
  const accountType = (formData.get("accountType") as string) === "AHLI_BAHASA" ? "AHLI_BAHASA" : "SISWA"

  const raw =
    accountType === "AHLI_BAHASA"
      ? {
          accountType: "AHLI_BAHASA" as const,
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
          domicileRegency: formData.get("domicileRegency"),
          participantCategory: formData.get("participantCategory") || "Pegiat Bahasa & Kearifan Lokal",
          institutionName: formData.get("institutionName") || null,
          expertLanguage: formData.get("expertLanguage"),
          expertAffiliation: formData.get("expertAffiliation"),
          expertProofType: formData.get("expertProofType"),
          expertProofNumber: formData.get("expertProofNumber"),
          expertProofFileUrl: formData.get("expertProofFileUrl"),
          expertTrackRecord: formData.get("expertTrackRecord") || null,
        }
      : {
          accountType: "SISWA" as const,
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
          domicileRegency: formData.get("domicileRegency"),
          participantCategory: formData.get("participantCategory"),
          institutionName: formData.get("institutionName") || null,
        }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Isi semua kolom wajib dengan benar.",
    }
  }

  const hdrs = await headers()
  const ip = getClientIp(hdrs)
  const regLimit = checkRateLimit(`register:${ip}`, 10, 5 * 60_000)
  if (!regLimit.allowed) {
    return {
      success: false,
      error: `Terlalu banyak percobaan pendaftaran. Silakan tunggu ${regLimit.retryAfterSeconds} detik.`,
    }
  }

  const data = parsed.data
  const cleanName = sanitizePlainText(data.fullName, 100)
  const cleanEmail = data.email.trim().toLowerCase()
  const cleanDomicile = sanitizePlainText(data.domicileRegency, 100)
  const cleanCategory = sanitizePlainText(data.participantCategory, 60)
  const cleanInstitution = data.institutionName ? sanitizePlainText(data.institutionName, 150) : null

  try {
    const exists = await prisma.masterUser.findUnique({ where: { email: cleanEmail } })
    if (exists) {
      return { success: false, error: "Alamat surel sudah terdaftar." }
    }

    const passwordHash = await hashPassword(data.password)

    if (data.accountType === "AHLI_BAHASA") {
      const cleanLang = sanitizePlainText(data.expertLanguage, 120)
      const cleanAffiliation = sanitizePlainText(data.expertAffiliation, 150)
      const cleanProofType = sanitizePlainText(data.expertProofType, 100)
      const cleanProofNumber = sanitizePlainText(data.expertProofNumber, 120)
      const cleanTrackRecord = data.expertTrackRecord
        ? sanitizePlainText(data.expertTrackRecord, 2000)
        : null
      const proofUrl = data.expertProofFileUrl.trim()

      if (!proofUrl.startsWith("/api/dokumen-ahli/")) {
        return {
          success: false,
          error: "Dokumen bukti kepakaran tidak valid. Silakan unggah ulang berkas PDF/JPG/PNG.",
        }
      }

      const applicantId = randomUUID()
      await prisma.$transaction(async (tx) => {
        await tx.masterUser.create({
          data: {
            id: applicantId,
            email: cleanEmail,
            passwordHash,
            fullName: cleanName,
            role: Role.AHLI_BAHASA,
            domicileRegency: cleanDomicile,
            participantCategory: cleanCategory,
            institutionName: cleanInstitution || cleanAffiliation,
            expertStatus: ExpertVerificationStatus.PENDING_EXPERT,
            expertLanguage: cleanLang,
            expertAffiliation: cleanAffiliation,
            expertProofType: cleanProofType,
            expertProofNumber: cleanProofNumber,
            expertProofFileUrl: proofUrl,
            expertTrackRecord: cleanTrackRecord,
            isActive: false,
            emailVerified: false,
          },
        })

        // Kirim notifikasi prioritas dalam aplikasi kepada seluruh Admin BBPST
        const admins = await tx.masterUser.findMany({
          where: { role: Role.ADMIN, isActive: true },
          select: { id: true },
        })
        if (admins.length > 0) {
          await tx.notification.createMany({
            data: admins.map((adm) => ({
              id: randomUUID(),
              userId: adm.id,
              title: "Pengajuan Baru Ahli Bahasa Daerah",
              message: `${cleanName} (${cleanAffiliation}) mendaftar sebagai Ahli ${cleanLang} dengan bukti ${cleanProofType} (${cleanProofNumber}).`,
              type: "system",
              link: "/admin/verifikasi-ahli",
              isPriority: true,
              isRead: false,
            })),
          })
        }
      })

      const instSettings = await getInstitutionSettings()
      const contactEmail = instSettings.contactEmail
      const contactWa = instSettings.contactWhatsapp.replace(/\D/g, "") || "628110000000"
      const appUrl =
        process.env.APP_URL?.trim() ||
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        "http://localhost:3000"

      await sendBbpstNotificationEmail({
        to: contactEmail,
        subject: `[BAKTI BBPST] Pendaftaran Baru Ahli Bahasa Daerah: ${cleanName}`,
        textBody: [
          "Yth. Tim Administrator Balai Bahasa Provinsi Sulawesi Tengah,",
          "",
          "Terdapat pengajuan akun Ahli Bahasa Daerah baru pada platform LMS BAHASA & KARAKTER:",
          `- Nama Lengkap: ${cleanName}`,
          `- Surel: ${cleanEmail}`,
          `- Domisili: ${cleanDomicile}`,
          `- Bahasa Daerah Keahlian: ${cleanLang}`,
          `- Afiliasi / Komunitas: ${cleanAffiliation}`,
          `- Jenis & Nomor Bukti: ${cleanProofType} (${cleanProofNumber})`,
          cleanTrackRecord ? `- Rekam Jejak: ${cleanTrackRecord}` : "",
          "",
          `Silakan tinjau berkas bukti kepakaran dan setujui pendaftaran melalui panel admin:`,
          `${appUrl}/admin/verifikasi-ahli`,
        ]
          .filter(Boolean)
          .join("\n"),
      })

      const waMessage = encodeURIComponent(
        `Halo Admin Balai Bahasa Provinsi Sulawesi Tengah (LMS BAHASA & KARAKTER).\n\nSaya telah mendaftar sebagai Ahli Bahasa Daerah:\n• Nama: ${cleanName}\n• Bahasa Keahlian: ${cleanLang}\n• Afiliasi: ${cleanAffiliation}\n• Jenis & Nomor Bukti: ${cleanProofType} (${cleanProofNumber})\n\nMohon konfirmasi verifikasi kepakaran akun saya. Terima kasih.`
      )

      return {
        success: true,
        pendingExpertApproval: true,
        whatsappUrl: `https://wa.me/${contactWa}?text=${waMessage}`,
        contactEmail,
        applicantName: cleanName,
        expertLanguage: cleanLang,
        expertProofNumber: cleanProofNumber,
      }
    }

    // Pendaftaran Peserta Umum / Masyarakat Luas
    const newUser = await prisma.masterUser.create({
      data: {
        id: randomUUID(),
        email: cleanEmail,
        passwordHash,
        fullName: cleanName,
        role: Role.SISWA,
        domicileRegency: cleanDomicile,
        participantCategory: cleanCategory,
        institutionName: cleanInstitution,
        expertStatus: ExpertVerificationStatus.NONE,
        isActive: true,
        emailVerified: false,
      },
      select: { id: true, email: true, role: true },
    })

    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })
    await setAuthCookie(token)
  } catch {
    return { success: false, error: "Gagal mendaftarkan akun. Silakan periksa kembali data Anda." }
  }

  redirect("/siswa")
}

export async function logout(): Promise<never> {
  "use server"
  await clearAuthCookie()
  redirect("/masuk")
}

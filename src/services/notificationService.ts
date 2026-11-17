import { prisma } from "@/lib/prisma"
import { Role } from "@/types"

export interface AppNotification {
  id: string
  title: string
  message: string
  createdAt: string // ISO string untuk serialization
  type: "badge" | "quiz" | "material" | "system"
  link?: string
}

/**
 * Mengambil daftar aktivitas notifikasi terbaru yang relevan
 * berdasarkan role pengguna yang sedang login.
 */
export async function getUserNotifications(
  userId: string,
  role: Role,
  schoolId?: string | null
): Promise<AppNotification[]> {
  try {
    const notifications: AppNotification[] = []

    if (role === "SISWA") {
      // 1. Lencana (Badge) yang baru diraih
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
        take: 3,
      })
      for (const ub of userBadges) {
        notifications.push({
          id: `badge-${ub.id}`,
          title: "Lencana Penghargaan Baru!",
          message: `Selamat! Kamu meraih lencana "${ub.badge.name}".`,
          createdAt: ub.earnedAt.toISOString(),
          type: "badge",
          link: "/siswa/profil",
        })
      }

      // 2. Kuis yang baru diselesaikan
      const attempts = await prisma.quizAttempt.findMany({
        where: { userId },
        include: { quiz: true },
        orderBy: { startedAt: "desc" },
        take: 3,
      })
      for (const att of attempts) {
        notifications.push({
          id: `attempt-${att.id}`,
          title: att.passed ? "Hasil Kuis: Lulus KKM" : "Hasil Kuis: Perlu Latihan",
          message: `Kuis "${att.quiz.title}" selesai dengan skor ${att.score}/${att.maxScore}.`,
          createdAt: att.startedAt.toISOString(),
          type: "quiz",
          link: "/siswa/kuis",
        })
      }

      // 3. Modul pembelajaran terbaru
      const newMaterials = await prisma.learningMaterial.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      })
      for (const mat of newMaterials) {
        notifications.push({
          id: `mat-${mat.id}`,
          title: "Materi Baru Tersedia",
          message: `Modul "${mat.title}" siap dipelajari. Raih +100 XP!`,
          createdAt: mat.createdAt.toISOString(),
          type: "material",
          link: `/siswa/materi/${mat.slug}`,
        })
      }
    } else if (role === "GURU") {
      // 1. Siswa yang mengumpulkan kuis
      const studentAttempts = await prisma.quizAttempt.findMany({
        where: {
          ...(schoolId ? { user: { schoolId } } : {}),
        },
        include: {
          user: { select: { fullName: true, class: { select: { name: true } } } },
          quiz: { select: { title: true } },
        },
        orderBy: { startedAt: "desc" },
        take: 5,
      })
      for (const att of studentAttempts) {
        notifications.push({
          id: `teacher-attempt-${att.id}`,
          title: "Pengumpulan Kuis Siswa",
          message: `${att.user.fullName} (${att.user.class?.name ?? "Siswa"}) menyelesaikan "${att.quiz.title}" (Skor: ${att.score}/${att.maxScore}).`,
          createdAt: att.startedAt.toISOString(),
          type: "quiz",
          link: "/guru/rekap",
        })
      }

      // 2. Pengingat Kurikulum
      notifications.push({
        id: "guru-system-guide",
        title: "Pedoman Literasi 3 Pilar",
        message: "Periksa kelengkapan butir soal dan kunci jawaban kuis sebelum dibagikan ke siswa.",
        createdAt: new Date().toISOString(),
        type: "system",
        link: "/guru/kuis",
      })
    } else {
      // ADMIN
      // Modul yang menunggu moderasi
      const pendingMaterials = await prisma.learningMaterial.findMany({
        where: { isPublished: false },
        include: { creator: { select: { fullName: true } } },
        take: 3,
      })
      for (const m of pendingMaterials) {
        notifications.push({
          id: `admin-mat-${m.id}`,
          title: "Modul Menunggu Moderasi",
          message: `Materi "${m.title}" oleh ${m.creator.fullName} menunggu verifikasi tayang.`,
          createdAt: m.createdAt.toISOString(),
          type: "material",
          link: "/admin/konten",
        })
      }

      notifications.push({
        id: "admin-sys-status",
        title: "Ekosistem BAKTI Normal",
        message: "Monitoring seluruh satuan pendidikan se-Sulawesi Tengah beroperasi lancar.",
        createdAt: new Date().toISOString(),
        type: "system",
        link: "/admin",
      })
    }

    // Urutkan dari yang paling baru (terbaru di atas)
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
  } catch (err) {
    console.error("Gagal mengambil notifikasi pengguna:", err)
    return []
  }
}

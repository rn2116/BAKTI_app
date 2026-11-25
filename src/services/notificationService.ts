import { prisma } from "@/lib/prisma"
import { Role } from "@/types"

export interface AppNotification {
  id: string
  title: string
  message: string
  createdAt: string
  type: "badge" | "quiz" | "material" | "system"
  link?: string
}

/**
 * Mengambil daftar aktivitas notifikasi terbaru yang relevan
 * berdasarkan peran pengguna yang sedang masuk.
 */
export async function getUserNotifications(
  userId: string,
  role: Role,
  schoolId?: string | null
): Promise<AppNotification[]> {
  try {
    const notifications: AppNotification[] = []

    // 0. Notifikasi prioritas langsung dari tabel notifications (misal pendaftaran Ahli Bahasa Daerah)
    const dbNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ isPriority: "desc" }, { createdAt: "desc" }],
      take: 5,
    })
    for (const n of dbNotifications) {
      notifications.push({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt.toISOString(),
        type: (n.type as AppNotification["type"]) || "system",
        link: n.link ?? undefined,
      })
    }

    if (role === "SISWA") {
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
          message: `Selamat! Anda meraih lencana "${ub.badge.name}".`,
          createdAt: ub.earnedAt.toISOString(),
          type: "badge",
          link: "/siswa/sertifikat",
        })
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { userId, completedAt: { not: null } },
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
      const studentAttempts = await prisma.quizAttempt.findMany({
        where: {
          completedAt: { not: null },
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
          title: "Pengumpulan Kuis Peserta",
          message: `${att.user.fullName} (${att.user.class?.name ?? "Peserta"}) menyelesaikan "${att.quiz.title}" (Skor: ${att.score}/${att.maxScore}).`,
          createdAt: att.startedAt.toISOString(),
          type: "quiz",
          link: "/guru/rekap",
        })
      }

      notifications.push({
        id: "guru-system-guide",
        title: "Pedoman Literasi 3 Pilar",
        message: "Periksa kelengkapan butir soal dan kunci jawaban kuis sebelum diterbitkan kepada peserta.",
        createdAt: new Date().toISOString(),
        type: "system",
        link: "/guru/kuis",
      })
    } else if (role === "AHLI_BAHASA") {
      const totalEntries = await prisma.characterMatrix.count()
      notifications.push({
        id: "expert-kamus-status",
        title: "Ruang Kerja Ahli Bahasa Daerah",
        message: `Tersedia ${totalEntries} entri pada Kamus Besar Kearifan Lokal Sulawesi Tengah yang siap diperkaya beserta rekaman pelafalan asli.`,
        createdAt: new Date().toISOString(),
        type: "material",
        link: "/ahli-bahasa/kamus",
      })
    } else {
      // ADMIN
      const pendingExperts = await prisma.masterUser.count({
        where: { role: "AHLI_BAHASA", expertStatus: "PENDING_EXPERT" },
      })
      if (pendingExperts > 0) {
        notifications.push({
          id: "admin-pending-experts",
          title: "Verifikasi Ahli Bahasa Daerah",
          message: `Terdapat ${pendingExperts} pengajuan akun Ahli Bahasa Daerah yang menunggu persetujuan Admin BBPST.`,
          createdAt: new Date().toISOString(),
          type: "system",
          link: "/admin/verifikasi-ahli",
        })
      }

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
        message: "Pemantauan partisipasi masyarakat dan satuan pendidikan se-Sulawesi Tengah berjalan lancar.",
        createdAt: new Date().toISOString(),
        type: "system",
        link: "/admin",
      })
    }

    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
  } catch (err) {
    console.error("Gagal mengambil notifikasi pengguna:", err)
    return []
  }
}

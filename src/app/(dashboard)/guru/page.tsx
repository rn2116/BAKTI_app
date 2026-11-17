import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building2, BookOpen, ClipboardList, FileText, ArrowRight } from "lucide-react"

export default async function GuruDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

  let totalClasses = 0
  let totalMaterials = 0
  let totalQuizzes = 0
  let totalStudents = 0
  let recentAttempts: any[] = []

  try {
    const [classesCount, materialsCount, quizzesCount, studentsCount, attempts] = await Promise.all([
      prisma.masterClass.count({
        where: { schoolId: user.schoolId ?? "", isActive: true },
      }),
      prisma.learningMaterial.count({
        where: { createdBy: user.id },
      }),
      prisma.quiz.count({
        where: { createdBy: user.id },
      }),
      prisma.masterUser.count({
        where: { schoolId: user.schoolId ?? "", role: "SISWA", isActive: true },
      }),
      prisma.quizAttempt.findMany({
        where: { user: { schoolId: user.schoolId ?? "" } },
        include: {
          user: { select: { fullName: true } },
          quiz: { select: { title: true } },
        },
        orderBy: { startedAt: "desc" },
        take: 5,
      }),
    ])
    totalClasses = classesCount
    totalMaterials = materialsCount
    totalQuizzes = quizzesCount
    totalStudents = studentsCount
    recentAttempts = attempts
  } catch (err) {
    console.error("Gagal memuat dasbor guru:", err)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dasbor Guru"
        description={`Selamat datang, ${user.fullName}. Kelola kelas, bank materi, kuis, dan pantau rekapitulasi nilai siswa.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Kelas Aktif" value={totalClasses} />
        <StatCard title="Siswa Terdaftar" value={totalStudents} />
        <StatCard title="Materi Dibuat" value={totalMaterials} />
        <StatCard title="Kuis Evaluasi" value={totalQuizzes} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aktivitas Evaluasi Kuis Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttempts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Belum ada pengerjaan kuis dari siswa saat ini.
              </p>
            ) : (
              <ul className="divide-y divide-input">
                {recentAttempts.map((att) => (
                  <li key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-foreground">{att.user.fullName}</div>
                      <div className="text-muted-foreground">{att.quiz.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-foreground">
                        {att.score} / {att.maxScore}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          att.passed ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {att.passed ? "Lulus" : "Remidi"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu Pintas Pengelolaan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/guru/kelas"
              className="p-3 rounded-lg border border-input hover:border-primary/50 hover:bg-accent/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-sky-100 text-sky-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Manajemen Kelas</div>
                  <div className="text-[10px] text-muted-foreground">Atur rombel & siswa</div>
                </div>
              </div>
              <div className="flex items-center text-[11px] text-primary font-medium group-hover:translate-x-1 transition-transform">
                Buka Kelas <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Link>

            <Link
              href="/guru/materi"
              className="p-3 rounded-lg border border-input hover:border-primary/50 hover:bg-accent/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Bank Materi</div>
                  <div className="text-[10px] text-muted-foreground">Tulis modul literasi</div>
                </div>
              </div>
              <div className="flex items-center text-[11px] text-primary font-medium group-hover:translate-x-1 transition-transform">
                Kelola Materi <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Link>

            <Link
              href="/guru/kuis"
              className="p-3 rounded-lg border border-input hover:border-primary/50 hover:bg-accent/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-amber-100 text-amber-700">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Bank Soal & Kuis</div>
                  <div className="text-[10px] text-muted-foreground">Buat kuis berwaktu</div>
                </div>
              </div>
              <div className="flex items-center text-[11px] text-primary font-medium group-hover:translate-x-1 transition-transform">
                Kelola Kuis <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Link>

            <Link
              href="/guru/rekap"
              className="p-3 rounded-lg border border-input hover:border-primary/50 hover:bg-accent/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-purple-100 text-purple-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Rekap Nilai Siswa</div>
                  <div className="text-[10px] text-muted-foreground">Unduh file Excel (.xlsx)</div>
                </div>
              </div>
              <div className="flex items-center text-[11px] text-primary font-medium group-hover:translate-x-1 transition-transform">
                Lihat Rekap <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

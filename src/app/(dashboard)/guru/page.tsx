import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { ClassPerformanceChart, PillarStat } from "@/components/guru/ClassPerformanceChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Building2,
  BookOpen,
  ClipboardList,
  FileText,
  ArrowRight,
  Plus,
  Users,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react"

export default async function GuruDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

  let totalClasses = 0
  let totalMaterials = 0
  let totalQuizzes = 0
  let totalStudents = 0
  let avgQuizScore = 0
  let schoolName = "Sekolah Binaan"
  let recentAttempts: any[] = []
  let pillarStats: PillarStat[] = [
    { category: "BAHASA_INDONESIA", label: "Bahasa Indonesia", color: "#0284C7", avgScore: 0, totalAttempts: 0 },
    { category: "KARAKTER", label: "Pendidikan Karakter", color: "#059669", avgScore: 0, totalAttempts: 0 },
    { category: "BUDAYA_SULTENG", label: "Kearifan Lokal Sulawesi Tengah", color: "#0D9488", avgScore: 0, totalAttempts: 0 },
  ]

  try {
    if (user.schoolId) {
      const school = await prisma.masterSchool.findUnique({
        where: { id: user.schoolId },
        select: { name: true },
      })
      if (school) schoolName = school.name
    }

    const [classesCount, materialsCount, quizzesCount, studentsCount, attempts, schoolQuizAttempts] =
      await Promise.all([
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
        prisma.quizAttempt.findMany({
          where: { user: { schoolId: user.schoolId ?? "" } },
          include: {
            quiz: { select: { category: true } },
          },
        }),
      ])

    totalClasses = classesCount
    totalMaterials = materialsCount
    totalQuizzes = quizzesCount
    totalStudents = studentsCount
    recentAttempts = attempts

    // Rata-rata skor kuis siswa binaan
    if (schoolQuizAttempts.length > 0) {
      const sumPercentage = schoolQuizAttempts.reduce((acc, curr) => {
        const pct = curr.maxScore > 0 ? (curr.score / curr.maxScore) * 100 : 0
        return acc + pct
      }, 0)
      avgQuizScore = Math.round(sumPercentage / schoolQuizAttempts.length)

      // Hitung per pilar
      pillarStats = pillarStats.map((p) => {
        const pilarAttempts = schoolQuizAttempts.filter((a) => a.quiz.category === p.category)
        if (pilarAttempts.length === 0) return p
        const pilarPctSum = pilarAttempts.reduce((acc, curr) => {
          return acc + (curr.maxScore > 0 ? (curr.score / curr.maxScore) * 100 : 0)
        }, 0)
        return {
          ...p,
          avgScore: Math.round(pilarPctSum / pilarAttempts.length),
          totalAttempts: pilarAttempts.length,
        }
      })
    }
  } catch (err) {
    console.error("Gagal memuat dasbor guru:", err)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. TEACHER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E135E] via-[#3C22BB] to-[#0284C7] p-6 sm:p-8 text-white shadow-lg border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 text-indigo-100">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Pendidik Berkarakter • {schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Selamat Datang, {user.fullName}! 👨‍🏫
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Kelola kelas pembelajaran, ciptakan modul literasi inovatif, dan pantau perkembangan karakter serta budi pekerti peserta didik Anda.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <Link href="/guru/materi" className="w-full sm:w-auto">
              <Button className="w-full rounded-2xl bg-white text-[#3C22BB] hover:bg-zinc-100 font-bold text-xs shadow-md gap-1.5 h-11 px-4">
                <Plus className="w-4 h-4" /> Buat Materi
              </Button>
            </Link>
            <Link href="/guru/kuis" className="w-full sm:w-auto">
              <Button className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md gap-1.5 h-11 px-4 border border-amber-400">
                <Plus className="w-4 h-4" /> Buat Kuis
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 KARTU STATISTIK DENGAN IKON BERWARNA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Siswa Binaan"
          value={totalStudents}
          icon={<Users className="w-5 h-5 text-[#3C22BB]" />}
        />
        <StatCard
          title="Kelas Aktif"
          value={totalClasses}
          icon={<Building2 className="w-5 h-5 text-[#0284C7]" />}
        />
        <StatCard
          title="Rata-rata Skor Kuis"
          value={`${avgQuizScore}%`}
          icon={<Award className="w-5 h-5 text-[#059669]" />}
        />
        <StatCard
          title="Materi & Kuis Terbit"
          value={totalMaterials + totalQuizzes}
          icon={<Sparkles className="w-5 h-5 text-[#D97706]" />}
        />
      </div>

      {/* 3. GRAFIK PERFORMA KELAS & MENU PINTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <ClassPerformanceChart pillars={pillarStats} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs space-y-3">
            <CardHeader className="p-0 pb-1">
              <CardTitle className="text-sm font-bold text-zinc-900">
                Menu Akses Cepat Guru
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/guru/kelas"
                className="p-3 rounded-xl border border-zinc-200 hover:border-[#3C22BB] hover:bg-indigo-50/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 text-[#3C22BB]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Kelas & Rombel</div>
                    <div className="text-[10px] text-zinc-500">Kode kelas & siswa</div>
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-bold text-[#3C22BB] pt-2 group-hover:translate-x-1 transition-transform">
                  Buka Kelas <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>

              <Link
                href="/guru/materi"
                className="p-3 rounded-xl border border-zinc-200 hover:border-[#0284C7] hover:bg-sky-50/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-50 text-[#0284C7]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Bank Materi</div>
                    <div className="text-[10px] text-zinc-500">Tulis modul literasi</div>
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-bold text-[#0284C7] pt-2 group-hover:translate-x-1 transition-transform">
                  Kelola Materi <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>

              <Link
                href="/guru/kuis"
                className="p-3 rounded-xl border border-zinc-200 hover:border-amber-600 hover:bg-amber-50/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Bank Soal Kuis</div>
                    <div className="text-[10px] text-zinc-500">Pilihan ganda & kunci</div>
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-bold text-amber-700 pt-2 group-hover:translate-x-1 transition-transform">
                  Kelola Kuis <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>

              <Link
                href="/guru/rekap"
                className="p-3 rounded-xl border border-zinc-200 hover:border-[#059669] hover:bg-emerald-50/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Rekap Nilai Siswa</div>
                    <div className="text-[10px] text-zinc-500">Ekspor spreadsheet</div>
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-bold text-[#059669] pt-2 group-hover:translate-x-1 transition-transform">
                  Unduh Excel <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. AKTIVITAS PENGERJAAN KUIS TERAKHIR OLEH SISWA */}
      <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs space-y-3">
        <CardHeader className="p-0 pb-1">
          <CardTitle className="text-sm font-bold text-zinc-900">
            Aktivitas Pengerjaan Kuis Siswa Terkini
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentAttempts.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">
              Belum ada pengerjaan kuis dari siswa saat ini.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentAttempts.map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-zinc-900">{att.user.fullName}</div>
                    <div className="text-zinc-500 text-[11px]">{att.quiz.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-zinc-900">
                      {att.score} / {att.maxScore}
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        att.passed ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {att.passed ? "Lulus ✓" : "Remidi ✗"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { getCurrentUser } from "@/lib/auth"
import { getStudentDashboardData } from "@/services/studentDashboardService"
import { StudentHeroBanner } from "@/components/gamification/StudentHeroBanner"
import { GamificationStatsRow } from "@/components/gamification/GamificationStatsRow"
import { QuickMenuGrid } from "@/components/gamification/QuickMenuGrid"
import { ProgressRingCard } from "@/components/gamification/ProgressRingCard"
import { WeeklyPointsChart } from "@/components/gamification/WeeklyPointsChart"
import { StudentSidebarPanel } from "@/components/gamification/StudentSidebarPanel"
import { SultengIllustration, getThemeByIndexAndCategory } from "@/components/shared/SultengIllustration"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Clock, ChevronRight, Activity } from "lucide-react"

export default async function SiswaDashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const data = await getStudentDashboardData(user.id)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. HERO BANNER SAMBUTAN SISWA */}
      <StudentHeroBanner fullName={data.user.fullName} />

      {/* 2. EMPAT KARTU STATUS GAMIFIKASI */}
      <GamificationStatsRow
        level={data.user.level}
        levelTitle={data.user.levelTitle}
        xpInLevel={data.user.xpCurrentLevel}
        xpNeeded={data.user.xpNextLevel}
        totalPoints={data.user.xp}
        streakDays={data.streakDays}
        badgesCount={data.userBadgesCount}
      />

      {/* 3. TANTANGAN HARI INI & 6 MENU UTAMA BERWARNA */}
      <QuickMenuGrid />

      {/* 4. ANALITIK PROGRESS & GRAFIK MINGGUAN DENGAN PANEL SAMPING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Progress Ring & Grafik Batang 7 Hari (8 Kolom di Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProgressRingCard
              overallPercent={data.overallProgressPercent}
              completedCount={data.completedMaterialsCount}
              totalCount={data.totalMaterialsCount}
              pillars={data.pillarProgress}
            />
            <WeeklyPointsChart data={data.weeklyPoints} />
          </div>

          {/* MATERI TERPOPULER DENGAN ILUSTRASI SULTENG */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3C22BB]" />
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Materi Rekomendasi Hari Ini
                </h2>
              </div>
              <Link
                href="/siswa/materi"
                className="text-xs font-bold text-[#3C22BB] hover:underline flex items-center gap-0.5"
              >
                Lihat semua katalog <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {data.popularMaterials.map((mat, idx) => (
                <Card
                  key={mat.id}
                  className="rounded-2xl border-zinc-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Ilustrasi Vektor Khas Sulawesi Tengah */}
                    <div className="relative">
                      <SultengIllustration
                        theme={getThemeByIndexAndCategory(mat.category, idx)}
                        className="h-28"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <CategoryBadge category={mat.category} variant="overlay" />
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{mat.readingTime} Menit Baca</span>
                        </span>
                        {mat.isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Selesai ✓
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-zinc-900 line-clamp-2 leading-snug">
                        {mat.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3.5 pt-0">
                    <Link
                      href={`/siswa/materi/${mat.slug}`}
                      className="block w-full text-center py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-[#3C22BB] hover:text-white transition-colors"
                    >
                      {mat.isCompleted ? "Baca Ulang" : "Mulai Belajar"}
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AKTIVITAS TERBARU (Mobile Cards / Desktop Table) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Activity className="w-4 h-4 text-[#065F46]" />
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Aktivitas Terkini
              </h2>
            </div>

            {/* Mobile Cards (< 768px) */}
            <div className="space-y-2.5 md:hidden">
              {data.recentActivities.map((act) => (
                <Card key={act.id} className="p-3.5 border-zinc-200/90 bg-white shadow-xs space-y-1.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {act.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {act.scoreOrXp}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-zinc-900 truncate">
                    {act.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Status: {act.status}</span>
                    <span>{new Date(act.date).toLocaleDateString("id-ID")}</span>
                  </div>
                </Card>
              ))}

              {data.recentActivities.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400 border border-dashed rounded-xl bg-white">
                  Belum ada aktivitas belajar yang tercatat.
                </div>
              )}
            </div>

            {/* Desktop Table (>= 768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold">
                    <th className="py-2.5 px-4">Tipe</th>
                    <th className="py-2.5 px-4">Judul Aktivitas</th>
                    <th className="py-2.5 px-4 text-center">Capaian / Poin</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {data.recentActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {act.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-zinc-900 max-w-[240px] truncate">
                        {act.title}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-700">
                        {act.scoreOrXp}
                      </td>
                      <td className="py-2.5 px-4 text-center text-zinc-600 font-medium">
                        {act.status}
                      </td>
                      <td className="py-2.5 px-4 text-right text-zinc-400 text-[11px]">
                        {new Date(act.date).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}

                  {data.recentActivities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        Belum ada aktivitas belajar yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panel Info, Badge Showcase, dan Kutipan Harian (4 Kolom di Desktop) */}
        <div className="lg:col-span-4 w-full">
          <StudentSidebarPanel
            lastMaterial={data.lastMaterial}
            lastQuizAttempt={data.lastQuizAttempt}
            badges={data.badgesSummary}
          />
        </div>
      </div>
    </div>
  )
}

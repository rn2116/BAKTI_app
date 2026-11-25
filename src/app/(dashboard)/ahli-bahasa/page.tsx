import Link from "next/link"
import { requireDashboardUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { getPendingDictionaryProposalsForCurator } from "@/services/dictionary"
import { PageHeader } from "@/components/shared/PageHeader"
import { RoleFlowBanner } from "@/components/shared/RoleFlowBanner"
import { DictionaryCurationPanel } from "@/components/ahli-bahasa/DictionaryCurationPanel"
import { Card } from "@/components/ui/card"
import {
  Languages,
  Compass,
  Volume2,
  ArrowRight,
  Award,
  Sparkles,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AhliBahasaDashboardPage() {
  const user = await requireDashboardUser("AHLI_BAHASA")

  const [activeLanguages, totalEntries, entriesWithAudio, proposalSummary] = await Promise.all([
    getActiveRegionalLanguages(),
    prisma.characterMatrix.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.characterMatrix.count({
      where: { verificationStatus: "APPROVED", audioUrl: { not: null } },
    }),
    getPendingDictionaryProposalsForCurator(user.expertLanguage),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat Datang, ${user.fullName}`}
        description="Ruang kerja resmi Ahli Bahasa Daerah untuk memperkaya Kamus Besar Kearifan Lokal Sulawesi Tengah beserta rekaman pelafalan asli."
      />

      {/* Panduan Alur Ahli Bahasa Daerah */}
      <RoleFlowBanner role="AHLI_BAHASA" />

      {/* Lencana Kepakaran */}
      <Card className="rounded-3xl bg-gradient-to-r from-[#1E135E] via-[#3C22BB] to-[#065F46] text-white p-6 shadow-md border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Ahli Bahasa Daerah Terverifikasi BBPST</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Keahlian Utama: {user.expertLanguage || "Bahasa Daerah Sulawesi Tengah"}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl leading-relaxed">
              Setiap kosakata, makna filosofis, nilai karakter padanan, dan rekaman audio pelafalan asli yang Anda sunting akan langsung memperkaya modul belajar masyarakat se-Sulawesi Tengah.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/ahli-bahasa/kamus"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs px-4 py-2.5 transition-colors"
            >
              <span>Kelola Kamus Besar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Card>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Bahasa Daerah Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3C22BB] flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1E135E]">
            {activeLanguages.length} Bahasa
          </div>
          <Link
            href="/ahli-bahasa/bahasa"
            className="text-xs font-bold text-[#3C22BB] hover:underline inline-flex items-center gap-1"
          >
            Tambah atau kelola bahasa <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Entri Kamus Kearifan Lokal</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#065F46] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#065F46]">
            {totalEntries} Kosakata
          </div>
          <Link
            href="/ahli-bahasa/kamus"
            className="text-xs font-bold text-[#065F46] hover:underline inline-flex items-center gap-1"
          >
            Sunting kosakata &amp; makna <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Rekaman Pelafalan Asli</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#D97706]">
            {entriesWithAudio} Audio
          </div>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            Tersedia Studio Rekaman Mini di Kamus
          </span>
        </Card>
      </div>

      {/* Antrean Kurasi Usulan Kosakata Masyarakat */}
      <DictionaryCurationPanel
        summary={proposalSummary}
        languages={activeLanguages.map((l) => ({ code: l.code, name: l.name }))}
        expertLanguage={user.expertLanguage}
      />
    </div>
  )
}

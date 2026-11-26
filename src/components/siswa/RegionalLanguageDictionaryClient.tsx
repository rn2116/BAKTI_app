"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { proposeDictionaryEntryAction } from "@/actions/dictionary"
import type {
  DictionaryEntryDTO,
  UserProposedEntryDTO,
} from "@/services/dictionary"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AudioButton } from "@/components/shared/AudioButton"
import { notify } from "@/lib/notify"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import {
  Search,
  Sparkles,
  Compass,
  Copy,
  BookOpen,
  Check,
  Languages,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Layers,
  PlusCircle,
  UserCheck,
  Clock,
  AlertTriangle,
  Loader2,
  Send,
} from "lucide-react"

interface LanguageOption {
  code: string
  name: string
  regencyCoverage?: string
}

interface RegionalLanguageDictionaryClientProps {
  matrices: DictionaryEntryDTO[]
  myProposals?: UserProposedEntryDTO[]
  languages?: LanguageOption[]
  initialLanguage?: string
}

const DEFAULT_LANGUAGE_TABS = [
  { code: "ALL", label: "Semua Bahasa", region: "Sulawesi Tengah" },
  { code: "KAILI", label: "Bahasa Kaili", region: "Palu, Sigi, Donggala, Parimo" },
  { code: "PAMONA", label: "Bahasa Pamona", region: "Poso" },
  { code: "BANGGAI", label: "Bahasa Banggai", region: "Banggai Kepulauan & Laut" },
  { code: "BUNGKU", label: "Bahasa Bungku", region: "Morowali" },
  { code: "TOLITOLI", label: "Bahasa Tolitoli", region: "Tolitoli" },
  { code: "BUOL", label: "Bahasa Buol", region: "Buol" },
  { code: "SALUAN", label: "Bahasa Saluan", region: "Banggai" },
  { code: "MORI", label: "Bahasa Mori", region: "Morowali Utara" },
  { code: "TAA", label: "Bahasa Taa", region: "Tojo Una-Una" },
]

export function RegionalLanguageDictionaryClient({
  matrices,
  myProposals = [],
  languages,
  initialLanguage = "ALL",
}: RegionalLanguageDictionaryClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>(initialLanguage || "ALL")
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const [proposeOpen, setProposeOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const languageOptions: LanguageOption[] =
    languages && languages.length > 0
      ? languages
      : Object.entries(REGIONAL_LANGUAGE_LABELS).map(([code, name]) => ({
          code,
          name,
        }))

  const languageTabs = [
    { code: "ALL", label: "Semua Bahasa", region: "Sulawesi Tengah" },
    ...languageOptions.map((lang) => ({
      code: lang.code,
      label: lang.name.replace(/^Bahasa\s+/i, ""),
      region:
        lang.regencyCoverage ||
        DEFAULT_LANGUAGE_TABS.find((t) => t.code === lang.code)?.region ||
        "Sulawesi Tengah",
    })),
  ]

  const languageLabelMap: Record<string, string> = Object.fromEntries(
    languageOptions.map((l) => [l.code, l.name])
  )

  function handleCopy(id: number, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      notify.success(`Ungkapan "${text}" disalin ke papan klip!`)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  function handleProposeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const res = await proposeDictionaryEntryAction(null, formData)
        if (res.success) {
          notify.success(res.message || "Usulan kosakata berhasil dikirim.")
          setProposeOpen(false)
          router.refresh()
        } else {
          notify.error(res.error || "Gagal mengirim usulan kosakata.")
        }
      } catch {
        notify.error("Terjadi kesalahan sistem saat mengirim usulan kosakata.")
      }
    })
  }

  const filteredMatrices = matrices.filter((item) => {
    const matchTab = activeTab === "ALL" || item.regionalLanguage === activeTab
    const q = search.toLowerCase().trim()
    const matchSearch =
      !q ||
      item.regionalTerm.toLowerCase().includes(q) ||
      item.indonesianCharacter.toLowerCase().includes(q) ||
      item.characterSource.toLowerCase().includes(q) ||
      item.implementation.toLowerCase().includes(q) ||
      (item.proposer?.fullName || "").toLowerCase().includes(q) ||
      (item.verifier?.fullName || "").toLowerCase().includes(q)

    return matchTab && matchSearch
  })

  return (
    <div className="space-y-6 min-w-0 w-full max-w-full">
      {/* Hero Banner Inspiratif BBPST */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E135E] via-[#3C22BB] to-[#0284C7] p-5 sm:p-8 text-white shadow-lg min-w-0">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5 min-w-0">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              Matriks Kosakata &amp; Kearifan Lokal Resmi BBPST
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Kamus Besar Kearifan Lokal Sulawesi Tengah
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Jelajahi kosakata daerah, ungkapan bijak, petuah luhur leluhur, dan falsafah budi pekerti dalam berbagai bahasa daerah di Provinsi Sulawesi Tengah untuk menguatkan karakter mulia.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setProposeOpen(true)}
            className="min-h-12 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs sm:text-sm px-5 rounded-2xl shadow-md gap-2 shrink-0 w-full lg:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Usulkan Kosakata / Ungkapan</span>
          </Button>
        </div>

        {/* Decorative background vectors */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Languages className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Status Usulan Pribadi Peserta (Jika Ada) */}
      {myProposals.length > 0 && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#1E135E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>Status Usulan Kosakata Anda ({myProposals.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-500">
              Dikurasi oleh Ahli Bahasa Daerah &amp; Admin BBPST (+20 XP jika disetujui)
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {myProposals.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-zinc-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-100">
                    {languageLabelMap[p.regionalLanguage] ?? p.regionalLanguage}
                  </span>
                  {p.verificationStatus === "APPROVED" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#065F46]">
                      <ShieldCheck className="w-3 h-3" /> Disetujui
                    </span>
                  ) : p.verificationStatus === "REJECTED" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      <AlertTriangle className="w-3 h-3" /> Perlu Perbaikan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3" /> Menunggu Verifikasi
                    </span>
                  )}
                </div>

                <div className="text-sm font-extrabold text-zinc-900 break-words">
                  &ldquo;{p.regionalTerm}&rdquo;
                </div>
                <div className="text-[11px] text-zinc-600 line-clamp-1">
                  Nilai: {p.indonesianCharacter}
                </div>

                {p.reviewNotes && (
                  <p className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200">
                    Catatan kurator: {p.reviewNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Tabs */}
      <div className="space-y-3 min-w-0 w-full max-w-full">
        {/* Search input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari istilah daerah, nilai karakter, kontributor..."
            className="pl-10 h-11 text-xs rounded-2xl bg-white border-zinc-200 shadow-xs w-full"
          />
        </div>

        {/* Dynamic Language Filter Tabs (Scrollable internally on mobile without overflowing page) */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto pb-1.5 scrollbar-none">
          <div className="flex items-center gap-2 w-max">
            {languageTabs.map((tab) => {
              const isActive = activeTab === tab.code
              return (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => setActiveTab(tab.code)}
                  className={`min-h-11 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? "bg-[#3C22BB] text-white shadow-md shadow-[#3C22BB]/20"
                      : "bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 shadow-xs"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.code !== "ALL" && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {tab.code}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* CTA Alur Belajar Bertahap 3 Tahap saat memilih bahasa */}
        {activeTab !== "ALL" && (
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-[#3C22BB]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#1E135E]">
              <Layers className="w-4 h-4 text-[#3C22BB] shrink-0" />
              <span>
                Ingin mempelajari{" "}
                <strong>
                  {languageLabelMap[activeTab] ??
                    REGIONAL_LANGUAGE_LABELS[activeTab] ??
                    activeTab}
                </strong>{" "}
                secara bertahap (Kartu Kilas → Latihan Mencocokkan → Kuis &amp; Sertifikat)?
              </span>
            </div>
            <Link
              href={`/siswa/belajar-bahasa/${activeTab}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-12 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold shadow-xs shrink-0 transition-colors"
            >
              <span>Mulai Belajar 3 Tahap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {filteredMatrices.map((item) => {
          const isCopied = copiedId === item.id
          const verifierName = item.verifier?.fullName
          const verifierLabel = item.verifier
            ? item.verifier.role === "AHLI_BAHASA"
              ? `${verifierName} — ${item.verifier.expertAffiliation || "Ahli Bahasa Daerah BBPST"}`
              : `${verifierName} — Balai Bahasa Provinsi Sulawesi Tengah`
            : "Balai Bahasa Provinsi Sulawesi Tengah"

          return (
            <div
              key={item.id}
              className="min-w-0 overflow-hidden break-words bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#3C22BB]/50 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="space-y-4 min-w-0">
                {/* Card Top: Regional Badge & Copy */}
                <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      <Languages className="w-3 h-3 text-teal-600 shrink-0" />
                      <span className="whitespace-normal break-words">
                        {languageLabelMap[item.regionalLanguage] ??
                          REGIONAL_LANGUAGE_LABELS[item.regionalLanguage] ??
                          item.regionalLanguage}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.regionalTerm)}
                      className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                      aria-label="Salin Istilah"
                      title="Salin Istilah"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Regional Term & Pronunciation */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                    <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 group-hover:text-[#3C22BB] transition-colors tracking-tight break-words min-w-0 flex-1">
                      &ldquo;{item.regionalTerm}&rdquo;
                    </h3>
                    <AudioButton
                      audioUrl={item.audioUrl}
                      text={item.regionalTerm}
                      label="Lafalkan"
                      variant="indigo"
                      size="sm"
                      showTextOnMobile={true}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Indonesian Character Value Badge */}
                  <div className="inline-flex items-start gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs max-w-full whitespace-normal break-words">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="break-words">Nilai: {item.indonesianCharacter}</span>
                  </div>
                </div>

                {/* Cultural Source Callout */}
                <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-100 text-xs space-y-1 min-w-0 break-words">
                  <div className="font-semibold text-zinc-700 flex items-center gap-1.5 text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-[#3C22BB] shrink-0" />
                    <span>Makna Filosofis &amp; Sumber Rujukan:</span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed break-words">
                    {item.characterSource}
                  </p>
                </div>

                {/* Practical Implementation Callout */}
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/70 text-xs space-y-1 min-w-0 break-words">
                  <div className="font-semibold text-indigo-900 flex items-center gap-1.5 text-[11px]">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Contoh Penerapan Sehari-hari:</span>
                  </div>
                  <p className="text-indigo-800 leading-relaxed break-words">
                    {item.implementation}
                  </p>
                </div>
              </div>

              {/* Blok Atribusi Kontributor & Ahli Bahasa + Footer */}
              <div className="pt-3.5 mt-4 border-t border-zinc-100 space-y-2.5 min-w-0">
                <div className="space-y-1.5 min-w-0">
                  {item.proposer && (
                    <div className="inline-flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-bold w-full">
                      <UserCheck className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                      <span className="whitespace-normal break-words leading-snug">
                        Kontributor: {item.proposer.fullName}
                        {item.proposer.regencyName ? ` (${item.proposer.regencyName})` : ""}
                      </span>
                    </div>
                  )}

                  <div className="inline-flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-[#065F46] border border-emerald-200/80 text-[10px] font-bold w-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#065F46] shrink-0 mt-0.5" />
                    <span
                      className="whitespace-normal break-words leading-snug"
                      title={`Diverifikasi oleh: ${verifierLabel}`}
                    >
                      Diverifikasi oleh: {verifierLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 text-xs text-zinc-400">
                  <Link
                    href={`/siswa/belajar-bahasa/${item.regionalLanguage}`}
                    className="min-h-11 inline-flex items-center gap-1.5 font-bold text-[#3C22BB] hover:underline px-1"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Belajar 3 Tahap</span>
                  </Link>
                  <AudioButton
                    text={`${item.regionalTerm}. Maknanya adalah nilai ${item.indonesianCharacter}. ${item.implementation}`}
                    label="Dengarkan"
                    variant="ghost"
                    size="sm"
                    showTextOnMobile={true}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {filteredMatrices.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-zinc-200 rounded-3xl p-8">
            <Compass className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-zinc-800">
              Tidak Ada Istilah Ditemukan
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              Coba gunakan kata kunci pencarian lain atau pilih tab bahasa daerah lainnya.
            </p>
            <Button
              onClick={() => {
                setSearch("")
                setActiveTab("ALL")
              }}
              variant="outline"
              className="text-xs rounded-xl min-h-12"
            >
              Atur Ulang Filter
            </Button>
          </div>
        )}
      </div>

      {/* Modal Usul Kosakata / Ungkapan Masyarakat */}
      <Dialog open={proposeOpen} onOpenChange={setProposeOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[#1E135E] flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#3C22BB]" />
              Usulkan Kosakata / Ungkapan Kearifan Lokal
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProposeSubmit} className="space-y-4 mt-2">
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-zinc-700 leading-relaxed">
              Usulan Anda akan dikurasi terlebih dahulu oleh <strong>Ahli Bahasa Daerah BBPST</strong>. Jika disetujui, nama Anda dicantumkan sebagai kontributor dan Anda memperoleh bonus <strong>+20 XP</strong>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="propose-lang" className="text-xs font-bold text-zinc-800">
                  Pilih Bahasa Daerah <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="propose-lang"
                  name="regionalLanguage"
                  defaultValue={
                    activeTab !== "ALL" ? activeTab : languageOptions[0]?.code ?? "KAILI"
                  }
                  disabled={isPending}
                  required
                  className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="propose-char" className="text-xs font-bold text-zinc-800">
                  Padanan Nilai Karakter Indonesia <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="propose-char"
                  name="indonesianCharacter"
                  placeholder="Misal: Gotong Royong, Kejujuran, Empati"
                  required
                  disabled={isPending}
                  className="h-11 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="propose-term" className="text-xs font-bold text-zinc-800">
                Kosakata / Ungkapan Daerah <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="propose-term"
                name="regionalTerm"
                placeholder="Misal: Nosintuvu Ri Posi Ranga"
                required
                disabled={isPending}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="propose-meaning" className="text-xs font-bold text-zinc-800">
                Arti Harfiah &amp; Makna Filosofis <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="propose-meaning"
                name="philosophicalMeaning"
                rows={3}
                placeholder="Jelaskan arti harfiah per kata maupun makna filosofis yang terkandung di dalamnya..."
                required
                disabled={isPending}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="propose-impl" className="text-xs font-bold text-zinc-800">
                Contoh Penerapan dalam Kehidupan Sehari-hari <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="propose-impl"
                name="implementation"
                rows={3}
                placeholder="Berikan contoh tindakan nyata yang mencerminkan ungkapan tersebut..."
                required
                disabled={isPending}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="propose-source" className="text-xs font-bold text-zinc-800">
                Sumber Rujukan / Penutur Asli <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="propose-source"
                name="referenceSource"
                placeholder="Contoh: Tradisi lisan masyarakat Donggala / Buku rujukan..."
                required
                disabled={isPending}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProposeOpen(false)}
                disabled={isPending}
                className="min-h-12 rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-h-12 bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-bold gap-2 px-5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Usulan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Usulan ke Ahli Bahasa</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

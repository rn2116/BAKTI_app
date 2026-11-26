"use client"

import { useState, useTransition } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { curateDictionaryProposalAction } from "@/actions/dictionary"
import type { ExpertCurationQueueData } from "@/services/expert"
import type { DictionaryEntryDTO } from "@/services/dictionary"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import { notify } from "@/lib/notify"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/shared/EmptyState"
import { AudioButton } from "@/components/shared/AudioButton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Edit3,
  Languages,
  UserCheck,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Loader2,
  MapPin,
  Search,
  Volume2,
  ArrowRight,
  Calendar,
} from "lucide-react"

const MiniAudioStudio = dynamic(
  () =>
    import("@/components/shared/MiniAudioStudio").then(
      (mod) => mod.MiniAudioStudio
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
    ),
  }
)

interface LanguageOption {
  code: string
  name: string
}

interface ExpertCurationClientProps {
  queueData: ExpertCurationQueueData
  languages: LanguageOption[]
}

type StatusTab = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ALL"

function splitMeaningAndSource(rawSource: string): {
  meaning: string
  reference: string | null
} {
  const marker = "Sumber Rujukan / Penutur Asli:"
  const idx = rawSource.indexOf(marker)
  if (idx === -1) {
    return { meaning: rawSource.trim(), reference: null }
  }
  const meaning = rawSource.slice(0, idx).trim()
  const reference = rawSource.slice(idx + marker.length).trim()
  return { meaning, reference: reference || null }
}

export function ExpertCurationClient({
  queueData,
  languages,
}: ExpertCurationClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [statusTab, setStatusTab] = useState<StatusTab>("PENDING_REVIEW")
  const [languageFilter, setLanguageFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  // Dialog Tinjau, Sunting & Setujui/Tolak
  const [reviewTarget, setReviewTarget] = useState<DictionaryEntryDTO | null>(null)
  const [editLang, setEditLang] = useState("")
  const [editTerm, setEditTerm] = useState("")
  const [editCharacter, setEditCharacter] = useState("")
  const [editSource, setEditSource] = useState("")
  const [editImplementation, setEditImplementation] = useState("")
  const [editAudioUrl, setEditAudioUrl] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")

  // Dialog Tolak Cepat dari Kartu
  const [rejectTarget, setRejectTarget] = useState<DictionaryEntryDTO | null>(null)
  const [quickRejectNotes, setQuickRejectNotes] = useState("")

  const languageLabelMap: Record<string, string> = Object.fromEntries(
    languages.map((l) => [l.code, l.name])
  )

  const normalizedExpertLang = (queueData.expertLanguage || "").trim().toUpperCase()

  function openReviewModal(entry: DictionaryEntryDTO) {
    setReviewTarget(entry)
    setEditLang(entry.regionalLanguage)
    setEditTerm(entry.regionalTerm)
    setEditCharacter(entry.indonesianCharacter)
    setEditSource(entry.characterSource)
    setEditImplementation(entry.implementation)
    setEditAudioUrl(entry.audioUrl ?? "")
    setReviewNotes(entry.reviewNotes ?? "")
  }

  function openQuickReject(entry: DictionaryEntryDTO) {
    setRejectTarget(entry)
    setQuickRejectNotes(entry.reviewNotes ?? "")
  }

  function handleCurateFromModal(decision: "APPROVED" | "REJECTED") {
    if (!reviewTarget) return

    if (editTerm.trim().length < 2) {
      notify.error("Kosakata atau ungkapan daerah minimal 2 karakter.")
      return
    }
    if (editCharacter.trim().length < 3) {
      notify.error("Padanan nilai karakter Indonesia minimal 3 karakter.")
      return
    }
    if (editSource.trim().length < 5) {
      notify.error("Arti harfiah, makna filosofis, dan rujukan minimal 5 karakter.")
      return
    }
    if (editImplementation.trim().length < 5) {
      notify.error("Contoh penerapan sehari-hari minimal 5 karakter.")
      return
    }
    if (decision === "REJECTED" && reviewNotes.trim().length < 5) {
      notify.error(
        "Harap tuliskan catatan perbaikan atau alasan penolakan minimal 5 karakter."
      )
      return
    }

    startTransition(async () => {
      try {
        const res = await curateDictionaryProposalAction({
          matrixId: reviewTarget.id,
          decision,
          reviewNotes: reviewNotes.trim() || null,
          regionalLanguage: editLang,
          regionalTerm: editTerm,
          indonesianCharacter: editCharacter,
          characterSource: editSource,
          implementation: editImplementation,
          audioUrl: editAudioUrl || null,
        })

        if (res.success) {
          notify.success(res.message || "Keputusan kurasi berhasil disimpan.")
          setReviewTarget(null)
          router.refresh()
        } else {
          notify.error(res.error || "Gagal menyimpan keputusan kurasi.")
        }
      } catch {
        notify.error("Terjadi kesalahan sistem saat menyimpan hasil kurasi.")
      }
    })
  }

  function handleConfirmQuickReject() {
    if (!rejectTarget) return
    if (quickRejectNotes.trim().length < 5) {
      notify.error(
        "Harap cantumkan catatan perbaikan atau alasan penolakan minimal 5 karakter."
      )
      return
    }

    startTransition(async () => {
      try {
        const res = await curateDictionaryProposalAction({
          matrixId: rejectTarget.id,
          decision: "REJECTED",
          reviewNotes: quickRejectNotes.trim(),
        })

        if (res.success) {
          notify.success(
            res.message || "Usulan ditolak dan catatan dikirimkan ke pengusul."
          )
          setRejectTarget(null)
          router.refresh()
        } else {
          notify.error(res.error || "Gagal menolak usulan kosakata.")
        }
      } catch {
        notify.error("Terjadi kesalahan sistem saat menolak usulan.")
      }
    })
  }

  const filtered = queueData.proposals.filter((item) => {
    const matchStatus =
      statusTab === "ALL" ? true : item.verificationStatus === statusTab
    const matchLang =
      languageFilter === "ALL"
        ? true
        : item.regionalLanguage.toUpperCase() === languageFilter.toUpperCase()
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      item.regionalTerm.toLowerCase().includes(q) ||
      item.indonesianCharacter.toLowerCase().includes(q) ||
      item.characterSource.toLowerCase().includes(q) ||
      (item.proposer?.fullName ?? "").toLowerCase().includes(q) ||
      (item.proposer?.regencyName ?? "").toLowerCase().includes(q)

    return matchStatus && matchLang && matchSearch
  })

  const statusTabs: Array<{ key: StatusTab; label: string; count: number }> = [
    {
      key: "PENDING_REVIEW",
      label: "Menunggu Kurasi",
      count: queueData.counts.pending,
    },
    {
      key: "APPROVED",
      label: "Riwayat Terverifikasi",
      count: queueData.counts.approved,
    },
    {
      key: "REJECTED",
      label: "Perlu Perbaikan",
      count: queueData.counts.rejected,
    },
    {
      key: "ALL",
      label: "Semua Status",
      count: queueData.proposals.length,
    },
  ]

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Ringkasan Antrean & Bahasa Keahlian */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-1.5 min-w-0">
          <div className="text-xs font-semibold text-zinc-500">
            Menunggu Kurasi Pakar
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#D97706]">
            {queueData.counts.pending} Usulan
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            {normalizedExpertLang
              ? `Diurutkan prioritas untuk keahlian ${
                  languageLabelMap[normalizedExpertLang] ?? normalizedExpertLang
                }.`
              : "Diurutkan berdasarkan usulan masyarakat terbaru."}
          </p>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-1.5 min-w-0">
          <div className="text-xs font-semibold text-zinc-500">
            Riwayat Terverifikasi (+20 XP)
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#065F46]">
            {queueData.counts.approved} Lema
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Kontribusi masyarakat yang telah disetujui dan tayang di Kamus Besar.
          </p>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-1.5 min-w-0">
          <div className="text-xs font-semibold text-zinc-500">
            Total Lema Kamus Aktif
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E135E]">
            {queueData.totalPublishedEntries} Kosakata
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-[#3C22BB] shrink-0" />
            <span>{queueData.totalWithAudio} dilengkapi rekaman suara asli</span>
          </p>
        </Card>
      </div>

      {/* Bilah Filter Status, Bahasa & Pencarian */}
      <Card className="rounded-3xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className={`min-h-11 px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                statusTab === tab.key
                  ? "bg-[#3C22BB] text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-white text-zinc-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kosakata, nama pengusul, kabupaten/kota, atau sumber..."
              className="pl-9 h-11 rounded-xl text-xs border-zinc-200 w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              aria-label="Filter Bahasa Daerah"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 w-full sm:w-52"
            >
              <option value="ALL">Semua Bahasa Daerah</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                  {normalizedExpertLang === lang.code.toUpperCase()
                    ? " (Keahlian Anda)"
                    : ""}
                </option>
              ))}
            </select>

            {normalizedExpertLang && languageFilter !== normalizedExpertLang && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setLanguageFilter(normalizedExpertLang)}
                className="min-h-11 w-full sm:w-auto rounded-xl text-xs font-bold border-emerald-300 text-[#065F46] hover:bg-emerald-50"
              >
                Fokus{" "}
                {languageLabelMap[normalizedExpertLang] ?? normalizedExpertLang}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Daftar Antrean Usulan Masyarakat */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-12 h-12 text-[#065F46]" />}
          title={
            statusTab === "PENDING_REVIEW"
              ? "Seluruh Usulan Masyarakat Sudah Selesai Dikurasi"
              : "Tidak Ada Entri Usulan yang Sesuai Filter"
          }
          description={
            statusTab === "PENDING_REVIEW"
              ? "Antrean kurasi saat ini kosong. Anda dapat meninjau riwayat terverifikasi atau memperkaya entri Kamus Besar secara langsung."
              : "Coba ubah filter bahasa daerah atau kata kunci pencarian untuk melihat usulan lainnya."
          }
          action={
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 px-4">
              {statusTab !== "APPROVED" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStatusTab("APPROVED")
                    setLanguageFilter("ALL")
                    setSearch("")
                  }}
                  className="min-h-11 w-full sm:w-auto rounded-xl text-xs font-bold"
                >
                  Lihat Riwayat Terverifikasi
                </Button>
              )}
              <Link
                href="/ahli-bahasa/kamus"
                className="min-h-11 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold px-4 py-2 transition-colors"
              >
                <span>Buka Kamus Besar Kearifan Lokal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 min-w-0">
          {filtered.map((item) => {
            const langLabel =
              languageLabelMap[item.regionalLanguage] ??
              REGIONAL_LANGUAGE_LABELS[item.regionalLanguage] ??
              item.regionalLanguage
            const isExpertMatch =
              normalizedExpertLang !== "" &&
              normalizedExpertLang.includes(item.regionalLanguage.toUpperCase())
            const parsedSource = splitMeaningAndSource(item.characterSource)

            return (
              <Card
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-xs flex flex-col justify-between gap-4 min-w-0 w-full overflow-hidden break-words"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        <Languages className="w-3 h-3 shrink-0" />
                        <span>{langLabel}</span>
                      </span>
                      {isExpertMatch && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-200">
                          Sesuai Keahlian Anda
                        </span>
                      )}
                    </div>

                    {item.verificationStatus === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#065F46]">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Disetujui &amp; Terbit</span>
                      </span>
                    ) : item.verificationStatus === "REJECTED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Ditolak</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Menunggu Kurasi</span>
                      </span>
                    )}
                  </div>

                  {/* Istilah Daerah & Audio */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-black text-[#1E135E] break-words">
                        &ldquo;{item.regionalTerm}&rdquo;
                      </h3>
                      <div className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-[#065F46] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 max-w-full whitespace-normal break-words">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Padanan Karakter: {item.indonesianCharacter}</span>
                      </div>
                    </div>

                    <AudioButton
                      audioUrl={item.audioUrl}
                      text={item.regionalTerm}
                      label="Dengarkan"
                      size="sm"
                      showTextOnMobile={true}
                    />
                  </div>

                  {/* Arti, Makna Filosofis & Sumber Rujukan */}
                  <div className="text-xs text-zinc-600 bg-[#FAFAF8] p-3 rounded-xl border border-zinc-200/80 space-y-2 min-w-0">
                    <div>
                      <div className="font-bold text-zinc-800 flex items-center gap-1 text-[11px] mb-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#3C22BB] shrink-0" />
                        <span>Arti Harfiah &amp; Makna Filosofis:</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed break-words">
                        {parsedSource.meaning}
                      </p>
                    </div>

                    {parsedSource.reference && (
                      <div className="pt-2 border-t border-zinc-200/70">
                        <span className="font-bold text-zinc-800 text-[11px] block">
                          Sumber Rujukan Lisan/Tulisan:
                        </span>
                        <p className="text-zinc-600 break-words leading-relaxed">
                          {parsedSource.reference}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-200/70">
                      <span className="font-bold text-indigo-900 text-[11px] block">
                        Contoh Penerapan:
                      </span>
                      <p className="text-indigo-900/90 break-words leading-relaxed">
                        {item.implementation}
                      </p>
                    </div>
                  </div>

                  {/* Identitas Pengusul */}
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 space-y-1.5 text-[11px] text-zinc-700 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1 font-bold text-zinc-900">
                        <UserCheck className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        <span>
                          Pengusul: {item.proposer?.fullName ?? "Kontributor Masyarakat"}
                        </span>
                      </span>
                      {item.proposer?.participantCategory && (
                        <span className="px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-900 font-semibold">
                          {item.proposer.participantCategory}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-600">
                      {item.proposer?.regencyName && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#065F46] shrink-0" />
                          <span>Asal: {item.proposer.regencyName}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {item.reviewNotes && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-[11px] text-zinc-700 break-words">
                      <strong>Catatan Kurasi:</strong> {item.reviewNotes}
                    </div>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    disabled={isPending}
                    className="min-h-12 flex-1 bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Edit3 className="w-4 h-4 shrink-0" />
                    <span>Tinjau, Sunting &amp; Terbitkan</span>
                  </Button>

                  {item.verificationStatus === "PENDING_REVIEW" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openQuickReject(item)}
                      disabled={isPending}
                      className="min-h-12 sm:w-auto border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold gap-1.5 px-4"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Tolak Usulan</span>
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog Tinjau, Sunting & Kurasi Lengkap */}
      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-black text-[#1E135E] flex items-center gap-2 pr-6">
              <ShieldCheck className="w-5 h-5 text-[#065F46] shrink-0" />
              <span>Kurasi &amp; Sunting Usulan Kosakata</span>
            </DialogTitle>
          </DialogHeader>

          {reviewTarget && (
            <div className="space-y-4 mt-2">
              {reviewTarget.proposer && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-wrap items-center gap-2 leading-relaxed">
                  <UserCheck className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>
                    Diusulkan oleh <strong>{reviewTarget.proposer.fullName}</strong>
                    {reviewTarget.proposer.participantCategory
                      ? ` (${reviewTarget.proposer.participantCategory})`
                      : ""}
                    {reviewTarget.proposer.regencyName
                      ? ` dari ${reviewTarget.proposer.regencyName}`
                      : ""}
                    . Jika disetujui, pengusul meraih <strong>+20 XP</strong> serta
                    notifikasi resmi.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Bahasa Daerah</Label>
                  <select
                    value={editLang}
                    onChange={(e) => setEditLang(e.target.value)}
                    disabled={isPending}
                    className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-800"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Padanan Nilai Karakter</Label>
                  <Input
                    value={editCharacter}
                    onChange={(e) => setEditCharacter(e.target.value)}
                    disabled={isPending}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  Ejaan Kosakata / Ungkapan Daerah
                </Label>
                <Input
                  value={editTerm}
                  onChange={(e) => setEditTerm(e.target.value)}
                  disabled={isPending}
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  Arti Harfiah, Makna Filosofis &amp; Sumber Rujukan
                </Label>
                <Textarea
                  rows={4}
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  disabled={isPending}
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  Contoh Penerapan Sehari-hari
                </Label>
                <Textarea
                  rows={3}
                  value={editImplementation}
                  onChange={(e) => setEditImplementation(e.target.value)}
                  disabled={isPending}
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              <MiniAudioStudio
                value={editAudioUrl}
                onChange={setEditAudioUrl}
                inputName="curationAudioUrl"
                label="Rekam Audio Pelafalan Penutur Jati (Opsional)"
              />

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  Catatan Kurasi Ahli Bahasa{" "}
                  <span className="font-normal text-zinc-500">
                    (Wajib diisi minimal 5 karakter jika menolak usulan)
                  </span>
                </Label>
                <Textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Tuliskan catatan penyelarasan ejaan atau alasan penolakan..."
                  disabled={isPending}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleCurateFromModal("REJECTED")}
                  className="min-h-12 w-full sm:w-auto border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Tolak Usulan</span>
                </Button>

                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleCurateFromModal("APPROVED")}
                  className="min-h-12 w-full sm:w-auto bg-[#065F46] hover:bg-[#044a36] text-white rounded-xl text-xs font-bold gap-1.5 px-5"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Setujui &amp; Terbitkan ke Kamus</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Tolak Usulan Cepat */}
      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-rose-800 flex items-center gap-2 pr-6">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Tolak Usulan Kosakata</span>
            </DialogTitle>
          </DialogHeader>

          {rejectTarget && (
            <div className="space-y-4 mt-1">
              <p className="text-xs text-zinc-600 leading-relaxed break-words">
                Tuliskan catatan perbaikan untuk usulan{" "}
                <strong className="text-zinc-900">
                  &ldquo;{rejectTarget.regionalTerm}&rdquo;
                </strong>{" "}
                dari {rejectTarget.proposer?.fullName ?? "kontributor masyarakat"}.
                Catatan akan dikirimkan langsung ke lonceng notifikasi pengusul.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="quickRejectNotes" className="text-xs font-bold">
                  Catatan Perbaikan / Alasan Penolakan{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="quickRejectNotes"
                  rows={3}
                  value={quickRejectNotes}
                  onChange={(e) => setQuickRejectNotes(e.target.value)}
                  disabled={isPending}
                  placeholder="Contoh: Mohon lengkapi arti harfiah dan sebutkan narasumber atau sumber tertulisnya..."
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setRejectTarget(null)}
                  className="min-h-11 w-full sm:w-auto rounded-xl text-xs font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmQuickReject}
                  className="min-h-11 w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Kirim Penolakan</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { curateDictionaryProposalAction } from "@/actions/dictionary"
import type {
  CuratorProposalSummary,
  DictionaryEntryDTO,
} from "@/services/dictionary"
import { notify } from "@/lib/notify"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface DictionaryCurationPanelProps {
  summary: CuratorProposalSummary
  languages: LanguageOption[]
  expertLanguage?: string | null
}

type FilterTab = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ALL"

export function DictionaryCurationPanel({
  summary,
  languages,
  expertLanguage,
}: DictionaryCurationPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<FilterTab>("PENDING_REVIEW")

  const [reviewTarget, setReviewTarget] = useState<DictionaryEntryDTO | null>(null)
  const [editLang, setEditLang] = useState("")
  const [editTerm, setEditTerm] = useState("")
  const [editCharacter, setEditCharacter] = useState("")
  const [editSource, setEditSource] = useState("")
  const [editImplementation, setEditImplementation] = useState("")
  const [editAudioUrl, setEditAudioUrl] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")

  const languageLabelMap: Record<string, string> = Object.fromEntries(
    languages.map((l) => [l.code, l.name])
  )

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

  function handleCurate(
    entry: DictionaryEntryDTO,
    decision: "APPROVED" | "REJECTED",
    useEditedFields: boolean
  ) {
    if (decision === "REJECTED" && reviewNotes.trim().length < 5) {
      notify.error("Harap tuliskan alasan penolakan atau catatan perbaikan minimal 5 karakter.")
      return
    }

    startTransition(async () => {
      try {
        const res = await curateDictionaryProposalAction({
          matrixId: entry.id,
          decision,
          reviewNotes: reviewNotes.trim() || null,
          ...(useEditedFields
            ? {
                regionalLanguage: editLang,
                regionalTerm: editTerm,
                indonesianCharacter: editCharacter,
                characterSource: editSource,
                implementation: editImplementation,
                audioUrl: editAudioUrl || null,
              }
            : {}),
        })

        if (res.success) {
          notify.success(res.message || "Keputusan kurasi berhasil disimpan.")
          setReviewTarget(null)
          router.refresh()
        } else {
          notify.error(res.error || "Gagal menyimpan keputusan kurasi.")
        }
      } catch {
        notify.error("Terjadi kesalahan sistem saat mengkurasi usulan.")
      }
    })
  }

  const filtered = summary.proposals.filter((item) =>
    activeTab === "ALL" ? true : item.verificationStatus === activeTab
  )

  const tabs: Array<{ key: FilterTab; label: string; count: number }> = [
    { key: "PENDING_REVIEW", label: "Menunggu Kurasi", count: summary.counts.pending },
    { key: "APPROVED", label: "Disetujui (+20 XP)", count: summary.counts.approved },
    { key: "REJECTED", label: "Ditolak / Perbaikan", count: summary.counts.rejected },
    { key: "ALL", label: "Semua Usulan", count: summary.proposals.length },
  ]

  return (
    <Card className="rounded-3xl border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3C22BB]">
            <ShieldCheck className="w-4 h-4" />
            <span>Kurasi Pakar Balai Bahasa Provinsi Sulawesi Tengah</span>
          </div>
          <h2 className="text-lg font-black text-[#1E135E]">
            Antrean Usulan Kosakata Masyarakat
          </h2>
          <p className="text-xs text-zinc-500">
            {expertLanguage
              ? `Diprioritaskan sesuai bahasa keahlian Anda (${expertLanguage}). Sunting ejaan atau makna sebelum menerbitkan (+20 XP bagi kontributor).`
              : "Tinjau, sunting ejaan sesuai kaidah, lalu setujui atau tolak usulan kosakata masyarakat."}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#3C22BB] text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-white text-zinc-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 bg-[#FAFAF8] space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <div className="text-sm font-bold text-zinc-800">
            Tidak ada usulan pada kategori ini
          </div>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Seluruh usulan kosakata dari masyarakat akan langsung muncul di daftar ini untuk Anda kurasi.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const langLabel =
              languageLabelMap[item.regionalLanguage] ??
              REGIONAL_LANGUAGE_LABELS[item.regionalLanguage] ??
              item.regionalLanguage

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-[#FAFAF8] flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      <Languages className="w-3 h-3" />
                      {langLabel}
                    </span>

                    {item.verificationStatus === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#065F46]">
                        <CheckCircle2 className="w-3 h-3" /> Disetujui &amp; Terbit
                      </span>
                    ) : item.verificationStatus === "REJECTED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        <AlertTriangle className="w-3 h-3" /> Ditolak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" /> Menunggu Kurasi
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#1E135E] break-words">
                      &ldquo;{item.regionalTerm}&rdquo;
                    </h3>
                    <div className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-[#065F46]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Padanan Karakter: {item.indonesianCharacter}</span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-600 bg-white p-3 rounded-xl border border-zinc-200/80 space-y-1">
                    <div className="font-bold text-zinc-800 flex items-center gap-1 text-[11px]">
                      <BookOpen className="w-3.5 h-3.5 text-[#3C22BB]" /> Makna &amp; Sumber Rujukan:
                    </div>
                    <p className="whitespace-pre-line leading-relaxed line-clamp-3">
                      {item.characterSource}
                    </p>
                  </div>

                  {item.proposer && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                        <UserCheck className="w-3.5 h-3.5 text-[#D97706]" />
                        Pengusul: {item.proposer.fullName}
                      </span>
                      {item.proposer.participantCategory && (
                        <span className="text-zinc-400">
                          • {item.proposer.participantCategory}
                        </span>
                      )}
                      {item.proposer.regencyName && (
                        <span className="inline-flex items-center gap-0.5 text-zinc-500">
                          <MapPin className="w-3 h-3" />
                          {item.proposer.regencyName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-200/80 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    disabled={isPending}
                    className="min-h-12 flex-1 bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Tinjau, Sunting &amp; Kurasi</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog Tinjau, Sunting & Kurasi */}
      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[#1E135E] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#065F46]" />
              Kurasi &amp; Sunting Usulan Kosakata Masyarakat
            </DialogTitle>
          </DialogHeader>

          {reviewTarget && (
            <div className="space-y-4 mt-2">
              {reviewTarget.proposer && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-wrap items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#D97706]" />
                  <span>
                    Diusulkan oleh <strong>{reviewTarget.proposer.fullName}</strong>
                    {reviewTarget.proposer.regencyName
                      ? ` dari ${reviewTarget.proposer.regencyName}`
                      : ""}
                    . Jika disetujui, kontributor meraih <strong>+20 XP</strong>.
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
                <Label className="text-xs font-bold">Kosakata / Ungkapan Daerah</Label>
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
                  rows={3}
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  disabled={isPending}
                  className="rounded-xl text-xs"
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
                  className="rounded-xl text-xs"
                />
              </div>

              <MiniAudioStudio
                value={editAudioUrl}
                onChange={setEditAudioUrl}
                inputName="curationAudioUrl"
                label="Rekam Audio Pelafalan Asli (Opsional)"
              />

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  Catatan Kurasi Ahli Bahasa{" "}
                  <span className="font-normal text-zinc-500">
                    (Wajib diisi jika menolak usulan)
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

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleCurate(reviewTarget, "REJECTED", true)}
                  className="min-h-12 border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold gap-1.5"
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
                  onClick={() => handleCurate(reviewTarget, "APPROVED", true)}
                  className="min-h-12 bg-[#065F46] hover:bg-[#044a36] text-white rounded-xl text-xs font-bold gap-1.5 px-5"
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
    </Card>
  )
}

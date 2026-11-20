"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { verifyQuizQuestionAction } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { AudioButton } from "@/components/shared/AudioButton"

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
import { notify } from "@/lib/notify"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Search,
  Hourglass,
  AlertTriangle,
  Quote,
  Check,
  UserCheck,
  BookOpenCheck,
  Languages,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import type { Category, RegionalLanguage, QuestionVerificationStatus } from "@/types"

export interface VerificationQuestionItem {
  id: string
  quizId: string
  question: string
  options: string
  correctIndex: number
  explanation: string | null
  points: number
  regionalLanguage: RegionalLanguage | null
  wiseSayingText: string | null
  wiseSayingMeaning: string | null
  referenceSource: string | null
  audioUrl: string | null
  verificationStatus: QuestionVerificationStatus
  reviewNotes: string | null
  createdAt: Date
  quiz: {
    id: string
    title: string
    category: Category
    regionalLanguage: RegionalLanguage | null
  }
  creator: {
    id: string
    fullName: string
    role: string
    school?: { name: string } | null
  } | null
  verifier: {
    fullName: string
  } | null
}

interface AdminVerifikasiSoalClientProps {
  questions: VerificationQuestionItem[]
  counts: {
    pending: number
    approved: number
    rejected: number
    total: number
  }
}

type StatusTab = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ALL"

function parseOptions(optStr: string): string[] {
  try {
    const arr: unknown = JSON.parse(optStr)
    if (Array.isArray(arr) && arr.length === 4) {
      return arr.map((x) => String(x))
    }
  } catch {
    // Abaikan parse error
  }
  return ["", "", "", ""]
}

export function AdminVerifikasiSoalClient({
  questions,
  counts,
}: AdminVerifikasiSoalClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<StatusTab>("PENDING_REVIEW")
  const [search, setSearch] = useState("")

  // Approve confirm state
  const [approveTarget, setApproveTarget] = useState<VerificationQuestionItem | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  // Reject / Revise modal state
  const [rejectTarget, setRejectTarget] = useState<VerificationQuestionItem | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  // Edit & Approve modal state
  const [editTarget, setEditTarget] = useState<VerificationQuestionItem | null>(null)
  const [editForm, setEditForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctIndex: 0,
    explanation: "",
    points: 10,
    regionalLanguage: "" as RegionalLanguage | "",
    wiseSayingText: "",
    wiseSayingMeaning: "",
    referenceSource: "",
    audioUrl: "",
  })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const filtered = questions.filter((q) => {
    const matchTab = activeTab === "ALL" || q.verificationStatus === activeTab
    const keyword = search.trim().toLowerCase()
    const matchSearch =
      !keyword ||
      q.question.toLowerCase().includes(keyword) ||
      q.quiz.title.toLowerCase().includes(keyword) ||
      (q.creator?.fullName || "").toLowerCase().includes(keyword) ||
      (q.wiseSayingText || "").toLowerCase().includes(keyword)
    return matchTab && matchSearch
  })

  async function handleConfirmApprove() {
    if (!approveTarget) return
    setIsApproving(true)
    try {
      const res = await verifyQuizQuestionAction({
        questionId: approveTarget.id,
        decision: "APPROVED",
      })
      if (res.success) {
        notify.success(res.message || "Soal disetujui & diterbitkan!")
        setApproveTarget(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menyetujui soal")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setIsApproving(false)
    }
  }

  function openRejectModal(q: VerificationQuestionItem) {
    setRejectTarget(q)
    setRejectNotes(q.reviewNotes ?? "")
  }

  async function handleSubmitReject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rejectTarget) return
    if (!rejectNotes.trim()) {
      notify.warning("Mohon tuliskan catatan revisi agar Guru mengetahui bagian yang perlu diperbaiki")
      return
    }
    setIsRejecting(true)
    try {
      const res = await verifyQuizQuestionAction({
        questionId: rejectTarget.id,
        decision: "REJECTED",
        reviewNotes: rejectNotes.trim(),
      })
      if (res.success) {
        notify.success(res.message || "Catatan revisi dikirim ke Guru")
        setRejectTarget(null)
        setRejectNotes("")
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menolak soal")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setIsRejecting(false)
    }
  }

  function openEditApproveModal(q: VerificationQuestionItem) {
    const opts = parseOptions(q.options)
    setEditTarget(q)
    setEditForm({
      question: q.question,
      optionA: opts[0] ?? "",
      optionB: opts[1] ?? "",
      optionC: opts[2] ?? "",
      optionD: opts[3] ?? "",
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
      points: q.points,
      regionalLanguage: q.regionalLanguage ?? "",
      wiseSayingText: q.wiseSayingText ?? "",
      wiseSayingMeaning: q.wiseSayingMeaning ?? "",
      referenceSource: q.referenceSource ?? "",
      audioUrl: q.audioUrl ?? "",
    })
  }

  async function handleSubmitEditApprove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editTarget) return
    if (
      !editForm.question.trim() ||
      !editForm.optionA.trim() ||
      !editForm.optionB.trim() ||
      !editForm.optionC.trim() ||
      !editForm.optionD.trim()
    ) {
      notify.warning("Pertanyaan dan seluruh pilihan A–D wajib diisi")
      return
    }

    setIsSavingEdit(true)
    try {
      const res = await verifyQuizQuestionAction({
        questionId: editTarget.id,
        decision: "APPROVED",
        question: editForm.question.trim(),
        options: [
          editForm.optionA.trim(),
          editForm.optionB.trim(),
          editForm.optionC.trim(),
          editForm.optionD.trim(),
        ],
        correctIndex: editForm.correctIndex,
        explanation: editForm.explanation.trim() || null,
        points: editForm.points,
        regionalLanguage: editForm.regionalLanguage ? editForm.regionalLanguage : null,
        wiseSayingText: editForm.wiseSayingText.trim() || null,
        wiseSayingMeaning: editForm.wiseSayingMeaning.trim() || null,
        referenceSource: editForm.referenceSource.trim() || null,
        audioUrl: editForm.audioUrl.trim() || null,
      })
      if (res.success) {
        notify.success(res.message || "Perubahan disimpan & soal diterbitkan!")
        setEditTarget(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menyimpan dan menyetujui soal")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const tabs: Array<{ key: StatusTab; label: string; count: number; badgeClass: string }> = [
    {
      key: "PENDING_REVIEW",
      label: "Menunggu Verifikasi",
      count: counts.pending,
      badgeClass: "bg-amber-100 text-amber-800",
    },
    {
      key: "APPROVED",
      label: "Disetujui",
      count: counts.approved,
      badgeClass: "bg-emerald-100 text-emerald-800",
    },
    {
      key: "REJECTED",
      label: "Perlu Revisi",
      count: counts.rejected,
      badgeClass: "bg-rose-100 text-rose-800",
    },
    {
      key: "ALL",
      label: "Semua Soal",
      count: counts.total,
      badgeClass: "bg-zinc-100 text-zinc-700",
    },
  ]

  return (
    <div className="space-y-5">
      {/* Filter Tabs & Search */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  isActive
                    ? "bg-[#3C22BB] text-white shadow-xs"
                    : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? "bg-white/20 text-white" : tab.badgeClass
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pertanyaan, ungkapan daerah, nama guru, atau paket kuis..."
            className="pl-9 h-10 text-xs rounded-xl border-zinc-200"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.map((q) => {
          const options = parseOptions(q.options)
          const letters = ["A", "B", "C", "D"]

          return (
            <div
              key={q.id}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#3C22BB]/30 transition-all"
            >
              {/* Meta Header: Status, Quiz, Pengusul */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="flex flex-wrap items-center gap-2">
                  {q.verificationStatus === "PENDING_REVIEW" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <Hourglass className="w-3 h-3 text-amber-600" />
                      Menunggu Verifikasi
                    </span>
                  )}
                  {q.verificationStatus === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Disetujui & Tayang ✓
                    </span>
                  )}
                  {q.verificationStatus === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Perlu Revisi
                    </span>
                  )}

                  <CategoryBadge category={q.quiz.category} />

                  {q.regionalLanguage && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      <Languages className="w-3 h-3" />
                      {REGIONAL_LANGUAGE_LABELS[q.regionalLanguage] ?? q.regionalLanguage}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <AudioButton
                    audioUrl={q.audioUrl}
                    text={q.wiseSayingText ? `${q.wiseSayingText}. ${q.question}` : q.question}
                    label="Audio"
                    size="sm"
                  />
                  <span className="font-mono font-bold text-[#3C22BB] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {q.points} Poin
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(q.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Info Pengusul & Paket Kuis Tujuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-50/80 p-3 rounded-xl border border-zinc-200/70">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck className="w-4 h-4 text-[#3C22BB] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-zinc-400 font-semibold uppercase">
                      Guru / Pengusul Soal
                    </div>
                    <div className="font-bold text-zinc-900 truncate">
                      {q.creator?.fullName ?? "Tim Balai Bahasa"}
                      {q.creator?.school?.name ? ` • ${q.creator.school.name}` : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpenCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-zinc-400 font-semibold uppercase">
                        Paket Kuis Tujuan
                      </div>
                      <div className="font-bold text-zinc-900 truncate">{q.quiz.title}</div>
                    </div>
                  </div>
                  <Link
                    href={`/admin/kuis/${q.quiz.id}/soal`}
                    className="text-[11px] font-bold text-[#3C22BB] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    Buka Kuis <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Ungkapan Bijak Daerah (jika ada) */}
              {q.wiseSayingText && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3C22BB]">
                    <Quote className="w-3.5 h-3.5" /> Teks Ungkapan Bijak Daerah
                  </div>
                  <p className="font-serif italic font-bold text-base text-[#1E135E]">
                    &ldquo;{q.wiseSayingText}&rdquo;
                  </p>
                  {q.wiseSayingMeaning && (
                    <p className="text-xs text-zinc-700">
                      <span className="font-semibold">Arti:</span> {q.wiseSayingMeaning}
                    </p>
                  )}
                  {q.referenceSource && (
                    <p className="text-[11px] text-zinc-500">
                      <span className="font-semibold">Rujukan:</span> {q.referenceSource}
                    </p>
                  )}
                </div>
              )}

              {/* Pertanyaan & Pilihan A-D */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-zinc-900 leading-relaxed whitespace-pre-line break-words">
                  {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctIndex
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs ${
                          isCorrect
                            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold"
                            : "bg-zinc-50 border-zinc-200/80 text-zinc-700"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {letters[optIdx]}
                        </span>
                        <span className="flex-1 break-words">{opt}</span>
                        {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                    )
                  })}
                </div>

                {q.explanation && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Pembahasan: </span>
                      {q.explanation}
                    </div>
                  </div>
                )}

                {q.verificationStatus === "REJECTED" && q.reviewNotes && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                    <span className="font-bold">Catatan Revisi Sebelumnya: </span>
                    {q.reviewNotes}
                  </div>
                )}
              </div>

              {/* Tombol Aksi Verifikasi Admin */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openRejectModal(q)}
                  className="h-10 px-4 rounded-xl text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak / Minta Revisi
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openEditApproveModal(q)}
                  className="h-10 px-4 rounded-xl text-xs font-bold border-indigo-200 text-[#3C22BB] hover:bg-indigo-50 gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Redaksi & Setujui
                </Button>

                {q.verificationStatus !== "APPROVED" && (
                  <Button
                    type="button"
                    onClick={() => setApproveTarget(q)}
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-[#065F46] hover:bg-[#044a36] text-white shadow-xs gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Setujui & Terbitkan
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-zinc-200 rounded-2xl p-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-zinc-800">
              {activeTab === "PENDING_REVIEW"
                ? "Semua Pengajuan Soal Telah Diverifikasi!"
                : "Tidak Ada Soal yang Cocok"}
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              {activeTab === "PENDING_REVIEW"
                ? "Saat ini tidak ada butir soal kiriman Guru yang menunggu antrean verifikasi."
                : "Coba ubah filter tab status atau kata kunci pencarian Anda."}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        variant="primary"
        title="Setujui & Terbitkan Soal?"
        description="Butir soal ini akan langsung berstatus Disetujui & Tayang sehingga dapat dikerjakan oleh siswa dalam mode ujian kuis."
        confirmText="Ya, Setujui & Terbitkan"
        isLoading={isApproving}
        onConfirm={handleConfirmApprove}
      />

      {/* Reject / Revision Notes Modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Tolak & Minta Revisi Soal Guru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitReject} className="space-y-4 mt-2">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 line-clamp-3">
              {rejectTarget?.question}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reviewNotes" className="text-xs font-bold text-zinc-800">
                Catatan Perbaikan / Revisi untuk Guru <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="reviewNotes"
                rows={4}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Contoh: Mohon sesuaikan penulisan huruf kapital berdasarkan EYD V, atau perjelas pembahasan kunci jawaban."
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectTarget(null)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isRejecting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-4"
              >
                {isRejecting ? "Mengirim..." : "Kirim Catatan Revisi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Redaksi & Approve Modal */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#3C22BB] flex items-center gap-2">
              <Edit3 className="w-5 h-5" /> Edit Redaksi Soal & Setujui
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitEditApprove} className="space-y-4 mt-2">
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="text-xs font-bold text-[#3C22BB]">
                Muatan Ungkapan Bijak Daerah (Opsional)
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Teks Ungkapan Bijak</Label>
                <Input
                  value={editForm.wiseSayingText}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, wiseSayingText: e.target.value }))
                  }
                  className="text-xs rounded-xl bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Arti Bahasa Indonesia</Label>
                  <Input
                    value={editForm.wiseSayingMeaning}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, wiseSayingMeaning: e.target.value }))
                    }
                    className="text-xs rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Sumber Rujukan</Label>
                  <Input
                    value={editForm.referenceSource}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, referenceSource: e.target.value }))
                    }
                    className="text-xs rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Teks Pertanyaan</Label>
              <Textarea
                rows={3}
                value={editForm.question}
                onChange={(e) => setEditForm((prev) => ({ ...prev, question: e.target.value }))}
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bahasa Daerah</Label>
                <select
                  value={editForm.regionalLanguage}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      regionalLanguage: e.target.value as RegionalLanguage | "",
                    }))
                  }
                  className="w-full text-xs h-9 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700"
                >
                  <option value="">-- Umum --</option>
                  {Object.entries(REGIONAL_LANGUAGE_LABELS).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bobot Poin</Label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.points}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      points: parseInt(e.target.value || "10", 10),
                    }))
                  }
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-semibold">Pilihan Jawaban A–D & Kunci Benar</Label>
              {(["A", "B", "C", "D"] as const).map((letter, idx) => {
                const fieldKey = (`option${letter}` as
                  | "optionA"
                  | "optionB"
                  | "optionC"
                  | "optionD")
                return (
                  <div key={letter} className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-zinc-700 w-24 shrink-0">
                      <input
                        type="radio"
                        name="editCorrectIndex"
                        checked={editForm.correctIndex === idx}
                        onChange={() =>
                          setEditForm((prev) => ({ ...prev, correctIndex: idx }))
                        }
                        className="text-[#3C22BB]"
                      />
                      <span>Kunci {letter}</span>
                    </label>
                    <Input
                      value={editForm[fieldKey]}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, [fieldKey]: e.target.value }))
                      }
                      required
                      className="text-xs rounded-xl flex-1"
                    />
                  </div>
                )
              })}
            </div>

            <MiniAudioStudio
              value={editForm.audioUrl}
              onChange={(url) => setEditForm((prev) => ({ ...prev, audioUrl: url }))}
              label="Audio Pelafalan Daerah / Rekaman Admin"
            />

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pembahasan Jawaban</Label>
              <Textarea
                rows={2}
                value={editForm.explanation}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, explanation: e.target.value }))
                }
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSavingEdit}
                className="bg-[#065F46] hover:bg-[#044a36] text-white rounded-xl text-xs font-bold px-5"
              >
                {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan & Terbitkan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

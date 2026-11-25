"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyExpertApplicantAction } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { notify } from "@/lib/notify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  XCircle,
  Hourglass,
  FileText,
  ExternalLink,
  Search,
  Award,
  MapPin,
  Building2,
  UserCheck,
  AlertTriangle,
} from "lucide-react"
import type { ExpertVerificationStatus } from "@/types"

export interface ExpertApplicantItem {
  id: string
  fullName: string
  email: string
  domicileRegency: string | null
  institutionName: string | null
  isActive: boolean
  expertStatus: ExpertVerificationStatus
  expertLanguage: string | null
  expertAffiliation: string | null
  expertProofType: string | null
  expertProofNumber: string | null
  expertProofFileUrl: string | null
  expertTrackRecord: string | null
  expertReviewNotes: string | null
  createdAt: Date
}

type FilterTab = "PENDING_EXPERT" | "APPROVED" | "REJECTED" | "ALL"

export function AdminVerifikasiAhliClient({
  applicants,
}: {
  applicants: ExpertApplicantItem[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FilterTab>("PENDING_EXPERT")
  const [search, setSearch] = useState("")

  const [approveTarget, setApproveTarget] = useState<ExpertApplicantItem | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  const [rejectTarget, setRejectTarget] = useState<ExpertApplicantItem | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  const pendingCount = applicants.filter((a) => a.expertStatus === "PENDING_EXPERT").length
  const approvedCount = applicants.filter((a) => a.expertStatus === "APPROVED").length
  const rejectedCount = applicants.filter((a) => a.expertStatus === "REJECTED").length

  const filtered = applicants.filter((item) => {
    const matchTab = activeTab === "ALL" || item.expertStatus === activeTab
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      (item.expertLanguage || "").toLowerCase().includes(q) ||
      (item.expertAffiliation || "").toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  async function handleApproveConfirm() {
    if (!approveTarget) return
    setIsApproving(true)
    try {
      const res = await verifyExpertApplicantAction({
        userId: approveTarget.id,
        decision: "APPROVED",
      })
      if (res.success) {
        notify.success(res.message || "Akun Ahli Bahasa Daerah berhasil disetujui.")
        setApproveTarget(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menyetujui pengajuan.")
      }
    } finally {
      setIsApproving(false)
    }
  }

  async function handleRejectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rejectTarget) return
    if (!rejectNotes.trim()) {
      notify.warning("Mohon tuliskan alasan penolakan untuk pendaftar.")
      return
    }
    setIsRejecting(true)
    try {
      const res = await verifyExpertApplicantAction({
        userId: rejectTarget.id,
        decision: "REJECTED",
        reviewNotes: rejectNotes.trim(),
      })
      if (res.success) {
        notify.success(res.message || "Pengajuan ditolak.")
        setRejectTarget(null)
        setRejectNotes("")
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menolak pengajuan.")
      }
    } finally {
      setIsRejecting(false)
    }
  }

  const tabs: Array<{ key: FilterTab; label: string; count: number }> = [
    { key: "PENDING_EXPERT", label: "Menunggu Verifikasi", count: pendingCount },
    { key: "APPROVED", label: "Disetujui", count: approvedCount },
    { key: "REJECTED", label: "Ditolak", count: rejectedCount },
    { key: "ALL", label: "Semua Pendaftar", count: applicants.length },
  ]

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[#3C22BB] text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, surel, atau bahasa..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Daftar Pengajuan */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.expertStatus === "PENDING_EXPERT" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <Hourglass className="w-3 h-3" /> Menunggu Persetujuan BBPST
                    </span>
                  )}
                  {item.expertStatus === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#065F46] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Disetujui &amp; Aktif
                    </span>
                  )}
                  {item.expertStatus === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      <XCircle className="w-3 h-3" /> Ditolak
                    </span>
                  )}

                  {item.expertLanguage && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-200">
                      <Award className="w-3 h-3" /> Keahlian: {item.expertLanguage}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-zinc-900">{item.fullName}</h3>
                <p className="text-xs text-zinc-500">
                  {item.email} • Daftar{" "}
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {item.expertProofFileUrl && (
                <a
                  href={item.expertProofFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3C22BB] border border-indigo-200 text-xs font-bold shrink-0 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Tinjau Dokumen Bukti</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAFAF8] border border-zinc-200/80 space-y-0.5">
                <div className="text-[10px] font-semibold uppercase text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Domisili
                </div>
                <div className="font-bold text-zinc-900">{item.domicileRegency ?? "-"}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAF8] border border-zinc-200/80 space-y-0.5">
                <div className="text-[10px] font-semibold uppercase text-zinc-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Afiliasi / Komunitas Adat
                </div>
                <div className="font-bold text-zinc-900">{item.expertAffiliation ?? "-"}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAF8] border border-zinc-200/80 space-y-0.5">
                <div className="text-[10px] font-semibold uppercase text-zinc-500 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Jenis &amp; Nomor Bukti
                </div>
                <div className="font-bold text-zinc-900">
                  {item.expertProofType ?? "-"} ({item.expertProofNumber ?? "-"})
                </div>
              </div>
            </div>

            {item.expertTrackRecord && (
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700">
                <span className="font-bold text-zinc-900">Rekam Jejak Kebahasaan: </span>
                {item.expertTrackRecord}
              </div>
            )}

            {item.expertReviewNotes && item.expertStatus === "REJECTED" && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <span className="font-bold">Catatan Penolakan: </span>
                {item.expertReviewNotes}
              </div>
            )}

            {item.expertStatus === "PENDING_EXPERT" && (
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRejectTarget(item)
                    setRejectNotes("")
                  }}
                  className="text-xs font-bold rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Tolak Pendaftaran
                </Button>
                <Button
                  type="button"
                  onClick={() => setApproveTarget(item)}
                  className="text-xs font-bold rounded-xl bg-[#065F46] hover:bg-[#044a36] text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Setujui sebagai Ahli Bahasa
                </Button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-14 bg-white border border-dashed border-zinc-200 rounded-2xl p-6 space-y-2">
            <UserCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-zinc-800">
              Tidak Ada Pengajuan pada Kategori Ini
            </div>
            <p className="text-xs text-zinc-500">
              Seluruh pengajuan akun Ahli Bahasa Daerah yang perlu ditinjau akan tampil di sini.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        variant="primary"
        title="Setujui &amp; Aktifkan Ahli Bahasa Daerah?"
        description={`Akun ${approveTarget?.fullName ?? ""} akan diaktifkan dan berwenang menambahkan bahasa daerah serta menyunting Kamus Besar Kearifan Lokal Sulawesi Tengah.`}
        confirmText="Ya, Setujui &amp; Aktifkan"
        isLoading={isApproving}
        onConfirm={handleApproveConfirm}
      />

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Tolak Pendaftaran Ahli Bahasa
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rejectNotes" className="text-xs font-bold text-zinc-800">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="rejectNotes"
                rows={3}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Contoh: Dokumen SK/Sertifikat bukti kepakaran tidak terbaca atau belum sesuai bidang bahasa daerah Sulawesi Tengah."
                required
                className="text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2">
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
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                {isRejecting ? "Menyimpan..." : "Kirim Penolakan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

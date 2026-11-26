"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { updateExpertProfileAction } from "@/actions/expert"
import type { ExpertProfileDTO } from "@/services/expert"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import { notify } from "@/lib/notify"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ShieldCheck,
  Award,
  Languages,
  Building2,
  FileCheck2,
  ExternalLink,
  Download,
  BookOpen,
  Volume2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  MapPin,
  Save,
  Loader2,
  ArrowRight,
  FileText,
} from "lucide-react"

interface ExpertProfileClientProps {
  profile: ExpertProfileDTO
}

export function ExpertProfileClient({ profile }: ExpertProfileClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [affiliation, setAffiliation] = useState(profile.expertAffiliation ?? "")
  const [trackRecord, setTrackRecord] = useState(profile.expertTrackRecord ?? "")

  const languageDisplay = profile.expertLanguage
    ? REGIONAL_LANGUAGE_LABELS[profile.expertLanguage.toUpperCase()] ??
      profile.expertLanguage
    : "Bahasa Daerah Sulawesi Tengah"

  const isApproved = profile.expertStatus === "APPROVED"
  const isRejected = profile.expertStatus === "REJECTED"

  function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedAffiliation = affiliation.trim()
    if (trimmedAffiliation.length < 2) {
      notify.error("Afiliasi atau lembaga adat minimal 2 karakter.")
      return
    }

    startTransition(async () => {
      try {
        const res = await updateExpertProfileAction({
          expertAffiliation: trimmedAffiliation,
          expertTrackRecord: trackRecord.trim() || null,
        })

        if (res.success) {
          notify.success(res.message || "Profil kepakaran berhasil diperbarui.")
          router.refresh()
        } else {
          notify.error(res.error || "Gagal memperbarui profil kepakaran.")
        }
      } catch {
        notify.error("Terjadi kesalahan sistem saat menyimpan pembaruan profil.")
      }
    })
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Kartu Status Verifikasi Kepakaran BBPST */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="rounded-3xl border-zinc-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-5 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-zinc-100 pb-5">
            <div className="space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#065F46] text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs max-w-full">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="break-words">
                      Terverifikasi Resmi oleh Balai Bahasa Provinsi Sulawesi Tengah
                    </span>
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold max-w-full">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Perlu Penyesuaian Dokumen Kepakaran</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 text-white px-3.5 py-1.5 text-xs font-bold max-w-full">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Menunggu Verifikasi Admin BBPST</span>
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#1E135E] break-words">
                  {profile.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-xs text-zinc-600">
                  <span className="inline-flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 text-[#3C22BB] shrink-0" />
                    {profile.email}
                  </span>
                  {profile.domicileRegency && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                      {profile.domicileRegency}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.expertProofFileUrl ? (
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 shrink-0 w-full lg:w-auto">
                <a
                  href={profile.expertProofFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold px-4 py-2.5 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Lihat Dokumen Kepakaran</span>
                </a>
                <a
                  href={profile.expertProofFileUrl}
                  download
                  className="min-h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold px-4 py-2.5 transition-colors"
                >
                  <Download className="w-4 h-4 shrink-0 text-[#065F46]" />
                  <span>Unduh Berkas</span>
                </a>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-[#FAFAF8] px-4 py-3 text-xs text-zinc-600 max-w-sm">
                <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#3C22BB] shrink-0" />
                  <span>Dokumen Kepakaran</span>
                </div>
                <p className="mt-1 leading-relaxed">
                  Akun kepakaran ditetapkan langsung melalui pendataan internal BBPST (tanpa berkas unggahan mandiri).
                </p>
              </div>
            )}
          </div>

          {/* Rincian Kepakaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFAF8] p-3.5 space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <Languages className="w-3.5 h-3.5 text-[#3C22BB] shrink-0" />
                <span>Bahasa Keahlian</span>
              </div>
              <div className="text-sm font-extrabold text-[#1E135E] break-words">
                {languageDisplay}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFAF8] p-3.5 space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <Building2 className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                <span>Afiliasi / Lembaga</span>
              </div>
              <div className="text-sm font-bold text-zinc-900 break-words">
                {profile.expertAffiliation || profile.institutionName || "-"}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFAF8] p-3.5 space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <Award className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                <span>Jenis Bukti Resmi</span>
              </div>
              <div className="text-sm font-bold text-zinc-900 break-words">
                {profile.expertProofType || "SK / Piagam Penetapan BBPST"}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFAF8] p-3.5 space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <FileCheck2 className="w-3.5 h-3.5 text-[#3C22BB] shrink-0" />
                <span>Nomor Sertifikat / SK</span>
              </div>
              <div className="text-sm font-mono font-bold text-zinc-900 break-all">
                {profile.expertProofNumber || "-"}
              </div>
            </div>
          </div>

          {profile.expertReviewNotes && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-[#065F46] leading-relaxed break-words">
              <strong>Catatan Tim Verifikator BBPST:</strong> {profile.expertReviewNotes}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Kartu Ringkasan Kontribusi Pakar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-500">
              Kosakata Terpublikasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3C22BB] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E135E]">
            {profile.stats.authoredPublishedCount} Lema
          </div>
          <Link
            href="/ahli-bahasa/kamus"
            className="min-h-11 inline-flex items-center gap-1 text-xs font-bold text-[#3C22BB] hover:underline"
          >
            <span>Buka Kamus Besar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-500">
              Rekaman Suara Penutur Jati
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#D97706]">
            {profile.stats.audioDocumentedCount} Audio
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Entri kamus dengan dokumentasi pelafalan asli yang telah disusun atau diverifikasi.
          </p>
        </Card>

        <Card className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-500">
              Kurasi Usulan Masyarakat
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#065F46] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#065F46]">
            {profile.stats.curatedProposalsCount} Usulan
          </div>
          <Link
            href="/ahli-bahasa/kurasi"
            className="min-h-11 inline-flex items-center gap-1 text-xs font-bold text-[#065F46] hover:underline"
          >
            <span>
              Antrean Menunggu ({profile.stats.pendingQueueCount})
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      {/* Formulir Pembaruan Profil Kepakaran */}
      <Card className="rounded-3xl border-zinc-200/90 bg-white p-4 sm:p-6 shadow-xs">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="border-b border-zinc-100 pb-3 space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#1E135E]">
              Pembaruan Informasi Kepakaran
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Perbarui nama afiliasi lembaga adat dan ringkasan rekam jejak kebahasaan Anda. Informasi afiliasi akan ditampilkan sebagai kredit verifikator resmi pada Kamus Besar.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expertAffiliation" className="text-xs font-bold text-zinc-800">
              Afiliasi / Lembaga Adat / Instansi <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="expertAffiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              disabled={isPending}
              required
              minLength={2}
              maxLength={150}
              placeholder="Misal: Lembaga Adat To Kaili / Pemerhati Bahasa Daerah BBPST"
              className="h-11 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expertTrackRecord" className="text-xs font-bold text-zinc-800">
              Ringkasan Rekam Jejak Kebahasaan &amp; Kearifan Lokal
            </Label>
            <Textarea
              id="expertTrackRecord"
              rows={4}
              value={trackRecord}
              onChange={(e) => setTrackRecord(e.target.value)}
              disabled={isPending}
              maxLength={2000}
              placeholder="Tuliskan pengalaman penelitian, penyusunan kamus, penyuluhan bahasa daerah, atau pelestarian tradisi lisan..."
              className="rounded-xl text-xs leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-zinc-500">
              Bahasa keahlian dan dokumen SK/sertifikat diverifikasi oleh Admin BBPST.
            </p>
            <Button
              type="submit"
              disabled={isPending}
              className="min-h-12 w-full sm:w-auto bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-bold px-5 gap-2 shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pembaruan Profil</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

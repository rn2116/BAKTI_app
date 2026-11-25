"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateInstitutionSettingsAction } from "@/actions/institution"
import type { InstitutionSettingsDTO } from "@/services/institution"
import { notify } from "@/lib/notify"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building2,
  FileSignature,
  MapPin,
  Mail,
  MessageCircle,
  Save,
  ShieldCheck,
  Loader2,
  Eye,
} from "lucide-react"

interface AdminInstitutionSettingsClientProps {
  initialSettings: InstitutionSettingsDTO
}

export function AdminInstitutionSettingsClient({
  initialSettings,
}: AdminInstitutionSettingsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [signerTitle, setSignerTitle] = useState(initialSettings.signerTitle)
  const [signerName, setSignerName] = useState(initialSettings.signerName)
  const [signerNip, setSignerNip] = useState(initialSettings.signerNip)
  const [cityName, setCityName] = useState(initialSettings.cityName)
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail)
  const [contactWhatsapp, setContactWhatsapp] = useState(initialSettings.contactWhatsapp)

  const previewDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData()
    formData.set("signerTitle", signerTitle)
    formData.set("signerName", signerName)
    formData.set("signerNip", signerNip)
    formData.set("cityName", cityName)
    formData.set("contactEmail", contactEmail)
    formData.set("contactWhatsapp", contactWhatsapp)

    startTransition(async () => {
      try {
        const res = await updateInstitutionSettingsAction(null, formData)
        if (res.success) {
          notify.success(res.message || "Pengaturan instansi berhasil disimpan.")
          router.refresh()
        } else {
          notify.error(res.error || "Gagal memperbarui pengaturan instansi.")
        }
      } catch {
        notify.error("Terjadi kesalahan sistem saat menyimpan pengaturan instansi.")
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Formulir Pengaturan */}
      <Card className="lg:col-span-7 rounded-3xl border-zinc-200/90 bg-white p-5 sm:p-7 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1 pb-4 border-b border-zinc-100">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3C22BB]">
              <FileSignature className="w-3.5 h-3.5" />
              <span>Konfigurasi Resmi Sertifikat &amp; Narahubung</span>
            </div>
            <h2 className="text-lg font-black text-[#1E135E]">
              Identitas Penandatangan &amp; Kontak BBPST
            </h2>
            <p className="text-xs text-zinc-500">
              Perubahan data ini langsung diterapkan pada penerbitan sertifikat PDF/PNG serta notifikasi konfirmasi pendaftar Ahli Bahasa Daerah.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signerTitle" className="text-xs font-bold text-zinc-800">
                Jabatan Penandatangan <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="signerTitle"
                name="signerTitle"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="Kepala Balai Bahasa Provinsi Sulawesi Tengah"
                required
                disabled={isPending}
                className="h-11 rounded-xl text-xs"
              />
              <p className="text-[11px] text-zinc-400">
                Contoh: Kepala Balai Bahasa Provinsi Sulawesi Tengah atau Plt. Kepala Balai Bahasa Provinsi Sulawesi Tengah
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="signerName" className="text-xs font-bold text-zinc-800">
                  Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="signerName"
                  name="signerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Dr. Asrif, M.Hum."
                  required
                  disabled={isPending}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signerNip" className="text-xs font-bold text-zinc-800">
                  NIP Penandatangan <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="signerNip"
                  name="signerNip"
                  value={signerNip}
                  onChange={(e) => setSignerNip(e.target.value)}
                  placeholder="197412152002121002"
                  required
                  disabled={isPending}
                  className="h-11 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cityName" className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                Kota Penerbitan Sertifikat <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cityName"
                name="cityName"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Palu"
                required
                disabled={isPending}
                className="h-11 rounded-xl text-xs sm:max-w-xs"
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail" className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  Alamat Surel Resmi BBPST <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="balaibahasasulteng@kemdikdasmen.go.id"
                  required
                  disabled={isPending}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactWhatsapp" className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#065F46]" />
                  Nomor WhatsApp Narahubung <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="contactWhatsapp"
                  name="contactWhatsapp"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder="628110000000"
                  required
                  disabled={isPending}
                  className="h-11 rounded-xl text-xs font-mono"
                />
                <p className="text-[11px] text-zinc-400">
                  Awali dengan kode negara 62 (contoh: 628114567890).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-100">
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#065F46]" />
              <span>Disimpan terpusat di MySQL (tanpa ubah berkas .env)</span>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="min-h-12 bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-bold px-6 gap-2 shadow-xs w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Instansi</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Pratinjau Langsung Blok Tanda Tangan Sertifikat */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="rounded-3xl border-indigo-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1E135E]">
              <Eye className="w-4 h-4 text-[#3C22BB]" />
              <span>Pratinjau Blok Tanda Tangan Sertifikat</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-100">
              Langsung
            </span>
          </div>

          <div className="rounded-2xl border-2 border-[#3C22BB]/30 bg-[#FAFAF8] p-6 text-center space-y-4">
            <div className="text-xs text-zinc-600 space-y-1">
              <p className="font-medium">
                {cityName.trim() || "Palu"}, {previewDate}
              </p>
              <p className="font-semibold text-zinc-800 break-words">
                {signerTitle.trim() || "Kepala Balai Bahasa Provinsi Sulawesi Tengah"}
              </p>
            </div>

            <div className="mx-auto max-w-[230px] rounded-lg border border-[#3C22BB] bg-white px-3 py-2.5">
              <div className="text-[11px] font-black tracking-wide text-[#3C22BB]">
                TERTANDA TANGAN ELEKTRONIK
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5">
                Sertifikasi Otomatis Sistem Pembelajaran BAKTI
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-black text-zinc-900 break-words">
                {signerName.trim() || "Dr. Asrif, M.Hum."}
              </div>
              <div className="text-xs text-zinc-500 font-mono">
                NIP. {signerNip.trim() || "197412152002121002"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 space-y-2 text-xs">
            <div className="font-bold text-[#065F46] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Ringkasan Kontak Narahubung BBPST</span>
            </div>
            <div className="text-[11px] text-zinc-700 space-y-1">
              <p className="truncate">
                Surel: <strong className="font-semibold">{contactEmail || "-"}</strong>
              </p>
              <p>
                WhatsApp:{" "}
                <strong className="font-mono">
                  {contactWhatsapp.replace(/\D/g, "") || "-"}
                </strong>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

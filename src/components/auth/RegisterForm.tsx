"use client"

import { useState, useRef, FormEvent } from "react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { register } from "@/actions/auth"
import { SULTENG_DOMICILE_OPTIONS, PARTICIPANT_CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Mail,
  Lock,
  MapPin,
  Briefcase,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  Award,
  Languages,
  Upload,
  FileCheck2,
  Loader2,
  Clock,
  MessageCircle,
  CheckCircle2,
} from "lucide-react"

interface LanguageOption {
  code: string
  name: string
}

interface RegisterFormProps {
  languages: LanguageOption[]
}

const PROOF_TYPES = [
  "Sertifikat Kompetensi Kebahasaan",
  "Piagam Penghargaan Pelestarian Bahasa Daerah",
  "SK Penetapan Balai Bahasa / Instansi Terkait",
  "Surat Keterangan Lembaga Adat / Komunitas",
] as const

export default function RegisterForm({ languages }: RegisterFormProps) {
  const [accountType, setAccountType] = useState<"SISWA" | "AHLI_BAHASA">("SISWA")
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // State khusus pendaftaran Ahli Bahasa Daerah
  const [selectedLangChoice, setSelectedLangChoice] = useState(languages[0]?.name ?? "Bahasa Kaili")
  const [customLanguageName, setCustomLanguageName] = useState("")
  const [proofFileUrl, setProofFileUrl] = useState("")
  const [proofFileName, setProofFileName] = useState("")
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)

  // State hasil sukses pendaftaran Ahli Bahasa (menunggu persetujuan)
  const [expertSuccess, setExpertSuccess] = useState<{
    whatsappUrl: string
    contactEmail: string
    applicantName: string
    expertLanguage: string
    expertProofNumber: string
  } | null>(null)

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran berkas bukti kepakaran maksimal 5 MB.")
      return
    }

    setIsUploadingDoc(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/dokumen-ahli", {
        method: "POST",
        body: fd,
      })
      const data = (await res.json()) as {
        success?: boolean
        url?: string
        filename?: string
        error?: string
      }

      if (!res.ok || !data.success || !data.url) {
        toast.error(data.error ?? "Gagal mengunggah dokumen bukti kepakaran.")
        return
      }

      setProofFileUrl(data.url)
      setProofFileName(file.name)
      toast.success("Dokumen bukti kepakaran berhasil diunggah.")
    } catch {
      toast.error("Terjadi kesalahan jaringan saat mengunggah dokumen.")
    } finally {
      setIsUploadingDoc(false)
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (accountType === "AHLI_BAHASA" && !proofFileUrl) {
      toast.error("Harap unggah dokumen bukti kepakaran (PDF, JPG, atau PNG) terlebih dahulu.")
      return
    }

    setPending(true)
    const formData = new FormData(event.currentTarget)
    formData.set("accountType", accountType)

    if (accountType === "AHLI_BAHASA") {
      const resolvedLang =
        selectedLangChoice === "__LAINNYA__"
          ? customLanguageName.trim()
          : selectedLangChoice
      formData.set("expertLanguage", resolvedLang)
      formData.set("expertProofFileUrl", proofFileUrl)
    }

    const result = await register(null, formData)
    setPending(false)

    if (!result) return

    if (result.pendingExpertApproval && result.whatsappUrl) {
      setExpertSuccess({
        whatsappUrl: result.whatsappUrl,
        contactEmail: result.contactEmail ?? "balaibahasasulteng@kemdikdasmen.go.id",
        applicantName: result.applicantName ?? "",
        expertLanguage: result.expertLanguage ?? "",
        expertProofNumber: result.expertProofNumber ?? "",
      })
      return
    }

    if (result.error) {
      toast.error(result.error)
    }
  }

  if (expertSuccess) {
    return (
      <div className="space-y-5 py-2 text-center sm:text-left">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              Menunggu Persetujuan Admin BBPST
            </div>
            <h2 className="text-base font-black text-zinc-900">
              Pendaftaran Ahli Bahasa Daerah Terkirim
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Terima kasih, <strong>{expertSuccess.applicantName}</strong>. Pengajuan Anda telah dicatat oleh sistem dan dikirimkan sebagai pemberitahuan ke Admin Balai Bahasa Provinsi Sulawesi Tengah ({expertSuccess.contactEmail}).
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-zinc-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Bahasa Daerah Keahlian</span>
            <strong className="text-[#1E135E]">{expertSuccess.expertLanguage}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Nomor Bukti Kepakaran</span>
            <strong className="font-mono text-zinc-900">{expertSuccess.expertProofNumber}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Status Verifikasi</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
              Menunggu Verifikasi
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href={expertSuccess.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#065F46] hover:bg-[#044a36] text-white h-11 px-4 text-xs font-bold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi &amp; Konfirmasi via WhatsApp BBPST</span>
          </a>

          <Link
            href="/masuk"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 h-10 px-4 text-xs font-bold transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-[#3C22BB]" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Pilihan Jenis Pendaftaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-100 border border-zinc-200/80">
        <button
          type="button"
          onClick={() => setAccountType("SISWA")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            accountType === "SISWA"
              ? "bg-[#3C22BB] text-white shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Daftar sebagai Peserta Umum
        </button>
        <button
          type="button"
          onClick={() => setAccountType("AHLI_BAHASA")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            accountType === "AHLI_BAHASA"
              ? "bg-[#065F46] text-white shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Daftar sebagai Ahli Bahasa Daerah
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-xs font-bold text-zinc-700">
          Nama Lengkap
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="fullName"
            name="fullName"
            placeholder="Contoh: Andi Wijaya Tadulako"
            className="pl-10 h-11 text-xs rounded-xl border-zinc-200 focus:border-[#3C22BB] focus:ring-[#3C22BB]"
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-zinc-700">
            Surel (Email)
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@surel.id"
              className="pl-10 h-11 text-xs rounded-xl border-zinc-200 focus:border-[#3C22BB] focus:ring-[#3C22BB]"
              required
              disabled={pending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold text-zinc-700">
            Kata Sandi
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              className="pl-10 pr-10 h-11 text-xs rounded-xl border-zinc-200 focus:border-[#3C22BB] focus:ring-[#3C22BB]"
              required
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Domisili & Kategori Peserta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="domicileRegency" className="text-xs font-bold text-zinc-700 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Kabupaten/Kota Domisili
          </Label>
          <select
            id="domicileRegency"
            name="domicileRegency"
            defaultValue="Kota Palu"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 h-11 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
            required
            disabled={pending}
          >
            {SULTENG_DOMICILE_OPTIONS.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="participantCategory" className="text-xs font-bold text-zinc-700 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Kategori Peserta
          </Label>
          <select
            id="participantCategory"
            name="participantCategory"
            defaultValue={accountType === "AHLI_BAHASA" ? "Pegiat Bahasa & Kearifan Lokal" : "Masyarakat Umum"}
            key={accountType}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 h-11 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
            required
            disabled={pending}
          >
            {PARTICIPANT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="institutionName" className="text-xs font-bold text-zinc-700 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-zinc-400" /> Asal Instansi / Sekolah / Komunitas{" "}
          <span className="font-normal text-zinc-400">(Opsional)</span>
        </Label>
        <Input
          id="institutionName"
          name="institutionName"
          placeholder="Contoh: Universitas Tadulako / SMP Negeri 1 Palu / Komunitas Adat"
          className="h-11 text-xs rounded-xl border-zinc-200"
          disabled={pending}
        />
      </div>

      {/* Kolom Verifikasi Khusus Pendaftar Ahli Bahasa Daerah */}
      {accountType === "AHLI_BAHASA" && (
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#065F46]">
            <Award className="w-4 h-4" />
            <span>Verifikasi Kepakaran Bahasa Daerah (Wajib)</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expertLanguageChoice" className="text-xs font-bold text-zinc-700 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-zinc-400" /> Bahasa Daerah Keahlian
            </Label>
            <select
              id="expertLanguageChoice"
              value={selectedLangChoice}
              onChange={(e) => setSelectedLangChoice(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 h-10 text-xs text-zinc-800"
              disabled={pending}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.name}>
                  {lang.name}
                </option>
              ))}
              <option value="__LAINNYA__">+ Usulkan Bahasa Daerah Baru di Sulawesi Tengah</option>
            </select>

            {selectedLangChoice === "__LAINNYA__" && (
              <Input
                value={customLanguageName}
                onChange={(e) => setCustomLanguageName(e.target.value)}
                placeholder="Tuliskan nama bahasa daerah usulan, misal: Bahasa Dampelas"
                className="h-10 text-xs rounded-xl bg-white mt-2"
                required
                disabled={pending}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expertAffiliation" className="text-xs font-bold text-zinc-700">
              Afiliasi / Lembaga / Komunitas Adat
            </Label>
            <Input
              id="expertAffiliation"
              name="expertAffiliation"
              placeholder="Contoh: Penyuluh Bahasa Daerah / Akademisi / Lembaga Adat To Kaili"
              className="h-10 text-xs rounded-xl bg-white"
              required
              disabled={pending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expertProofType" className="text-xs font-bold text-zinc-700">
                Jenis Bukti Kepakaran
              </Label>
              <select
                id="expertProofType"
                name="expertProofType"
                defaultValue={PROOF_TYPES[0]}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 h-10 text-xs text-zinc-800"
                required
                disabled={pending}
              >
                {PROOF_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expertProofNumber" className="text-xs font-bold text-zinc-700">
                Nomor Sertifikat / Piagam / SK
              </Label>
              <Input
                id="expertProofNumber"
                name="expertProofNumber"
                placeholder="Contoh: SK-BBPST-2026-014"
                className="h-10 text-xs rounded-xl bg-white"
                required
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700">
              Unggah Dokumen Bukti Kepakaran (PDF, JPG, atau PNG maks. 5 MB)
            </Label>
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleDocUpload}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingDoc || pending}
                onClick={() => docInputRef.current?.click()}
                className="h-10 rounded-xl border-emerald-300 bg-white text-[#065F46] hover:bg-emerald-50 text-xs font-bold gap-2"
              >
                {isUploadingDoc ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunggah Berkas...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{proofFileUrl ? "Ganti Dokumen Bukti" : "Unggah Dokumen Bukti"}</span>
                  </>
                )}
              </Button>

              {proofFileUrl && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200 truncate max-w-full">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{proofFileName || "Dokumen terunggah"}</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expertTrackRecord" className="text-xs font-bold text-zinc-700">
              Ringkasan Rekam Jejak / Karya Kebahasaan{" "}
              <span className="font-normal text-zinc-500">(Opsional)</span>
            </Label>
            <Textarea
              id="expertTrackRecord"
              name="expertTrackRecord"
              rows={2}
              placeholder="Tuliskan karya tulis, kamus, penelitian, atau pengalaman pelestarian bahasa daerah..."
              className="text-xs rounded-xl bg-white"
              disabled={pending}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={pending || isUploadingDoc}
        className={`w-full h-11 rounded-xl text-white font-bold text-xs shadow-sm gap-2 transition-all mt-2 ${
          accountType === "AHLI_BAHASA"
            ? "bg-[#065F46] hover:bg-[#044a36]"
            : "bg-[#3C22BB] hover:bg-[#2E1994]"
        }`}
      >
        <span>
          {pending
            ? "Memproses Pendaftaran..."
            : accountType === "AHLI_BAHASA"
              ? "Ajukan Pendaftaran Ahli Bahasa Daerah"
              : "Daftar Akun Peserta"}
        </span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  )
}

import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { getRegionalLanguageLabelMap } from "@/services/regionalLanguageService"
import { CATEGORY_LABELS } from "@/lib/constants"
import {
  CheckCircle2,
  XCircle,
  Award,
  School,
  Calendar,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react"

export const dynamic = "force-dynamic"

interface VerifikasiPageProps {
  params: Promise<{
    kode: string
  }>
}

interface VerifiedCertificateDisplay {
  certificateNo: string
  studentName: string
  nisn: string | null
  schoolName: string
  regencyName: string
  competenceTitle: string
  competenceSub: string
  evaluationText: string
  issuedAt: Date
}

export default async function VerifikasiSertifikatPage({
  params,
}: VerifikasiPageProps) {
  const { kode } = await params
  const kodeSertifikat = decodeURIComponent(kode || "").trim()

  const [materialCert, regionalCert, languageLabelMap] = await Promise.all([
    prisma.userCertificate.findUnique({
      where: { certificateNo: kodeSertifikat },
      include: {
        user: {
          select: {
            fullName: true,
            nisn: true,
            domicileRegency: true,
            participantCategory: true,
            institutionName: true,
            school: {
              select: {
                name: true,
                regency: { select: { name: true } },
              },
            },
          },
        },
        material: {
          select: {
            title: true,
            category: true,
          },
        },
        quizAttempt: {
          select: {
            score: true,
            maxScore: true,
          },
        },
      },
    }),
    prisma.sertifikat.findUnique({
      where: { nomorSertifikat: kodeSertifikat },
      include: {
        user: {
          select: {
            fullName: true,
            nisn: true,
            domicileRegency: true,
            participantCategory: true,
            institutionName: true,
            school: {
              select: {
                name: true,
                regency: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    getRegionalLanguageLabelMap(),
  ])

  let certificate: VerifiedCertificateDisplay | null = null
  if (materialCert) {
    const categoryLabel =
      CATEGORY_LABELS[materialCert.material.category as keyof typeof CATEGORY_LABELS] ??
      materialCert.material.category.replace(/_/g, " ")
    certificate = {
      certificateNo: materialCert.certificateNo,
      studentName: materialCert.user.fullName,
      nisn: materialCert.user.nisn,
      schoolName:
        materialCert.user.institutionName ||
        materialCert.user.school?.name ||
        materialCert.user.participantCategory ||
        "Masyarakat Umum",
      regencyName:
        materialCert.user.domicileRegency ||
        materialCert.user.school?.regency?.name ||
        "Provinsi Sulawesi Tengah",
      competenceTitle: materialCert.material.title,
      competenceSub: `Kategori: ${categoryLabel}`,
      evaluationText: `LULUS (${materialCert.quizAttempt.score} / ${materialCert.quizAttempt.maxScore} Poin)`,
      issuedAt: materialCert.issuedAt,
    }
  } else if (regionalCert) {
    const langName =
      languageLabelMap[regionalCert.bahasaDaerah] ?? regionalCert.bahasaDaerah
    certificate = {
      certificateNo: regionalCert.nomorSertifikat,
      studentName: regionalCert.user.fullName,
      nisn: regionalCert.user.nisn,
      schoolName:
        regionalCert.user.institutionName ||
        regionalCert.user.school?.name ||
        regionalCert.user.participantCategory ||
        "Masyarakat Umum",
      regencyName:
        regionalCert.user.domicileRegency ||
        regionalCert.user.school?.regency?.name ||
        "Provinsi Sulawesi Tengah",
      competenceTitle: `Penguasaan ${langName} & Nilai Karakter`,
      competenceSub: "Sertifikasi Modul 3 Tahap Kearifan Lokal Sulawesi Tengah (BBPST)",
      evaluationText: `LULUS (Skor Akhir: ${regionalCert.skorAkhir} / 100)`,
      issuedAt: regionalCert.tanggalTerbit,
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header Publik */}
      <header className="max-w-3xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-zinc-200">
        <BrandLogo light={false} size="sm" />
        <Link
          href="/masuk"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#3C22BB] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shrink-0"
        >
          <span>Masuk Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container Kartu Verifikasi */}
      <main className="max-w-2xl w-full mx-auto my-8">
        {certificate ? (
          <div className="rounded-3xl bg-white border border-zinc-200/90 shadow-lg overflow-hidden">
            {/* Header Sertifikat Berwarna Royal Indigo */}
            <div className="bg-gradient-to-r from-[#1E135E] via-[#3C22BB] to-[#0284C7] p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-xs font-bold backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>SERTIFIKAT SAH & TERVERIFIKASI</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  Verifikasi Sertifikat Digital
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100/90 font-medium leading-relaxed">
                  Diterbitkan secara sah oleh Balai Bahasa Provinsi Sulawesi Tengah untuk kompetensi literasi dan karakter generasi muda.
                </p>
              </div>

              {/* Ornamen Latar */}
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <Award className="w-48 h-48 text-white" />
              </div>
            </div>

            {/* Badan Data Sertifikat */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Status Sukses Besar */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-emerald-900">
                    Dokumen Asli Terdaftar
                  </div>
                  <div className="text-xs text-emerald-700">
                    Nomor Registrasi: <span className="font-mono font-bold">{certificate.certificateNo}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Peserta & Prestasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Nama Penerima
                  </span>
                  <div className="text-base font-black text-zinc-900">
                    {certificate.studentName}
                  </div>
                  {certificate.nisn && (
                    <div className="text-xs text-zinc-500 font-mono">
                      NISN: {certificate.nisn}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Asal Daerah / Instansi</span>
                  </span>
                  <div className="text-sm font-bold text-zinc-900">
                    {certificate.schoolName}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {certificate.regencyName}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Kompetensi / Materi Pembelajaran</span>
                  </span>
                  <div className="text-base font-bold text-[#3C22BB]">
                    {certificate.competenceTitle}
                  </div>
                  <div className="text-xs text-zinc-600">
                    {certificate.competenceSub}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Evaluasi Kuis
                  </span>
                  <div className="text-sm font-bold text-emerald-800">
                    {certificate.evaluationText}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Tanggal Terbit</span>
                  </span>
                  <div className="text-sm font-bold text-zinc-900">
                    {new Date(certificate.issuedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Penegasan Keabsahan */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed space-y-1">
                <div className="font-bold">Keabsahan Dokumen Digital:</div>
                <p className="text-indigo-800/90 text-[11px]">
                  Sertifikat elektronik ini diterbitkan secara otomatis oleh sistem pembelajaran BAHASA & KARAKTER Balai Bahasa Provinsi Sulawesi Tengah berdasarkan riwayat belajar dan evaluasi autentik.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-red-200 shadow-md p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">
                Sertifikat Tidak Ditemukan
              </h1>
              <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                Nomor sertifikat <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{kodeSertifikat || "-"}</span> tidak terdaftar dalam pangkalan data resmi Balai Bahasa Provinsi Sulawesi Tengah.
              </p>
            </div>

            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Pastikan Anda memindai kode QR asli atau memeriksa kembali nomor registrasi yang tercantum pada sertifikat fisik/digital Anda.
            </p>

            <div className="pt-4">
              <Link
                href="/masuk"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Kunjungi Portal Utama</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer Resmi */}
      <footer className="max-w-3xl w-full mx-auto text-center pt-6 border-t border-zinc-200 space-y-1">
        <p className="text-xs font-bold text-zinc-700">
          Balai Bahasa Provinsi Sulawesi Tengah
        </p>
        <p className="text-[11px] text-zinc-500">
          Kementerian Pendidikan Dasar dan Menengah Republik Indonesia
        </p>
      </footer>
    </div>
  )
}

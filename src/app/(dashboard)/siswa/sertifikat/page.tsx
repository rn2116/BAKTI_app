import nextDynamic from "next/dynamic"
import { getCurrentUser } from "@/lib/auth"
import { getUserCertificates, getUserRegionalCertificates } from "@/services/user"
import { getRegionalLanguageLabelMap } from "@/services/regionalLanguageService"
import { getInstitutionSettings } from "@/services/institution"
import { PageHeader } from "@/components/shared/PageHeader"
import { BadgeCard } from "@/components/gamification/BadgeCard"
import { Card, CardContent } from "@/components/ui/card"
import { Award, ShieldCheck, ExternalLink, Compass } from "lucide-react"
import Link from "next/link"

const PrintCertificateButton = nextDynamic(
  () =>
    import("@/components/siswa/PrintCertificateButton").then(
      (mod) => mod.PrintCertificateButton
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-9 w-full rounded-xl bg-zinc-100 animate-pulse" />
    ),
  }
)

export default async function SertifikatSiswaPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [regionalCertificates, certificates, languageLabelMap, instSettings] = await Promise.all([
    getUserRegionalCertificates(user.id),
    getUserCertificates(user.id),
    getRegionalLanguageLabelMap(),
    getInstitutionSettings(),
  ])

  const hasAnyCertificate = regionalCertificates.length > 0 || certificates.length > 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sertifikat Saya"
        description="Unduh sertifikat digital penguasaan bahasa daerah Sulawesi Tengah dan materi literasi yang telah Anda tuntaskan."
      />

      {/* Sertifikat Penguasaan Bahasa Daerah BBPST */}
      {regionalCertificates.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#D97706]" />
            <h2 className="text-sm font-bold text-[#1E135E] uppercase tracking-wider">
              Sertifikat Penguasaan Bahasa Daerah (BBPST)
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regionalCertificates.map((rc) => {
              const langName =
                languageLabelMap[rc.bahasaDaerah] ?? rc.bahasaDaerah
              const moduleTitle = `Penguasaan ${langName} & Nilai Karakter`
              return (
                <Card
                  key={rc.id}
                  className="group relative overflow-hidden rounded-2xl border-indigo-200/80 bg-gradient-to-br from-white via-[#FAFAF8] to-indigo-50/40 shadow-xs"
                >
                  <CardContent className="p-5 flex flex-col h-full space-y-4">
                    <div className="bg-white rounded-xl px-3 py-2 border border-zinc-200/80 flex items-center justify-center">
                      <img
                        src="/images/logo-bbpst-kemendikdasmen.png"
                        alt="Logo Kemendikdasmen — Balai Bahasa Provinsi Sulawesi Tengah"
                        className="h-12 w-auto object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-[#065F46]">
                        <ShieldCheck className="w-3 h-3" />
                        Terverifikasi QR
                      </span>
                      <span className="text-xs font-extrabold text-[#3C22BB] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        Skor {rc.skorAkhir}/100
                      </span>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Sertifikat Kompetensi Daerah
                      </div>
                      <h3 className="text-lg font-extrabold text-[#1E135E] leading-snug">
                        {langName}
                      </h3>
                      <div className="text-xs font-mono text-zinc-600 break-all">
                        No: {rc.nomorSertifikat}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Terbit:{" "}
                        {new Date(rc.tanggalTerbit).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <PrintCertificateButton
                        certificateNo={rc.nomorSertifikat}
                        studentName={user.fullName}
                        materialTitle={moduleTitle}
                        issuedAt={rc.tanggalTerbit}
                        finalScore={rc.skorAkhir}
                        signerTitle={instSettings.signerTitle}
                        signerName={instSettings.signerName}
                        signerNip={instSettings.signerNip}
                        cityName={instSettings.cityName}
                      />
                      <Link
                        href={`/verifikasi/${encodeURIComponent(rc.nomorSertifikat)}`}
                        className="inline-flex items-center justify-center gap-1 w-full text-[11px] font-bold text-[#3C22BB] hover:underline py-1"
                      >
                        <span>Lihat Halaman Verifikasi Publik</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Sertifikat Materi Literasi */}
      {(certificates.length > 0 || !hasAnyCertificate) && (
        <section className="space-y-4">
          {certificates.length > 0 && regionalCertificates.length > 0 && (
            <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
              Sertifikat Modul Literasi &amp; Karakter
            </h2>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {certificates.length > 0 ? (
              certificates.map((c) => (
                <Card key={c.id} className="group relative overflow-hidden rounded-2xl">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        📜
                      </div>
                      <BadgeCard
                        name={c.material.title}
                        earned
                        earnedAt={c.issuedAt}
                      />
                    </div>
                    <div className="flex-1 mb-4">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Sertifikat Kelulusan
                      </div>
                      <div className="text-lg font-bold">{c.material.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        Nomor: {c.certificateNo}
                      </div>
                    </div>
                    <div className="mt-auto">
                      <PrintCertificateButton
                        certificateNo={c.certificateNo}
                        studentName={user.fullName}
                        materialTitle={c.material.title}
                        issuedAt={c.issuedAt}
                        signerTitle={instSettings.signerTitle}
                        signerName={instSettings.signerName}
                        signerNip={instSettings.signerNip}
                        cityName={instSettings.cityName}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              !hasAnyCertificate && (
                <Card className="col-span-full rounded-2xl">
                  <CardContent className="py-16 text-center space-y-4">
                    <Award className="w-12 h-12 text-indigo-300 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[#1E135E]">
                        Belum Ada Sertifikat Digital
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto">
                        Tuntaskan 3 tahap modul bahasa daerah (Kartu Ungkapan, Gim Mencocokkan, dan Kuis Evaluasi) atau selesaikan materi literasi untuk meraih sertifikat resmi ber-QR BBPST.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      <Link
                        href="/siswa/belajar-bahasa/KAILI"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white px-4 py-2 text-xs font-bold transition-colors"
                      >
                        <Compass className="w-4 h-4" />
                        Mulai Modul Bahasa Kaili
                      </Link>
                      <Link
                        href="/siswa/materi"
                        className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-xs font-bold hover:bg-accent transition-colors"
                      >
                        Lihat Katalog Materi
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </section>
      )}

      {/* Footer Kredit Resmi Sertifikat */}
      <div className="pt-6 border-t border-zinc-200/80 text-center space-y-1">
        <p className="text-xs font-bold text-zinc-700">
          Sertifikat Elektronik Resmi Platform Pembelajaran BAHASA & KARAKTER
        </p>
        <p className="text-[11px] text-zinc-500">
          Bakti by Balai Bahasa Provinsi Sulawesi Tengah • Kementerian Pendidikan Dasar dan Menengah RI
        </p>
      </div>
    </div>
  )
}

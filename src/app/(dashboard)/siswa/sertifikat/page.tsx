import { getCurrentUser } from "@/lib/auth"
import { getUserCertificates } from "@/services/user"
import { PageHeader } from "@/components/shared/PageHeader"
import { BadgeCard } from "@/components/gamification/BadgeCard"
import { Card, CardContent } from "@/components/ui/card"
import { PrintCertificateButton } from "@/components/siswa/PrintCertificateButton"
import Link from "next/link"

export default async function SertifikatSiswaPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const certificates = await getUserCertificates(user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sertifikat Saya"
        description="Unduh sertifikat digital materi yang telah Anda selesaikan."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {certificates.length > 0 ? (
          certificates.map((c) => (
            <Card key={c.id} className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Sertifikat Kelulusan
                  </div>
                  <div className="text-lg font-bold">{c.material.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Nomor: {c.certificateNo}
                  </div>
                </div>
                <div className="mt-auto">
                  <PrintCertificateButton />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-3">
            <CardContent className="py-20 text-center">
              <h3 className="text-lg font-semibold">Belum ada sertifikat</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Selesaikan materi dan lulus kuis untuk mendapatkan sertifikat digital.
              </p>
              <Link
                href="/siswa/materi"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Lihat Katalog Materi
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

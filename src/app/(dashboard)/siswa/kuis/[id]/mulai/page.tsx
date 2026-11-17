import { getCurrentUser } from "@/lib/auth"
import { getQuizById } from "@/services/quiz"
import { InteractiveQuizRunner } from "@/components/quiz/InteractiveQuizRunner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function KuisMulaiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const quiz = await getQuizById(id)

  if (!quiz) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold text-zinc-900">Kuis tidak ditemukan</h1>
        <p className="text-xs text-zinc-500">
          Paket kuis mungkin telah dihapus atau belum dipublikasikan oleh guru.
        </p>
        <Link
          href="/siswa/kuis"
          className="inline-flex items-center gap-2 rounded-xl bg-[#3C22BB] text-white px-4 py-2 text-xs font-bold hover:bg-[#2E1994] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tombol Navigasi Keluar Mode Kuis */}
      <div className="max-w-2xl mx-auto flex items-center justify-between text-xs font-bold text-zinc-500">
        <Link
          href="/siswa/kuis"
          className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-[#3C22BB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Keluar dari Kuis
        </Link>
        <span className="text-[11px] font-semibold text-zinc-400">Mode Fokus Ujian</span>
      </div>

      <InteractiveQuizRunner quiz={quiz} />
    </div>
  )
}

import { getCurrentUser } from "@/lib/auth"
import { getPublishedQuizzes, getUserQuizAttempts } from "@/services/quiz"
import { PageHeader } from "@/components/shared/PageHeader"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Clock, HelpCircle, Trophy, Sparkles, CheckCircle2, ChevronRight } from "lucide-react"

export default async function KuisSiswaPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [quizzes, attempts] = await Promise.all([
    getPublishedQuizzes(),
    getUserQuizAttempts(user.id),
  ])

  // Map skor terbaik per kuis
  const bestAttemptMap = new Map<string, { score: number; maxScore: number; passed: boolean }>()
  attempts.forEach((att) => {
    const existing = bestAttemptMap.get(att.quizId)
    if (!existing || att.score > existing.score) {
      bestAttemptMap.set(att.quizId, {
        score: att.score,
        maxScore: att.maxScore,
        passed: att.passed,
      })
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuis Interaktif & Bank Soal"
        description="Uji wawasan literasi dan budi pekerti Anda dalam mode fokus berwaktu untuk meraih skor terbaik dan lencana kehormatan."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((q) => {
          const attempt = bestAttemptMap.get(q.id)

          return (
            <Card
              key={q.id}
              className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <CategoryBadge category={q.category} />
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-500" /> +{q.xpReward} XP
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#3C22BB] transition-colors">
                  {q.title}
                </h3>

                {q.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {q.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{q.timeLimit} Menit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{q._count.questions} Butir Soal</span>
                  </div>
                </div>

                {/* Riwayat Skor Terbaik Siswa */}
                {attempt && (
                  <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> Skor Terbaik:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-zinc-800">
                        {attempt.score}/{attempt.maxScore}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          attempt.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {attempt.passed ? "Lulus ✓" : "Remidi"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 flex flex-col gap-2">
                <Link
                  href={`/siswa/kuis/${q.id}/mulai`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white py-2.5 px-4 text-xs font-bold transition-all shadow-xs"
                >
                  <span>{attempt?.passed ? "Uji Coba Ulang" : "Mulai Kuis Sekarang"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                {q.regionalLanguage && (
                  <Link
                    href={`/siswa/belajar-bahasa/${q.regionalLanguage}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3C22BB] py-2 px-3 text-[11px] font-bold transition-colors border border-indigo-200/80"
                  >
                    <span>Alur Belajar 3 Tahap (Kartu & Latihan)</span>
                  </Link>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {quizzes.length === 0 && (
        <div className="p-16 text-center rounded-2xl border border-dashed border-zinc-200 bg-white shadow-xs">
          <HelpCircle className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-zinc-700">Belum ada paket kuis</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Kuis interaktif akan muncul segera setelah diterbitkan oleh guru.
          </p>
        </div>
      )}
    </div>
  )
}

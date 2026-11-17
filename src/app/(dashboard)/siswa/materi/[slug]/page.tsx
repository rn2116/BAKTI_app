import { getCurrentUser } from "@/lib/auth"
import { getMaterialBySlug, getMaterialProgress } from "@/services/material"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { SultengIllustration, getThemeByIndexAndCategory } from "@/components/shared/SultengIllustration"
import { ReadingViewClient } from "@/components/siswa/ReadingViewClient"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Clock, BookOpen, ChevronRight, Sparkles } from "lucide-react"

export default async function MateriDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const material = await getMaterialBySlug(slug)
  if (!material) return null

  const progress = await getMaterialProgress(user.id, material.id)
  const isDone = progress?.status === "SELESAI"

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tombol Kembali & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
        <Link
          href="/siswa/materi"
          className="inline-flex items-center gap-1 text-[#3C22BB] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Katalog Materi
        </Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[200px]">{material.title}</span>
      </div>

      {/* Header Visual Materi dengan Ilustrasi Sulteng */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
        <SultengIllustration
          theme={getThemeByIndexAndCategory(material.category, material.orderIndex)}
          className="h-44 sm:h-52"
        />
        <div className="p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CategoryBadge category={material.category} />
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-zinc-400" /> {material.readingTime} Menit Baca
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> +100 XP
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-snug">
            {material.title}
          </h1>

          <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
            {material.description}
          </p>
        </div>
      </div>

      {/* Komponen Bacaan Utama dengan Top Scroll Progress & Klaim Poin */}
      <ReadingViewClient
        materialId={material.id}
        initialIsDone={isDone}
        title={material.title}
        contentHtml={material.content}
      />

      {/* Kuis Terkait Materi Ini (Jika Ada) */}
      {material.quizzes.length > 0 && (
        <Card className="rounded-3xl border-zinc-200/90 bg-white p-6 shadow-xs space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#3C22BB]" /> Uji Pemahaman: Kuis Terkait
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2.5">
            {material.quizzes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/70 transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-zinc-900">{q.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {q.questions.length} butir soal • Waktu {q.timeLimit} menit • KKM {q.passingScore}%
                  </div>
                </div>
                <Link
                  href={`/siswa/kuis/${q.id}/mulai`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#3C22BB] hover:bg-[#2E1994] text-white shadow-xs transition-colors shrink-0"
                >
                  Mulai Kuis <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

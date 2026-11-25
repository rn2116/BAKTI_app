import { requireDashboardUser } from "@/lib/auth"
import { createReadingStartToken } from "@/lib/readingVerification"
import {
  getMaterialBySlug,
  getMaterialProgress,
  getNextMaterialCard,
} from "@/services/material"
import { getRegionalLanguageLabelMap } from "@/services/regionalLanguageService"
import { prisma } from "@/lib/prisma"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import {
  SultengIllustration,
  getThemeByIndexAndCategory,
} from "@/components/shared/SultengIllustration"
import { ReadingViewClient } from "@/components/siswa/ReadingViewClient"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  ChevronRight,
  Sparkles,
  Languages,
  BookMarked,
  Compass,
  ClipboardCheck,
} from "lucide-react"

export default async function MateriDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireDashboardUser("SISWA")
  const { slug } = await params

  const material = await getMaterialBySlug(slug)
  if (!material || !material.isPublished) {
    notFound()
  }

  const [progress, nextMaterial, languageLabelMap, fallbackQuiz] = await Promise.all([
    getMaterialProgress(user.id, material.id),
    getNextMaterialCard(material.orderIndex, material.id, material.category),
    getRegionalLanguageLabelMap(),
    material.quizzes.length === 0
      ? prisma.quiz.findFirst({
          where: {
            isPublished: true,
            ...(material.regionalLanguage
              ? { regionalLanguage: material.regionalLanguage }
              : { category: material.category }),
          },
          select: { id: true, title: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve(null),
  ])

  const isDone = progress?.status === "SELESAI"
  const readingToken = createReadingStartToken(user.id, material.id)
  const regionalLanguageName = material.regionalLanguage
    ? (languageLabelMap[material.regionalLanguage] ?? material.regionalLanguage)
    : null
  const recommendedQuiz = material.quizzes[0] ?? fallbackQuiz
  const dictionaryHref = material.regionalLanguage
    ? `/siswa/budaya-bahasa?bahasa=${encodeURIComponent(material.regionalLanguage)}`
    : "/siswa/budaya-bahasa"

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tombol Kembali & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
        <Link
          href="/siswa/materi"
          className="inline-flex items-center gap-1 text-[#3C22BB] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Katalog Kartu Materi
        </Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[220px]">{material.title}</span>
      </div>

      {/* Header Visual Materi dengan Ilustrasi Sulteng */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
        <SultengIllustration
          theme={getThemeByIndexAndCategory(material.category, material.orderIndex)}
          className="h-44 sm:h-52"
        />
        <div className="p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={material.category} />
              {regionalLanguageName && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  <Languages className="w-3.5 h-3.5" />
                  {regionalLanguageName}
                </span>
              )}
              {material.referenceSource && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-200">
                  <BookMarked className="w-3.5 h-3.5" />
                  {material.referenceSource}
                </span>
              )}
            </div>
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
        summary={material.description}
        contentHtml={material.content}
        readingToken={readingToken}
        referenceSource={material.referenceSource}
        regionalLanguageName={regionalLanguageName}
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
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/70 transition-colors gap-3"
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

      {/* Navigasi Alur Terarah: Materi Berikutnya -> Kamus Besar -> Kuis Evaluasi */}
      <Card className="rounded-3xl border-indigo-200/80 bg-gradient-to-br from-[#F7F5FF] via-white to-emerald-50/50 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#3C22BB]">
            Alur Belajar Terarah
          </div>
          <h2 className="text-base font-black text-zinc-900">
            Langkah Selanjutnya Setelah Membaca Materi
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Langkah 1: Kartu Materi Berikutnya */}
          <Link
            href={nextMaterial ? `/siswa/materi/${nextMaterial.slug}` : "/siswa/materi"}
            className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-zinc-200 hover:border-[#3C22BB] hover:shadow-xs transition-all group"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3C22BB] uppercase">
                <BookOpen className="w-3.5 h-3.5" /> 1. Lanjutkan Bacaan
              </div>
              <div className="text-xs font-extrabold text-zinc-900 group-hover:text-[#3C22BB] line-clamp-2">
                {nextMaterial ? nextMaterial.title : "Lihat Seluruh Kartu Materi"}
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#3C22BB]">
              {nextMaterial ? "Kartu Materi Berikutnya" : "Katalog Materi"}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Langkah 2: Kamus Besar */}
          <Link
            href={dictionaryHref}
            className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-zinc-200 hover:border-[#065F46] hover:shadow-xs transition-all group"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#065F46] uppercase">
                <Compass className="w-3.5 h-3.5" /> 2. Eksplorasi Lema
              </div>
              <div className="text-xs font-extrabold text-zinc-900 group-hover:text-[#065F46]">
                Jelajahi Kosakata di Kamus Besar
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#065F46]">
              Buka Kamus &amp; Kartu Kilas <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Langkah 3: Kuis Evaluasi */}
          <Link
            href={recommendedQuiz ? `/siswa/kuis/${recommendedQuiz.id}/mulai` : "/siswa/kuis"}
            className="flex flex-col justify-between p-4 rounded-2xl bg-[#3C22BB] text-white hover:bg-[#2E1994] shadow-xs transition-all"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase">
                <ClipboardCheck className="w-3.5 h-3.5" /> 3. Uji Kompetensi
              </div>
              <div className="text-xs font-extrabold leading-snug line-clamp-2">
                {recommendedQuiz ? recommendedQuiz.title : "Kerjakan Kuis Evaluasi"}
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-200">
              Kerjakan Kuis Evaluasi <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </Card>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Calendar, BookOpen, ClipboardList, Award, Flame, Quote } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StudentSidebarPanelProps {
  lastMaterial: { id: string; title: string; slug: string; category: string } | null
  lastQuizAttempt: { id: string; title: string; score: number; maxScore: number; passed: boolean } | null
  badges: Array<{ id: string; name: string; earned: boolean }>
}

export function StudentSidebarPanel({
  lastMaterial,
  lastQuizAttempt,
  badges,
}: StudentSidebarPanelProps) {
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="space-y-4">
      {/* 1. KARTU INFORMASI WAKTU & STATUS */}
      <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
          <Calendar className="w-4 h-4 text-[#3C22BB]" />
          <span>{todayFormatted}</span>
        </div>

        {/* Terakhir Dipelajari */}
        <div className="border-t border-zinc-100 pt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Materi Terakhir
          </div>
          {lastMaterial ? (
            <Link
              href={`/siswa/materi/${lastMaterial.slug}`}
              className="block p-2.5 rounded-xl bg-sky-50/70 hover:bg-sky-100/70 border border-sky-100 transition-colors"
            >
              <div className="text-xs font-bold text-sky-950 truncate">
                {lastMaterial.title}
              </div>
              <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                Lanjutkan membaca →
              </div>
            </Link>
          ) : (
            <div className="text-xs text-zinc-400 italic">Belum ada materi dibaca</div>
          )}
        </div>

        {/* Nilai Kuis Terakhir */}
        <div className="border-t border-zinc-100 pt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <ClipboardList className="w-3.5 h-3.5 text-[#3C22BB]" /> Kuis Terakhir
          </div>
          {lastQuizAttempt ? (
            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-indigo-950 truncate">
                  {lastQuizAttempt.title}
                </div>
                <div className="text-[10px] text-indigo-700 font-semibold">
                  Skor: {lastQuizAttempt.score}/{lastQuizAttempt.maxScore}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  lastQuizAttempt.passed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {lastQuizAttempt.passed ? "Lulus" : "Remidi"}
              </span>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 italic">Belum mengikuti kuis</div>
          )}
        </div>
      </Card>

      {/* 2. ETALASE 4 LENCANA PRESTASI */}
      <Card className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#D97706]" /> Koleksi Lencana
          </div>
          <Link
            href="/siswa/sertifikat"
            className="text-[11px] font-bold text-[#3C22BB] hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-xl border text-center transition-all ${
                b.earned
                  ? "bg-amber-50/80 border-amber-200 shadow-xs text-zinc-900"
                  : "bg-zinc-50 border-zinc-200 opacity-60 text-zinc-400 grayscale"
              }`}
            >
              <div className="text-2xl mb-1">{b.earned ? "🏅" : "🔒"}</div>
              <div className="text-[11px] font-bold leading-tight truncate">
                {b.name}
              </div>
              <span className="text-[9px] font-semibold block mt-0.5">
                {b.earned ? "Diraih ✓" : "Terkunci"}
              </span>
            </div>
          ))}
          {badges.length === 0 && (
            <div className="col-span-2 text-center text-xs text-zinc-400 py-3">
              Belum ada lencana
            </div>
          )}
        </div>
      </Card>

      {/* 3. KUTIPAN MOTIVASI SULTENG */}
      <Card className="rounded-2xl bg-gradient-to-br from-[#1E135E] to-[#3C22BB] text-white p-5 shadow-xs space-y-2 relative overflow-hidden">
        <Quote className="w-8 h-8 text-white/10 absolute right-3 bottom-3" />
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-400" /> Semangat Hari Ini
        </div>
        <p className="text-xs text-white/95 leading-relaxed font-medium">
          &quot;Bahasa menunjukkan bangsa, karakter menentukan masa depan. Belajar hari ini adalah investasi kehormatan esok hari.&quot;
        </p>
      </Card>
    </div>
  )
}

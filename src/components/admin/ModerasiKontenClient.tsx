"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  toggleMaterialPublish,
  toggleQuizPublish,
  deleteMaterial,
  deleteQuiz,
} from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { Trash2, CheckCircle2, XCircle, BookOpen, ClipboardList } from "lucide-react"
import { Category, Role } from "@prisma/client"

interface MaterialItem {
  id: string
  title: string
  category: Category
  description: string
  readingTime: number
  isPublished: boolean
  createdAt: Date
  creator: { fullName: string; role: Role }
  _count: { quizzes: number }
}

interface QuizItem {
  id: string
  title: string
  category: Category
  timeLimit: number
  passingScore: number
  isPublished: boolean
  createdAt: Date
  creator: { fullName: string; role: Role }
  material: { title: string } | null
  _count: { questions: number }
}

export function ModerasiKontenClient({
  materials,
  quizzes,
}: {
  materials: MaterialItem[]
  quizzes: QuizItem[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<"MATERI" | "KUIS">("MATERI")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleToggleMaterial(id: string, currentStatus: boolean) {
    setLoadingId(id)
    const res = await toggleMaterialPublish(id, !currentStatus)
    setLoadingId(null)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal mengubah status publikasi")
    }
  }

  async function handleToggleQuiz(id: string, currentStatus: boolean) {
    setLoadingId(id)
    const res = await toggleQuizPublish(id, !currentStatus)
    setLoadingId(null)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal mengubah status publikasi")
    }
  }

  async function handleDeleteMaterial(id: string) {
    if (!confirm("Hapus materi ini secara permanen dari sistem?")) return
    const res = await deleteMaterial(id)
    if (res.success) router.refresh()
    else alert(res.error || "Gagal menghapus materi")
  }

  async function handleDeleteQuiz(id: string) {
    if (!confirm("Hapus kuis ini secara permanen dari sistem?")) return
    const res = await deleteQuiz(id)
    if (res.success) router.refresh()
    else alert(res.error || "Gagal menghapus kuis")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#18181B]">
            Pusat Moderasi & Kurasi Konten
          </h2>
          <p className="text-xs text-zinc-500">
            Verifikasi kelayakan materi literasi dan kuis yang diajukan oleh para pengajar
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={tab === "MATERI" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("MATERI")}
            className="text-xs gap-1.5 flex-1 sm:flex-initial"
          >
            <BookOpen className="w-3.5 h-3.5" /> Materi ({materials.length})
          </Button>
          <Button
            variant={tab === "KUIS" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("KUIS")}
            className="text-xs gap-1.5 flex-1 sm:flex-initial"
          >
            <ClipboardList className="w-3.5 h-3.5" /> Kuis ({quizzes.length})
          </Button>
        </div>
      </div>

      {/* 1. Mobile Stacked Cards (< 768px) */}
      <div className="space-y-3 md:hidden">
        {tab === "MATERI" ? (
          materials.map((m) => (
            <Card key={m.id} className="p-4 border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#18181B] truncate">{m.title}</div>
                  <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{m.description}</div>
                </div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    m.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {m.isPublished ? "Terbit" : "Draft"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-2">
                <CategoryBadge category={m.category} />
                <span className="text-[11px] text-zinc-500">Oleh: {m.creator.fullName}</span>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-2">
                <Button
                  variant={m.isPublished ? "outline" : "default"}
                  size="sm"
                  disabled={loadingId === m.id}
                  onClick={() => handleToggleMaterial(m.id, m.isPublished)}
                  className="h-8 text-xs px-3"
                >
                  {m.isPublished ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Cabut Tayang
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Setujui
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMaterial(m.id)}
                  className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          quizzes.map((q) => (
            <Card key={q.id} className="p-4 border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#18181B] truncate">{q.title}</div>
                  <div className="text-[11px] text-zinc-500">
                    {q._count.questions} Butir Soal • {q.timeLimit} Menit
                  </div>
                </div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    q.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {q.isPublished ? "Terbit" : "Draft"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-2">
                <CategoryBadge category={q.category} />
                <span className="text-[11px] text-zinc-500">Oleh: {q.creator.fullName}</span>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-2">
                <Button
                  variant={q.isPublished ? "outline" : "default"}
                  size="sm"
                  disabled={loadingId === q.id}
                  onClick={() => handleToggleQuiz(q.id, q.isPublished)}
                  className="h-8 text-xs px-3"
                >
                  {q.isPublished ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Cabut Tayang
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Setujui
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteQuiz(q.id)}
                  className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}

        {((tab === "MATERI" && materials.length === 0) ||
          (tab === "KUIS" && quizzes.length === 0)) && (
          <div className="p-8 border border-dashed rounded-xl text-center text-xs text-zinc-500 bg-white">
            Tidak ada konten yang perlu dimoderasi saat ini.
          </div>
        )}
      </div>

      {/* 2. Desktop Full Table (>= 768px) */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-semibold">
              <th className="py-3 px-4">Judul Konten</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Pembuat / Guru</th>
              <th className="py-3 px-4 text-center">Status Tayang</th>
              <th className="py-3 px-4 text-right">Moderasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {tab === "MATERI" ? (
              materials.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3 px-4 max-w-[280px]">
                    <div className="font-semibold text-zinc-900 truncate">{m.title}</div>
                    <div className="text-[11px] text-zinc-500 line-clamp-1">{m.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <CategoryBadge category={m.category} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-800">{m.creator.fullName}</div>
                    <div className="text-[10px] text-zinc-400">{m.creator.role}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {m.isPublished ? "Terbit (Live)" : "Tertahan (Draft)"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={m.isPublished ? "outline" : "default"}
                        size="sm"
                        disabled={loadingId === m.id}
                        onClick={() => handleToggleMaterial(m.id, m.isPublished)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        {m.isPublished ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Cabut
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Setujui
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMaterial(m.id)}
                        className="h-7 w-7 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              quizzes.map((q) => (
                <tr key={q.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3 px-4 max-w-[280px]">
                    <div className="font-semibold text-zinc-900 truncate">{q.title}</div>
                    <div className="text-[11px] text-zinc-500">
                      {q._count.questions} Butir Soal • {q.timeLimit} Menit
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <CategoryBadge category={q.category} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-800">{q.creator.fullName}</div>
                    <div className="text-[10px] text-zinc-400">{q.creator.role}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        q.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.isPublished ? "Terbit (Live)" : "Tertahan (Draft)"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={q.isPublished ? "outline" : "default"}
                        size="sm"
                        disabled={loadingId === q.id}
                        onClick={() => handleToggleQuiz(q.id, q.isPublished)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        {q.isPublished ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Cabut
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Setujui
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuiz(q.id)}
                        className="h-7 w-7 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}

            {((tab === "MATERI" && materials.length === 0) ||
              (tab === "KUIS" && quizzes.length === 0)) && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500">
                  Tidak ada konten yang perlu dimoderasi saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>
    </div>
  )
}

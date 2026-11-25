"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveQuizWithQuestions, deleteQuiz } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Trash2,
  HelpCircle,
  ChevronRight,
  Languages,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import type { Category, RegionalLanguage } from "@/types"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { notify } from "@/lib/notify"

interface QuestionFormItem {
  id?: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  points?: number
}

interface QuizItem {
  id: string
  title: string
  description: string | null
  category: Category
  regionalLanguage?: RegionalLanguage | null
  materialId: string | null
  createdBy?: string
  timeLimit: number
  passingScore: number
  xpReward: number
  isPublished: boolean
  creator?: { id?: string; fullName: string; role?: string }
  material?: { title: string } | null
  _count?: { questions: number; attempts: number }
  teacherSubmissionStats?: {
    pending: number
    approved: number
    rejected: number
  }
}

interface MaterialOption {
  id: string
  title: string
}

export function KuisManagementClient({
  quizzes,
  materials,
  currentUserId,
  languages,
}: {
  quizzes: QuizItem[]
  materials: MaterialOption[]
  currentUserId: string
  languages?: Array<{ code: string; name: string }>
}) {
  const languageLabelMap: Record<string, string> = Object.fromEntries(
    languages && languages.length > 0
      ? languages.map((l) => [l.code, l.name])
      : Object.entries(REGIONAL_LANGUAGE_LABELS)
  )
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Soal state saat form aktif
  const [questions, setQuestions] = useState<QuestionFormItem[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      points: 10,
      explanation: "",
    },
  ])

  function openCreate() {
    setSelectedQuiz(null)
    setQuestions([
      {
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        points: 10,
        explanation: "",
      },
    ])
    setError(null)
    setOpen(true)
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        points: 10,
        explanation: "",
      },
    ])
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) {
      notify.warning("Kuis harus memiliki minimal 1 butir soal")
      return
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateQuestion<K extends keyof QuestionFormItem>(
    index: number,
    field: K,
    val: QuestionFormItem[K]
  ) {
    setQuestions((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: val }
      return copy
    })
  }

  function updateOption(qIndex: number, optIndex: number, val: string) {
    setQuestions((prev) => {
      const copy = [...prev]
      const newOpts = [...copy[qIndex].options]
      newOpts[optIndex] = val
      copy[qIndex] = { ...copy[qIndex], options: newOpts }
      return copy
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validasi soal
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        const msg = `Pertanyaan soal nomor ${i + 1} tidak boleh kosong`
        setError(msg)
        notify.warning(msg)
        setLoading(false)
        return
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          const msg = `Pilihan jawaban ${String.fromCharCode(65 + j)} pada soal ${i + 1} tidak boleh kosong`
          setError(msg)
          notify.warning(msg)
          setLoading(false)
          return
        }
      }
    }

    const form = new FormData(e.currentTarget)
    if (selectedQuiz) {
      form.append("id", selectedQuiz.id)
    }
    form.append("questions", JSON.stringify(questions))

    const res = await saveQuizWithQuestions(null, form)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      notify.success(
        res.message ||
          (selectedQuiz
            ? "Paket kuis berhasil diperbarui"
            : "Paket kuis dibuat & soal menunggu verifikasi Admin")
      )
      router.refresh()
    } else {
      setError(res.error || "Gagal menyimpan kuis")
      notify.error(res.error || "Gagal menyimpan kuis")
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setIsDeleting(true)
    const res = await deleteQuiz(deleteTargetId)
    setIsDeleting(false)

    if (res.success) {
      notify.success("Paket kuis berhasil dihapus")
      setDeleteTargetId(null)
      router.refresh()
    } else {
      notify.error(res.error || "Gagal menghapus kuis")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Bank Soal & Kuis</h2>
          <p className="text-xs text-muted-foreground">
            Kelola instrumen asesmen dan kuis interaktif untuk siswa
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              size="sm"
              className="gap-2 text-xs bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" /> Buat Kuis Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Kuis & Bank Soal Pilihan Ganda</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              {/* Data Umum Kuis */}
              <div className="space-y-4 border-b border-input pb-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Judul Kuis</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedQuiz?.title ?? ""}
                    placeholder="Contoh: Kuis Pemahaman Legenda Sawerigading"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Kategori</Label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={selectedQuiz?.category ?? "BAHASA_INDONESIA"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="BAHASA_INDONESIA">Bahasa Indonesia</option>
                      <option value="KARAKTER">Pendidikan Karakter</option>
                      <option value="BUDAYA_SULTENG">Kearifan Lokal Sulawesi Tengah</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="materialId">Tautkan dengan Materi (Opsional)</Label>
                    <select
                      id="materialId"
                      name="materialId"
                      defaultValue={selectedQuiz?.materialId ?? ""}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">-- Tanpa Tautan Materi --</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="timeLimit">Durasi (Menit)</Label>
                    <Input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      min="1"
                      defaultValue={selectedQuiz?.timeLimit ?? 15}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="passingScore">Nilai KKM (%)</Label>
                    <Input
                      id="passingScore"
                      name="passingScore"
                      type="number"
                      min="10"
                      max="100"
                      defaultValue={selectedQuiz?.passingScore ?? 75}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="xpReward">Hadiah XP</Label>
                    <Input
                      id="xpReward"
                      name="xpReward"
                      type="number"
                      min="10"
                      defaultValue={selectedQuiz?.xpReward ?? 50}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    value="true"
                    defaultChecked={selectedQuiz ? selectedQuiz.isPublished : true}
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer text-xs">
                    Publikasikan kuis ini sekarang
                  </Label>
                </div>
              </div>

              {/* Daftar Soal */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> Daftar Butir Soal ({questions.length})
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Butir Soal
                  </Button>
                </div>

                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-lg border border-input bg-muted/20 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        Nomor {qIdx + 1}
                      </span>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIdx)}
                          className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Hapus Soal
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Pertanyaan</Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                        placeholder="Tuliskan butir soal..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Pilihan Jawaban (Pilih radio untuk jawaban benar):</Label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => updateQuestion(qIdx, "correctIndex", optIdx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold w-4">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                            placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                            className="h-8 text-xs"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Pembahasan Jawaban (Opsional)</Label>
                      <Input
                        value={q.explanation ?? ""}
                        onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)}
                        placeholder="Penjelasan kenapa opsi ini benar..."
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-input">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl shadow-xs"
                >
                  {loading ? "Menyimpan..." : "Simpan Kuis & Soal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((q) => {
          const isOwner = q.createdBy === currentUserId || q.creator?.id === currentUserId
          const stats = q.teacherSubmissionStats

          return (
            <Card
              key={q.id}
              className="border-zinc-200/90 rounded-2xl bg-white shadow-xs flex flex-col justify-between hover:border-[#3C22BB]/40 hover:shadow-md transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={q.category} />
                    {q.regionalLanguage && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        <Languages className="w-2.5 h-2.5" />
                        {languageLabelMap[q.regionalLanguage] ?? REGIONAL_LANGUAGE_LABELS[q.regionalLanguage] ?? q.regionalLanguage}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      q.isPublished
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {q.isPublished ? "Terbit" : "Draft"}
                  </span>
                </div>
                <CardTitle className="text-base line-clamp-2 leading-snug">{q.title}</CardTitle>
                {q.material && (
                  <p className="text-xs text-[#3C22BB] font-medium truncate mt-0.5">
                    Modul: {q.material.title}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-3 gap-1 text-center bg-zinc-50 border border-zinc-100 p-2 rounded-xl text-xs">
                  <div>
                    <div className="text-[10px] text-zinc-500">Soal Tayang</div>
                    <div className="font-bold text-zinc-900">{q._count?.questions ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">Waktu</div>
                    <div className="font-bold text-zinc-900">{q.timeLimit} m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">Peserta</div>
                    <div className="font-bold text-zinc-900">{q._count?.attempts ?? 0}</div>
                  </div>
                </div>

                {/* Ringkasan Status Pengajuan Soal Guru pada Paket Ini */}
                {stats && (stats.pending > 0 || stats.approved > 0 || stats.rejected > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {stats.pending > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Hourglass className="w-2.5 h-2.5" /> {stats.pending} Menunggu
                      </span>
                    )}
                    {stats.approved > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" /> {stats.approved} Disetujui
                      </span>
                    )}
                    {stats.rejected > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-2.5 h-2.5" /> {stats.rejected} Perlu Revisi
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 gap-2">
                  <Link
                    href={`/guru/kuis/${q.id}/soal`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3C22BB]/10 hover:bg-[#3C22BB] text-[#3C22BB] hover:text-white px-3 py-2 text-xs font-bold transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ajukan / Kelola Soal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTargetId(q.id)}
                      className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 shrink-0"
                      title="Hapus paket kuis ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {quizzes.length === 0 && (
          <div className="col-span-full p-10 border border-dashed rounded-xl text-center text-sm text-muted-foreground">
            Belum ada bank kuis. Klik Buat Kuis Baru untuk membuat evaluasi pembelajaran.
          </div>
        )}
      </div>

      {/* Dialog Konfirmasi Hapus Kuis */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(isOpen) => !isOpen && setDeleteTargetId(null)}
        variant="danger"
        title="Hapus Paket Kuis & Butir Soal?"
        description="Paket kuis beserta seluruh butir soal pilihan ganda dan riwayat pengerjaan siswa akan dihapus secara permanen."
        confirmText="Ya, Hapus Kuis"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

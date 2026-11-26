"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveQuizHeader, deleteQuiz } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { notify } from "@/lib/notify"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  ClipboardList,
  Edit3,
  Trash2,
  Clock,
  Award,
  Layers,
  ChevronRight,
  Sparkles,
  Languages,
  ShieldCheck,
} from "lucide-react"
import type { Category, RegionalLanguage } from "@/types"

interface QuizItem {
  id: string
  title: string
  description: string | null
  category: Category
  regionalLanguage: RegionalLanguage | null
  timeLimit: number
  passingScore: number
  xpReward: number
  isPublished: boolean
  createdAt: Date
  creator?: { fullName: string }
  material?: { id: string; title: string } | null
  _count?: { questions: number; attempts: number }
}

interface LanguageOption {
  code: string
  name: string
}

interface AdminQuizListClientProps {
  quizzes: QuizItem[]
  pendingCount?: number
  languages?: LanguageOption[]
}

export function AdminQuizListClient({
  quizzes,
  pendingCount = 0,
  languages,
}: AdminQuizListClientProps) {
  const languageOptions: LanguageOption[] =
    languages && languages.length > 0
      ? languages
      : Object.entries(REGIONAL_LANGUAGE_LABELS).map(([code, name]) => ({
          code,
          name,
        }))
  const languageLabelMap: Record<string, string> = Object.fromEntries(
    languageOptions.map((item) => [item.code, item.name])
  )
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL")

  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null)

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description || "").toLowerCase().includes(search.toLowerCase())
    const matchCategory =
      selectedCategory === "ALL" || q.category === selectedCategory
    const matchLanguage =
      selectedLanguage === "ALL" || q.regionalLanguage === selectedLanguage

    return matchSearch && matchCategory && matchLanguage
  })

  function openCreate() {
    setSelectedQuiz(null)
    setModalOpen(true)
  }

  function openEdit(quiz: QuizItem) {
    setSelectedQuiz(quiz)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (selectedQuiz) {
      formData.append("id", selectedQuiz.id)
    }

    try {
      const res = await saveQuizHeader(null, formData)
      if (res.success) {
        notify.success(res.message || "Kuis berhasil disimpan")
        setModalOpen(false)
        router.refresh()
        if (!selectedQuiz && res.quizId) {
          router.push(`/admin/kuis/${res.quizId}/soal`)
        }
      } else {
        notify.error(res.error || "Gagal menyimpan kuis")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      const res = await deleteQuiz(deleteTargetId)
      if (res.success) {
        notify.success("Kuis dan seluruh butir soal berhasil dihapus")
        setDeleteTargetId(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menghapus kuis")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kuis atau deskripsi..."
              className="pl-9 h-10 text-xs rounded-xl border-zinc-200"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB] focus:ring-1 focus:ring-[#3C22BB]"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="BAHASA_INDONESIA">Bahasa Indonesia</option>
            <option value="KARAKTER">Pendidikan Karakter</option>
            <option value="BUDAYA_SULTENG">Kearifan Lokal Sulawesi Tengah</option>
          </select>

          {/* Regional Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB] focus:ring-1 focus:ring-[#3C22BB]"
          >
            <option value="ALL">Semua Bahasa Daerah</option>
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/admin/verifikasi-soal"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 h-10 text-xs font-bold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Verifikasi Soal</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <Button
            onClick={openCreate}
            className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold px-4 h-10 shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Buat Kuis Baru
          </Button>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#3C22BB]/40 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CategoryBadge category={quiz.category} />
                  {quiz.regionalLanguage && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      <Languages className="w-2.5 h-2.5" />
                      {languageLabelMap[quiz.regionalLanguage] ?? REGIONAL_LANGUAGE_LABELS[quiz.regionalLanguage] ?? quiz.regionalLanguage}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    quiz.isPublished
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {quiz.isPublished ? "Terbit" : "Draft"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-zinc-900 group-hover:text-[#3C22BB] transition-colors line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                  {quiz.description || "Tidak ada deskripsi tambahan."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-zinc-100 text-center">
                <div className="p-1.5 rounded-lg bg-zinc-50">
                  <div className="text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
                    <Layers className="w-3 h-3 text-[#3C22BB]" /> Soal
                  </div>
                  <div className="text-xs font-bold text-zinc-800 mt-0.5">
                    {quiz._count?.questions ?? 0} Butir
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-zinc-50">
                  <div className="text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-sky-600" /> Waktu
                  </div>
                  <div className="text-xs font-bold text-zinc-800 mt-0.5">
                    {quiz.timeLimit} Menit
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-zinc-50">
                  <div className="text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-amber-500" /> KKM
                  </div>
                  <div className="text-xs font-bold text-zinc-800 mt-0.5">
                    {quiz.passingScore}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 flex items-center justify-between border-t border-zinc-100">
              <div className="text-[10px] text-zinc-400">
                Reward: <strong className="text-[#3C22BB]">+{quiz.xpReward} XP</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(quiz)}
                  className="h-8 px-2 text-xs text-zinc-600 hover:text-zinc-900"
                  title="Edit Info Kuis"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTargetId(quiz.id)}
                  className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  title="Hapus Kuis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Link href={`/admin/kuis/${quiz.id}/soal`}>
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl shadow-xs flex items-center gap-1"
                  >
                    Kelola Soal <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredQuizzes.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-zinc-200 rounded-2xl p-8">
            <ClipboardList className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-zinc-800">
              Belum Ada Kuis Ditemukan
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              Silakan buat kuis baru untuk modul Bahasa Indonesia, Pendidikan Karakter, atau Kearifan Lokal Sulawesi Tengah.
            </p>
            <Button
              onClick={openCreate}
              className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Kuis Sekarang
            </Button>
          </div>
        )}
      </div>

      {/* Modal Buat / Edit Kuis */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#3C22BB]" />
              {selectedQuiz ? "Edit Informasi Kuis" : "Buat Kuis Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Judul Kuis <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={selectedQuiz?.title ?? ""}
                placeholder="Contoh: Kuis Literasi Tata Bahasa Baku & Cerita Kaili"
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Kategori Pembelajaran <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={selectedQuiz?.category ?? "BAHASA_INDONESIA"}
                  className="w-full text-xs h-9 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB]"
                >
                  <option value="BAHASA_INDONESIA">Bahasa Indonesia</option>
                  <option value="KARAKTER">Pendidikan Karakter</option>
                  <option value="BUDAYA_SULTENG">Kearifan Lokal Sulawesi Tengah</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="regionalLanguage" className="text-xs font-semibold">
                  Bahasa Daerah (Opsional)
                </Label>
                <select
                  id="regionalLanguage"
                  name="regionalLanguage"
                  defaultValue={selectedQuiz?.regionalLanguage ?? ""}
                  className="w-full text-xs h-9 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB]"
                >
                  <option value="">-- Umum / Tanpa Bahasa Daerah --</option>
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Deskripsi Singkat / Petunjuk Pengerjaan
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={selectedQuiz?.description ?? ""}
                placeholder="Tuliskan petunjuk atau cakupan materi kuis..."
                className="text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="timeLimit" className="text-xs font-semibold">
                  Waktu (Menit)
                </Label>
                <Input
                  id="timeLimit"
                  name="timeLimit"
                  type="number"
                  min={1}
                  defaultValue={selectedQuiz?.timeLimit ?? 30}
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="passingScore" className="text-xs font-semibold">
                  KKM Nilai (0-100)
                </Label>
                <Input
                  id="passingScore"
                  name="passingScore"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={selectedQuiz?.passingScore ?? 75}
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="xpReward" className="text-xs font-semibold">
                  Reward XP
                </Label>
                <Input
                  id="xpReward"
                  name="xpReward"
                  type="number"
                  min={0}
                  defaultValue={selectedQuiz?.xpReward ?? 50}
                  className="text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                value="true"
                defaultChecked={selectedQuiz ? selectedQuiz.isPublished : true}
                className="h-4 w-4 rounded border-zinc-300 text-[#3C22BB] focus:ring-[#3C22BB]"
              />
              <Label htmlFor="isPublished" className="cursor-pointer text-xs font-medium text-zinc-700">
                Terbitkan Kuis (dapat langsung diakses siswa jika ada soal)
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold px-4 shadow-xs"
              >
                {loading
                  ? "Menyimpan..."
                  : selectedQuiz
                  ? "Simpan Perubahan"
                  : "Buat & Lanjut Kelola Soal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        variant="danger"
        title="Hapus Kuis & Bank Soal?"
        description="Seluruh butir soal, riwayat pengerjaan, dan perolehan nilai siswa pada kuis ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus Kuis"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

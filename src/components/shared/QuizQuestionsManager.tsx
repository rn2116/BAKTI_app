"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  saveQuizQuestion,
  deleteQuizQuestion,
  importQuizQuestionsAction,
} from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { AudioButton } from "@/components/shared/AudioButton"

const MiniAudioStudio = dynamic(
  () =>
    import("@/components/shared/MiniAudioStudio").then(
      (mod) => mod.MiniAudioStudio
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
    ),
  }
)
import { notify } from "@/lib/notify"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  Trash2,
  Edit3,
  Languages,
  Clock,
  Award,
  HelpCircle,
  Check,
  FileText,
  AlertTriangle,
  Quote,
  RefreshCw,
  ShieldCheck,
  Hourglass,
} from "lucide-react"
import type { Category, RegionalLanguage, QuestionVerificationStatus } from "@/types"

export interface ManagedQuestionItem {
  id: string
  quizId: string
  question: string
  options: string
  correctIndex: number
  explanation: string | null
  points: number
  orderIndex: number
  regionalLanguage: RegionalLanguage | null
  wiseSayingText?: string | null
  wiseSayingMeaning?: string | null
  referenceSource?: string | null
  audioUrl?: string | null
  verificationStatus: QuestionVerificationStatus
  createdBy?: string | null
  reviewNotes?: string | null
  creator?: { id?: string; fullName: string; role?: string } | null
}

export interface ManagedQuizDetail {
  id: string
  title: string
  description: string | null
  category: Category
  regionalLanguage: RegionalLanguage | null
  referenceSource?: string | null
  timeLimit: number
  passingScore: number
  xpReward: number
  isPublished: boolean
  questions: ManagedQuestionItem[]
}

interface LanguageOption {
  code: string
  name: string
}

interface QuizQuestionsManagerProps {
  quiz: ManagedQuizDetail
  userRole: "ADMIN" | "GURU"
  currentUserId: string
  backHref: string
  languages?: LanguageOption[]
}

interface ParsedExcelQuestion {
  question: string
  options: [string, string, string, string]
  correctIndex: number
  explanation?: string
  points: number
  wiseSayingText?: string
  wiseSayingMeaning?: string
  referenceSource?: string
  audioUrl?: string
  regionalLanguage?: RegionalLanguage | null
  isValid: boolean
  errorReason?: string
}

const VALID_REGIONAL_LANGUAGES = new Set(Object.keys(REGIONAL_LANGUAGE_LABELS))

function StatusBadge({ status }: { status: QuestionVerificationStatus }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Disetujui & Tayang ✓
      </span>
    )
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        Perlu Revisi
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
      <Hourglass className="w-3 h-3 text-amber-600" />
      Menunggu Verifikasi Admin
    </span>
  )
}

export function QuizQuestionsManager({
  quiz,
  userRole,
  currentUserId,
  backHref,
  languages,
}: QuizQuestionsManagerProps) {
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
  const validRegionalLanguages = new Set(languageOptions.map((item) => item.code))
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isGuru = userRole === "GURU"

  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<ManagedQuestionItem | null>(null)
  const [questionAudioUrl, setQuestionAudioUrl] = useState("")
  const [manualLoading, setManualLoading] = useState(false)

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [excelModalOpen, setExcelModalOpen] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedExcelQuestion[]>([])
  const [isImporting, setIsImporting] = useState(false)

  function openCreateQuestion() {
    setEditingQuestion(null)
    setQuestionAudioUrl("")
    setManualModalOpen(true)
  }

  function openEditQuestion(q: ManagedQuestionItem) {
    setEditingQuestion(q)
    setQuestionAudioUrl(q.audioUrl ?? "")
    setManualModalOpen(true)
  }

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setManualLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("quizId", quiz.id)
    if (editingQuestion) {
      formData.append("id", editingQuestion.id)
    }

    try {
      const res = await saveQuizQuestion(null, formData)
      if (res.success) {
        notify.success(res.message || "Soal berhasil disimpan")
        setManualModalOpen(false)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menyimpan soal")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setManualLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      const res = await deleteQuizQuestion(deleteTargetId, quiz.id)
      if (res.success) {
        notify.success("Butir soal berhasil dihapus")
        setDeleteTargetId(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menghapus butir soal")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setIsDeleting(false)
    }
  }

  function handleDownloadTemplate() {
    const templateData = [
      {
        No: 1,
        Ungkapan_Bijak: "Mosipeili, Mosimpotove, Mosimpoasi, Nosarara Nosabatutu",
        Arti_Ungkapan: "Saling menengok, menyayangi, mengasihi, bersaudara dan bersatu.",
        Sumber_Rujukan: "Dr. H. Suaib Djafar, M.Si — Ungkapan Bijak Masyarakat Kaili",
        Bahasa_Daerah: "KAILI",
        Pertanyaan: "Nilai karakter utama apakah yang terkandung dalam ungkapan To Kaili di atas?",
        Pilihan_A: "Persaingan bebas",
        Pilihan_B: "Persaudaraan, Empati & Toleransi",
        Pilihan_C: "Kemandirian ekonomi pribadi",
        Pilihan_D: "Ketegasan sanksi adat",
        Kunci_Jawaban: "B",
        Pembahasan: "Nosarara Nosabatutu merupakan semboyan persatuan luhur masyarakat Kaili yang bermakna bersaudara dan saling mengasihi.",
        Poin: 10,
        Audio_URL: "",
      },
      {
        No: 2,
        Ungkapan_Bijak: "",
        Arti_Ungkapan: "",
        Sumber_Rujukan: "",
        Bahasa_Daerah: "",
        Pertanyaan: "Manakah kalimat berikut yang menggunakan konjungsi kausalitas secara baku?",
        Pilihan_A: "Dia tidak masuk sekolah sehingga dia sakit perut.",
        Pilihan_B: "Karena hujan deras mengguyur, maka jalanan menjadi licin.",
        Pilihan_C: "Lomba literasi ditunda karena aula sekolah sedang direnovasi.",
        Pilihan_D: "Sebab akibat dari bencana tersebut belum diketahui.",
        Kunci_Jawaban: "C",
        Pembahasan: "Kalimat C menggunakan kata penghubung kausalitas 'karena' dengan struktur kalimat majemuk yang baku dan tepat.",
        Poin: 10,
        Audio_URL: "",
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    ws["!cols"] = [
      { wch: 5 },
      { wch: 40 },
      { wch: 40 },
      { wch: 35 },
      { wch: 15 },
      { wch: 45 },
      { wch: 28 },
      { wch: 28 },
      { wch: 28 },
      { wch: 28 },
      { wch: 14 },
      { wch: 40 },
      { wch: 8 },
      { wch: 30 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template_Soal")
    XLSX.writeFile(wb, "Template_Soal_Kuis_BBPST.xlsx")
    notify.success("Template Excel berhasil diunduh!")
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setExcelFile(file)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

        if (!rawJson || rawJson.length === 0) {
          notify.error("Berkas Excel kosong atau format tidak sesuai")
          setParsedRows([])
          return
        }

        const parsed: ParsedExcelQuestion[] = rawJson.map((row) => {
          const getStr = (keys: string[]) => {
            for (const k of keys) {
              const v = row[k]
              if (v !== undefined && v !== null) return String(v).trim()
            }
            return ""
          }

          const qText = getStr(["Pertanyaan", "pertanyaan"])
          const optA = getStr(["Pilihan_A", "pilihan_a", "A"])
          const optB = getStr(["Pilihan_B", "pilihan_b", "B"])
          const optC = getStr(["Pilihan_C", "pilihan_c", "C"])
          const optD = getStr(["Pilihan_D", "pilihan_d", "D"])
          const rawKey = getStr(["Kunci_Jawaban", "kunci_jawaban", "Kunci"]).toUpperCase()
          const explanation = getStr(["Pembahasan", "pembahasan"])
          const wiseSayingText = getStr(["Ungkapan_Bijak", "ungkapan_bijak"])
          const wiseSayingMeaning = getStr(["Arti_Ungkapan", "arti_ungkapan"])
          const referenceSource = getStr(["Sumber_Rujukan", "sumber_rujukan"])
          const audioUrl = getStr(["Audio_URL", "audio_url", "AudioUrl"])
          const rawLang = getStr(["Bahasa_Daerah", "bahasa_daerah"]).toUpperCase()
          const points = parseInt(getStr(["Poin", "poin"]) || "10", 10) || 10

          const regionalLanguage = validRegionalLanguages.has(rawLang)
            ? (rawLang as RegionalLanguage)
            : quiz.regionalLanguage

          let correctIdx = -1
          if (rawKey === "A" || rawKey === "0") correctIdx = 0
          else if (rawKey === "B" || rawKey === "1") correctIdx = 1
          else if (rawKey === "C" || rawKey === "2") correctIdx = 2
          else if (rawKey === "D" || rawKey === "3") correctIdx = 3

          let isValid = true
          let errorReason = ""

          if (!qText) {
            isValid = false
            errorReason = "Pertanyaan kosong"
          } else if (!optA || !optB || !optC || !optD) {
            isValid = false
            errorReason = "Pilihan A/B/C/D belum lengkap"
          } else if (correctIdx === -1) {
            isValid = false
            errorReason = `Kunci jawaban '${rawKey}' tidak valid (gunakan A, B, C, atau D)`
          }

          return {
            question: qText,
            options: [optA, optB, optC, optD],
            correctIndex: correctIdx >= 0 ? correctIdx : 0,
            explanation,
            points,
            wiseSayingText: wiseSayingText || undefined,
            wiseSayingMeaning: wiseSayingMeaning || undefined,
            referenceSource: referenceSource || undefined,
            audioUrl: audioUrl || undefined,
            regionalLanguage,
            isValid,
            errorReason,
          }
        })

        setParsedRows(parsed)
      } catch (err) {
        console.error("Gagal membaca Excel:", err)
        notify.error("Gagal membaca file Excel. Pastikan format file adalah .xlsx atau .xls")
      }
    }
    reader.readAsBinaryString(file)
  }

  async function handleExecuteBulkImport() {
    const validRows = parsedRows.filter((r) => r.isValid)
    if (validRows.length === 0) {
      notify.error("Tidak ada butir soal yang valid untuk disimpan")
      return
    }

    setIsImporting(true)
    try {
      const payload = validRows.map((r) => ({
        question: r.question,
        options: r.options,
        correctIndex: r.correctIndex,
        explanation: r.explanation,
        points: r.points,
        wiseSayingText: r.wiseSayingText || null,
        wiseSayingMeaning: r.wiseSayingMeaning || null,
        referenceSource: r.referenceSource || null,
        audioUrl: r.audioUrl || null,
        regionalLanguage: r.regionalLanguage ?? quiz.regionalLanguage,
      }))

      const res = await importQuizQuestionsAction(quiz.id, JSON.stringify(payload))
      if (res.success) {
        notify.success(res.message || `Berhasil mengimpor ${validRows.length} butir soal!`)
        setExcelModalOpen(false)
        setParsedRows([])
        setExcelFile(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal mengimpor butir soal")
      }
    } catch {
      notify.error("Terjadi kesalahan saat memproses impor")
    } finally {
      setIsImporting(false)
    }
  }

  function parseOptions(optStr: string): string[] {
    try {
      const arr: unknown = JSON.parse(optStr)
      if (Array.isArray(arr)) return arr.map((x) => String(x))
    } catch {
      // Abaikan parse error
    }
    return ["A", "B", "C", "D"]
  }

  const validParsedCount = parsedRows.filter((r) => r.isValid).length
  const editingOptions = editingQuestion ? parseOptions(editingQuestion.options) : ["", "", "", ""]

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Quiz Summary Header */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#3C22BB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={quiz.category} />
            {quiz.regionalLanguage && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                <Languages className="w-3 h-3" />
                {languageLabelMap[quiz.regionalLanguage] ?? REGIONAL_LANGUAGE_LABELS[quiz.regionalLanguage] ?? quiz.regionalLanguage}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{quiz.title}</h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
              {quiz.description || "Kelola dan ajukan butir soal evaluasi untuk kuis ini."}
            </p>
            {quiz.referenceSource && (
              <p className="text-[11px] font-semibold text-[#3C22BB] mt-1.5">
                Rujukan: {quiz.referenceSource}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={() => setExcelModalOpen(true)}
              variant="outline"
              className="text-xs font-semibold rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-10 gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Impor Excel (.xlsx)
            </Button>
            <Button
              onClick={openCreateQuestion}
              className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold h-10 px-4 shadow-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />{" "}
              {isGuru ? "Ajukan Soal Baru" : "Tambah Soal Manual"}
            </Button>
          </div>
        </div>

        {isGuru && (
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3C22BB] shrink-0 mt-0.5" />
            <span>
              <strong>Alur Verifikasi Balai Bahasa:</strong> Setiap soal yang Anda ajukan atau impor dari Excel akan otomatis berstatus{" "}
              <span className="font-bold text-amber-700">Menunggu Verifikasi Admin</span> hingga ditinjau dan disetujui oleh Admin untuk tayang ke siswa.
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#3C22BB]" />
            <span>Total Soal Ditampilkan: <strong>{quiz.questions.length} Butir</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Waktu: <strong>{quiz.timeLimit} Menit</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>KKM Kelulusan: <strong>{quiz.passingScore}%</strong></span>
          </div>
        </div>
      </div>

      {/* Question List Cards */}
      <div className="space-y-4">
        {quiz.questions.map((q, idx) => {
          const options = parseOptions(q.options)
          const optionLetters = ["A", "B", "C", "D"]
          const isOwner = q.createdBy === currentUserId
          const canModify = userRole === "ADMIN" || (isGuru && isOwner)

          return (
            <div
              key={q.id}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#3C22BB]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 text-[#3C22BB] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={q.verificationStatus} />
                      {q.regionalLanguage && (
                        <span className="inline-block text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          {languageLabelMap[q.regionalLanguage] ?? REGIONAL_LANGUAGE_LABELS[q.regionalLanguage] ?? q.regionalLanguage}
                        </span>
                      )}
                      {q.creator?.fullName && (
                        <span className="text-[10px] text-zinc-500">
                          Pengusul: <strong>{q.creator.fullName}</strong>
                        </span>
                      )}
                    </div>

                    {q.wiseSayingText && (
                      <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/70 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3C22BB]">
                          <Quote className="w-3 h-3" /> Ungkapan Bijak Daerah
                        </div>
                        <p className="font-serif italic font-bold text-sm text-[#1E135E]">
                          &ldquo;{q.wiseSayingText}&rdquo;
                        </p>
                        {q.wiseSayingMeaning && (
                          <p className="text-[11px] text-zinc-600">
                            <span className="font-semibold">Arti:</span> {q.wiseSayingMeaning}
                          </p>
                        )}
                        {q.referenceSource && (
                          <p className="text-[10px] text-zinc-500">
                            Rujukan: {q.referenceSource}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-sm font-semibold text-zinc-900 leading-relaxed whitespace-pre-line break-words">
                      {q.question}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <AudioButton
                    audioUrl={q.audioUrl}
                    text={q.wiseSayingText ? `${q.wiseSayingText}. ${q.question}` : q.question}
                    label="Audio"
                    size="sm"
                  />
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                    {q.points} Poin
                  </span>
                  {canModify && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditQuestion(q)}
                        className="h-8 px-2 text-xs text-zinc-600 hover:text-zinc-900"
                        title="Edit Soal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTargetId(q.id)}
                        className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Revision Notes Callout (if REJECTED) */}
              {q.verificationStatus === "REJECTED" && (
                <div className="sm:ml-10 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 text-xs text-rose-900">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      Catatan Revisi dari Admin:
                    </div>
                    <p className="text-rose-800 leading-relaxed">
                      {q.reviewNotes || "Mohon periksa kembali redaksi soal dan kunci jawaban."}
                    </p>
                  </div>
                  {canModify && (
                    <Button
                      size="sm"
                      onClick={() => openEditQuestion(q)}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Perbaiki & Ajukan Ulang
                    </Button>
                  )}
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:pl-10">
                {options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                        isCorrect
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium shadow-xs"
                          : "bg-zinc-50/60 border-zinc-200/80 text-zinc-700"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </span>
                      <span className="flex-1 leading-snug break-words">{opt}</span>
                      {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  )
                })}
              </div>

              {/* Explanation Callout */}
              {q.explanation && (
                <div className="sm:ml-10 p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Pembahasan: </span>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {quiz.questions.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-zinc-200 rounded-2xl p-8">
            <HelpCircle className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-zinc-800">
              Belum Ada Butir Soal di Kuis Ini
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-5">
              Tambahkan pertanyaan interaktif satu per satu atau gunakan impor massal Excel untuk memasukkan puluhan soal sekaligus.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={() => setExcelModalOpen(true)}
                variant="outline"
                className="text-xs font-semibold rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-9"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
                Impor Massal Excel
              </Button>
              <Button
                onClick={openCreateQuestion}
                className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold h-9 shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />{" "}
                {isGuru ? "Ajukan Soal Pertama" : "Tambah Soal Manual"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Soal Manual */}
      <Dialog open={manualModalOpen} onOpenChange={setManualModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#3C22BB]" />
              {editingQuestion
                ? editingQuestion.verificationStatus === "REJECTED" && isGuru
                  ? "Perbaiki & Ajukan Ulang Soal"
                  : "Edit Butir Soal"
                : isGuru
                  ? "Ajukan Butir Soal Baru"
                  : "Tambah Soal Kuis Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleManualSubmit} className="space-y-4 mt-2">
            {isGuru && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                Soal yang Anda simpan akan dikirim ke antrean <strong>Verifikasi Admin</strong> sebelum ditayangkan ke siswa.
              </div>
            )}

            {/* Muatan Ungkapan Bijak Daerah (Opsional) */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="text-xs font-bold text-[#3C22BB] flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" /> Muatan Ungkapan Bijak Daerah (Opsional)
              </div>
              <div className="space-y-1">
                <Label htmlFor="wiseSayingText" className="text-[11px] font-semibold">
                  Teks Ungkapan Bijak Daerah (Misal Bahasa Kaili)
                </Label>
                <Input
                  id="wiseSayingText"
                  name="wiseSayingText"
                  defaultValue={editingQuestion?.wiseSayingText ?? ""}
                  placeholder="Contoh: Nosarara Nosabatutu"
                  className="text-xs rounded-xl bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="wiseSayingMeaning" className="text-[11px] font-semibold">
                    Arti / Terjemahan Bahasa Indonesia
                  </Label>
                  <Input
                    id="wiseSayingMeaning"
                    name="wiseSayingMeaning"
                    defaultValue={editingQuestion?.wiseSayingMeaning ?? ""}
                    placeholder="Arti harfiah ungkapan daerah..."
                    className="text-xs rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="referenceSource" className="text-[11px] font-semibold">
                    Sumber Rujukan
                  </Label>
                  <Input
                    id="referenceSource"
                    name="referenceSource"
                    defaultValue={editingQuestion?.referenceSource ?? quiz.referenceSource ?? ""}
                    placeholder="Contoh: Dr. H. Suaib Djafar, M.Si"
                    className="text-xs rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="question" className="text-xs font-semibold">
                Teks Pertanyaan <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="question"
                name="question"
                rows={3}
                defaultValue={editingQuestion?.question ?? ""}
                placeholder="Tuliskan butir soal literasi atau kuis kearifan lokal..."
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="regionalLanguage" className="text-xs font-semibold">
                  Bahasa Daerah Soal (Opsional)
                </Label>
                <select
                  id="regionalLanguage"
                  name="regionalLanguage"
                  defaultValue={editingQuestion?.regionalLanguage ?? quiz.regionalLanguage ?? ""}
                  className="w-full text-xs h-9 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB]"
                >
                  <option value="">-- Ikuti Kategori Kuis / Umum --</option>
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="points" className="text-xs font-semibold">
                  Bobot Nilai / Poin
                </Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min={1}
                  defaultValue={editingQuestion?.points ?? 10}
                  className="text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold">
                Pilihan Jawaban (A, B, C, D) & Tentukan Kunci Jawaban Benar
              </Label>

              <div className="space-y-2.5">
                {[
                  { key: "A", name: "optionA", idx: 0, defaultVal: editingOptions[0] },
                  { key: "B", name: "optionB", idx: 1, defaultVal: editingOptions[1] },
                  { key: "C", name: "optionC", idx: 2, defaultVal: editingOptions[2] },
                  { key: "D", name: "optionD", idx: 3, defaultVal: editingOptions[3] },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-zinc-700 w-24 shrink-0">
                      <input
                        type="radio"
                        name="correctIndex"
                        value={opt.idx}
                        defaultChecked={editingQuestion ? editingQuestion.correctIndex === opt.idx : opt.idx === 0}
                        className="text-[#3C22BB] focus:ring-[#3C22BB]"
                      />
                      <span>Kunci {opt.key}</span>
                    </label>
                    <Input
                      name={opt.name}
                      defaultValue={opt.defaultVal}
                      placeholder={`Pilihan ${opt.key}...`}
                      required
                      className="text-xs rounded-xl flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <MiniAudioStudio
                value={questionAudioUrl}
                onChange={setQuestionAudioUrl}
                inputName="audioUrl"
                label="Audio Pelafalan Bahasa Daerah / Rekaman Suara Guru"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="explanation" className="text-xs font-semibold">
                Pembahasan / Penjelasan Jawaban (Opsional)
              </Label>
              <Textarea
                id="explanation"
                name="explanation"
                rows={2}
                defaultValue={editingQuestion?.explanation ?? ""}
                placeholder="Penjelasan mengapa kunci jawaban tersebut benar..."
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setManualModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={manualLoading}
                className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold px-4 shadow-xs"
              >
                {manualLoading
                  ? "Menyimpan..."
                  : isGuru
                    ? editingQuestion?.verificationStatus === "REJECTED"
                      ? "Perbaiki & Ajukan Ulang"
                      : "Ajukan Soal ke Admin"
                    : "Simpan Soal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Impor Massal Excel */}
      <Dialog open={excelModalOpen} onOpenChange={setExcelModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Impor Massal Soal Kuis dari Excel (.xlsx)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {isGuru && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Seluruh butir soal yang diimpor oleh Guru akan otomatis masuk dengan status{" "}
                <strong>Menunggu Verifikasi Admin</strong>.
              </div>
            )}

            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-900">
                  Langkah 1: Unduh Template Excel Resmi BBPST
                </h4>
                <p className="text-[11px] text-emerald-700">
                  Mendukung kolom standar (Pertanyaan, Pilihan A–D, Kunci) serta kolom Ungkapan Bijak Daerah.
                </p>
              </div>
              <Button
                onClick={handleDownloadTemplate}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0 gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Template (.xlsx)
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-800">
                Langkah 2: Pilih atau Unggah Berkas Excel (.xlsx / .xls)
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 hover:border-[#3C22BB] p-6 rounded-2xl text-center cursor-pointer transition-all bg-zinc-50/50 hover:bg-indigo-50/30"
              >
                <Upload className="w-8 h-8 text-[#3C22BB] mx-auto mb-2" />
                <p className="text-xs font-medium text-zinc-700">
                  {excelFile ? (
                    <strong className="text-emerald-700 font-bold">{excelFile.name}</strong>
                  ) : (
                    "Klik untuk memilih berkas Excel atau tarik berkas ke area ini"
                  )}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Format didukung: Microsoft Excel (.xlsx, .xls)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-800">
                    Pratinjau Hasil Pembacaan Excel ({validParsedCount} dari {parsedRows.length} baris valid)
                  </Label>
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-8">#</th>
                        <th className="px-3 py-2">Pertanyaan</th>
                        <th className="px-3 py-2">Pilihan A / B / C / D</th>
                        <th className="px-3 py-2 text-center w-16">Kunci</th>
                        <th className="px-3 py-2 text-center w-14">Poin</th>
                        <th className="px-3 py-2 w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={row.isValid ? "hover:bg-zinc-50" : "bg-rose-50/50"}
                        >
                          <td className="px-3 py-2 font-medium text-zinc-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium text-zinc-800 max-w-xs truncate">
                            {row.question || <span className="text-rose-500">Kosong</span>}
                          </td>
                          <td className="px-3 py-2 text-zinc-600 max-w-xs truncate">
                            A: {row.options[0]} | B: {row.options[1]}
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-emerald-700">
                            {["A", "B", "C", "D"][row.correctIndex]}
                          </td>
                          <td className="px-3 py-2 text-center">{row.points}</td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                              </span>
                            ) : (
                              <span className="text-rose-600 font-semibold text-[10px]" title={row.errorReason}>
                                {row.errorReason}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExcelModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleExecuteBulkImport}
                disabled={isImporting || validParsedCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 shadow-xs"
              >
                {isImporting
                  ? "Menyimpan ke Database..."
                  : isGuru
                    ? `Ajukan ${validParsedCount} Soal ke Admin`
                    : `Simpan ${validParsedCount} Soal ke Kuis`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Question Confirmation */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        variant="danger"
        title="Hapus Butir Soal?"
        description="Butir soal ini akan dihapus secara permanen dari bank kuis. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus Soal"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

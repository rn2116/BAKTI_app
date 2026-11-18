"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { submitQuizAttempt } from "@/actions/quiz"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { notify } from "@/lib/notify"
import { QuizSecurityGuard } from "@/components/quiz/QuizSecurityGuard"
import {
  Clock,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react"
import confetti from "canvas-confetti"
import {
  playOptionSelectSound,
  playNextQuestionSound,
  playQuizCompleteSound,
  isSoundMuted,
  setSoundMuted,
} from "@/lib/soundEffects"
import Link from "next/link"

interface QuestionItem {
  id: string
  question: string
  options: string // JSON array string
  points: number
  orderIndex: number
  explanation?: string | null
  correctIndex?: number
}

interface InteractiveQuizRunnerProps {
  quiz: {
    id: string
    title: string
    description: string | null
    timeLimit: number
    passingScore: number
    xpReward: number
    questions: QuestionItem[]
  }
}

interface QuizResultData {
  score: number
  maxScore: number
  passed: boolean
  xpEarned: number
  violationCount: number
  isAutoSubmitted: boolean
  answers: Array<{
    questionId: string
    selectedIndex: number | null
    isCorrect: boolean
    correctIndex: number
    explanation?: string | null
  }>
}

export function InteractiveQuizRunner({ quiz }: InteractiveQuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60)
  const [isMuted, setIsMuted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [result, setResult] = useState<QuizResultData | null>(null)
  const [violationCount, setViolationCount] = useState(0)
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false)

  // Initialize sound preferences
  useEffect(() => {
    setIsMuted(isSoundMuted())
  }, [])

  function toggleSound() {
    const next = !isMuted
    setIsMuted(next)
    setSoundMuted(next)
  }

  // Timer Mundur
  useEffect(() => {
    if (result) return // Berhenti jika sudah selesai
    if (timeLeft <= 0) {
      handleAutoSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, result])

  const currentQuestion = quiz.questions[currentIndex]
  const parsedOptions: string[] = currentQuestion
    ? JSON.parse(currentQuestion.options)
    : []

  const totalQuestions = quiz.questions.length
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100)

  // Pilih Opsi
  function handleSelectOption(optionIndex: number) {
    if (!currentQuestion) return
    playOptionSelectSound()
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }))
  }

  // Berpindah Soal
  function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      playNextQuestionSound()
      setCurrentIndex((prev) => prev + 1)
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      playNextQuestionSound()
      setCurrentIndex((prev) => prev - 1)
    }
  }

  // Submit Kuis
  async function handleSubmit(autoSubmitted = false, overrideViolations?: number) {
    setIsSubmitting(true)

    const finalViolationCount =
      overrideViolations !== undefined ? overrideViolations : violationCount
    const finalIsAutoSubmitted = autoSubmitted || isAutoSubmitted

    const answersPayload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: userAnswers[q.id] ?? null,
    }))

    const formData = new FormData()
    formData.append("quizId", quiz.id)
    formData.append("answers", JSON.stringify(answersPayload))
    formData.append("violationCount", String(finalViolationCount))
    formData.append("isAutoSubmitted", String(finalIsAutoSubmitted))

    const res = await submitQuizAttempt(null, formData)
    setIsSubmitting(false)

    if (res.success) {
      // Evaluasi lokal untuk feedback langsung pembahasan
      let score = 0
      let maxScore = 0
      const detailedAnswers = quiz.questions.map((q) => {
        const selected = userAnswers[q.id] ?? null
        const correct = q.correctIndex ?? 0
        const isCorrect = selected === correct
        const points = isCorrect ? q.points : 0
        score += points
        maxScore += q.points
        return {
          questionId: q.id,
          selectedIndex: selected,
          isCorrect,
          correctIndex: correct,
          explanation: q.explanation,
        }
      })

      const passed = maxScore > 0 && score / maxScore >= quiz.passingScore / 100
      const xpEarned = passed ? Math.round(quiz.xpReward * (score / (maxScore || 1))) : 0

      setResult({
        score,
        maxScore,
        passed,
        xpEarned,
        violationCount: finalViolationCount,
        isAutoSubmitted: finalIsAutoSubmitted,
        answers: detailedAnswers,
      })

      playQuizCompleteSound(passed)

      if (passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3C22BB", "#065F46", "#D97706", "#FDE047"],
        })
        notify.success("Selamat! Anda berhasil lulus kuis ini!")
        if (xpEarned > 0) {
          notify.reward("Poin XP Berhasil Diraih!", xpEarned, `Nilai akhir: ${score}/${maxScore}`)
        }
      } else {
        notify.warning("Belum mencapai KKM kelulusan. Pelajari kembali materi dan coba lagi!")
      }
    } else {
      notify.error(res.error ?? "Gagal menyimpan jawaban kuis")
    }
  }

  function handleAutoSubmit() {
    notify.warning("Waktu pengerjaan telah habis! Jawaban Anda dikumpulkan secara otomatis.")
    setIsAutoSubmitted(true)
    handleSubmit(true)
  }

  // Format menit & detik
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isTimeUrgent = timeLeft < 60

  // ==========================================
  // JIKA SUDAH SELESAI -> TAMPILKAN HASIL & PEMBAHASAN
  // ==========================================
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pt-2">
        {/* Kartu Ringkasan Nilai & Poin */}
        <Card className="rounded-3xl border-zinc-200/90 bg-white p-6 sm:p-8 text-center shadow-md space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-sm border"
            style={{
              backgroundColor: result.passed ? "#ECFDF5" : "#FEF2F2",
              borderColor: result.passed ? "#A7F3D0" : "#FECACA",
              color: result.passed ? "#065F46" : "#DC2626",
            }}
          >
            {result.passed ? "🏆" : "💪"}
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 ${
                result.passed
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {result.passed ? "Lulus Kuis" : "Belum Lulus (Remidi)"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {result.passed ? "Luar Biasa, Capaian Hebat!" : "Tetap Semangat, Jangan Menyerah!"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mt-1">
              {result.passed
                ? `Selamat! Anda berhasil mencapai nilai di atas KKM (${quiz.passingScore}%) dan meraih tambahan poin XP.`
                : `Nilai Anda belum mencapai KKM (${quiz.passingScore}%). Silakan baca kembali modul materi lalu coba lagi.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="text-[11px] font-bold text-zinc-400 uppercase">Skor Akhir</div>
              <div className="text-2xl font-black font-mono text-zinc-900">
                {result.score} <span className="text-sm text-zinc-400 font-normal">/ {result.maxScore}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-[11px] font-bold text-amber-700 uppercase flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Poin Diraih
              </div>
              <div className="text-2xl font-black font-mono text-[#D97706]">
                +{result.xpEarned} XP
              </div>
            </div>
          </div>

          {/* Indikator Kejujuran Hasil Kuis */}
          {result.violationCount === 0 ? (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3 max-w-sm mx-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Integritas Terjaga: Pengerjaan 100% jujur tanpa berpindah tab.</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl py-2 px-3 max-w-sm mx-auto">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Catatan Integritas: Terdeteksi {result.violationCount}x berpindah tab
                {result.isAutoSubmitted ? " (Kuis dikumpulkan otomatis)" : ""}.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button
              onClick={() => {
                setResult(null)
                setCurrentIndex(0)
                setUserAnswers({})
                setTimeLeft(quiz.timeLimit * 60)
                setViolationCount(0)
                setIsAutoSubmitted(false)
              }}
              variant="outline"
              className="w-full sm:w-auto rounded-xl gap-2 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4" /> Ulangi Kuis
            </Button>
            <Link href="/siswa/kuis" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold gap-2">
                Daftar Kuis Lainnya <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Kartu Pembahasan Per Butir Soal */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-zinc-900 px-1">
            Pembahasan Jawaban Kuis ({quiz.questions.length} Butir Soal)
          </h2>

          {quiz.questions.map((q, idx) => {
            const parsed: string[] = JSON.parse(q.options)
            const ans = result.answers.find((a) => a.questionId === q.id)
            const isCorrect = ans?.isCorrect ?? false
            const selectedOpt = ans?.selectedIndex !== null && ans?.selectedIndex !== undefined
              ? parsed[ans.selectedIndex]
              : null
            const correctOpt = ans ? parsed[ans.correctIndex] : null

            return (
              <Card
                key={q.id}
                className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
                  isCorrect
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-red-50/40 border-red-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs bg-white border border-zinc-200 text-zinc-800">
                      {idx + 1}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isCorrect ? "Jawaban Benar ✓" : "Kurang Tepat ✗"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-600">
                    {isCorrect ? `+${q.points}` : "0"} Poin
                  </span>
                </div>

                <p className="text-sm font-bold text-zinc-900 leading-snug">
                  {q.question}
                </p>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-500 font-semibold w-28 shrink-0">
                      Jawaban Anda:
                    </span>
                    <span
                      className={`font-semibold ${
                        isCorrect ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {selectedOpt ?? "(Tidak dijawab)"}
                    </span>
                  </div>

                  {!isCorrect && (
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-500 font-semibold w-28 shrink-0">
                        Kunci Jawaban:
                      </span>
                      <span className="font-bold text-emerald-700">
                        {correctOpt}
                      </span>
                    </div>
                  )}

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-white/80 border border-zinc-200/80 mt-2 text-zinc-700 leading-relaxed text-[11px]">
                      <span className="font-bold text-zinc-900 block mb-0.5">
                        💡 Penjelasan Pembahasan:
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ==========================================
  // MODE MENGERJAKAN SOAL FOKUS BERWAKTU
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto space-y-4 select-none">
      {/* Pengawas Kejujuran Akademik (Anti Pindah Tab & Anti Salin-Tempel) */}
      <QuizSecurityGuard
        onViolation={(count) => setViolationCount(count)}
        onAutoSubmit={() => {
          setIsAutoSubmitted(true)
          setViolationCount(3)
          handleSubmit(true, 3)
        }}
        isCompleted={Boolean(result)}
        currentViolations={violationCount}
      />

      {/* 1. Header Kuis: Waktu Mundur, Toggle Suara, dan Indikator Integritas */}
      <Card className="p-4 rounded-2xl border-zinc-200/90 bg-white shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3C22BB] bg-[#3C22BB]/10 px-2 py-0.5 rounded-full">
                Soal {currentIndex + 1} dari {totalQuestions}
              </span>

              {/* Status Integritas Ujian Bertingkat */}
              {violationCount === 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Mode Ujian Jujur • Fokus Terjaga (0/3)
                </span>
              ) : violationCount < 3 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Mode Ujian Jujur • Peringatan Pindah Tab ({violationCount}/3)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Mode Ujian Jujur • Batas Pelanggaran (3/3)
                </span>
              )}
            </div>

            <h2 className="text-sm font-bold text-zinc-900 truncate">
              {quiz.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="w-9 h-9 rounded-xl border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
              title={isMuted ? "Aktifkan Efek Suara" : "Matikan Suara"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#3C22BB]" />}
            </button>

            {/* Timer Mundur */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm ${
                isTimeUrgent
                  ? "bg-red-50 border-red-300 text-red-600 animate-pulse"
                  : "bg-zinc-50 border-zinc-200 text-zinc-800"
              }`}
            >
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Segmented Progress Bar Nomor Soal */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {quiz.questions.map((q, idx) => {
          const isAnswered = userAnswers[q.id] !== undefined
          const isCurrent = idx === currentIndex

          return (
            <button
              key={q.id}
              onClick={() => {
                playNextQuestionSound()
                setCurrentIndex(idx)
              }}
              className={`h-2 flex-1 rounded-full transition-all ${
                isCurrent
                  ? "bg-[#3C22BB] ring-2 ring-[#3C22BB]/30"
                  : isAnswered
                  ? "bg-emerald-500"
                  : "bg-zinc-200"
              }`}
              title={`Nomor ${idx + 1}`}
            />
          )
        })}
      </div>

      {/* 3. Kartu Soal dengan Transisi AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="rounded-3xl border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>PERTANYAAN NO. {currentIndex + 1}</span>
                <span>+{currentQuestion.points} POIN</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-relaxed break-words">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Opsi Pilihan Jawaban A, B, C, D */}
            <div className="space-y-2.5 pt-2">
              {parsedOptions.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestion.id] === optIdx
                const letter = String.fromCharCode(65 + optIdx)

                return (
                  <motion.button
                    key={optIdx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full min-h-[52px] p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-[#3C22BB]/10 border-[#3C22BB] text-[#3C22BB] shadow-sm ring-1 ring-[#3C22BB]"
                        : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#3C22BB] text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="flex-1 break-words">{opt}</span>
                  </motion.button>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* 4. Navigasi Bawah: Sebelum / Selanjutnya / Selesai */}
      <div className="flex items-center justify-between pt-2">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          variant="outline"
          className="rounded-xl gap-1 text-xs font-bold px-4 h-10"
        >
          <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
        </Button>

        {currentIndex === totalQuestions - 1 ? (
          <Button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isSubmitting}
            className="rounded-xl bg-[#065F46] hover:bg-[#044a36] text-white gap-2 text-xs font-bold px-5 h-10 shadow-md"
          >
            <span>{isSubmitting ? "Mengumpulkan..." : "Kumpulkan Kuis"}</span>
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white gap-1 text-xs font-bold px-5 h-10 shadow-xs"
          >
            <span>Soal Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Dialog Konfirmasi Kumpulkan Kuis */}
      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        variant="primary"
        title="Kumpulkan Jawaban Kuis?"
        description={`Anda telah menjawab ${
          Object.keys(userAnswers).length
        } dari ${totalQuestions} butir soal. Apakah Anda yakin ingin menyelesaikan dan mengirim jawaban sekarang?`}
        confirmText="Ya, Kumpulkan Jawaban"
        cancelText="Periksa Kembali"
        isLoading={isSubmitting}
        onConfirm={async () => {
          setShowSubmitConfirm(false)
          await handleSubmit()
        }}
      />
    </div>
  )
}

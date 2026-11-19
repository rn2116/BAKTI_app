"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
  markFlashcardLearnedAction,
  completeMatchingStageAction,
} from "@/actions/regional-learning"
import { AudioButton } from "@/components/shared/AudioButton"
import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notify"
import {
  playOptionSelectSound,
  playNextQuestionSound,
  playQuizCompleteSound,
} from "@/lib/soundEffects"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Layers,
  Lock,
  Puzzle,
  Quote,
  RotateCw,
  Sparkles,
  Trophy,
  Award,
  RefreshCw,
} from "lucide-react"
import type { RegionalLanguageModuleData } from "@/services/regionalLearningService"

interface RegionalLearningFlowClientProps {
  data: RegionalLanguageModuleData
}

type StageNumber = 1 | 2 | 3

export function RegionalLearningFlowClient({ data }: RegionalLearningFlowClientProps) {
  const router = useRouter()

  const initialStage: StageNumber = !data.progress.stage1Completed
    ? 1
    : !data.progress.stage2Completed
      ? 2
      : 3

  const [activeStage, setActiveStage] = useState<StageNumber>(initialStage)

  // Tahap 1: Flashcard state
  const [cardIdx, setCardIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState<string[]>(data.progress.learnedCardIds)
  const [stage1Done, setStage1Done] = useState(data.progress.stage1Completed)
  const [isMarkingCard, setIsMarkingCard] = useState(false)

  // Tahap 2: Matching Game state
  const [stage2Done, setStage2Done] = useState(data.progress.stage2Completed)
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null)
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [isSavingStage2, setIsSavingStage2] = useState(false)

  // Acak urutan opsi kanan Tahap 2 secara deterministik agar tidak sejajar persis dengan kiri
  const shuffledRightPairs = useMemo(() => {
    const arr = [...data.matchingPairs]
    if (arr.length <= 1) return arr
    // Rotasi & tukar posisi deterministik
    const rotated = [...arr.slice(1), arr[0]]
    if (rotated.length >= 3) {
      const tmp = rotated[0]
      rotated[0] = rotated[rotated.length - 1]
      rotated[rotated.length - 1] = tmp
    }
    return rotated
  }, [data.matchingPairs])

  const currentCard = data.flashcards[cardIdx]
  const totalCards = data.flashcards.length
  const learnedSet = new Set(learnedIds)
  const isCurrentCardLearned = currentCard ? learnedSet.has(currentCard.id) : false

  async function handleMarkCardLearned() {
    if (!currentCard) return
    setIsMarkingCard(true)
    const res = await markFlashcardLearnedAction({
      regionalLanguage: data.language,
      cardId: currentCard.id,
      totalCards: Math.max(1, totalCards),
    })
    setIsMarkingCard(false)

    if (res.success && res.learnedCardIds) {
      setLearnedIds(res.learnedCardIds)
      playOptionSelectSound()
      if (res.stage1Completed && !stage1Done) {
        setStage1Done(true)
        notify.success("Tahap 1 selesai! Latihan Mencocokkan kini terbuka.")
        if (res.xpAwarded && res.xpAwarded > 0) {
          notify.reward("Bonus Tahap 1!", res.xpAwarded, "Kartu ungkapan tuntas dipelajari")
        }
      } else {
        notify.success("Kartu ditandai sudah dipelajari ✓")
      }
      if (cardIdx < totalCards - 1) {
        setIsFlipped(false)
        setCardIdx((prev) => prev + 1)
      }
      router.refresh()
    } else {
      notify.error(res.error ?? "Gagal mencatat progres kartu")
    }
  }

  function handleSelectRightMeaning(rightId: string) {
    if (!selectedLeftId || matchedIds.includes(rightId)) return

    if (selectedLeftId === rightId) {
      playOptionSelectSound()
      const nextMatched = [...matchedIds, rightId]
      setMatchedIds(nextMatched)
      setSelectedLeftId(null)
      setWrongPair(null)

      if (nextMatched.length >= data.matchingPairs.length) {
        void finishStage2()
      }
    } else {
      setMistakes((m) => m + 1)
      setWrongPair({ left: selectedLeftId, right: rightId })
      notify.warning("Belum cocok! Perhatikan kembali arti dan nilai karakternya.")
      setTimeout(() => {
        setWrongPair(null)
        setSelectedLeftId(null)
      }, 650)
    }
  }

  async function finishStage2() {
    const score = Math.max(60, 100 - mistakes * 10)
    setIsSavingStage2(true)
    const res = await completeMatchingStageAction({
      regionalLanguage: data.language,
      score,
    })
    setIsSavingStage2(false)

    if (res.success) {
      setStage2Done(true)
      playQuizCompleteSound(true)
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.65 },
        colors: ["#3C22BB", "#065F46", "#D97706", "#FDE047"],
      })
      notify.success("Hebat! Tahap 2 selesai. Kuis Evaluasi kini terbuka!")
      if (res.xpAwarded && res.xpAwarded > 0) {
        notify.reward("Bonus Tahap 2!", res.xpAwarded, `Skor latihan: ${score}%`)
      }
      router.refresh()
    } else {
      notify.error(res.error ?? "Gagal menyimpan progres latihan")
    }
  }

  function resetMatchingGame() {
    setMatchedIds([])
    setSelectedLeftId(null)
    setWrongPair(null)
    setMistakes(0)
  }

  const stages = [
    {
      num: 1 as const,
      title: "Kartu Ungkapan",
      subtitle: "Flashcard Interaktif",
      icon: Layers,
      unlocked: true,
      completed: stage1Done,
    },
    {
      num: 2 as const,
      title: "Latihan Ringan",
      subtitle: "Mencocokkan Makna",
      icon: Puzzle,
      unlocked: stage1Done,
      completed: stage2Done,
    },
    {
      num: 3 as const,
      title: "Kuis Evaluasi",
      subtitle: "Ujian & Sertifikat",
      icon: ClipboardList,
      unlocked: stage2Done,
      completed: data.progress.stage3Completed,
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb & Header Bahasa */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/siswa/budaya-bahasa"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3C22BB] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kamus 9 Bahasa
        </Link>
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-200">
          Wilayah Tutur: {data.region}
        </span>
      </div>

      {/* Hero Header Modul Bahasa */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1E135E] via-[#3C22BB] to-[#0D9488] p-6 sm:p-8 text-white shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Alur Belajar Bertahap 3 Tahap</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Eksplorasi {data.languageName}
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl leading-relaxed">
          Pelajari ungkapan bijak secara bertahap: pahami arti melalui kartu interaktif, asah ingatan di latihan mencocokkan, lalu tuntaskan kuis evaluasi untuk meraih sertifikat resmi BBPST.
        </p>
      </div>

      {/* Stepper 1 -> 2 -> 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stages.map((st) => {
          const IconComp = st.icon
          const isActive = activeStage === st.num

          return (
            <button
              key={st.num}
              type="button"
              onClick={() => {
                if (!st.unlocked) {
                  notify.warning(`Selesaikan Tahap ${st.num - 1} terlebih dahulu untuk membuka tahap ini.`)
                  return
                }
                playNextQuestionSound()
                setActiveStage(st.num)
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 min-h-[72px] ${
                isActive
                  ? "bg-[#3C22BB] text-white border-[#3C22BB] shadow-md"
                  : st.completed
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70"
                    : st.unlocked
                      ? "bg-white border-zinc-200 text-zinc-900 hover:border-[#3C22BB]/50"
                      : "bg-zinc-50 border-zinc-200/80 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                  isActive
                    ? "bg-white/20 text-white"
                    : st.completed
                      ? "bg-emerald-600 text-white"
                      : st.unlocked
                        ? "bg-indigo-50 text-[#3C22BB]"
                        : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {st.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : !st.unlocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <IconComp className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? "text-amber-300" : st.completed ? "text-emerald-700" : "text-zinc-400"
                  }`}
                >
                  Tahap {st.num} {st.completed ? "• Selesai" : ""}
                </div>
                <div className="font-extrabold text-sm truncate">{st.title}</div>
                <div
                  className={`text-[11px] truncate ${
                    isActive ? "text-indigo-100" : "text-zinc-500"
                  }`}
                >
                  {st.subtitle}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* KONTEN TAHAP AKTIF */}
      <AnimatePresence mode="wait">
        {/* =========================================
            TAHAP 1: KARTU UNGKAPAN (FLASHCARD)
           ========================================= */}
        {activeStage === 1 && (
          <motion.div
            key="stage-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {currentCard ? (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-zinc-600 px-1">
                  <span>
                    Kartu {cardIdx + 1} dari {totalCards} ({learnedIds.length}/{totalCards} dipelajari)
                  </span>
                  <span className="text-[#3C22BB]">Ketuk kartu untuk membalik</span>
                </div>

                {/* Flashcard Interaktif */}
                <div
                  onClick={() => setIsFlipped((f) => !f)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setIsFlipped((f) => !f)
                    }
                  }}
                  className="cursor-pointer select-none rounded-3xl border border-[#3C22BB]/20 bg-white p-6 sm:p-10 shadow-sm hover:shadow-md transition-all min-h-[280px] flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3C22BB]/10 text-[#3C22BB] text-xs font-bold">
                      <Quote className="w-3.5 h-3.5" />
                      {isFlipped ? "Makna & Nilai Karakter" : data.languageName}
                    </span>

                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                      {isCurrentCardLearned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dipelajari
                        </span>
                      )}
                      <AudioButton
                        audioUrl={currentCard.audioUrl}
                        text={`${currentCard.text}. Artinya: ${currentCard.literalMeaning}`}
                        label="Dengarkan"
                        variant="indigo"
                        size="sm"
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div
                        key="front"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="my-auto py-8 text-center space-y-4"
                      >
                        <p className="font-serif italic font-bold text-xl sm:text-3xl text-[#1E135E] leading-relaxed break-words">
                          &ldquo;{currentCard.text}&rdquo;
                        </p>
                        <p className="text-xs text-zinc-400 font-medium">
                          Rujukan: {currentCard.referenceSource}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="my-auto py-4 space-y-3 text-left"
                      >
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <div className="text-[11px] font-bold uppercase text-emerald-700">
                            Nilai Karakter Utama
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-emerald-950">
                            {currentCard.characterValue}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                          <div className="text-[11px] font-bold uppercase text-[#3C22BB]">
                            Arti Harfiah
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed mt-0.5">
                            {currentCard.literalMeaning}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                          <div className="text-[11px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" /> Makna Filosofis & Penerapan
                          </div>
                          <p className="text-xs text-zinc-700 leading-relaxed mt-0.5">
                            {currentCard.philosophicalMeaning}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-center text-xs font-semibold text-zinc-400 gap-1.5 pt-2">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? "Ketuk untuk melihat ungkapan daerah" : "Ketuk kartu untuk melihat makna"}</span>
                  </div>
                </div>

                {/* Navigasi Kartu & Tombol Tandai Dipelajari */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={cardIdx === 0}
                      onClick={() => {
                        setIsFlipped(false)
                        setCardIdx((prev) => Math.max(0, prev - 1))
                      }}
                      className="rounded-xl text-xs font-bold h-11 px-4 gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Sebelumnya
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={cardIdx >= totalCards - 1}
                      onClick={() => {
                        setIsFlipped(false)
                        setCardIdx((prev) => Math.min(totalCards - 1, prev + 1))
                      }}
                      className="rounded-xl text-xs font-bold h-11 px-4 gap-1"
                    >
                      Berikutnya <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      type="button"
                      disabled={isMarkingCard || isCurrentCardLearned}
                      onClick={handleMarkCardLearned}
                      className={`flex-1 sm:flex-none h-11 px-5 rounded-xl text-xs font-bold gap-2 ${
                        isCurrentCardLearned
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-[#3C22BB] hover:bg-[#2E1994] text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isMarkingCard
                          ? "Menyimpan..."
                          : isCurrentCardLearned
                            ? "Sudah Dipelajari ✓"
                            : "Tandai Sudah Dipelajari"}
                      </span>
                    </Button>

                    {stage1Done && (
                      <Button
                        type="button"
                        onClick={() => setActiveStage(2)}
                        className="flex-1 sm:flex-none h-11 px-5 rounded-xl bg-[#065F46] hover:bg-[#044a36] text-white text-xs font-bold gap-1.5 shadow-sm"
                      >
                        <span>Lanjut Tahap 2</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center space-y-3">
                <p className="text-sm font-bold text-zinc-700">
                  Belum ada kartu ungkapan pada bahasa ini.
                </p>
                <Button
                  onClick={() => setActiveStage(3)}
                  className="bg-[#3C22BB] text-white rounded-xl text-xs font-bold"
                >
                  Langsung ke Kuis Evaluasi
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================
            TAHAP 2: LATIHAN RINGAN (MENCOCOKKAN)
           ========================================= */}
        {activeStage === 2 && (
          <motion.div
            key="stage-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                  <Puzzle className="w-5 h-5 text-[#3C22BB]" />
                  Latihan Mencocokkan Ungkapan & Makna
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ketuk satu ungkapan daerah (kiri/atas), lalu ketuk arti atau nilai karakter yang paling tepat (kanan/bawah).
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-200">
                  {matchedIds.length} / {data.matchingPairs.length} Cocok
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetMatchingGame}
                  className="rounded-xl text-xs gap-1 h-8"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Acak Ulang
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom Kiri: Ungkapan Daerah */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                  1. Pilih Ungkapan Daerah
                </div>
                {data.matchingPairs.map((pair) => {
                  const isMatched = matchedIds.includes(pair.id)
                  const isSelected = selectedLeftId === pair.id
                  const isWrong = wrongPair?.left === pair.id

                  return (
                    <div
                      key={pair.id}
                      onClick={() => {
                        if (!isMatched) {
                          playOptionSelectSound()
                          setSelectedLeftId(pair.id)
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 min-h-[56px] ${
                        isMatched
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 opacity-75 cursor-default"
                          : isWrong
                            ? "bg-rose-50 border-rose-400 text-rose-900"
                            : isSelected
                              ? "bg-[#3C22BB] text-white border-[#3C22BB] shadow-md cursor-pointer"
                              : "bg-zinc-50/70 border-zinc-200 hover:border-[#3C22BB]/60 cursor-pointer"
                      }`}
                    >
                      <span className="font-serif italic font-bold text-xs sm:text-sm leading-snug break-words flex-1">
                        &ldquo;{pair.expression}&rdquo;
                      </span>
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        <AudioButton
                          audioUrl={pair.audioUrl}
                          text={pair.expression}
                          variant={isSelected ? "light" : "ghost"}
                          size="sm"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Kolom Kanan: Arti / Nilai Karakter */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                  2. Pasangkan dengan Arti / Nilai
                </div>
                {shuffledRightPairs.map((pair) => {
                  const isMatched = matchedIds.includes(pair.id)
                  const isWrong = wrongPair?.right === pair.id

                  return (
                    <button
                      key={pair.id}
                      type="button"
                      disabled={isMatched || !selectedLeftId}
                      onClick={() => handleSelectRightMeaning(pair.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 min-h-[56px] text-xs font-semibold ${
                        isMatched
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                          : isWrong
                            ? "bg-rose-50 border-rose-400 text-rose-900"
                            : selectedLeftId
                              ? "bg-white border-[#3C22BB]/30 hover:bg-indigo-50 text-zinc-800 cursor-pointer"
                              : "bg-zinc-50 border-zinc-200 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      <span className="leading-relaxed break-words flex-1">{pair.meaning}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {stage2Done && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <div className="font-extrabold">Tahap 2 Selesai!</div>
                    <div>Anda siap melanjutkan ke Kuis Evaluasi Resmi.</div>
                  </div>
                </div>
                <Button
                  type="button"
                  disabled={isSavingStage2}
                  onClick={() => setActiveStage(3)}
                  className="bg-[#065F46] hover:bg-[#044a36] text-white rounded-xl text-xs font-bold h-10 px-5 gap-1.5"
                >
                  <span>Lanjut Tahap 3: Kuis Evaluasi</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================
            TAHAP 3: KUIS EVALUASI & SERTIFIKAT
           ========================================= */}
        {activeStage === 3 && (
          <motion.div
            key="stage-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C22BB]/10 text-[#3C22BB] text-[11px] font-bold">
                    <Trophy className="w-3.5 h-3.5" /> Tahap Akhir — Kuis Evaluasi
                  </span>
                  <h2 className="text-xl font-black text-zinc-900">
                    {data.quiz?.title ?? `Evaluasi ${data.languageName}`}
                  </h2>
                  <p className="text-xs text-zinc-500 max-w-xl">
                    {data.quiz?.description ??
                      "Uji pemahaman Anda terhadap ungkapan bijak dan nilai karakter daerah dalam mode ujian fokus untuk memperoleh sertifikat."}
                  </p>
                </div>
              </div>

              {data.quiz ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                      <div className="text-[10px] font-bold uppercase text-zinc-400">Jumlah Soal</div>
                      <div className="text-lg font-black text-zinc-900">
                        {data.quiz.questionCount} Butir
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                      <div className="text-[10px] font-bold uppercase text-zinc-400">Durasi</div>
                      <div className="text-lg font-black text-zinc-900">
                        {data.quiz.timeLimit} Menit
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                      <div className="text-[10px] font-bold uppercase text-zinc-400">KKM Lulus</div>
                      <div className="text-lg font-black text-zinc-900">
                        {data.quiz.passingScore}%
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="text-[10px] font-bold uppercase text-amber-700">Hadiah XP</div>
                      <div className="text-lg font-black text-[#D97706]">
                        +{data.quiz.xpReward} XP
                      </div>
                    </div>
                  </div>

                  {data.quiz.bestAttempt && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-bold text-indigo-950">Capaian Terbaik Anda: </span>
                        <span className="font-mono font-bold text-[#3C22BB]">
                          {data.quiz.bestAttempt.score}/{data.quiz.bestAttempt.maxScore} (
                          {data.quiz.bestAttempt.percent}%)
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          data.quiz.bestAttempt.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {data.quiz.bestAttempt.passed ? "Lulus ✓" : "Belum Lulus"}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <Link
                      href={`/siswa/kuis/${data.quiz.id}/mulai`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-sm shadow-md transition-all min-h-12"
                    >
                      <span>
                        {data.quiz.bestAttempt?.passed
                          ? "Ulangi Kuis Evaluasi"
                          : "Mulai Kuis Evaluasi Sekarang"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center space-y-2">
                  <p className="text-xs text-zinc-500">
                    Kuis evaluasi khusus {data.languageName} sedang disiapkan. Anda dapat mengikuti kuis budaya umum terlebih dahulu.
                  </p>
                  <Link
                    href="/siswa/kuis"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3C22BB] hover:underline"
                  >
                    Lihat Daftar Kuis Tersedia <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Kartu Sertifikat jika sudah diraih */}
            {data.certificate && (
              <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <Award className="w-7 h-7 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                      Sertifikat Digital Resmi Terbit!
                    </div>
                    <div className="text-base font-black">
                      Kompetensi {data.languageName} (Skor: {data.certificate.skorAkhir}%)
                    </div>
                    <div className="text-[11px] font-mono text-emerald-100/90">
                      No. {data.certificate.nomorSertifikat}
                    </div>
                  </div>
                </div>
                <Link
                  href="/siswa/sertifikat"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs shrink-0"
                >
                  Unduh Sertifikat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

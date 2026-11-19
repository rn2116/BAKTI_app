"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { generateQuickReadingCheck } from "@/lib/readingCheck"
import {
  Clock,
  CheckCircle2,
  Lock,
  Award,
  Sparkles,
  AlertTriangle,
  BookOpenCheck,
  HelpCircle,
  RotateCcw,
  ArrowUp,
  Layers,
} from "lucide-react"

export interface ReadingClaimPayload {
  startedAt: number
  readingToken: string
  checkVerified: boolean
  segmentsCompleted: number
  totalSegments: number
}

interface ReadingEngagementGateProps {
  title: string
  summary: string
  contentHtml: string
  readingToken: string
  isDone: boolean
  onClaim: (payload: ReadingClaimPayload) => Promise<void>
  onSegmentProgressChange?: (readCount: number) => void
  loading: boolean
}

export function ReadingEngagementGate({
  title,
  summary,
  contentHtml,
  readingToken,
  isDone,
  onClaim,
  onSegmentProgressChange,
  loading,
}: ReadingEngagementGateProps) {
  const startedAtRef = useRef<number>(Date.now())
  const lastScrollYRef = useRef<number>(0)
  const lastScrollTimeRef = useRef<number>(Date.now())
  const visibleSegmentsRef = useRef<Set<number>>(new Set())
  const segmentDwellRef = useRef<Record<number, number>>({})

  const [totalSegments, setTotalSegments] = useState<number>(1)
  const [segmentRequiredSeconds, setSegmentRequiredSeconds] = useState<number[]>([5])
  const [readSegmentCount, setReadSegmentCount] = useState<number>(0)
  const [currentSegmentDwell, setCurrentSegmentDwell] = useState<number>(0)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [fastScrollWarning, setFastScrollWarning] = useState<boolean>(false)

  // State Cek Pemahaman Singkat (Lapis 3)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checkStatus, setCheckStatus] = useState<"IDLE" | "WRONG" | "VERIFIED">("IDLE")

  // Hitung total kata dan target waktu baca minimal global (25–60 detik)
  const totalWords = useMemo(() => {
    const plain = contentHtml
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    return plain ? plain.split(/\s+/).length : 0
  }, [contentHtml])

  const requiredGlobalSeconds = useMemo(() => {
    return Math.max(25, Math.min(60, Math.ceil(totalWords / 4)))
  }, [totalWords])

  // Pertanyaan cek pemahaman singkat deterministik dari isi materi
  const quickCheck = useMemo(
    () => generateQuickReadingCheck(title, summary, contentHtml),
    [title, summary, contentHtml]
  )

  const allSegmentsRead = readSegmentCount >= totalSegments
  const isTimeFulfilled = elapsedSeconds >= requiredGlobalSeconds
  const isReadyForReadingCheck = allSegmentsRead && isTimeFulfilled
  const isCheckVerified = checkStatus === "VERIFIED"
  const canClaim = isReadyForReadingCheck && isCheckVerified && !isDone && !loading

  // Hitung estimasi sisa waktu baca aktif (menggabungkan sisa segmen + sisa waktu global)
  const remainingSegmentSeconds = useMemo(() => {
    if (allSegmentsRead) return 0
    let rem = 0
    for (let i = readSegmentCount; i < totalSegments; i++) {
      const req = segmentRequiredSeconds[i] ?? 5
      const spent = i === readSegmentCount ? currentSegmentDwell : (segmentDwellRef.current[i] ?? 0)
      rem += Math.max(0, req - spent)
    }
    return rem
  }, [allSegmentsRead, readSegmentCount, totalSegments, segmentRequiredSeconds, currentSegmentDwell])

  const estimatedRemainingSeconds = Math.max(
    remainingSegmentSeconds,
    Math.max(0, requiredGlobalSeconds - elapsedSeconds)
  )

  const progressPercent =
    totalSegments > 0 ? Math.round((readSegmentCount / totalSegments) * 100) : 0

  // Beri tahu parent setiap kali jumlah segmen terbaca berubah
  useEffect(() => {
    onSegmentProgressChange?.(readSegmentCount)
  }, [readSegmentCount, onSegmentProgressChange])

  // 1. Inisialisasi daftar segmen & IntersectionObserver
  useEffect(() => {
    if (isDone) return

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reading-segment]")
    )

    if (elements.length === 0) {
      setTotalSegments(1)
      setSegmentRequiredSeconds([5])
      return
    }

    setTotalSegments(elements.length)
    const perSegReq = elements.map((el) => {
      const words = (el.innerText || "").trim().split(/\s+/).filter(Boolean).length
      // Minimal 4-6 detik per bagian
      return Math.max(4, Math.min(6, Math.ceil(words / 22)))
    })
    setSegmentRequiredSeconds(perSegReq)

    const updateVisibilityManually = () => {
      const vh = window.innerHeight || 800
      elements.forEach((el) => {
        const idxAttr = el.getAttribute("data-reading-segment")
        const idx = idxAttr ? parseInt(idxAttr, 10) : -1
        if (idx < 0) return
        const rect = el.getBoundingClientRect()
        const inView = rect.top < vh * 0.85 && rect.bottom > vh * 0.12
        if (inView) {
          visibleSegmentsRef.current.add(idx)
        } else {
          visibleSegmentsRef.current.delete(idx)
        }
      })
    }

    updateVisibilityManually()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idxAttr = entry.target.getAttribute("data-reading-segment")
          const idx = idxAttr ? parseInt(idxAttr, 10) : -1
          if (idx < 0) return

          if (entry.isIntersecting) {
            visibleSegmentsRef.current.add(idx)
          } else {
            visibleSegmentsRef.current.delete(idx)
          }
        })
      },
      {
        threshold: [0.05, 0.25],
        rootMargin: "-60px 0px -80px 0px",
      }
    )

    elements.forEach((el) => observer.observe(el))
    window.addEventListener("scroll", updateVisibilityManually, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", updateVisibilityManually)
    }
  }, [isDone, contentHtml])

  // 2. Deteksi Fast-Scroll (Antisipasi loncat langsung ke bawah dalam < 5 detik / loncat tengah artikel)
  useEffect(() => {
    if (isDone || allSegmentsRead) return

    function handleScrollSpeedCheck() {
      const now = Date.now()
      const currentY = window.scrollY
      const dtSinceMount = now - startedAtRef.current
      const dtScroll = Math.max(16, now - lastScrollTimeRef.current)
      const deltaY = currentY - lastScrollYRef.current

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      )
      const scrollRatio = currentY / maxScroll

      // Kasus A: Menggulir ke bagian bawah (< 5 detik sejak dibuka) pada artikel yang bisa digulir
      const jumpedEarlyToBottom =
        maxScroll > 250 && dtSinceMount < 5000 && scrollRatio >= 0.72

      // Kasus B: Kecepatan gulir ekstrem melompati bagian tengah yang belum dibaca
      const highVelocityJump =
        deltaY > 850 && dtScroll < 350 && readSegmentCount < Math.max(1, totalSegments - 1)

      // Kasus C: Berada di bagian paling bawah padahal bagian awal/tengah belum terbaca
      const skippedMiddleToEnd =
        maxScroll > 250 &&
        scrollRatio >= 0.88 &&
        readSegmentCount < Math.max(1, totalSegments - 1) &&
        !visibleSegmentsRef.current.has(readSegmentCount)

      if (jumpedEarlyToBottom || highVelocityJump || skippedMiddleToEnd) {
        setFastScrollWarning(true)
      } else if (visibleSegmentsRef.current.has(readSegmentCount)) {
        // Hilangkan peringatan bila siswa kembali ke bagian berurutan yang sedang dibaca
        setFastScrollWarning(false)
      }

      lastScrollYRef.current = currentY
      lastScrollTimeRef.current = now
    }

    window.addEventListener("scroll", handleScrollSpeedCheck, { passive: true })
    return () => window.removeEventListener("scroll", handleScrollSpeedCheck)
  }, [isDone, allSegmentsRead, readSegmentCount, totalSegments])

  // 3. Timer Aktif (!document.hidden) untuk progres waktu global & segmen berurutan
  useEffect(() => {
    if (isDone) return

    const interval = setInterval(() => {
      if (document.hidden) return

      setElapsedSeconds((prev) =>
        prev >= requiredGlobalSeconds ? requiredGlobalSeconds : prev + 1
      )

      setReadSegmentCount((currentCompleted) => {
        if (currentCompleted >= totalSegments) return currentCompleted

        // Segmen hanya bertambah apabila segmen berurutan saat ini berada di viewport
        if (visibleSegmentsRef.current.has(currentCompleted)) {
          const prevDwell = segmentDwellRef.current[currentCompleted] ?? 0
          const nextDwell = prevDwell + 1
          segmentDwellRef.current[currentCompleted] = nextDwell
          setCurrentSegmentDwell(nextDwell)

          const requiredForSeg = segmentRequiredSeconds[currentCompleted] ?? 5
          if (nextDwell >= requiredForSeg) {
            setFastScrollWarning(false)
            setCurrentSegmentDwell(0)
            return currentCompleted + 1
          }
        }
        return currentCompleted
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isDone, totalSegments, segmentRequiredSeconds, requiredGlobalSeconds])

  const scrollToActiveSegment = useCallback(() => {
    const targetEl = document.querySelector<HTMLElement>(
      `[data-reading-segment="${readSegmentCount}"]`
    )
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" })
      setFastScrollWarning(false)
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [readSegmentCount])

  function handleCheckAnswer() {
    if (selectedOption === null) return
    if (selectedOption === quickCheck.correctIndex) {
      setCheckStatus("VERIFIED")
    } else {
      setCheckStatus("WRONG")
    }
  }

  function handleRetryCheck() {
    setSelectedOption(null)
    setCheckStatus("IDLE")
  }

  if (isDone) {
    return (
      <div className="mt-10 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center text-[#065F46] shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-zinc-900">
              Materi Ini Sudah Selesai!
            </div>
            <div className="text-xs text-zinc-500">
              Anda telah mengklaim +100 Poin XP untuk materi ini.
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 text-[#065F46] border border-emerald-200 font-bold text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Selesai Dipelajari</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Bilah Progres Bacaan Mengambang (Ringkas di Bawah Layar saat Belum Tuntas) */}
      {!isReadyForReadingCheck && (
        <div className="fixed bottom-20 md:bottom-5 right-4 left-4 md:left-auto md:w-80 z-30 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-zinc-200/90 shadow-lg rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800">
              <span className="flex items-center gap-1.5 text-[#3C22BB]">
                <Layers className="w-3.5 h-3.5" />
                Terbaca {readSegmentCount} dari {totalSegments} bagian materi
              </span>
              <span className="font-mono text-emerald-700">{progressPercent}%</span>
            </div>

            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3C22BB] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Estimasi sisa waktu baca aktif:
              </span>
              <span className="font-mono font-bold text-zinc-700">
                {estimatedRemainingSeconds} detik
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-zinc-200/80 space-y-5">
        {/* Peringatan Anti Fast-Scroll */}
        <AnimatePresence>
          {fastScrollWarning && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-2xl bg-orange-50 border border-orange-300 text-orange-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EA580C]/15 text-[#EA580C] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#EA580C]" />
                </div>
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-orange-950">
                  Kamu menggulir terlalu cepat! Silakan baca materi secara perlahan dari bagian
                  awal agar pemahamanmu maksimal sebelum mengklaim poin.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={scrollToActiveSegment}
                className="border-orange-300 bg-white hover:bg-orange-100 text-[#EA580C] font-bold text-xs rounded-xl shrink-0 gap-1.5"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Ke Bagian {Math.min(readSegmentCount + 1, totalSegments)}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Penjaminan Kualitas Membaca */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-[#D97706] shrink-0">
              <Sparkles className="w-6 h-6 text-[#D97706]" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-zinc-900">
                Validasi Membaca & Pemahaman Materi
              </div>
              <p className="text-xs text-zinc-500">
                Baca seluruh bagian secara berurutan dan jawab 1 cek pemahaman untuk klaim +100 XP:
              </p>
            </div>
          </div>
        </div>

        {/* Bilah Progres Bagian & Waktu Baca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Lapis 1 & 2A: Progres Bagian Berurutan */}
          <div
            className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
              allSegmentsRead
                ? "bg-emerald-50 border-emerald-200 text-[#065F46]"
                : "bg-indigo-50/50 border-indigo-200/80 text-zinc-900"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                {allSegmentsRead ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <BookOpenCheck className="w-4 h-4 text-[#3C22BB] shrink-0" />
                )}
                <span>
                  {allSegmentsRead
                    ? `Seluruh bagian terbaca (${totalSegments}/${totalSegments}) ✓`
                    : `Terbaca ${readSegmentCount} dari ${totalSegments} bagian materi`}
                </span>
              </span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/80 rounded-full overflow-hidden border border-black/5">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  allSegmentsRead ? "bg-emerald-600" : "bg-[#3C22BB]"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Lapis 2B: Waktu Baca Aktif */}
          <div
            className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all ${
              isTimeFulfilled && allSegmentsRead
                ? "bg-emerald-50 border-emerald-200 text-[#065F46]"
                : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}
          >
            {isTimeFulfilled && allSegmentsRead ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
            )}
            <div className="text-xs">
              {isTimeFulfilled && allSegmentsRead ? (
                <span className="font-bold">Waktu baca aktif terpenuhi ✓</span>
              ) : (
                <span>
                  Estimasi sisa waktu baca aktif:{" "}
                  <strong className="font-mono font-bold text-amber-900">
                    {estimatedRemainingSeconds} detik lagi
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lapis 3: Kartu Cek Pemahaman Singkat (Muncul setelah bacaan & waktu terpenuhi) */}
        <AnimatePresence>
          {isReadyForReadingCheck && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl border p-5 space-y-4 ${
                isCheckVerified
                  ? "bg-emerald-50/70 border-emerald-300"
                  : "bg-indigo-50/50 border-[#3C22BB]/30"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#3C22BB]">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Cek Pemahaman Singkat</span>
                </div>

                {isCheckVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#065F46] border border-emerald-300 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Pemahaman Terverifikasi ✓
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-zinc-900 leading-relaxed">
                {quickCheck.question}
              </p>

              <div className="space-y-2">
                {quickCheck.options.map((optText, idx) => {
                  const isSelected = selectedOption === idx
                  const letter = String.fromCharCode(65 + idx)
                  const isLockedVerified = isCheckVerified

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isLockedVerified}
                      onClick={() => {
                        setSelectedOption(idx)
                        if (checkStatus === "WRONG") {
                          setCheckStatus("IDLE")
                        }
                      }}
                      className={`w-full min-h-12 p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium flex items-center gap-3 transition-all ${
                        isLockedVerified && idx === quickCheck.correctIndex
                          ? "bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold"
                          : isSelected
                            ? "bg-[#3C22BB]/10 border-[#3C22BB] text-[#1E135E] font-semibold ring-1 ring-[#3C22BB]"
                            : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isLockedVerified && idx === quickCheck.correctIndex
                            ? "bg-emerald-600 text-white"
                            : isSelected
                              ? "bg-[#3C22BB] text-white"
                              : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 leading-snug break-words">{optText}</span>
                    </button>
                  )
                })}
              </div>

              {checkStatus === "WRONG" && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-rose-800">
                    Jawaban belum tepat, coba periksa kembali bagian inti bacaan di atas ya!
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRetryCheck}
                    className="border-rose-300 bg-white hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl shrink-0 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Coba Jawab Lagi
                  </Button>
                </div>
              )}

              {!isCheckVerified && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleCheckAnswer}
                    disabled={selectedOption === null}
                    className="h-10 px-5 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    Periksa Jawaban
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tombol Klaim Poin XP */}
        <div className="flex justify-end pt-2">
          {canClaim ? (
            <motion.div
              whileTap={{ scale: 0.98 }}
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <Button
                onClick={() =>
                  onClaim({
                    startedAt: startedAtRef.current,
                    readingToken,
                    checkVerified: true,
                    segmentsCompleted: readSegmentCount,
                    totalSegments,
                  })
                }
                disabled={loading}
                className="relative overflow-hidden h-12 px-6 rounded-2xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-sm shadow-md gap-2 cursor-pointer transition-all"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>{loading ? "Memproses..." : "Tandai Selesai & Klaim Poin XP"}</span>
              </Button>
            </motion.div>
          ) : (
            <Button
              disabled
              className="h-12 px-6 rounded-2xl bg-zinc-100 text-zinc-400 border border-zinc-200 font-bold text-sm cursor-not-allowed gap-2"
            >
              <Lock className="w-4 h-4 text-zinc-400" />
              <span>
                {isReadyForReadingCheck
                  ? "Selesaikan Cek Pemahaman Dahulu"
                  : "Klaim Poin Terkunci (Baca Materi Dahulu)"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

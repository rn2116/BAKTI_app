"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Clock,
  ArrowDownCircle,
  CheckCircle2,
  Lock,
  Award,
  Sparkles,
} from "lucide-react"

interface ReadingEngagementGateProps {
  contentHtml: string
  isDone: boolean
  onClaim: (startedAt: number) => Promise<void>
  loading: boolean
}

export function ReadingEngagementGate({
  contentHtml,
  isDone,
  onClaim,
  loading,
}: ReadingEngagementGateProps) {
  const startedAtRef = useRef<number>(Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isScrollFulfilled, setIsScrollFulfilled] = useState(false)

  // Hitung jumlah perkiraan kata dari konten HTML
  const totalWords = useMemo(() => {
    const plain = contentHtml
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    return plain ? plain.split(/\s+/).length : 0
  }, [contentHtml])

  // Batas minimal membaca: minimal 25 detik, maksimal 60 detik (1 kata per 4 detik)
  const requiredSeconds = useMemo(() => {
    return Math.max(25, Math.min(60, Math.ceil(totalWords / 4)))
  }, [totalWords])

  const isTimeFulfilled = elapsedSeconds >= requiredSeconds
  const remainingSeconds = Math.max(0, requiredSeconds - elapsedSeconds)
  const canClaim = isTimeFulfilled && isScrollFulfilled && !isDone && !loading

  // Timer aktif yang hanya berjalan jika tab sedang dilihat siswa
  useEffect(() => {
    if (isDone || isTimeFulfilled) return

    const interval = setInterval(() => {
      if (!document.hidden) {
        setElapsedSeconds((prev) => {
          const next = prev + 1
          return next >= requiredSeconds ? requiredSeconds : next
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isDone, isTimeFulfilled, requiredSeconds])

  // Pantau posisi scroll pembaca (minimal 85% kedalaman scroll atau mencapai batas bawah)
  useEffect(() => {
    if (isDone || isScrollFulfilled) return

    function checkScrollDepth() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 50) {
        // Konten pendek yang muat langsung dalam layar pengguna
        setIsScrollFulfilled(true)
        return
      }

      const scrollY = window.scrollY
      const ratio = scrollY / scrollHeight

      if (ratio >= 0.85) {
        setIsScrollFulfilled(true)
      }
    }

    checkScrollDepth()
    window.addEventListener("scroll", checkScrollDepth, { passive: true })
    return () => window.removeEventListener("scroll", checkScrollDepth)
  }, [isDone, isScrollFulfilled])

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
    <div className="mt-10 pt-6 border-t border-zinc-200/80 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-[#D97706] shrink-0">
            <Sparkles className="w-6 h-6 text-[#D97706]" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-zinc-900">
              Penjaminan Kualitas Membaca
            </div>
            <p className="text-xs text-zinc-500">
              Penuhi 2 syarat membaca di bawah untuk mengaktifkan tombol klaim poin:
            </p>
          </div>
        </div>
      </div>

      {/* Indikator Status & Hitung Mundur Interaktif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Indikator 1: Waktu Baca Minimal */}
        <div
          className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
            isTimeFulfilled
              ? "bg-emerald-50 border-emerald-200 text-[#065F46]"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          {isTimeFulfilled ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
          )}
          <div className="text-xs">
            {isTimeFulfilled ? (
              <span className="font-bold">Waktu baca terpenuhi ✓</span>
            ) : (
              <span>
                Waktu baca minimal:{" "}
                <strong className="font-mono font-bold text-amber-900">
                  {remainingSeconds} detik lagi
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Indikator 2: Kedalaman Gulir Artikel */}
        <div
          className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
            isScrollFulfilled
              ? "bg-emerald-50 border-emerald-200 text-[#065F46]"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          {isScrollFulfilled ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ArrowDownCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div className="text-xs">
            {isScrollFulfilled ? (
              <span className="font-bold">Seluruh bagian terbaca ✓</span>
            ) : (
              <span className="font-medium text-amber-900">
                Gulir artikel sampai bagian akhir
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tombol Klaim Poin (Terkunci jika belum selesai, Terbuka jika kedua syarat terpenuhi) */}
      <div className="flex justify-end pt-2">
        {canClaim ? (
          <motion.div
            whileTap={{ scale: 0.98 }}
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <Button
              onClick={() => onClaim(startedAtRef.current)}
              disabled={loading}
              className="relative overflow-hidden h-12 px-6 rounded-2xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-sm shadow-md gap-2 cursor-pointer transition-all"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>{loading ? "Memproses..." : "Tandai Selesai & Klaim Poin"}</span>
            </Button>
          </motion.div>
        ) : (
          <Button
            disabled
            className="h-12 px-6 rounded-2xl bg-zinc-100 text-zinc-400 border border-zinc-200 font-bold text-sm cursor-not-allowed gap-2"
          >
            <Lock className="w-4 h-4 text-zinc-400" />
            <span>Klaim Poin Terkunci (Selesaikan Bacaan)</span>
          </Button>
        )}
      </div>
    </div>
  )
}

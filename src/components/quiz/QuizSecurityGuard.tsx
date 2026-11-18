"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notify"

interface QuizSecurityGuardProps {
  onViolation: (count: number) => void
  onAutoSubmit: () => void
  isCompleted: boolean
  currentViolations: number
}

export function QuizSecurityGuard({
  onViolation,
  onAutoSubmit,
  isCompleted,
  currentViolations,
}: QuizSecurityGuardProps) {
  const [showWarningModal, setShowWarningModal] = useState(false)
  const lastViolationTimeRef = useRef<number>(0)
  const violationCountRef = useRef<number>(currentViolations)

  // Sinkronkan ref dengan props
  useEffect(() => {
    violationCountRef.current = currentViolations
  }, [currentViolations])

  useEffect(() => {
    if (isCompleted) {
      setShowWarningModal(false)
      return
    }

    function recordViolation() {
      if (isCompleted) return

      const now = Date.now()
      // Cooldown 2 detik untuk menghindari double count dari blur + visibilitychange yang bersamaan
      if (now - lastViolationTimeRef.current < 2000) {
        return
      }
      lastViolationTimeRef.current = now

      const nextCount = violationCountRef.current + 1
      violationCountRef.current = nextCount
      onViolation(nextCount)

      if (nextCount < 3) {
        setShowWarningModal(true)
      } else {
        setShowWarningModal(false)
        notify.error("Batas pelanggaran tercapai! Kuis dikumpulkan otomatis.")
        onAutoSubmit()
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        recordViolation()
      }
    }

    function handleWindowBlur() {
      recordViolation()
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault()
      notify.warning("Klik kanan dinonaktifkan demi integritas ujian.")
    }

    function handleKeyDown(e: KeyboardEvent) {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      // Blokir shortcut salin/tempel, view source, cetak, seleksi semua
      if (
        isCtrlOrMeta &&
        (key === "c" || key === "v" || key === "x" || key === "u" || key === "p" || key === "a")
      ) {
        e.preventDefault()
        notify.warning("Tombol pintasan dinonaktifkan selama ujian.")
        return
      }

      // Blokir DevTools (F12 atau Ctrl+Shift+I/J/C)
      if (
        e.key === "F12" ||
        (isCtrlOrMeta && e.shiftKey && (key === "i" || key === "j" || key === "c"))
      ) {
        e.preventDefault()
        notify.warning("Akses inspeksi elemen dinonaktifkan selama ujian.")
        return
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isCompleted, onViolation, onAutoSubmit])

  return (
    <AnimatePresence>
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 sm:p-7 text-center space-y-4"
          >
            {/* Ikon Peringatan Kejujuran */}
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-rose-50 border border-rose-200 text-[#E11D48]">
              <ShieldAlert className="w-8 h-8 text-[#E11D48] animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-[#E11D48] border border-rose-200">
                Peringatan Kejujuran Ujian
              </span>
              <h3 className="text-lg font-extrabold text-zinc-900">
                Pelanggaran Terdeteksi ({violationCountRef.current}/3)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Sistem mendeteksi Anda berpindah ke tab atau aplikasi lain. Harap tetap berada di
              halaman ini selama kuis berlangsung.
            </p>

            <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl text-left text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#EA580C] shrink-0" />
                Konsekuensi Pelanggaran:
              </div>
              <p className="text-[11px] leading-normal text-rose-700">
                Jika Anda berpindah hingga <strong>3 kali</strong>, kuis akan otomatis terkumpul
                dan catatan pelanggaran akan tersimpan permanen di laporan guru & Balai Bahasa.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => {
                  setShowWarningModal(false)
                  window.focus()
                }}
                className="w-full h-11 rounded-2xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-sm shadow-md transition-all"
              >
                Saya Mengerti & Kembali Mengerjakan
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

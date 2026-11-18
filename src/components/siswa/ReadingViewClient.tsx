"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { markMaterialComplete } from "@/actions/material"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle2, Sparkles, Award } from "lucide-react"
import { MaterialContentRenderer } from "@/components/shared/MaterialContentRenderer"
import confetti from "canvas-confetti"

interface ReadingViewClientProps {
  materialId: string
  initialIsDone: boolean
  title: string
  contentHtml: string
}

export function ReadingViewClient({
  materialId,
  initialIsDone,
  title,
  contentHtml,
}: ReadingViewClientProps) {
  const [isDone, setIsDone] = useState(initialIsDone)
  const [loading, setLoading] = useState(false)

  async function handleClaimPoints() {
    setLoading(true)
    const formData = new FormData()
    formData.append("materialId", materialId)

    const result = await markMaterialComplete(null, formData)
    setLoading(false)

    if (result.success) {
      setIsDone(true)
      toast.success("Hebat! Materi telah selesai dipelajari (+100 XP)")

      // Trigger efek konfeti perayaan
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3C22BB", "#065F46", "#D97706", "#FDE047"],
      })
    } else {
      toast.error(result.error ?? "Gagal menyimpan progres")
    }
  }

  return (
    <div className="space-y-6">
      {/* Konten Bacaan Utama Berstruktur dengan Tipografi Lora & Hirarki Rapi */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 shadow-xs">
        <MaterialContentRenderer content={contentHtml} />

        {/* Bagian Bawah: Aksi Klaim Poin Selesai */}
        <div className="mt-10 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-[#D97706] shrink-0">
              <Sparkles className="w-6 h-6 text-[#D97706]" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-zinc-900">
                {isDone ? "Materi Ini Sudah Selesai!" : "Sudah Selesai Membaca?"}
              </div>
              <div className="text-xs text-zinc-500">
                {isDone
                  ? "Anda telah mengklaim +100 Poin XP untuk materi ini."
                  : "Klik tombol untuk menandai tuntas & klaim +100 Poin XP."}
              </div>
            </div>
          </div>

          <div>
            {isDone ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 text-[#065F46] border border-emerald-200 font-bold text-sm shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Selesai Dipelajari</span>
              </div>
            ) : (
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleClaimPoints}
                  disabled={loading}
                  className="h-12 px-6 rounded-2xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-sm shadow-md gap-2"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{loading ? "Memproses..." : "Tandai Selesai & Klaim Poin"}</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

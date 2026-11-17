"use client"
import { useConfetti } from "@/hooks/use-confetti"
import { Button } from "@/components/ui/button"
import { Star, Trophy } from "lucide-react"

interface ConfettiTriggerProps {
  trigger: boolean
  message?: string
  onDismiss?: () => void
}

export function ConfettiTrigger({
  trigger,
  message = "Selamat! Anda meraih prestasi baru!",
  onDismiss,
}: ConfettiTriggerProps) {
  const { startConfetti, stopConfetti } = useConfetti()

  // Saat trigger berubah dari false ke true, jalankan konfeti
  // useEffect di dalam use-confetti sudah menangani ini

  if (!trigger) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-2xl border border-input bg-card p-6 shadow-2xl animate-pop-in">
        <div className="text-4xl">🎉</div>
        <div className="text-lg font-bold">{message}</div>
        <Button
          onClick={() => {
            stopConfetti()
            onDismiss?.()
          }}
        >
          Selesai
        </Button>
      </div>
    </div>
  )
}

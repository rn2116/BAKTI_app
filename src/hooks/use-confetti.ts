"use client"
import { useEffect, useRef } from "react"

export function useConfetti() {
  const ref = useRef<((opts?: any) => void) | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    import("canvas-confetti").then((module) => {
      const confetti = module.default as (opts?: any) => void
      ref.current = confetti
    })
  }, [])

  const startConfetti = () => {
    if (!ref.current) return
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      colors: ["#3C22BB", "#065F46", "#D97706", "#FFFFFF", "#FAFAF8"],
    }

    function fire(particleRatio: number, opts: any) {
      ref.current?.({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.15, { spread: 180, decay: 0.92, scalar: 1.4 })
  }

  const stopConfetti = () => {
    // canvas-confetti tidak perlu stop eksplisit
  }

  return { startConfetti, stopConfetti }
}

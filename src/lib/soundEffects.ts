// Utilitas Sintetis Web Audio API (0 KB, bebas error 404, tidak butuh file eksternal)

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume()
  }
  return audioCtx
}

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("bk_sound_muted") === "true"
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem("bk_sound_muted", muted ? "true" : "false")
}

// 1. Suara Pop / Click Lembut saat memilih opsi kuis A, B, C, D
export function playOptionSelectSound() {
  if (isSoundMuted()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(540, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    // Ignore audio errors silently
  }
}

// 2. Suara geser / ketukan halus saat berpindah soal
export function playNextQuestionSound() {
  if (isSoundMuted()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch {
    // Ignore audio errors silently
  }
}

// 3. Melodi nada riang saat lulus atau nada lembut penyemangat
export function playQuizCompleteSound(isPassed: boolean) {
  if (isSoundMuted()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    if (isPassed) {
      // Arpeggio ceria nada naik (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)

        gain.gain.setValueAtTime(0, now + idx * 0.1)
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.22)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.25)
      })
    } else {
      // Nada lembut ganda (G4, E4) penyemangat
      const notes = [392.0, 329.63]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "triangle"
        osc.frequency.setValueAtTime(freq, now + idx * 0.15)

        gain.gain.setValueAtTime(0.15, now + idx * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.28)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.15)
        osc.stop(now + idx * 0.15 + 0.3)
      })
    }
  } catch {
    // Ignore audio errors silently
  }
}

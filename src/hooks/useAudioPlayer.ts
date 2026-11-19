"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { notify } from "@/lib/notify"

export interface UseAudioPlayerOptions {
  audioUrl?: string | null
  text?: string | null
  lang?: string
  rate?: number
}

function normalizeAudioUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  if (trimmed.startsWith("/uploads/audio/")) {
    const filename = trimmed.replace("/uploads/audio/", "")
    return `/api/audio/${encodeURIComponent(filename)}`
  }
  return trimmed
}

export function useAudioPlayer({
  audioUrl,
  text,
  lang = "id",
  rate = 0.95,
}: UseAudioPlayerOptions) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.src = ""
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsLoading(false)
  }, [])

  // Hentikan audio bila sumber berubah atau komponen unmount
  useEffect(() => {
    stop()
    setError(null)
    return () => {
      stop()
    }
  }, [audioUrl, text, stop])

  const play = useCallback(async () => {
    stop()
    setError(null)

    const cleanAudioUrl = audioUrl?.trim() || ""
    const cleanText = text?.trim() || ""

    if (!cleanAudioUrl && !cleanText) {
      const msg = "Tidak ada sumber audio atau teks untuk diputar."
      setError(msg)
      notify.warning(msg)
      return
    }

    // Prioritas 1: File Audio Resmi (HTMLAudioElement)
    if (cleanAudioUrl) {
      setIsLoading(true)
      const resolvedUrl = normalizeAudioUrl(cleanAudioUrl)
      const audio = new Audio(resolvedUrl)
      audio.playbackRate = rate
      audioRef.current = audio

      audio.onplaying = () => {
        setIsLoading(false)
        setIsPlaying(true)
      }
      audio.onended = () => {
        setIsPlaying(false)
        setIsLoading(false)
      }
      audio.onerror = () => {
        const msg = "Berkas audio gagal dimuat. Periksa kembali file audio."
        setError(msg)
        setIsPlaying(false)
        setIsLoading(false)
        notify.error(msg)
      }

      try {
        await audio.play()
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
        const msg = "Gagal memutar berkas audio. Pastikan browser mengizinkan pemutaran audio."
        setError(msg)
        setIsPlaying(false)
        setIsLoading(false)
        notify.error(msg)
      }
      return
    }

    // Prioritas 2: Fallback Server TTS (/api/tts)
    setIsLoading(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, lang }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`TTS HTTP ${res.status}`)
      }

      const blob = await res.blob()
      if (controller.signal.aborted) return

      const objectUrl = URL.createObjectURL(blob)
      objectUrlRef.current = objectUrl

      const audio = new Audio(objectUrl)
      audio.playbackRate = rate
      audioRef.current = audio

      audio.onplaying = () => {
        setIsLoading(false)
        setIsPlaying(true)
      }
      audio.onended = () => {
        setIsPlaying(false)
        setIsLoading(false)
      }
      audio.onerror = () => {
        const msg = "Gagal memutar stream audio pelafalan."
        setError(msg)
        setIsPlaying(false)
        setIsLoading(false)
        notify.error(msg)
      }

      await audio.play()
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return

      // Fallback terakhir ke Web Speech API hanya jika tersedia suara aktif di OS
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        window.speechSynthesis.getVoices().length > 0
      ) {
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.lang = lang === "id" ? "id-ID" : lang
        utterance.rate = rate
        utterance.onstart = () => {
          setIsLoading(false)
          setIsPlaying(true)
        }
        utterance.onend = () => {
          setIsPlaying(false)
          setIsLoading(false)
        }
        utterance.onerror = () => {
          const msg = "Suara pelafalan gagal diputar pada perangkat ini."
          setError(msg)
          setIsPlaying(false)
          setIsLoading(false)
          notify.error(msg)
        }
        window.speechSynthesis.speak(utterance)
        return
      }

      const msg = "Gagal memuat suara pelafalan. Periksa koneksi jaringan Anda."
      setError(msg)
      setIsPlaying(false)
      setIsLoading(false)
      notify.error(msg)
    }
  }, [audioUrl, text, lang, rate, stop])

  const toggle = useCallback(() => {
    if (isPlaying || isLoading) {
      stop()
    } else {
      void play()
    }
  }, [isPlaying, isLoading, play, stop])

  return {
    isPlaying,
    isLoading,
    error,
    play,
    stop,
    toggle,
  }
}

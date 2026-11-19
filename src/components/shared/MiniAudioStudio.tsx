"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AudioButton } from "@/components/shared/AudioButton"
import { notify } from "@/lib/notify"
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Upload,
  Trash2,
  CheckCircle2,
  Loader2,
  FileAudio,
} from "lucide-react"

interface MiniAudioStudioProps {
  value: string
  onChange: (url: string) => void
  inputName?: string
  label?: string
}

function formatDuration(sec: number): string {
  const mins = Math.floor(sec / 60)
  const rem = sec % 60
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`
}

export function MiniAudioStudio({
  value,
  onChange,
  inputName = "audioUrl",
  label = "Studio Rekaman Mini & Audio Pelafalan (Opsional)",
}: MiniAudioStudioProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function handleStartRecording() {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      notify.error("Browser Anda tidak mendukung fitur rekaman mikrofon.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      chunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg")
          ? "audio/ogg"
          : ""

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || "audio/webm"
        const blob = new Blob(chunksRef.current, { type: finalMime })
        setRecordedBlob(blob)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecordedBlob(null)
      setRecordSeconds(0)
      setIsRecording(true)

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } catch {
      notify.error("Izin mikrofon ditolak atau perangkat audio tidak tersedia.")
    }
  }

  function handleStopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  function handleTogglePreview() {
    if (!previewUrl) return
    if (isPreviewPlaying && previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
      setIsPreviewPlaying(false)
      return
    }

    const audio = new Audio(previewUrl)
    previewAudioRef.current = audio
    audio.onended = () => setIsPreviewPlaying(false)
    audio.onerror = () => {
      setIsPreviewPlaying(false)
      notify.error("Gagal memutar pratinjau rekaman.")
    }
    void audio.play().then(() => setIsPreviewPlaying(true))
  }

  function handleResetRecording() {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setRecordedBlob(null)
    setRecordSeconds(0)
    setIsPreviewPlaying(false)
  }

  async function uploadAudioFile(fileOrBlob: Blob, filename: string) {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", fileOrBlob, filename)

      const res = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
      })

      const data = (await res.json()) as {
        success?: boolean
        url?: string
        error?: string
      }

      if (!res.ok || !data.success || !data.url) {
        notify.error(data.error ?? "Gagal mengunggah audio ke server.")
        return
      }

      onChange(data.url)
      handleResetRecording()
      notify.success("Berkas audio berhasil diunggah dan ditautkan!")
    } catch {
      notify.error("Terjadi kesalahan jaringan saat mengunggah audio.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSaveRecording() {
    if (!recordedBlob) return
    const ext = recordedBlob.type.includes("ogg")
      ? "ogg"
      : recordedBlob.type.includes("wav")
        ? "wav"
        : "webm"
    await uploadAudioFile(recordedBlob, `rekaman-${Date.now()}.${ext}`)
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadAudioFile(file, file.name)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="p-3.5 rounded-2xl bg-zinc-50/90 border border-zinc-200 space-y-3">
      <input type="hidden" name={inputName} value={value} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
          <FileAudio className="w-4 h-4 text-[#3C22BB]" />
          <span>{label}</span>
        </Label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Audio Terpasang
          </span>
        )}
      </div>

      {/* Audio yang sudah tersimpan */}
      {value && (
        <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AudioButton
              audioUrl={value}
              label="Putar Audio"
              variant="indigo"
              size="sm"
              showTextOnMobile={true}
            />
            <span className="text-[11px] font-mono text-zinc-500 truncate">{value}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50"
            title="Hapus tautan audio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Kontrol Rekam Langsung & Unggah File */}
      <div className="flex flex-wrap items-center gap-2">
        {!isRecording && !recordedBlob && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => void handleStartRecording()}
              className="h-9 px-3 rounded-xl border-[#3C22BB]/30 text-[#3C22BB] hover:bg-[#3C22BB]/10 text-xs font-bold gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Mulai Rekam</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 rounded-xl border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold gap-1.5"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isUploading ? "Mengunggah..." : "Unggah File Audio (.mp3/.wav/.ogg)"}</span>
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.ogg,.webm,.m4a,audio/*"
              onChange={(e) => void handleFileInputChange(e)}
              className="hidden"
            />
          </>
        )}

        {/* Sedang Merekam */}
        {isRecording && (
          <div className="w-full p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="text-xs font-bold text-rose-800">
                Merekam...{" "}
                <span className="font-mono">{formatDuration(recordSeconds)}</span>
              </span>
              <div className="flex items-center gap-0.5 h-4">
                {[0.5, 1, 0.7, 0.9, 0.6].map((r, i) => (
                  <motion.span
                    key={i}
                    className="w-1 bg-rose-500 rounded-full"
                    animate={{ height: ["4px", `${r * 14}px`, "4px"] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleStopRecording}
              className="h-8 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </Button>
          </div>
        )}

        {/* Hasil Rekaman Siap Preview & Simpan */}
        <AnimatePresence>
          {recordedBlob && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleTogglePreview}
                  className="h-8 px-3 rounded-lg bg-white text-[#3C22BB] border-indigo-200 text-xs font-bold gap-1.5"
                >
                  {isPreviewPlaying ? (
                    <>
                      <Square className="w-3 h-3 fill-current" /> Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" /> Putar Ulang ({formatDuration(recordSeconds)})
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isUploading}
                  onClick={handleResetRecording}
                  className="h-8 px-2.5 rounded-lg text-zinc-600 hover:text-zinc-900 text-xs font-semibold gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={() => void handleSaveRecording()}
                className="h-8 px-3.5 rounded-lg bg-[#065F46] hover:bg-[#044a36] text-white text-xs font-bold gap-1.5"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploading ? "Menyimpan..." : "Unggah & Gunakan"}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Manual URL (Opsional jika ingin menempel URL langsung) */}
      <div className="space-y-1">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Atau tempel tautan URL audio langsung (contoh: /api/audio/...)"
          className="h-8 text-[11px] rounded-xl bg-white"
        />
      </div>
    </div>
  )
}

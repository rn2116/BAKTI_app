"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, Loader2, Image as ImageIcon } from "lucide-react"
import { notify } from "@/lib/notify"
import { loadOfficialLogoForExport } from "@/lib/pdf-logo"
import QRCode from "qrcode"
import jsPDF from "jspdf"

interface PrintCertificateButtonProps {
  certificateNo: string
  studentName?: string
  materialTitle?: string
  issuedAt?: Date | string
  finalScore?: number
  signerTitle?: string
  signerName?: string
  signerNip?: string
  cityName?: string
}

const DEFAULT_SIGNER_TITLE = "Kepala Balai Bahasa Provinsi Sulawesi Tengah"
const DEFAULT_HEAD_OF_OFFICE_NAME =
  process.env.NEXT_PUBLIC_KEPALA_BALAI_NAMA?.trim() || "Dr. Asrif, M.Hum."
const DEFAULT_HEAD_OF_OFFICE_NIP =
  process.env.NEXT_PUBLIC_KEPALA_BALAI_NIP?.trim() || "197412152002121002"
const DEFAULT_CITY_NAME = "Palu"

export function PrintCertificateButton({
  certificateNo,
  studentName = "Peserta Didik",
  materialTitle = "Kompetensi Literasi & Karakter",
  issuedAt,
  finalScore,
  signerTitle = DEFAULT_SIGNER_TITLE,
  signerName = DEFAULT_HEAD_OF_OFFICE_NAME,
  signerNip = DEFAULT_HEAD_OF_OFFICE_NIP,
  cityName = DEFAULT_CITY_NAME,
}: PrintCertificateButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  function getFormattedDate(): string {
    return issuedAt
      ? new Date(issuedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
  }

  function getVerificationUrl(): string {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return `${origin}/verifikasi/${encodeURIComponent(certificateNo)}`
  }

  function handleCopy() {
    if (!certificateNo) return
    navigator.clipboard.writeText(certificateNo)
    setCopied(true)
    notify.success("Nomor sertifikat berhasil disalin ke papan klip!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadPDF() {
    try {
      setIsGenerating(true)

      // 1. Tentukan URL Verifikasi Publik
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const verificationUrl = `${origin}/verifikasi/${encodeURIComponent(certificateNo)}`

      // 2. Muat QR Code & Logo Resmi secara paralel
      const [qrDataUrl, officialLogo] = await Promise.all([
        QRCode.toDataURL(verificationUrl, {
          width: 160,
          margin: 1,
          color: {
            dark: "#1E135E",
            light: "#FFFFFF",
          },
        }),
        loadOfficialLogoForExport(),
      ])

      // 3. Buat Dokumen PDF Resmi Landscape A4 (297 x 210 mm)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = 297
      const pageHeight = 210

      // Latar Belakang & Bingkai Luar Indah
      doc.setFillColor(250, 250, 248)
      doc.rect(0, 0, pageWidth, pageHeight, "F")

      // Bingkai Ganda Berwarna Royal Indigo & Emas
      doc.setDrawColor(60, 34, 187) // #3C22BB
      doc.setLineWidth(2)
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

      doc.setDrawColor(217, 119, 6) // #D97706
      doc.setLineWidth(0.8)
      doc.rect(13, 13, pageWidth - 26, pageHeight - 26)

      // Header Kop Resmi (Logo Kemendikdasmen - BBPST)
      if (officialLogo) {
        const logoHeightMm = 14
        const logoWidthMm = logoHeightMm * officialLogo.aspectRatio
        doc.addImage(
          officialLogo.dataUrl,
          "PNG",
          (pageWidth - logoWidthMm) / 2,
          16,
          logoWidthMm,
          logoHeightMm
        )
      } else {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(30, 19, 94)
        doc.text(
          "KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH",
          pageWidth / 2,
          22,
          { align: "center" }
        )
        doc.setFontSize(13)
        doc.text(
          "BALAI BAHASA PROVINSI SULAWESI TENGAH",
          pageWidth / 2,
          28,
          { align: "center" }
        )
      }

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(110, 110, 120)
      doc.text(
        "Platform Pembelajaran Digital Interaktif: BAHASA & KARAKTER (BAKTI)",
        pageWidth / 2,
        35,
        { align: "center" }
      )

      // Garis Pembatas Header
      doc.setDrawColor(200, 200, 210)
      doc.setLineWidth(0.5)
      doc.line(30, 39, pageWidth - 30, 39)

      // Judul Sertifikat
      doc.setFont("helvetica", "bold")
      doc.setFontSize(22)
      doc.setTextColor(60, 34, 187) // #3C22BB
      doc.text("SERTIFIKAT KELULUSAN", pageWidth / 2, 51, { align: "center" })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 110)
      doc.text(
        `Nomor Registrasi: ${certificateNo}`,
        pageWidth / 2,
        60,
        { align: "center" }
      )

      // Teks Pernyataan
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 70)
      doc.text("Diberikan kepada:", pageWidth / 2, 72, { align: "center" })

      // Nama Siswa / Penerima
      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)
      doc.setTextColor(24, 24, 27)
      doc.text(studentName, pageWidth / 2, 83, { align: "center" })

      // Garis Aksen Nama
      doc.setDrawColor(217, 119, 6)
      doc.setLineWidth(1)
      const nameWidth = doc.getTextWidth(studentName)
      doc.line(
        pageWidth / 2 - nameWidth / 2 - 5,
        86,
        pageWidth / 2 + nameWidth / 2 + 5,
        86
      )

      // Keterangan Prestasi
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 70)
      doc.text(
        "Telah berhasil menuntaskan materi pembelajaran serta lulus evaluasi kompetensi pada modul:",
        pageWidth / 2,
        96,
        { align: "center" }
      )

      // Judul Materi / Bahasa Daerah
      doc.setFont("helvetica", "bold")
      doc.setFontSize(15)
      doc.setTextColor(60, 34, 187)
      doc.text(`"${materialTitle}"`, pageWidth / 2, 106, { align: "center" })

      if (typeof finalScore === "number") {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10.5)
        doc.setTextColor(6, 95, 70) // #065F46
        doc.text(`Capaian Nilai Akhir Evaluasi: ${finalScore} / 100`, pageWidth / 2, 114, {
          align: "center",
        })
      }

      doc.setFont("helvetica", "italic")
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 110)
      doc.text(
        "Sebagai wujud komitmen dalam merawat Bahasa Indonesia, memperkokoh karakter, dan melestarikan kearifan lokal Sulawesi Tengah.",
        pageWidth / 2,
        typeof finalScore === "number" ? 122 : 115,
        { align: "center" }
      )

      // Bagian Bawah: QR Code Keaslian (Kiri) dan Tanda Tangan Balai Bahasa (Kanan)
      const qrSize = 34
      const qrX = 30
      const qrY = 138

      // Tambahkan QR Code
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize)

      // Keterangan QR Code
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(30, 19, 94)
      doc.text("VERIFIKASI KEASLIAN", qrX + qrSize + 4, qrY + 10)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.setTextColor(100, 100, 110)
      doc.text(
        "Pindai kode QR dengan kamera ponsel untuk",
        qrX + qrSize + 4,
        qrY + 16
      )
      doc.text(
        "memvalidasi status sertifikat pada pangkalan data",
        qrX + qrSize + 4,
        qrY + 21
      )
      doc.text(
        "Balai Bahasa Provinsi Sulawesi Tengah.",
        qrX + qrSize + 4,
        qrY + 26
      )

      // Sisi Kanan: Tempat, Tanggal & Pengesahan
      const signX = pageWidth - 75
      const signY = 142

      const formattedDate = issuedAt
        ? new Date(issuedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(50, 50, 60)
      doc.text(`${cityName}, ${formattedDate}`, signX, signY, { align: "center" })
      doc.text(signerTitle, signX, signY + 6, {
        align: "center",
        maxWidth: 96,
      })

      // Stempel Digital Info
      doc.setDrawColor(60, 34, 187)
      doc.setLineWidth(0.4)
      doc.roundedRect(signX - 35, signY + 13, 70, 16, 2, 2)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(60, 34, 187)
      doc.text("TERTANDA TANGAN ELEKTRONIK", signX, signY + 20, {
        align: "center",
      })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(110, 110, 120)
      doc.text("Sertifikasi Otomatis Sistem Pembelajaran BAKTI", signX, signY + 25, {
        align: "center",
      })

      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(24, 24, 27)
      doc.text(signerName, signX, signY + 37, { align: "center" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 110)
      doc.text(`NIP. ${signerNip}`, signX, signY + 42, { align: "center" })

      // Unduh File PDF
      doc.save(`Sertifikat_${certificateNo}.pdf`)
      notify.success("Sertifikat digital resmi (PDF) berhasil diunduh!")
    } catch (error) {
      console.error("Gagal membuat sertifikat PDF:", error)
      notify.error("Terjadi kendala saat menghasilkan dokumen sertifikat.")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleDownloadImage() {
    try {
      setIsGeneratingImage(true)
      const verificationUrl = getVerificationUrl()
      const [qrDataUrl, officialLogo] = await Promise.all([
        QRCode.toDataURL(verificationUrl, {
          width: 240,
          margin: 1,
          color: { dark: "#1E135E", light: "#FFFFFF" },
        }),
        loadOfficialLogoForExport(),
      ])

      const canvas = document.createElement("canvas")
      canvas.width = 1600
      canvas.height = 1130
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context tidak tersedia")

      // Background
      ctx.fillStyle = "#FAFAF8"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Borders
      ctx.strokeStyle = "#3C22BB"
      ctx.lineWidth = 10
      ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96)

      ctx.strokeStyle = "#D97706"
      ctx.lineWidth = 4
      ctx.strokeRect(66, 66, canvas.width - 132, canvas.height - 132)

      // Header Kop Resmi (Logo Kemendikdasmen - BBPST)
      ctx.textAlign = "center"
      if (officialLogo) {
        const logoImg = new window.Image()
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve()
          logoImg.onerror = () => reject(new Error("Gagal memuat logo"))
          logoImg.src = officialLogo.dataUrl
        })
        const logoH = 90
        const logoW = logoH * officialLogo.aspectRatio
        ctx.drawImage(logoImg, (canvas.width - logoW) / 2, 90, logoW, logoH)
      } else {
        ctx.fillStyle = "#1E135E"
        ctx.font = "bold 28px sans-serif"
        ctx.fillText("KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH", canvas.width / 2, 134)
        ctx.font = "bold 34px sans-serif"
        ctx.fillText("BALAI BAHASA PROVINSI SULAWESI TENGAH", canvas.width / 2, 178)
      }

      ctx.fillStyle = "#64748B"
      ctx.font = "22px sans-serif"
      ctx.fillText(
        "Platform Pembelajaran Digital Interaktif: BAHASA & KARAKTER (BAKTI)",
        canvas.width / 2,
        214
      )

      // Divider
      ctx.strokeStyle = "#CBD5E1"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(160, 244)
      ctx.lineTo(canvas.width - 160, 244)
      ctx.stroke()

      // Title
      ctx.fillStyle = "#3C22BB"
      ctx.font = "bold 56px sans-serif"
      ctx.fillText("SERTIFIKAT KELULUSAN", canvas.width / 2, 326)

      ctx.fillStyle = "#475569"
      ctx.font = "24px sans-serif"
      ctx.fillText(`Nomor Registrasi: ${certificateNo}`, canvas.width / 2, 368)

      // Recipient
      ctx.font = "26px sans-serif"
      ctx.fillText("Diberikan kepada:", canvas.width / 2, 434)

      ctx.fillStyle = "#18181B"
      ctx.font = "bold 50px sans-serif"
      ctx.fillText(studentName, canvas.width / 2, 498)

      ctx.strokeStyle = "#D97706"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 260, 518)
      ctx.lineTo(canvas.width / 2 + 260, 518)
      ctx.stroke()

      // Achievement
      ctx.fillStyle = "#334155"
      ctx.font = "26px sans-serif"
      ctx.fillText(
        "Telah berhasil menuntaskan materi pembelajaran serta lulus evaluasi kompetensi pada modul:",
        canvas.width / 2,
        576
      )

      ctx.fillStyle = "#3C22BB"
      ctx.font = "bold 38px sans-serif"
      ctx.fillText(`"${materialTitle}"`, canvas.width / 2, 634)

      if (typeof finalScore === "number") {
        ctx.fillStyle = "#065F46"
        ctx.font = "bold 28px sans-serif"
        ctx.fillText(`Capaian Nilai Akhir Evaluasi: ${finalScore} / 100`, canvas.width / 2, 682)
      }

      // QR Code on bottom-left
      const qrImg = new window.Image()
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve()
        qrImg.onerror = () => reject(new Error("Gagal memuat QR Code"))
        qrImg.src = qrDataUrl
      })
      ctx.drawImage(qrImg, 150, 760, 190, 190)

      ctx.textAlign = "left"
      ctx.fillStyle = "#1E135E"
      ctx.font = "bold 20px sans-serif"
      ctx.fillText("VERIFIKASI KEASLIAN", 362, 818)
      ctx.fillStyle = "#64748B"
      ctx.font = "19px sans-serif"
      ctx.fillText("Pindai kode QR dengan kamera ponsel untuk", 362, 854)
      ctx.fillText("memvalidasi keabsahan sertifikat pada database", 362, 882)
      ctx.fillText("Balai Bahasa Provinsi Sulawesi Tengah.", 362, 910)

      // Signature on bottom-right
      const formattedDate = getFormattedDate()
      ctx.textAlign = "center"
      ctx.fillStyle = "#1E293B"
      ctx.font = "22px sans-serif"
      ctx.fillText(`${cityName}, ${formattedDate}`, 1240, 788)
      ctx.fillText(signerTitle, 1240, 820)

      ctx.strokeStyle = "#3C22BB"
      ctx.lineWidth = 2
      ctx.strokeRect(1060, 848, 360, 80)
      ctx.fillStyle = "#3C22BB"
      ctx.font = "bold 20px sans-serif"
      ctx.fillText("TERTANDA TANGAN ELEKTRONIK", 1240, 884)
      ctx.fillStyle = "#64748B"
      ctx.font = "16px sans-serif"
      ctx.fillText("Sertifikasi Otomatis Sistem Pembelajaran BAKTI", 1240, 912)

      ctx.fillStyle = "#18181B"
      ctx.font = "bold 24px sans-serif"
      ctx.fillText(signerName, 1240, 974)
      ctx.fillStyle = "#64748B"
      ctx.font = "20px sans-serif"
      ctx.fillText(`NIP. ${signerNip}`, 1240, 1006)

      const link = document.createElement("a")
      link.download = `Sertifikat_${certificateNo}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      notify.success("Sertifikat gambar (PNG) berhasil diunduh!")
    } catch (error) {
      console.error("Gagal membuat gambar sertifikat:", error)
      notify.error("Gagal mengunduh gambar sertifikat.")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      <Button
        type="button"
        onClick={handleDownloadPDF}
        disabled={isGenerating || isGeneratingImage}
        className="flex-1 min-w-[115px] text-xs gap-1.5 min-h-12 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold shadow-xs"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Unduh PDF</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        onClick={handleDownloadImage}
        disabled={isGenerating || isGeneratingImage}
        variant="outline"
        className="text-xs gap-1.5 min-h-12 rounded-xl border-indigo-200 text-[#3C22BB] hover:bg-indigo-50 font-bold"
        title="Unduh Sertifikat sebagai Gambar PNG"
      >
        {isGeneratingImage ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ImageIcon className="w-3.5 h-3.5" />
        )}
        <span>PNG</span>
      </Button>

      {certificateNo && (
        <Button
          type="button"
          onClick={handleCopy}
          variant="outline"
          size="icon"
          title="Salin Nomor Registrasi Sertifikat"
          className="min-h-12 min-w-12 rounded-xl border-zinc-200 hover:bg-zinc-100 shrink-0"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </Button>
      )}
    </div>
  )
}

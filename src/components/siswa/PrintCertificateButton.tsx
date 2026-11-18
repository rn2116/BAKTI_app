"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, Loader2 } from "lucide-react"
import { notify } from "@/lib/notify"
import QRCode from "qrcode"
import jsPDF from "jspdf"

interface PrintCertificateButtonProps {
  certificateNo: string
  studentName?: string
  materialTitle?: string
  issuedAt?: Date | string
}

export function PrintCertificateButton({
  certificateNo,
  studentName = "Peserta Didik",
  materialTitle = "Kompetensi Literasi & Karakter",
  issuedAt,
}: PrintCertificateButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

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

      // 2. Generate QR Code Data URL
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 160,
        margin: 1,
        color: {
          dark: "#1E135E",
          light: "#FFFFFF",
        },
      })

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

      // Header Instansi Resmi
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(30, 19, 94) // #1E135E
      doc.text(
        "KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH",
        pageWidth / 2,
        25,
        { align: "center" }
      )

      doc.setFontSize(13)
      doc.text(
        "BALAI BAHASA PROVINSI SULAWESI TENGAH",
        pageWidth / 2,
        31,
        { align: "center" }
      )

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(110, 110, 120)
      doc.text(
        "Platform Pembelajaran Digital Interaktif: BAHASA & KARAKTER (BAKTI)",
        pageWidth / 2,
        37,
        { align: "center" }
      )

      // Garis Pembatas Header
      doc.setDrawColor(200, 200, 210)
      doc.setLineWidth(0.5)
      doc.line(30, 41, pageWidth - 30, 41)

      // Judul Sertifikat
      doc.setFont("helvetica", "bold")
      doc.setFontSize(22)
      doc.setTextColor(60, 34, 187) // #3C22BB
      doc.text("SERTIFIKAT KELULUSAN", pageWidth / 2, 53, { align: "center" })

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

      // Judul Materi
      doc.setFont("helvetica", "bold")
      doc.setFontSize(15)
      doc.setTextColor(60, 34, 187)
      doc.text(`"${materialTitle}"`, pageWidth / 2, 106, { align: "center" })

      doc.setFont("helvetica", "italic")
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 110)
      doc.text(
        "Sebagai wujud komitmen dalam merawat Bahasa Indonesia, memperkokoh karakter, dan melestarikan budaya Sulawesi Tengah.",
        pageWidth / 2,
        115,
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
      doc.text(`Palu, ${formattedDate}`, signX, signY, { align: "center" })
      doc.text("Kepala Balai Bahasa Provinsi Sulawesi Tengah", signX, signY + 6, {
        align: "center",
      })

      // Stempel Digital Info
      doc.setDrawColor(60, 34, 187)
      doc.setLineWidth(0.4)
      doc.roundedRect(signX - 35, signY + 12, 70, 16, 2, 2)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(60, 34, 187)
      doc.text("TERTANDA TANGAN ELEKTRONIK", signX, signY + 19, {
        align: "center",
      })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(110, 110, 120)
      doc.text("Sertifikasi Otomatis Sistem Pembelajaran BAKTI", signX, signY + 24, {
        align: "center",
      })

      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(24, 24, 27)
      doc.text("Dr. Asrif, M.Hum.", signX, signY + 36, { align: "center" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 110)
      doc.text("NIP. 197412152002121002", signX, signY + 41, { align: "center" })

      // Unduh File PDF
      doc.save(`Sertifikat_${certificateNo}.pdf`)
      notify.success("Sertifikat digital resmi berhasil diunduh!")
    } catch (error) {
      console.error("Gagal membuat sertifikat PDF:", error)
      notify.error("Terjadi kendala saat menghasilkan dokumen sertifikat.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        type="button"
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className="flex-1 text-xs gap-1.5 h-9 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold shadow-xs"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Membuat PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Unduh PDF</span>
          </>
        )}
      </Button>

      {certificateNo && (
        <Button
          type="button"
          onClick={handleCopy}
          variant="outline"
          size="icon"
          title="Salin Nomor Registrasi Sertifikat"
          className="h-9 w-9 rounded-xl border-zinc-200 hover:bg-zinc-100 shrink-0"
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

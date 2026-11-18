"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { notify } from "@/lib/notify"

interface ExportData {
  nama: string
  nisn: string
  sekolah: string
  kelas: string
  kuis: string
  kategori: string
  skor: number
  skorMaksimal: number
  status: string
  tanggal: string
}

interface ExportExcelButtonProps {
  data: ExportData[]
  filename?: string
  className?: string
}

export function ExportExcelButton({
  data,
  filename = "Laporan_Rekap_Nilai_Siswa_BBPST.xlsx",
  className,
}: ExportExcelButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      notify.warning("Tidak ada data rekapitulasi nilai untuk diekspor")
      return
    }

    const headerAoa = [
      ["KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI"],
      ["BALAI BAHASA PROVINSI SULAWESI TENGAH"],
      ["REKAPITULASI PENILAIAN LITERASI & PENDIDIKAN KARAKTER SISWA"],
      [`Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} | Sekolah: ${data[0]?.sekolah || "Sekolah Mitra BBPST"}`],
      [], // Baris kosong pemisah
      [
        "No",
        "Nama Lengkap Siswa",
        "NISN",
        "Asal Sekolah",
        "Kelas",
        "Judul Kuis",
        "Kategori Literasi",
        "Skor Perolehan",
        "Skor Maksimal",
        "Status Kelulusan",
        "Waktu Pengerjaan",
      ],
    ]

    const dataAoa = data.map((item, idx) => [
      idx + 1,
      item.nama,
      item.nisn || "-",
      item.sekolah,
      item.kelas,
      item.kuis,
      item.kategori,
      item.skor,
      item.skorMaksimal,
      item.status,
      item.tanggal,
    ])

    const fullAoa = [...headerAoa, ...dataAoa]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAoa)

    // Autosize columns
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 15 },
      { wch: 28 },
      { wch: 15 },
      { wch: 35 },
      { wch: 22 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 22 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai BBPST")
    XLSX.writeFile(workbook, filename)
    notify.success("Laporan resmi rekap nilai berhasil diekspor ke Excel (.xlsx)")
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className={className || "w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50 h-10"}
    >
      <Download className="w-4 h-4 text-emerald-600" />
      Ekspor ke Excel Resmi (.xlsx)
    </Button>
  )
}

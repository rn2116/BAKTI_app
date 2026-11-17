"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"

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
}

export function ExportExcelButton({
  data,
  filename = "rekap-nilai-siswa.xlsx",
}: ExportExcelButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diekspor.")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item, idx) => ({
        No: idx + 1,
        "Nama Siswa": item.nama,
        NISN: item.nisn || "-",
        Sekolah: item.sekolah,
        Kelas: item.kelas,
        "Judul Kuis": item.kuis,
        Kategori: item.kategori,
        Skor: item.skor,
        "Skor Maksimal": item.skorMaksimal,
        Status: item.status,
        "Waktu Pengerjaan": item.tanggal,
      }))
    )

    // Autosize columns
    const max_width = [5, 25, 15, 25, 15, 30, 20, 10, 15, 15, 20]
    worksheet["!cols"] = max_width.map((w) => ({ wch: w }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai")
    XLSX.writeFile(workbook, filename)
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold"
    >
      <Download className="w-4 h-4 text-emerald-600" />
      Ekspor ke Excel (.xlsx)
    </Button>
  )
}

import * as XLSX from "xlsx"

export interface OfficialReportRow {
  no?: number
  fullName: string
  nisn: string
  schoolName: string
  className: string
  scoreBahasa: number
  scoreKarakter: number
  scoreBudaya: number
  avgScore: number
  xp: number
  level: number
  predikat: string
}

export function exportOfficialBBPSTExcel(
  rows: OfficialReportRow[],
  filterInfo = "Seluruh Sekolah & Kelas",
  filename = "Laporan_Resmi_Capaian_Literasi_BBPST.xlsx"
) {
  const headerAoa = [
    ["KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI"],
    ["BALAI BAHASA PROVINSI SULAWESI TENGAH"],
    ["LAPORAN CAPAIAN LITERASI BAHASA & PENDIDIKAN KARAKTER PESERTA"],
    [`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} | Lingkup: ${filterInfo}`],
    [], // Baris kosong pemisah
    [
      "No",
      "Nama Lengkap Peserta",
      "NISN / Identitas",
      "Asal Sekolah / Instansi",
      "Kelas / Kategori",
      "Nilai Bahasa Indonesia",
      "Nilai Pendidikan Karakter",
      "Nilai Kearifan Lokal Sulteng",
      "Rata-rata Nilai Literasi",
      "Total XP",
      "Level Capaian",
      "Predikat Karakter",
    ],
  ]

  const dataAoa = rows.map((r, idx) => [
    idx + 1,
    r.fullName,
    r.nisn || "-",
    r.schoolName,
    r.className,
    r.scoreBahasa,
    r.scoreKarakter,
    r.scoreBudaya,
    r.avgScore,
    r.xp,
    `Level ${r.level}`,
    r.predikat,
  ])

  const fullAoa = [...headerAoa, ...dataAoa]
  const ws = XLSX.utils.aoa_to_sheet(fullAoa)

  // Column widths
  ws["!cols"] = [
    { wch: 5 },  // No
    { wch: 28 }, // Nama
    { wch: 15 }, // NISN
    { wch: 28 }, // Sekolah
    { wch: 18 }, // Kelas
    { wch: 22 }, // Bahasa
    { wch: 24 }, // Karakter
    { wch: 22 }, // Budaya
    { wch: 22 }, // Rata-rata
    { wch: 12 }, // XP
    { wch: 14 }, // Level
    { wch: 32 }, // Predikat
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Capaian BBPST")
  XLSX.writeFile(wb, filename)
}

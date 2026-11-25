"use client"

import { useState, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  saveCharacterMatrixAction,
  deleteCharacterMatrixAction,
  importCharacterMatrixAction,
} from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { AudioButton } from "@/components/shared/AudioButton"

const MiniAudioStudio = dynamic(
  () =>
    import("@/components/shared/MiniAudioStudio").then(
      (mod) => mod.MiniAudioStudio
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
    ),
  }
)
import { notify } from "@/lib/notify"
import { REGIONAL_LANGUAGE_LABELS } from "@/lib/constants"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  Trash2,
  Edit3,
  Languages,
  BookOpen,
  Compass,
  Sparkles,
  HelpCircle,
} from "lucide-react"
import type { RegionalLanguage } from "@/types"

interface MatrixItem {
  id: number
  indonesianCharacter: string
  regionalLanguage: RegionalLanguage
  regionalTerm: string
  characterSource: string
  implementation: string
  audioUrl?: string | null
  createdAt: Date
  creator?: { fullName: string } | null
}

interface LanguageOption {
  code: string
  name: string
}

interface AdminCharacterMatrixClientProps {
  matrices: MatrixItem[]
  languages?: LanguageOption[]
}

interface ParsedExcelMatrix {
  indonesianCharacter: string
  regionalLanguage: string
  regionalTerm: string
  characterSource: string
  implementation: string
  audioUrl?: string
  isValid: boolean
  errorReason?: string
}

export function AdminCharacterMatrixClient({
  matrices,
  languages,
}: AdminCharacterMatrixClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const languageOptions: LanguageOption[] =
    languages && languages.length > 0
      ? languages
      : Object.entries(REGIONAL_LANGUAGE_LABELS).map(([code, name]) => ({
          code,
          name,
        }))

  const languageLabelMap: Record<string, string> = Object.fromEntries(
    languageOptions.map((item) => [item.code, item.name])
  )

  const [search, setSearch] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL")

  // Modal manual CRUD
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMatrix, setEditingMatrix] = useState<MatrixItem | null>(null)
  const [matrixAudioUrl, setMatrixAudioUrl] = useState("")
  const [loading, setLoading] = useState(false)

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Excel Bulk Import Modal
  const [excelModalOpen, setExcelModalOpen] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedExcelMatrix[]>([])
  const [isImporting, setIsImporting] = useState(false)

  // Filter matrices
  const filteredMatrices = matrices.filter((m) => {
    const matchSearch =
      m.indonesianCharacter.toLowerCase().includes(search.toLowerCase()) ||
      m.regionalTerm.toLowerCase().includes(search.toLowerCase()) ||
      m.characterSource.toLowerCase().includes(search.toLowerCase()) ||
      m.implementation.toLowerCase().includes(search.toLowerCase())
    const matchLanguage =
      selectedLanguage === "ALL" || m.regionalLanguage === selectedLanguage

    return matchSearch && matchLanguage
  })

  function openCreate() {
    setEditingMatrix(null)
    setMatrixAudioUrl("")
    setModalOpen(true)
  }

  function openEdit(item: MatrixItem) {
    setEditingMatrix(item)
    setMatrixAudioUrl(item.audioUrl ?? "")
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (editingMatrix) {
      formData.append("id", String(editingMatrix.id))
    }

    try {
      const res = await saveCharacterMatrixAction(null, formData)
      if (res.success) {
        notify.success(res.message || "Nilai karakter berhasil disimpan")
        setModalOpen(false)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menyimpan data")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (deleteTargetId === null) return
    setIsDeleting(true)
    try {
      const res = await deleteCharacterMatrixAction(deleteTargetId)
      if (res.success) {
        notify.success("Data matriks karakter berhasil dihapus")
        setDeleteTargetId(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menghapus data")
      }
    } catch {
      notify.error("Terjadi kesalahan sistem")
    } finally {
      setIsDeleting(false)
    }
  }

  // Template Excel Download
  function handleDownloadTemplate() {
    const templateData = [
      {
        No: 1,
        Nilai_Karakter_Indonesia: "Gotong Royong & Persatuan",
        Bahasa_Daerah: "KAILI",
        Istilah_Daerah: "Nosarara Nosabatutu",
        Sumber_Karakter: "Falsafah adat suku Kaili tentang persaudaraan dan kebersamaan hidup.",
        Implementasi_Perilaku: "Siswa aktif bekerja sama dalam piket kelas, kerja kelompok, dan membantu teman tanpa membedakan latar belakang.",
        Audio_URL: "",
      },
      {
        No: 2,
        Nilai_Karakter_Indonesia: "Musyawarah & Keharmonisan",
        Bahasa_Daerah: "PAMONA",
        Istilah_Daerah: "Sintuwu Maroso",
        Sumber_Karakter: "Semboyan persatuan luhur masyarakat Pamona Poso dalam menyatukan tekad.",
        Implementasi_Perilaku: "Menghargai perbedaan pendapat saat pemilihan ketua kelas dan menyelesaikan perselisihan dengan dialog damai.",
        Audio_URL: "",
      },
      {
        No: 3,
        Nilai_Karakter_Indonesia: "Kejujuran & Keteguhan Hati",
        Bahasa_Daerah: "BANGGAI",
        Istilah_Daerah: "Montolutusan",
        Sumber_Karakter: "Nilai luhur kerukunan dan ketulusan bersaudara suku Banggai.",
        Implementasi_Perilaku: "Berbicara jujur kepada bapak/ibu guru dan tidak mencontek saat ujian kejujuran.",
        Audio_URL: "",
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    ws["!cols"] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 16 },
      { wch: 25 },
      { wch: 45 },
      { wch: 55 },
      { wch: 30 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Matriks_Karakter")
    XLSX.writeFile(wb, "Template_Matriks_Karakter_BBPST.xlsx")
    notify.success("Template Excel Matriks Karakter berhasil diunduh!")
  }

  // Parse Excel file
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setExcelFile(file)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

        if (!rawJson || rawJson.length === 0) {
          notify.error("Berkas Excel kosong atau format tidak sesuai")
          setParsedRows([])
          return
        }

        const validLangs = languageOptions.map((item) => item.code)

        const parsed: ParsedExcelMatrix[] = rawJson.map((row) => {
          const indoChar = String(row["Nilai_Karakter_Indonesia"] || row["nilai_karakter"] || "").trim()
          const regLangRaw = String(row["Bahasa_Daerah"] || row["bahasa_daerah"] || "").trim().toUpperCase()
          const regTerm = String(row["Istilah_Daerah"] || row["istilah_daerah"] || "").trim()
          const source = String(row["Sumber_Karakter"] || row["sumber_karakter"] || "").trim()
          const impl = String(row["Implementasi_Perilaku"] || row["implementasi"] || "").trim()
          const audioRaw = String(row["Audio_URL"] || row["audio_url"] || "").trim()

          let isValid = true
          let errorReason = ""

          if (!indoChar) {
            isValid = false
            errorReason = "Nilai karakter Indonesia kosong"
          } else if (!regTerm) {
            isValid = false
            errorReason = "Istilah daerah kosong"
          } else if (!validLangs.includes(regLangRaw)) {
            isValid = false
            errorReason = `Bahasa '${regLangRaw}' tidak dikenal (pilih: ${validLangs.join(", ")})`
          }

          return {
            indonesianCharacter: indoChar,
            regionalLanguage: regLangRaw,
            regionalTerm: regTerm,
            characterSource: source || "-",
            implementation: impl || "-",
            audioUrl: audioRaw || undefined,
            isValid,
            errorReason,
          }
        })

        setParsedRows(parsed)
      } catch (err) {
        console.error("Gagal membaca Excel:", err)
        notify.error("Gagal membaca file Excel. Pastikan format file .xlsx atau .xls")
      }
    }
    reader.readAsBinaryString(file)
  }

  async function handleExecuteBulkImport() {
    const validRows = parsedRows.filter((r) => r.isValid)
    if (validRows.length === 0) {
      notify.error("Tidak ada baris data matriks karakter yang valid")
      return
    }

    setIsImporting(true)
    try {
      const payload = validRows.map((r) => ({
        indonesianCharacter: r.indonesianCharacter,
        regionalLanguage: r.regionalLanguage,
        regionalTerm: r.regionalTerm,
        characterSource: r.characterSource,
        implementation: r.implementation,
        audioUrl: r.audioUrl,
      }))

      const res = await importCharacterMatrixAction(JSON.stringify(payload))
      if (res.success) {
        notify.success(res.message || `Berhasil mengimpor ${validRows.length} entri matriks karakter!`)
        setExcelModalOpen(false)
        setParsedRows([])
        setExcelFile(null)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal mengimpor matriks karakter")
      }
    } catch {
      notify.error("Terjadi kesalahan saat memproses impor")
    } finally {
      setIsImporting(false)
    }
  }

  const validParsedCount = parsedRows.filter((r) => r.isValid).length

  return (
    <div className="space-y-6">
      {/* Header Controls & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nilai, istilah daerah, atau pepatah..."
              className="pl-9 h-10 text-xs rounded-xl border-zinc-200"
            />
          </div>

          {/* Regional Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB] focus:ring-1 focus:ring-[#3C22BB]"
          >
            <option value="ALL">Semua Bahasa Daerah</option>
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setExcelModalOpen(true)}
            variant="outline"
            className="text-xs font-semibold rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-10 gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Impor Massal Excel
          </Button>
          <Button
            onClick={openCreate}
            className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold px-4 h-10 shadow-xs gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Kosakata / Nilai
          </Button>
        </div>
      </div>

      {/* Grid of Character Matrices */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMatrices.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#3C22BB]/40 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  <Languages className="w-3 h-3" />
                  {languageLabelMap[item.regionalLanguage] ??
                    REGIONAL_LANGUAGE_LABELS[item.regionalLanguage] ??
                    item.regionalLanguage}
                </span>

                <div className="flex items-center gap-1">
                  <AudioButton
                    audioUrl={item.audioUrl}
                    text={item.regionalTerm}
                    label="Dengar"
                    size="sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(item)}
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTargetId(item.id)}
                    className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 group-hover:text-[#3C22BB] transition-colors">
                  &ldquo;{item.regionalTerm}&rdquo;
                </h3>
                <div className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  {item.indonesianCharacter}
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="font-semibold text-zinc-700 block text-[11px] mb-0.5">
                    Sumber Karakter & Tradisi:
                  </span>
                  <p className="text-zinc-600 line-clamp-3 leading-relaxed">
                    {item.characterSource}
                  </p>
                </div>

                <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
                  <span className="font-semibold text-indigo-900 block text-[11px] mb-0.5">
                    Implementasi Perilaku Siswa:
                  </span>
                  <p className="text-indigo-800 line-clamp-3 leading-relaxed">
                    {item.implementation}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
              <span>BBPST Sulawesi Tengah</span>
              <span>ID #{item.id}</span>
            </div>
          </div>
        ))}

        {filteredMatrices.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-zinc-200 rounded-2xl p-8">
            <Compass className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-zinc-800">
              Belum Ada Entri Matriks Karakter
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-5">
              Tambahkan istilah karakter kearifan lokal 9 bahasa daerah Sulawesi Tengah atau gunakan fitur impor massal Excel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={() => setExcelModalOpen(true)}
                variant="outline"
                className="text-xs font-semibold rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-9"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
                Impor Massal Excel
              </Button>
              <Button
                onClick={openCreate}
                className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold h-9 shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Entri Manual
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Matriks */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#3C22BB]" />
              {editingMatrix ? "Sunting Entri Kamus Besar Kearifan Lokal" : "Tambah Entri Kamus Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="regionalLanguage" className="text-xs font-semibold">
                  Bahasa Daerah Sulawesi Tengah <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="regionalLanguage"
                  name="regionalLanguage"
                  defaultValue={editingMatrix?.regionalLanguage ?? languageOptions[0]?.code ?? "KAILI"}
                  className="w-full text-xs h-9 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 outline-hidden focus:border-[#3C22BB]"
                  required
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="indonesianCharacter" className="text-xs font-semibold">
                  Nilai Karakter (Indonesia) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="indonesianCharacter"
                  name="indonesianCharacter"
                  defaultValue={editingMatrix?.indonesianCharacter ?? ""}
                  placeholder="Misal: Gotong Royong, Santun, Jujur"
                  required
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="regionalTerm" className="text-xs font-semibold">
                Istilah / Ungkapan Bahasa Daerah <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="regionalTerm"
                name="regionalTerm"
                defaultValue={editingMatrix?.regionalTerm ?? ""}
                placeholder="Misal: Nosarara Nosabatutu / Sintuwu Maroso"
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="characterSource" className="text-xs font-semibold">
                Makna Filosofis &amp; Sumber Rujukan (Pepatah / Folklor / Adat) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="characterSource"
                name="characterSource"
                rows={3}
                defaultValue={editingMatrix?.characterSource ?? ""}
                placeholder="Makna filosofis, cerita rakyat, pepatah luhur, atau tradisi adat asal ungkapan ini..."
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="implementation" className="text-xs font-semibold">
                Contoh Penerapan dalam Kehidupan Sehari-hari <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="implementation"
                name="implementation"
                rows={3}
                defaultValue={editingMatrix?.implementation ?? ""}
                placeholder="Contoh tindakan nyata peserta atau masyarakat dalam kehidupan sehari-hari yang mencerminkan nilai ini..."
                required
                className="text-xs rounded-xl"
              />
            </div>

            <MiniAudioStudio
              value={matrixAudioUrl}
              onChange={setMatrixAudioUrl}
              inputName="audioUrl"
              label="Audio Pelafalan Bahasa Daerah (Rekam / Unggah)"
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-semibold px-4 shadow-xs"
              >
                {loading ? "Menyimpan..." : "Simpan Entri"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Impor Massal Excel */}
      <Dialog open={excelModalOpen} onOpenChange={setExcelModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Impor Massal Matriks Karakter dari Excel (.xlsx)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-900">
                  Langkah 1: Unduh Template Excel Matriks Karakter BBPST
                </h4>
                <p className="text-[11px] text-emerald-700">
                  Format resmi memuat kolom Nilai Karakter, Kode Bahasa Daerah, Istilah Daerah, Sumber, dan Implementasi.
                </p>
              </div>
              <Button
                onClick={handleDownloadTemplate}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0 gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Template (.xlsx)
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-800">
                Langkah 2: Pilih atau Unggah Berkas Excel (.xlsx / .xls)
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 hover:border-[#3C22BB] p-6 rounded-2xl text-center cursor-pointer transition-all bg-zinc-50/50 hover:bg-indigo-50/30"
              >
                <Upload className="w-8 h-8 text-[#3C22BB] mx-auto mb-2" />
                <p className="text-xs font-medium text-zinc-700">
                  {excelFile ? (
                    <strong className="text-emerald-700 font-bold">{excelFile.name}</strong>
                  ) : (
                    "Klik untuk memilih berkas Excel atau tarik berkas ke area ini"
                  )}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Format didukung: Microsoft Excel (.xlsx, .xls)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-800">
                  Pratinjau Hasil Pembacaan Excel ({validParsedCount} dari {parsedRows.length} baris valid)
                </Label>

                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-8">#</th>
                        <th className="px-3 py-2">Istilah Daerah</th>
                        <th className="px-3 py-2">Bahasa</th>
                        <th className="px-3 py-2">Nilai Indonesia</th>
                        <th className="px-3 py-2">Sumber</th>
                        <th className="px-3 py-2 w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={row.isValid ? "hover:bg-zinc-50" : "bg-rose-50/50"}
                        >
                          <td className="px-3 py-2 font-medium text-zinc-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-bold text-zinc-900">{row.regionalTerm}</td>
                          <td className="px-3 py-2 text-zinc-600">{row.regionalLanguage}</td>
                          <td className="px-3 py-2 font-medium text-emerald-800">{row.indonesianCharacter}</td>
                          <td className="px-3 py-2 text-zinc-500 max-w-xs truncate">{row.characterSource}</td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                              </span>
                            ) : (
                              <span className="text-rose-600 font-semibold text-[10px]" title={row.errorReason}>
                                {row.errorReason}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExcelModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleExecuteBulkImport}
                disabled={isImporting || validParsedCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 shadow-xs"
              >
                {isImporting
                  ? "Menyimpan ke Database..."
                  : `Simpan ${validParsedCount} Matriks ke Database`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        variant="danger"
        title="Hapus Nilai Karakter?"
        description="Data matriks nilai karakter daerah ini akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus Data"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

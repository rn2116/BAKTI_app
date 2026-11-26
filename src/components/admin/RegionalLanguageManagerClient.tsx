"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  saveRegionalLanguageAction,
  toggleRegionalLanguageStatusAction,
} from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { notify } from "@/lib/notify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Languages,
  Plus,
  Edit3,
  MapPin,
  CheckCircle2,
  Power,
  BookOpen,
} from "lucide-react"

export interface ManagedLanguageItem {
  id: string
  code: string
  name: string
  regencyCoverage: string
  description: string | null
  isActive: boolean
  entryCount: number
  creator?: { fullName: string } | null
}

export function RegionalLanguageManagerClient({
  languages,
}: {
  languages: ManagedLanguageItem[]
}) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLang, setEditingLang] = useState<ManagedLanguageItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function openCreate() {
    setEditingLang(null)
    setModalOpen(true)
  }

  function openEdit(item: ManagedLanguageItem) {
    setEditingLang(item)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    const fd = new FormData(e.currentTarget)
    if (editingLang) {
      fd.set("id", editingLang.id)
      fd.set("code", editingLang.code)
      fd.set("isActive", String(editingLang.isActive))
    }

    try {
      const res = await saveRegionalLanguageAction(null, fd)
      if (res.success) {
        notify.success(res.message || "Bahasa daerah berhasil disimpan.")
        setModalOpen(false)
        router.refresh()
      } else {
        notify.error(res.error || "Gagal menyimpan bahasa daerah.")
      }
    } catch {
      notify.error("Terjadi kesalahan jaringan.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggle(item: ManagedLanguageItem) {
    setTogglingId(item.id)
    try {
      const res = await toggleRegionalLanguageStatusAction(item.id, !item.isActive)
      if (res.success) {
        notify.success(res.message || "Status bahasa diperbarui.")
        router.refresh()
      } else {
        notify.error(res.error || "Gagal mengubah status bahasa.")
      }
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        <div className="space-y-0.5 min-w-0">
          <div className="text-xs font-bold text-[#3C22BB] uppercase tracking-wider">
            Daftar Bahasa Daerah Dinamis
          </div>
          <p className="text-xs text-zinc-600 break-words leading-relaxed">
            Tambahkan bahasa daerah Sulawesi Tengah baru kapan saja agar otomatis tampil pada Kamus Besar dan Modul Pembelajaran.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-bold min-h-12 w-full sm:w-auto px-4 gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Tambah Bahasa Daerah</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
        {languages.map((lang) => (
          <Card
            key={lang.id}
            className="rounded-2xl border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 min-w-0 w-full overflow-hidden break-words"
          >
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3C22BB] border border-indigo-100">
                  <Languages className="w-3 h-3 shrink-0" />
                  <span className="break-all">{lang.code}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    lang.isActive
                      ? "bg-emerald-50 text-[#065F46] border-emerald-200"
                      : "bg-zinc-100 text-zinc-500 border-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  {lang.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-[#1E135E] break-words">
                  {lang.name}
                </h3>
                <p className="text-xs text-zinc-500 flex items-start gap-1 mt-1 break-words">
                  <MapPin className="w-3.5 h-3.5 text-[#065F46] shrink-0 mt-0.5" />
                  <span>{lang.regencyCoverage}</span>
                </p>
              </div>

              {lang.description && (
                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3 break-words">
                  {lang.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700">
                <BookOpen className="w-3.5 h-3.5 text-[#3C22BB] shrink-0" />
                {lang.entryCount} Entri Kamus
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(lang)}
                  className="min-h-11 px-3 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Sunting
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={togglingId === lang.id}
                  onClick={() => handleToggle(lang)}
                  className={`min-h-11 min-w-11 px-3 rounded-xl text-xs font-semibold border ${
                    lang.isActive
                      ? "text-amber-700 border-amber-200 bg-amber-50/40 hover:bg-amber-50"
                      : "text-emerald-700 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50"
                  }`}
                  title={lang.isActive ? "Nonaktifkan" : "Aktifkan"}
                  aria-label={lang.isActive ? "Nonaktifkan Bahasa" : "Aktifkan Bahasa"}
                >
                  <Power className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1E135E] flex items-center gap-2">
              <Languages className="w-5 h-5 text-[#3C22BB]" />
              {editingLang ? "Sunting Bahasa Daerah" : "Tambah Bahasa Daerah Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-semibold">
                  Kode Unik Bahasa <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={editingLang?.code ?? ""}
                  disabled={Boolean(editingLang)}
                  placeholder="Misal: DAMPELAS"
                  required
                  className="text-xs rounded-xl font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Nama Bahasa Daerah <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingLang?.name ?? ""}
                  placeholder="Misal: Bahasa Dampelas"
                  required
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="regencyCoverage" className="text-xs font-semibold">
                Cakupan Wilayah Kabupaten/Kota <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="regencyCoverage"
                name="regencyCoverage"
                defaultValue={editingLang?.regencyCoverage ?? ""}
                placeholder="Misal: Kabupaten Donggala bagian utara"
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Deskripsi Ringkas &amp; Sejarah Penutur
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={editingLang?.description ?? ""}
                placeholder="Gambaran wilayah sebaran dan kekhasan tradisi lisan bahasa daerah ini..."
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="min-h-11 text-xs rounded-xl w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="min-h-11 bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl text-xs font-bold px-4 w-full sm:w-auto"
              >
                {isSaving ? "Menyimpan..." : "Simpan Bahasa Daerah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveSchool, deleteSchool } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Trash2,
  Edit3,
  Building2,
  Phone,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { notify } from "@/lib/notify"

interface SchoolItem {
  id: string
  name: string
  npsn: string
  regencyId: string
  address: string
  phone: string
  isActive: boolean
  regency: { name: string; code: string }
  _count: { classes: number; users: number }
}

interface RegencyItem {
  id: string
  name: string
  code: string
}

export function SekolahManagementClient({
  schools,
  regencies,
}: {
  schools: SchoolItem[]
  regencies: RegencyItem[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<SchoolItem | null>(null)

  const [search, setSearch] = useState("")
  const [selectedRegency, setSelectedRegency] = useState("ALL")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setSelectedSchool(null)
    setError(null)
    setOpen(true)
  }

  function openEdit(school: SchoolItem) {
    setSelectedSchool(school)
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    if (selectedSchool) {
      form.append("id", selectedSchool.id)
    }

    const res = await saveSchool(null, form)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      notify.success(
        selectedSchool
          ? "Data satuan pendidikan berhasil diperbarui"
          : "Satuan pendidikan baru berhasil ditambahkan"
      )
      router.refresh()
    } else {
      setError(res.error || "Gagal menyimpan sekolah")
      notify.error(res.error || "Gagal menyimpan sekolah")
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setIsDeleting(true)
    const res = await deleteSchool(deleteTargetId)
    setIsDeleting(false)

    if (res.success) {
      notify.success("Satuan pendidikan berhasil dihapus")
      setDeleteTargetId(null)
      router.refresh()
    } else {
      notify.error(res.error || "Gagal menghapus sekolah")
    }
  }

  // Filter list
  const filteredSchools = schools.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.npsn.includes(search) ||
      s.address.toLowerCase().includes(search.toLowerCase())

    const matchRegency =
      selectedRegency === "ALL" || s.regencyId === selectedRegency

    return matchSearch && matchRegency
  })

  return (
    <div className="space-y-5">
      {/* Baris Kontrol: Judul, Tambah, Search, & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Input Pencarian */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari sekolah, NPSN, alamat..."
              className="pl-9 h-10 text-xs rounded-xl border-zinc-200 focus-visible:ring-[#3C22BB]"
            />
          </div>

          {/* Filter Wilayah */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={selectedRegency}
              onChange={(e) => setSelectedRegency(e.target.value)}
              className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#3C22BB] w-full sm:w-auto"
            >
              <option value="ALL">Semua Kabupaten/Kota (13)</option>
              {regencies.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tombol Tambah Sekolah */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              size="sm"
              className="gap-2 text-xs bg-[#3C22BB] hover:bg-[#2E1994] text-white shadow-xs rounded-xl h-10 px-4 self-end sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Sekolah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#18181B]">
                {selectedSchool ? "Edit Data Sekolah" : "Tambah Satuan Pendidikan Baru"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Satuan Pendidikan</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedSchool?.name ?? ""}
                  placeholder="Contoh: SMAN 1 Palu"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="npsn">NPSN (8 Digit)</Label>
                  <Input
                    id="npsn"
                    name="npsn"
                    maxLength={8}
                    defaultValue={selectedSchool?.npsn ?? ""}
                    placeholder="Contoh: 40201234"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regencyId">Kabupaten / Kota</Label>
                  <select
                    id="regencyId"
                    name="regencyId"
                    defaultValue={selectedSchool?.regencyId ?? regencies[0]?.id ?? ""}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
                    required
                  >
                    {regencies.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Nomor Telepon / Kontak Resmi</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={selectedSchool?.phone ?? ""}
                  placeholder="Contoh: 0451-421234"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  name="address"
                  rows={3}
                  defaultValue={selectedSchool?.address ?? ""}
                  placeholder="Jl. Sam Ratulangi No. 1, Kota Palu"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl"
                >
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 1. Mobile Stacked Cards (< 768px) */}
      <div className="space-y-3 md:hidden">
        {filteredSchools.map((s) => (
          <Card key={s.id} className="p-4 border-zinc-200 shadow-xs space-y-3 bg-white rounded-2xl">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3C22BB]/10 text-[#3C22BB]">
                  NPSN: {s.npsn}
                </span>
                <h3 className="font-bold text-sm text-[#18181B] mt-1.5 truncate">
                  {s.name}
                </h3>
                <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate">{s.regency.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(s)}
                  className="h-8 w-8 text-zinc-600 hover:text-[#3C22BB] hover:bg-zinc-100 rounded-lg"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTargetId(s.id)}
                  className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-zinc-600 line-clamp-2 border-t border-zinc-100 pt-2">
              {s.address}
            </p>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 pt-2">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-400" />
                <span>{s.phone}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span>{s._count.classes} Rombel</span>
                <span>•</span>
                <span>{s._count.users} Pengguna</span>
              </div>
            </div>
          </Card>
        ))}

        {filteredSchools.length === 0 && (
          <div className="p-8 border border-dashed rounded-2xl text-center text-xs text-zinc-500 bg-white">
            Tidak ada satuan pendidikan yang sesuai dengan kriteria filter.
          </div>
        )}
      </div>

      {/* 2. Desktop Full Table (>= 768px) */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-semibold">
              <th className="py-3 px-4">NPSN & Satuan Pendidikan</th>
              <th className="py-3 px-4">Kabupaten / Kota</th>
              <th className="py-3 px-4">Kontak & Alamat</th>
              <th className="py-3 px-4 text-center">Rombel & Pengguna</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60">
            {filteredSchools.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-sm text-[#18181B]">{s.name}</div>
                  <div className="text-xs font-mono text-[#3C22BB] font-semibold">
                    NPSN: {s.npsn}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs font-medium text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{s.regency.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="text-xs text-zinc-600 line-clamp-1">{s.address}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{s.phone}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">
                    <span>{s._count.classes} Rombel</span>
                    <span>/</span>
                    <span>{s._count.users} User</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {s.isActive ? "Aktif" : "Non-aktif"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(s)}
                      className="h-8 w-8 text-zinc-600 hover:text-[#3C22BB] hover:bg-zinc-100 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTargetId(s.id)}
                      className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredSchools.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                  Tidak ada satuan pendidikan yang sesuai dengan filter pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>

      {/* Dialog Konfirmasi Hapus Sekolah */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(isOpen) => !isOpen && setDeleteTargetId(null)}
        variant="danger"
        title="Hapus Satuan Pendidikan?"
        description="Satuan pendidikan ini beserta seluruh rombel dan relasi data di dalamnya akan dihapus. Pastikan tidak ada data krusial yang hilang."
        confirmText="Ya, Hapus Sekolah"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

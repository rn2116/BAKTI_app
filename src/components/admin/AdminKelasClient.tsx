"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClass, deleteClass } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Building2, Users, Search, Filter, Layers } from "lucide-react"

interface ClassItem {
  id: string
  name: string
  grade: number
  schoolId: string
  school: { id: string; name: string }
  _count: { users: number }
}

interface SchoolOption {
  id: string
  name: string
}

export function AdminKelasClient({
  classes,
  schools,
}: {
  classes: ClassItem[]
  schools: SchoolOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterSchool, setFilterSchool] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const res = await createClass(null, form)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(res.error || "Gagal membuat kelas")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus rombongan belajar (kelas) ini?")) return
    const res = await deleteClass(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal menghapus kelas")
    }
  }

  const filtered = classes.filter((c) => {
    const matchSchool = filterSchool === "ALL" || c.schoolId === filterSchool
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.school.name.toLowerCase().includes(search.toLowerCase()) ||
      `kelas ${c.grade}`.includes(search.toLowerCase())
    return matchSchool && matchSearch
  })

  return (
    <div className="space-y-5">
      {/* Baris Kontrol: Search, Filter, & Tambah */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Input Pencarian */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kelas / sekolah..."
              className="pl-9 h-10 text-xs rounded-xl border-zinc-200 focus-visible:ring-[#3C22BB]"
            />
          </div>

          {/* Filter Sekolah */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="h-10 text-xs rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#3C22BB] w-full sm:w-auto"
            >
              <option value="ALL">Semua Satuan Pendidikan ({schools.length})</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Tambah Kelas */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2 text-xs bg-[#3C22BB] hover:bg-[#2E1994] text-white shadow-xs rounded-xl h-10 px-4 self-end sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Rombel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#18181B]">
                Tambah Rombongan Belajar (Kelas) Baru
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="schoolId">Sekolah Satuan Pendidikan</Label>
                <select
                  id="schoolId"
                  name="schoolId"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
                  required
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="grade">Tingkat (Grade 10-12)</Label>
                  <Input
                    id="grade"
                    name="grade"
                    type="number"
                    min="1"
                    max="12"
                    defaultValue={10}
                    placeholder="Contoh: 10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama Rombel</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Contoh: X MIPA 1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
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
                  {loading ? "Menyimpan..." : "Simpan Kelas"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 1. Mobile Stacked Cards (< 768px) */}
      <div className="space-y-3 md:hidden">
        {filtered.map((c) => (
          <Card key={c.id} className="p-4 border-zinc-200 shadow-xs space-y-2.5 bg-white rounded-2xl">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3C22BB]/10 text-[#3C22BB]">
                  Tingkat {c.grade}
                </span>
                <h3 className="font-bold text-sm text-[#18181B] mt-1 truncate">
                  {c.name}
                </h3>
                <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate">{c.school.name}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(c.id)}
                className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-2 text-zinc-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>{c._count.users} Siswa Terdaftar</span>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 border border-dashed rounded-2xl text-center text-xs text-zinc-500 bg-white">
            Tidak ada rombongan belajar yang cocok dengan filter.
          </div>
        )}
      </div>

      {/* 2. Desktop Full Table (>= 768px) */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-semibold">
              <th className="py-3 px-4">Nama Rombel & Tingkat</th>
              <th className="py-3 px-4">Satuan Pendidikan</th>
              <th className="py-3 px-4 text-center">Jumlah Siswa</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-sm text-[#18181B]">{c.name}</div>
                  <div className="text-xs text-zinc-400 font-medium">Tingkat Kelas {c.grade}</div>
                </td>
                <td className="py-3.5 px-4 text-xs font-medium text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{c.school.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#3C22BB] bg-[#3C22BB]/10 px-2.5 py-1 rounded-full">
                    <Users className="w-3 h-3" />
                    {c._count.users} Siswa
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(c.id)}
                    className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-zinc-500">
                  Tidak ada rombongan belajar yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>
    </div>
  )
}

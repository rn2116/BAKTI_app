"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveSchool, deleteSchool } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit3, Building, Phone, MapPin } from "lucide-react"

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
      router.refresh()
    } else {
      setError(res.error || "Gagal menyimpan sekolah")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus satuan pendidikan ini beserta seluruh relasinya?")) return
    const res = await deleteSchool(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal menghapus sekolah")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daftar Satuan Pendidikan</h2>
          <p className="text-xs text-muted-foreground">
            Sekolah mitra BAKTI tingkat SMA/SMK se-Sulawesi Tengah
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} size="sm" className="gap-2 text-xs">
              <Plus className="w-4 h-4" /> Tambah Sekolah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedSchool ? "Edit Data Sekolah" : "Tambah Satuan Pendidikan"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-md">
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

              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                <Label htmlFor="phone">Nomor Telepon / Kontak</Label>
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

              <div className="flex justify-end gap-2 pt-4 border-t border-input">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schools.map((s) => (
          <Card key={s.id} className="border-input hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    NPSN: {s.npsn}
                  </span>
                  <h3 className="font-semibold text-base mt-1.5">{s.name}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{s.regency.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(s)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s.id)}
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {s.address}
              </p>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span>{s.phone}</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-input bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>{s._count.classes} Rombel</span>
              <span>{s._count.users} Pengguna</span>
            </div>
          </Card>
        ))}

        {schools.length === 0 && (
          <div className="col-span-full p-10 border border-dashed rounded-xl text-center text-sm text-muted-foreground">
            Belum ada sekolah terdaftar. Tambahkan sekolah mitra pertama Anda.
          </div>
        )}
      </div>
    </div>
  )
}

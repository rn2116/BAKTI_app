"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClass, deleteClass } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Building, Users } from "lucide-react"

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
    if (!confirm("Hapus rombel kelas ini?")) return
    const res = await deleteClass(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal menghapus kelas")
    }
  }

  const filtered = filterSchool === "ALL"
    ? classes
    : classes.filter((c) => c.schoolId === filterSchool)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daftar Rombongan Belajar (Rombel)</h2>
          <p className="text-xs text-muted-foreground">
            Kelola kelas untuk penempatan siswa di seluruh satuan pendidikan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Semua Sekolah</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 text-xs">
                <Plus className="w-4 h-4" /> Tambah Rombel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Rombongan Belajar Baru</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {error && (
                  <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="schoolId">Sekolah Satuan Pendidikan</Label>
                  <select
                    id="schoolId"
                    name="schoolId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <Label htmlFor="grade">Tingkat (Grade 1-12)</Label>
                    <Input
                      id="grade"
                      name="grade"
                      type="number"
                      min="1"
                      max="12"
                      placeholder="Contoh: 10"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nama Kelas</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Contoh: X IPA 1"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Kelas"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="border-input hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Kelas {c.grade}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(c.id)}
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <h3 className="font-semibold text-base">{c.name}</h3>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                <span>{c.school.name}</span>
              </div>
            </div>

            <div className="px-4 py-2.5 border-t border-input bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{c._count.users} Siswa</span>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-10 border border-dashed rounded-xl text-center text-sm text-muted-foreground">
            Tidak ada data kelas yang cocok dengan filter.
          </div>
        )}
      </div>
    </div>
  )
}

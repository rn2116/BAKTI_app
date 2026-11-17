"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClass, deleteClass } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Users } from "lucide-react"

interface KelasClientProps {
  classes: Array<{
    id: string
    name: string
    grade: number
    schoolId: string
    _count: { users: number }
  }>
  schoolId: string
  schoolName: string
}

export function KelasManagementClient({
  classes,
  schoolId,
  schoolName,
}: KelasClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    form.append("schoolId", schoolId)

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
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return
    const res = await deleteClass(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal menghapus kelas")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{schoolName}</h2>
          <p className="text-xs text-muted-foreground">
            Daftar rombongan belajar aktif di sekolah Anda
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 text-xs">
              <Plus className="w-4 h-4" /> Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Rombongan Belajar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="grade">Tingkat Kelas (Grade)</Label>
                <Input
                  id="grade"
                  name="grade"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Contoh: 10 atau 11 atau 12"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Kelas</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: X IPA 1 atau XII Bahasa"
                  required
                />
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-sm transition-all border-input">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                  Kelas {cls.grade}
                </span>
                <CardTitle className="text-base mt-1.5">{cls.name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(cls.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{cls._count.users} Siswa terdaftar</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full p-8 border border-dashed rounded-xl text-center text-sm text-muted-foreground">
            Belum ada kelas yang terdaftar di sekolah ini. Klik tombol Tambah Kelas di atas.
          </div>
        )}
      </div>
    </div>
  )
}

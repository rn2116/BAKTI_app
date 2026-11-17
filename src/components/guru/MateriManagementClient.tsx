"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveMaterial, deleteMaterial } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit3, BookOpen, Clock } from "lucide-react"
import { Category } from "@prisma/client"

interface MaterialItem {
  id: string
  title: string
  slug: string
  category: Category
  description: string
  content: string
  readingTime: number
  orderIndex: number
  isPublished: boolean
  createdAt: Date
  creator?: { fullName: string }
  _count?: { quizzes: number; progress: number }
}

export function MateriManagementClient({
  materials,
  isTeacher = true,
}: {
  materials: MaterialItem[]
  isTeacher?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null)

  function openCreate() {
    setSelectedMaterial(null)
    setError(null)
    setOpen(true)
  }

  function openEdit(mat: MaterialItem) {
    setSelectedMaterial(mat)
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    if (selectedMaterial) {
      form.append("id", selectedMaterial.id)
    }

    const res = await saveMaterial(null, form)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(res.error || "Gagal menyimpan materi")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus materi pembelajaran ini?")) return
    const res = await deleteMaterial(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal menghapus materi")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isTeacher ? "Daftar Materi Dibuat" : "Katalog Materi Sistem"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Kelola konten literasi bahasa, pembentukan karakter, dan budaya Sulteng
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              size="sm"
              className="gap-2 text-xs bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" /> Buat Materi Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedMaterial ? "Edit Materi" : "Buat Materi Pembelajaran Baru"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="title">Judul Materi</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={selectedMaterial?.title ?? ""}
                  placeholder="Contoh: Tata Bahasa Baku & Cerita Rakyat Tadulako"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Kategori Kurikulum</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={selectedMaterial?.category ?? "BAHASA_INDONESIA"}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="BAHASA_INDONESIA">Bahasa Indonesia</option>
                    <option value="KARAKTER">Pendidikan Karakter</option>
                    <option value="BUDAYA_SULTENG">Budaya Sulawesi Tengah</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="readingTime">Waktu Baca (Menit)</Label>
                  <Input
                    id="readingTime"
                    name="readingTime"
                    type="number"
                    min="1"
                    defaultValue={selectedMaterial?.readingTime ?? 5}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Deskripsi Singkat / Ringkasan</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={selectedMaterial?.description ?? ""}
                  placeholder="Ringkasan materi pembelajaran..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content">Isi Materi Lengkap (Mendukung HTML)</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={8}
                  defaultValue={selectedMaterial?.content ?? ""}
                  placeholder="Tuliskan isi bab atau materi teks di sini..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <Label htmlFor="orderIndex">Urutan Tampil (Index)</Label>
                  <Input
                    id="orderIndex"
                    name="orderIndex"
                    type="number"
                    defaultValue={selectedMaterial?.orderIndex ?? 0}
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    value="true"
                    defaultChecked={selectedMaterial ? selectedMaterial.isPublished : true}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer text-xs">
                    Publikasikan Langsung
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-input">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3C22BB] hover:bg-[#2E1994] text-white rounded-xl shadow-xs"
                >
                  {loading ? "Menyimpan..." : "Simpan Materi"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((m) => (
          <Card key={m.id} className="border-zinc-200/90 rounded-2xl bg-white shadow-xs flex flex-col justify-between hover:border-[#3C22BB]/40 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <CategoryBadge category={m.category} />
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    m.isPublished
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {m.isPublished ? "Terbit" : "Draft"}
                </span>
              </div>
              <CardTitle className="text-base line-clamp-1">{m.title}</CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {m.description}
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-y border-input/60 py-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{m.readingTime} Menit</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{m._count?.quizzes ?? 0} Kuis Terkait</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  Oleh: {m.creator?.fullName ?? "Guru"}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(m)}
                    className="h-8 px-2 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(m.id)}
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {materials.length === 0 && (
          <div className="col-span-full p-10 border border-dashed rounded-xl text-center text-sm text-muted-foreground">
            Belum ada materi pembelajaran. Klik tombol Buat Materi Baru untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  )
}

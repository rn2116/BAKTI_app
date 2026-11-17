"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClass, deleteClass } from "@/actions/admin-guru"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notify } from "@/lib/notify"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Users, Copy, Check, Hash, Sparkles } from "lucide-react"

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
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
      notify.success("Rombel kelas berhasil ditambahkan!")
      router.refresh()
    } else {
      setError(res.error || "Gagal membuat kelas")
      notify.error(res.error || "Gagal membuat kelas")
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    setIsDeleting(true)
    const res = await deleteClass(deleteTargetId)
    setIsDeleting(false)

    if (res.success) {
      notify.success("Rombongan belajar berhasil dihapus")
      setDeleteTargetId(null)
      router.refresh()
    } else {
      notify.error(res.error || "Gagal menghapus kelas")
    }
  }

  function handleCopyCode(classId: string, className: string) {
    // Generate kode kelas ringkas 6 karakter dari ID
    const code = `BK-${className.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${classId.slice(0, 4).toUpperCase()}`
    navigator.clipboard.writeText(code)
    setCopiedId(classId)
    notify.success("Kode berhasil disalin ke papan klip!", `Kode ${className}: ${code}`)

    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900">{schoolName}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daftar rombongan belajar (rombel) aktif dan pembagian kode kelas untuk siswa
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 text-xs font-bold rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white h-10 px-4 shadow-xs">
              <Plus className="w-4 h-4" /> Tambah Rombel Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-zinc-900">
                Tambah Rombongan Belajar
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-xs font-bold text-zinc-700">
                  Tingkat Kelas (Grade)
                </Label>
                <Input
                  id="grade"
                  name="grade"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Contoh: 10 atau 11 atau 12"
                  className="rounded-xl border-zinc-200 text-xs h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-zinc-700">
                  Nama Kelas / Rombel
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: X IPA 1 atau XII Bahasa"
                  className="rounded-xl border-zinc-200 text-xs h-10"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold"
                >
                  {loading ? "Menyimpan..." : "Simpan Kelas"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid Kartu Kelas Modern dengan Kartu Kode Kelas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => {
          const classCode = `BK-${cls.name.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${cls.id.slice(0, 4).toUpperCase()}`
          const isCopied = copiedId === cls.id

          return (
            <Card
              key={cls.id}
              className="rounded-2xl border-zinc-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-[#3C22BB] uppercase bg-[#3C22BB]/10 px-2.5 py-0.5 rounded-full border border-[#3C22BB]/20">
                    Tingkat {cls.grade}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTargetId(cls.id)}
                    className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <h3 className="text-lg font-black text-zinc-900 leading-snug">
                  {cls.name}
                </h3>

                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>{cls._count.users} Siswa Terdaftar</span>
                </div>

                {/* Kartu Kode Kelas dengan Tombol Salin */}
                <div className="mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3 h-3 text-indigo-500" /> Kode Kelas Siswa
                    </div>
                    <div className="font-mono font-black text-sm text-[#3C22BB] tracking-wider mt-0.5">
                      {classCode}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCopyCode(cls.id, cls.name)}
                    variant="outline"
                    size="sm"
                    className={`h-8 px-2.5 rounded-lg text-xs font-bold gap-1 transition-all ${
                      isCopied ? "bg-emerald-50 text-emerald-700 border-emerald-300" : ""
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin Kode
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}

        {classes.length === 0 && (
          <div className="col-span-full p-12 border border-dashed rounded-3xl text-center text-xs text-zinc-400 bg-white shadow-xs">
            Belum ada rombel kelas yang terdaftar. Klik tombol Tambah Rombel Baru di atas untuk memulai.
          </div>
        )}
      </div>

      {/* Dialog Konfirmasi Hapus Rombel */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(isOpen) => !isOpen && setDeleteTargetId(null)}
        variant="danger"
        title="Hapus Rombongan Belajar?"
        description="Rombongan belajar ini akan dihapus. Siswa yang berada di kelas ini tidak akan terhapus, tetapi relasi kelasnya akan dikosongkan."
        confirmText="Ya, Hapus Rombel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

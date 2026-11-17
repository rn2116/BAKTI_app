"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveUserAdmin, deleteUserAdmin } from "@/actions/admin-guru"
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
import { Plus, Trash2, Edit3, Sparkles } from "lucide-react"
import { Role } from "@prisma/client"

interface UserAdminItem {
  id: string
  fullName: string
  email: string
  role: Role
  nisn: string | null
  nip: string | null
  isActive: boolean
  createdAt: Date
  school: { id: string; name: string } | null
  class: { id: string; name: string; grade: number } | null
  xp: number
  level: number
}

interface SchoolItem {
  id: string
  name: string
}

interface ClassItem {
  id: string
  name: string
  schoolId: string
}

export function PenggunaManagementClient({
  users,
  schools,
  classes,
}: {
  users: UserAdminItem[]
  schools: SchoolItem[]
  classes: ClassItem[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserAdminItem | null>(null)

  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  const [formSchoolId, setFormSchoolId] = useState<string>("")
  const [formRole, setFormRole] = useState<Role>(Role.SISWA)

  function openCreate() {
    setSelectedUser(null)
    setFormRole(Role.SISWA)
    setFormSchoolId("")
    setError(null)
    setOpen(true)
  }

  function openEdit(u: UserAdminItem) {
    setSelectedUser(u)
    setFormRole(u.role)
    setFormSchoolId(u.school?.id ?? "")
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    if (selectedUser) {
      form.append("id", selectedUser.id)
    }

    const res = await saveUserAdmin(null, form)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(res.error || "Gagal menyimpan akun pengguna")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengguna ini dari sistem?")) return
    const res = await deleteUserAdmin(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal menghapus pengguna")
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.nisn && u.nisn.includes(search)) ||
      (u.nip && u.nip.includes(search))
    return matchRole && matchSearch
  })

  const formAvailableClasses = classes.filter((c) => c.schoolId === formSchoolId)

  return (
    <div className="space-y-6">
      {/* Top action and filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#18181B]">Daftar Akun Pengguna</h2>
          <p className="text-xs text-zinc-500">
            Kelola akses siswa, guru pendidik, dan administrator platform
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} size="sm" className="gap-2 text-xs w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {error && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={selectedUser?.fullName ?? ""}
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser?.email ?? ""}
                    placeholder="nama@sekolah.sch.id"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role">Peran (Role)</Label>
                  <select
                    id="role"
                    name="role"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
                    required
                  >
                    <option value="SISWA">Siswa</option>
                    <option value="GURU">Guru</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Kata Sandi {selectedUser ? "(Kosongkan jika tidak diganti)" : ""}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  required={!selectedUser}
                />
              </div>

              {formRole !== Role.ADMIN && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="schoolId">Sekolah Asal</Label>
                    <select
                      id="schoolId"
                      name="schoolId"
                      value={formSchoolId}
                      onChange={(e) => setFormSchoolId(e.target.value)}
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
                    >
                      <option value="">-- Pilih Sekolah --</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formRole === Role.SISWA ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="classId">Kelas / Rombel</Label>
                      <select
                        id="classId"
                        name="classId"
                        defaultValue={selectedUser?.class?.id ?? ""}
                        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {formAvailableClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formRole === Role.SISWA && (
                  <div className="space-y-1.5">
                    <Label htmlFor="nisn">NISN (Opsional)</Label>
                    <Input
                      id="nisn"
                      name="nisn"
                      defaultValue={selectedUser?.nisn ?? ""}
                      placeholder="Contoh: 0071234567"
                    />
                  </div>
                )}

                {formRole === Role.GURU && (
                  <div className="space-y-1.5">
                    <Label htmlFor="nip">NIP (Opsional)</Label>
                    <Input
                      id="nip"
                      name="nip"
                      defaultValue={selectedUser?.nip ?? ""}
                      placeholder="Contoh: 198501012010011001"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    value="true"
                    defaultChecked={selectedUser ? selectedUser.isActive : true}
                    className="h-4 w-4 rounded border-zinc-300 text-[#3C22BB] focus:ring-[#3C22BB]"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer text-xs">
                    Akun Pengguna Aktif
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Pengguna"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <Input
          placeholder="Cari nama, email, NISN, atau NIP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs text-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "SISWA", "GURU", "ADMIN"].map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(r)}
              className="text-xs h-8 px-3"
            >
              {r === "ALL" ? "Semua Peran" : r}
            </Button>
          ))}
        </div>
      </div>

      {/* 1. Mobile Stacked Cards (< 768px) */}
      <div className="space-y-3 md:hidden">
        {filteredUsers.map((u) => (
          <Card key={u.id} className="p-4 border-zinc-200 shadow-xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-[#18181B] truncate">
                  {u.fullName}
                </div>
                <div className="text-[11px] text-zinc-500 truncate">{u.email}</div>
              </div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  u.role === "ADMIN"
                    ? "bg-purple-100 text-purple-800"
                    : u.role === "GURU"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-[#3C22BB]/10 text-[#3C22BB]"
                }`}
              >
                {u.role}
              </span>
            </div>

            <div className="text-xs text-zinc-600 border-t border-zinc-100 pt-2 flex flex-col gap-1">
              <div>
                <span className="text-zinc-400">Sekolah: </span>
                <span className="font-medium text-zinc-800">{u.school?.name ?? "-"}</span>
              </div>
              {u.class && (
                <div>
                  <span className="text-zinc-400">Kelas: </span>
                  <span className="font-medium text-zinc-800">Kelas {u.class.grade} ({u.class.name})</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {u.isActive ? "Aktif" : "Non-aktif"}
                </span>
                {u.role === "SISWA" && (
                  <span className="text-xs font-mono font-bold text-[#D97706] flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> {u.xp} XP
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(u)}
                  className="h-7 px-2 text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(u.id)}
                  className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 border border-dashed rounded-xl text-center text-xs text-zinc-500 bg-white">
            Tidak ada pengguna yang ditemukan.
          </div>
        )}
      </div>

      {/* 2. Desktop Full Table (>= 768px) */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-semibold">
              <th className="py-3 px-4">Pengguna</th>
              <th className="py-3 px-4">Peran</th>
              <th className="py-3 px-4">Sekolah / Rombel</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Gamifikasi</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-zinc-900">{u.fullName}</div>
                  <div className="text-[11px] text-zinc-500">{u.email}</div>
                  {u.nisn && (
                    <div className="text-[10px] text-zinc-400">NISN: {u.nisn}</div>
                  )}
                  {u.nip && (
                    <div className="text-[10px] text-zinc-400">NIP: {u.nip}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : u.role === "GURU"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-[#3C22BB]/10 text-[#3C22BB]"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-zinc-800">{u.school?.name ?? "-"}</div>
                  {u.class && (
                    <div className="text-[11px] text-zinc-500">
                      Kelas {u.class.grade} ({u.class.name})
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.isActive ? "Aktif" : "Non-aktif"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {u.role === "SISWA" ? (
                    <div className="font-mono text-xs font-semibold text-[#D97706]">
                      {u.xp} XP (Lvl {u.level})
                    </div>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(u)}
                      className="h-7 w-7 text-zinc-600 hover:text-zinc-900"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(u.id)}
                      className="h-7 w-7 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-zinc-500">
                  Tidak ada pengguna yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>
    </div>
  )
}

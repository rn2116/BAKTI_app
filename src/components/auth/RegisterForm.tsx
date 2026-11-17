"use client"

import { useState, useEffect, FormEvent } from "react"
import { toast } from "@/components/ui/use-toast"
import { register } from "@/actions/auth"
import { getSchools, getClassesBySchool } from "@/actions/school"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, School, GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react"

interface Option {
  id: string
  name: string
}

export default function RegisterForm() {
  const [schools, setSchools] = useState<Option[]>([])
  const [classes, setClasses] = useState<Option[]>([])
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    ;(async () => {
      const data = await getSchools()
      setSchools(data)
    })()
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const formData = new FormData(event.currentTarget)
    const result = await register(null, formData)
    setPending(false)

    if (result && result.error) {
      toast.error(result.error)
    }
  }

  async function handleSchoolChange(value: string) {
    if (!value) {
      setClasses([])
      return
    }
    const data = await getClassesBySchool(value)
    setClasses(data)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-xs font-bold text-zinc-700">
          Nama Lengkap Siswa
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="fullName"
            name="fullName"
            placeholder="Contoh: Andi Wijaya Tadulako"
            className="pl-10 h-11 text-xs rounded-xl border-zinc-200 focus:border-[#3C22BB] focus:ring-[#3C22BB]"
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-zinc-700">
          Alamat Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="andi@sekolah.sch.id"
            className="pl-10 h-11 text-xs rounded-xl border-zinc-200 focus:border-[#3C22BB] focus:ring-[#3C22BB]"
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-zinc-700">
          Kata Sandi Baru
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 6 karakter"
            className="pl-10 pr-10 h-11 text-xs rounded-xl border-zinc-200 focus:border-[#3C22BB] focus:ring-[#3C22BB]"
            required
            disabled={pending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dropdown Sekolah & Kelas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <Label htmlFor="schoolId" className="text-xs font-bold text-zinc-700 flex items-center gap-1">
            <School className="w-3.5 h-3.5 text-zinc-400" /> Sekolah Asal
          </Label>
          <select
            id="schoolId"
            name="schoolId"
            defaultValue=""
            onChange={(e) => handleSchoolChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 h-11 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
            required
            disabled={pending}
          >
            <option value="" disabled>
              -- Pilih Sekolah --
            </option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="classId" className="text-xs font-bold text-zinc-700 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" /> Rombel / Kelas
          </Label>
          <select
            id="classId"
            name="classId"
            defaultValue=""
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 h-11 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C22BB]"
            required
            disabled={pending}
          >
            <option value="" disabled>
              -- Pilih Kelas --
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-sm shadow-md gap-2"
          disabled={pending}
        >
          <span>{pending ? "Mendaftarkan Akun..." : "Daftar Akun Siswa"}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}

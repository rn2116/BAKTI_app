"use client"
import { useState, useEffect, FormEvent } from "react"
import { toast } from "@/components/ui/use-toast"
import { register } from "@/actions/auth"
import { getSchools, getClassesBySchool } from "@/actions/school"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  id: string
  name: string
}

export default function RegisterForm() {
  const [schools, setSchools] = useState<Option[]>([])
  const [classes, setClasses] = useState<Option[]>([])
  const [pending, setPending] = useState(false)

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

    if (result.error) {
      toast.error(result.error)
    }
  }

  async function handleSchoolChange(value: string) {
    const data = await getClassesBySchool(value)
    setClasses(data)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-input bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                placeholder="Andi Wijaya"
                className="pl-10"
                required
                disabled={pending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="andi@contoh.id"
                className="pl-10"
                required
                disabled={pending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                required
                disabled={pending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolId">Sekolah</Label>
            <select
              id="schoolId"
              name="schoolId"
              defaultValue=""
              onChange={(e) => handleSchoolChange(e.target.value)}
              disabled={pending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Pilih sekolah</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="classId">Kelas</Label>
            <select
              id="classId"
              name="classId"
              disabled={pending || classes.length === 0}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                classes.length === 0 && "opacity-50"
              )}
            >
              <option value="">Pilih kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Pilih sekolah terlebih dahulu untuk melihat kelas.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Mendaftar..." : "Daftar"}
          </Button>
        </div>
      </div>
      <AlertCircle className="w-5 h-5 text-destructive" aria-hidden={true} />
    </form>
  )
}

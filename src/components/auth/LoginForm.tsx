"use client"

import { useState, FormEvent } from "react"
import { toast } from "@/components/ui/use-toast"
import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react"

export default function LoginForm() {
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const formData = new FormData(event.currentTarget)
    const result = await login(null, formData)
    setPending(false)

    if (result && result.error) {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
            placeholder="nama@contoh.id"
            className="pl-10 h-11 text-xs rounded-xl border-zinc-200 focus:border-[#3C22BB] focus:ring-[#3C22BB]"
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-bold text-zinc-700">
            Kata Sandi
          </Label>
        </div>
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

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white font-bold text-sm shadow-md gap-2"
          disabled={pending}
        >
          <span>{pending ? "Memverifikasi Masuk..." : "Masuk ke Akun"}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}

import Link from "next/link"
import LoginForm from "@/components/auth/LoginForm"
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FAFAF8]">
      {/* 1. Panel Visual Desktop Kiri */}
      <AuthVisualPanel />

      {/* 2. Panel Formulir Kanan */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Header Mobile Logo (< lg) */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-zinc-200/80">
          <BrandLogo light={false} />
        </div>

        {/* Form Container */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6 py-8">
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Selamat Datang Kembali! 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Masuk untuk melanjutkan petualangan belajar bahasa, karakter, dan budaya Sulawesi Tengah.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-zinc-500">
            Belum memiliki akun siswa?{" "}
            <Link
              href="/daftar"
              className="font-bold text-[#3C22BB] hover:underline"
            >
              Daftar akun baru sekarang
            </Link>
          </p>
        </div>

        {/* Kredit Resmi di Mobile & Desktop Footer */}
        <div className="pt-6 border-t border-zinc-200/80 flex items-center justify-center gap-2 text-center text-[11px] text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-[#3C22BB] shrink-0" />
          <span>Bakti by Balai Bahasa Provinsi Sulawesi Tengah</span>
        </div>
      </div>
    </div>
  )
}

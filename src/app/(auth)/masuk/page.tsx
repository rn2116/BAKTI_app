import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import LoginForm from "@/components/auth/LoginForm"
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { ShieldCheck, Info } from "lucide-react"

const ROLE_PATH: Record<string, string> = {
  SISWA: "/siswa",
  GURU: "/guru",
  ADMIN: "/admin",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>
}) {
  const { expired } = await searchParams
  const isExpired = expired === "1"

  if (!isExpired) {
    const user = await getCurrentUser()
    if (user && user.isActive) {
      redirect(ROLE_PATH[user.role] ?? "/siswa")
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FAFAF8]">
      {/* 1. Panel Visual Desktop Kiri */}
      <AuthVisualPanel />

      {/* 2. Panel Formulir Kanan */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Header Mobile Logo (< lg) */}
        <div className="lg:hidden flex items-center justify-between pb-5 border-b border-zinc-200/80">
          <BrandLogo light={false} size="sm" />
        </div>

        {/* Form Container */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6 py-8">
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start gap-2.5">
              <img
                src="/images/logo-bbpst-kemendikdasmen.png"
                alt="Logo Kemendikdasmen — Balai Bahasa Provinsi Sulawesi Tengah"
                className="h-12 sm:h-14 w-auto object-contain"
              />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-[#3C22BB] bg-indigo-50 border border-indigo-100">
                BAHASA &amp; KARAKTER
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                Selamat Datang Kembali! 👋
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Masuk untuk melanjutkan petualangan belajar bahasa, karakter, dan budaya Sulawesi Tengah.
              </p>
            </div>
          </div>

          {isExpired && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Sesi login Anda sebelumnya telah berakhir atau tidak lagi valid. Silakan masuk kembali dengan akun Anda.
              </span>
            </div>
          )}

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

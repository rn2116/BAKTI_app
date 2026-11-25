import Link from "next/link"
import RegisterForm from "@/components/auth/RegisterForm"
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { getActiveRegionalLanguages } from "@/services/regionalLanguageService"
import { ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  const languages = await getActiveRegionalLanguages()

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FAFAF8]">
      {/* 1. Panel Visual Desktop Kiri */}
      <AuthVisualPanel />

      {/* 2. Panel Formulir Kanan */}
      <div className="lg:col-span-6 flex flex-col justify-between p-5 sm:p-10 lg:p-12 xl:p-14 min-h-screen">
        {/* Header Mobile Logo (< lg) */}
        <div className="lg:hidden flex items-center justify-between pb-5 border-b border-zinc-200/80">
          <BrandLogo light={false} size="sm" />
        </div>

        {/* Form Container */}
        <div className="my-auto max-w-lg w-full mx-auto space-y-5 py-6">
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start gap-2.5">
              <img
                src="/images/logo-bbpst-kemendikdasmen.png"
                alt="Logo Kemendikdasmen — Balai Bahasa Provinsi Sulawesi Tengah"
                width={1024}
                height={194}
                decoding="async"
                className="h-12 sm:h-14 w-auto object-contain"
              />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-[#3C22BB] bg-indigo-50 border border-indigo-100">
                BAHASA &amp; KARAKTER
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                Pendaftaran Akun BAKTI
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Terbuka bagi masyarakat umum, pelajar, pendidik, serta ahli dan pegiat bahasa daerah di Sulawesi Tengah.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-sm">
            <RegisterForm languages={languages.map((l) => ({ code: l.code, name: l.name }))} />
          </div>

          <p className="text-center text-xs text-zinc-500">
            Sudah memiliki akun?{" "}
            <Link
              href="/masuk"
              className="font-bold text-[#3C22BB] hover:underline"
            >
              Masuk ke akun Anda
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

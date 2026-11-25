"use client"

import { useEffect, useState } from "react"
import { AuthUser } from "@/types"
import { ROLE_LABELS } from "@/lib/constants"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { TopHeaderProgressBar } from "@/components/layout/TopHeaderProgressBar"
import { AllRolesFlowModal } from "@/components/shared/AllRolesFlowModal"
import { Sparkles, Calendar } from "lucide-react"

interface DesktopTopHeaderProps {
  user: AuthUser
}

export function DesktopTopHeader({ user }: DesktopTopHeaderProps) {
  const [dateText, setDateText] = useState("")

  useEffect(() => {
    try {
      const now = new Date()
      setDateText(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
    } catch {
      setDateText("Provinsi Sulawesi Tengah")
    }
  }, [])

  const roleLabel =
    user.role === "SISWA"
      ? "Portal Peserta"
      : user.role === "GURU"
        ? "Portal Pendidik"
        : user.role === "AHLI_BAHASA"
          ? "Portal Ahli Bahasa"
          : "Panel Admin BBPST"

  const roleBadgeStyle =
    user.role === "SISWA"
      ? "bg-indigo-50 text-[#3C22BB] border-indigo-100"
      : user.role === "GURU"
        ? "bg-emerald-50 text-[#059669] border-emerald-100"
        : user.role === "AHLI_BAHASA"
          ? "bg-teal-50 text-[#0F766E] border-teal-200"
          : "bg-purple-50 text-purple-700 border-purple-100"

  return (
    <header className="hidden md:flex h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-8 items-center justify-between shadow-2xs relative">
      {/* Reading Progress Bar di Tepi Paling Bawah Header */}
      <TopHeaderProgressBar />

      {/* Sisi Kiri Top Bar: Badge Portal & Tanggal Format Indonesia */}
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full border text-xs font-bold tracking-tight ${roleBadgeStyle}`}
        >
          {roleLabel}
        </span>
        <span className="text-zinc-300 text-xs font-bold">•</span>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>{dateText || "Provinsi Sulawesi Tengah"}</span>
        </div>
      </div>

      {/* Sisi Kanan Top Bar: Panduan Alur, NotificationBell & Info Pengguna */}
      <div className="flex items-center gap-3">
        <AllRolesFlowModal
          initialRole={user.role}
          currentUserRole={user.role}
          triggerVariant="desktop-header"
          isAuthenticated={true}
        />

        {/* Lonceng Notifikasi */}
        <NotificationBell userId={user.id} />

        <div className="h-5 w-px bg-zinc-200" />

        {/* Profil Mini Pengguna */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3C22BB] to-[#0284C7] text-white flex items-center justify-center text-xs font-black shadow-xs">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-zinc-900 leading-tight">
              {user.fullName}
            </div>
            <div className="text-[10px] text-zinc-500 leading-tight flex items-center gap-1">
              <span>{ROLE_LABELS[user.role] ?? user.role}</span>
              {user.role === "SISWA" && (
                <span className="text-amber-600 font-bold flex items-center gap-0.5">
                  • <Sparkles className="w-2.5 h-2.5 text-amber-500" /> {user.xp} XP
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

"use client"

import { useState } from "react"
import { logout } from "@/actions/auth"
import { AuthUser } from "@/types"
import { LogOut } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { NotificationBell } from "@/components/layout/NotificationBell"

interface MobileTopHeaderProps {
  user: AuthUser
}

export function MobileTopHeader({ user }: MobileTopHeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleConfirmLogout() {
    setIsLoggingOut(true)
    await logout()
  }

  return (
    <>
      <header className="sticky top-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 flex items-center justify-between z-40 md:hidden shadow-xs">
        {/* Sisi Kiri: Logo + Judul */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#3C22BB] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
            BK
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-extrabold text-[#3C22BB] truncate uppercase tracking-tight">
              Bahasa & Karakter
            </div>
            <div className="text-[10px] text-zinc-500 truncate -mt-0.5">
              Prov. Sulawesi Tengah
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Lonceng Notifikasi + Nama Pengguna + Tombol Keluar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Pusat Notifikasi Lonceng */}
          <NotificationBell userId={user.id} />

          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-zinc-800 truncate max-w-[100px]">
              {user.fullName.split(" ")[0]}
            </div>
            <div className="text-[10px] text-zinc-500 capitalize leading-none">
              {user.role.toLowerCase()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors shadow-xs active:bg-red-200 min-h-[36px]"
            title="Keluar dari akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Keluar</span>
          </button>
        </div>
      </header>

      {/* Modal Konfirmasi Keluar Akun */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        variant="warning"
        title="Keluar dari Akun?"
        description="Sesi login Anda akan diakhiri. Anda dapat masuk kembali kapan saja menggunakan email dan kata sandi Anda."
        confirmText="Ya, Keluar Akun"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}

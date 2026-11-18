import { getCurrentUser, AuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DesktopSidebar from "@/components/layout/DesktopSidebar"
import { DesktopTopHeader } from "@/components/layout/DesktopTopHeader"
import { MobileTopHeader } from "@/components/layout/MobileTopHeader"
import MobileBottomNav from "@/components/layout/MobileBottomNav"

export default async function AppShell({
  children,
  user: initialUser,
}: {
  children: React.ReactNode
  user?: AuthUser
}) {
  const user = initialUser ?? (await getCurrentUser())
  if (!user) {
    redirect("/masuk")
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] overflow-x-hidden">
      {/* 1. Desktop Sidebar Fixed (Lebar Baru md:w-72 / 288px) */}
      <DesktopSidebar user={user} />

      {/* 2. Mobile Top Header Sticky (< 768px) dengan Lonceng Notifikasi & Tombol Keluar */}
      <MobileTopHeader user={user} />

      {/* 3. Main Content Area dengan Offset md:pl-72 yang Presisi */}
      <main className="min-h-screen pb-24 md:pb-8 md:pl-72 transition-all duration-200 flex flex-col">
        {/* Desktop Top Header Bar (>= 768px) dengan Lonceng Notifikasi & Tanggal */}
        <DesktopTopHeader user={user} />

        {/* Konten Halaman Aktif */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-12">
          {children}
        </div>
      </main>

      {/* 4. Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav userRole={user.role} />
    </div>
  )
}

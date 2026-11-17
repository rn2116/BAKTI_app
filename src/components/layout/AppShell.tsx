import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DesktopSidebar from "@/components/layout/DesktopSidebar"
import { MobileTopHeader } from "@/components/layout/MobileTopHeader"
import MobileBottomNav from "@/components/layout/MobileBottomNav"

export default async function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/masuk")
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] overflow-x-hidden">
      {/* Desktop Sidebar Fixed */}
      <DesktopSidebar user={user} />

      {/* Mobile Top Header Sticky with visible Logout button */}
      <MobileTopHeader user={user} />

      {/* Main Content Area */}
      <main className="min-h-screen pb-24 md:pb-8 md:pl-64 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav userRole={user.role} />
    </div>
  )
}

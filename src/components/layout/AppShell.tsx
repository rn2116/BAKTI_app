import { getCurrentUser, AuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPendingVerificationCount } from "@/services/admin-guru"
import { getPendingCurationCount } from "@/services/expert"
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
  if (!user || !user.isActive) {
    redirect("/api/auth/clear-session")
  }

  let pendingQuestionCount = 0
  let pendingExpertCount = 0
  let pendingCurationCount = 0
  if (user.role === "ADMIN") {
    try {
      const [qCount, eCount] = await Promise.all([
        getPendingVerificationCount(),
        prisma.masterUser.count({
          where: { role: "AHLI_BAHASA", expertStatus: "PENDING_EXPERT" },
        }),
      ])
      pendingQuestionCount = qCount
      pendingExpertCount = eCount
    } catch {
      pendingQuestionCount = 0
      pendingExpertCount = 0
    }
  } else if (user.role === "AHLI_BAHASA") {
    try {
      pendingCurationCount = await getPendingCurationCount()
    } catch {
      pendingCurationCount = 0
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] overflow-x-hidden">
      {/* 1. Desktop Sidebar Fixed */}
      <DesktopSidebar
        user={user}
        pendingQuestionCount={pendingQuestionCount}
        pendingExpertCount={pendingExpertCount}
        pendingCurationCount={pendingCurationCount}
      />

      {/* 2. Mobile Top Header Sticky (< 768px) */}
      <MobileTopHeader user={user} />

      {/* 3. Main Content Area */}
      <main className="min-h-screen min-w-0 w-full overflow-x-hidden pb-24 md:pb-8 md:pl-72 transition-all duration-200 flex flex-col">
        <DesktopTopHeader user={user} />

        <div className="flex-1 min-w-0 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-12">
          {children}
        </div>
      </main>

      {/* 4. Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav
        userRole={user.role}
        pendingQuestionCount={pendingQuestionCount}
        pendingExpertCount={pendingExpertCount}
        pendingCurationCount={pendingCurationCount}
      />
    </div>
  )
}

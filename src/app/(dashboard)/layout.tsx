import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AppShell from "@/components/layout/AppShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user || !user.isActive) {
    redirect("/api/auth/clear-session")
  }

  return <AppShell user={user}>{children}</AppShell>
}

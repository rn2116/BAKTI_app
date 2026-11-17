import AppShell from "@/components/layout/AppShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}

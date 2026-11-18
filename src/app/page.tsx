import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/masuk")
  }

  if (user.role === "GURU") {
    redirect("/guru")
  }

  if (user.role === "ADMIN") {
    redirect("/admin")
  }

  redirect("/siswa")
}

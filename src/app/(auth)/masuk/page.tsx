import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Masuk"
        description="Selamat datang kembali. Masuk untuk melanjutkan pembelajaran Anda."
      />
      <div className="mx-auto">
        <LoginForm />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/daftar"
          className="text-primary font-medium hover:underline transition-colors"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  )
}

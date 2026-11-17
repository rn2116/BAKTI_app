import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import RegisterForm from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar"
        description="Buat akun siswa baru dan pilih sekolah serta kelas Anda."
      />
      <div className="mx-auto">
        <RegisterForm />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/masuk"
          className="text-primary font-medium hover:underline transition-colors"
        >
          Masuk
        </Link>
      </p>
    </div>
  )
}

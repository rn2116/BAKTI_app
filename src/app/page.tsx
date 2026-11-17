import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-primary mb-4">Bahasa &amp; Karakter</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Platform Pembelajaran Interaktif Bahasa Indonesia, Pendidikan Karakter, dan Budaya Sulawesi Tengah.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/masuk"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  )
}

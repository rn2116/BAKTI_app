import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Bahasa & Karakter — Balai Bahasa Provinsi Sulawesi Tengah",
  description:
    "Platform Pembelajaran Interaktif Bahasa Indonesia, Pendidikan Karakter, dan Kearifan Lokal Sulawesi Tengah",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/tut-wuri-handayani.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/tut-wuri-handayani.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-[#FAFAF8] text-[#18181B] min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  )
}

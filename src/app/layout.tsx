import "./globals.css"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Lora } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Bahasa & Karakter - Balai Bahasa Sulawesi Tengah",
  description:
    "Platform Pembelajaran Interaktif Bahasa Indonesia, Pendidikan Karakter, dan Budaya Sulawesi Tengah",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${lora.variable}`}
    >
      <body
        className="font-sans antialiased bg-[#FAFAF8] text-[#18181B] min-h-screen"
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}

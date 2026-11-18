"use client"

import { usePathname } from "next/navigation"
import { motion, useScroll, useSpring } from "framer-motion"

export function TopHeaderProgressBar() {
  const pathname = usePathname()
  // Hanya aktif di halaman membaca materi: /siswa/materi/[slug]
  const isReadingPage =
    pathname.startsWith("/siswa/materi/") && pathname !== "/siswa/materi"

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  if (!isReadingPage) return null

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#3C22BB] origin-left z-30 pointer-events-none shadow-xs"
      style={{ scaleX }}
    />
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Sparkles, BookOpen, Award, ShieldCheck, ExternalLink } from "lucide-react"
import { AppNotification } from "@/services/notificationService"
import { fetchMyNotifications } from "@/actions/notification"
import { notify } from "@/lib/notify"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface NotificationBellProps {
  userId: string
  initialNotifications?: AppNotification[]
}

function getRelativeTime(dateString: string): string {
  try {
    const now = new Date().getTime()
    const past = new Date(dateString).getTime()
    const diffSec = Math.floor((now - past) / 1000)

    if (diffSec < 60) return "Baru saja"
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} mnt lalu`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} jam lalu`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 7) return `${diffDay} hari lalu`
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })
  } catch {
    return "Baru saja"
  }
}

export function NotificationBell({ userId, initialNotifications = [] }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications)
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Baca timestamp terakhir dibaca dari localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`bk_last_read_notif_${userId}`)
      if (stored) {
        setLastReadTimestamp(parseInt(stored, 10))
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, [userId])

  // Muat notifikasi terbaru jika belum ada
  useEffect(() => {
    if (initialNotifications.length === 0) {
      fetchMyNotifications().then((data) => {
        if (data && data.length > 0) {
          setNotifications(data)
        }
      })
    }
  }, [initialNotifications.length])

  // Tutup panel jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Hitung jumlah belum dibaca
  const unreadCount = notifications.filter(
    (n) => new Date(n.createdAt).getTime() > lastReadTimestamp
  ).length

  function handleMarkAllAsRead() {
    const now = Date.now()
    setLastReadTimestamp(now)
    try {
      localStorage.setItem(`bk_last_read_notif_${userId}`, now.toString())
      notify.info("Semua notifikasi ditandai telah dibaca")
    } catch {
      // Abaikan
    }
  }

  function getNotificationIcon(type: AppNotification["type"]) {
    switch (type) {
      case "badge":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        )
      case "quiz":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        )
      case "material":
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3C22BB] border border-indigo-200/60 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284C7] border border-sky-200/60 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        )
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Tombol Lonceng */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Pusat Notifikasi"
        className="relative p-2 rounded-xl text-zinc-600 hover:text-[#3C22BB] hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3C22BB]/30"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E11D48] text-white text-[9px] font-black leading-none shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-zinc-200/90 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header Popover */}
            <div className="p-3.5 px-4 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#18181B]">Pusat Aktivitas & Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-[#E11D48] text-[10px] font-extrabold">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-[#3C22BB] hover:text-[#2E1994] flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tandai dibaca</span>
                </button>
              )}
            </div>

            {/* Daftar Notifikasi */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 p-1">
              {notifications.map((item) => {
                const isUnread = new Date(item.createdAt).getTime() > lastReadTimestamp

                const ContentWrapper = ({ children }: { children: React.ReactNode }) =>
                  item.link ? (
                    <Link
                      href={item.link}
                      onClick={() => setOpen(false)}
                      className="block p-3 rounded-xl hover:bg-zinc-50 transition-colors"
                    >
                      {children}
                    </Link>
                  ) : (
                    <div className="p-3 rounded-xl">{children}</div>
                  )

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-xl transition-colors ${
                      isUnread ? "bg-indigo-50/30" : ""
                    }`}
                  >
                    <ContentWrapper>
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(item.type)}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-zinc-900 truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                              {getRelativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    </ContentWrapper>
                  </div>
                )
              })}

              {notifications.length === 0 && (
                <div className="py-10 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-zinc-700">Belum Ada Notifikasi</div>
                  <p className="text-[11px] text-zinc-400 max-w-[220px] mx-auto">
                    Aktivitas belajar, perolehan lencana, dan skor kuis kamu akan muncul di sini.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Popover */}
            <div className="p-2.5 px-4 bg-zinc-50/50 border-t border-zinc-100 text-center">
              <span className="text-[10px] text-zinc-400 font-medium">
                BAKTI • Balai Bahasa Provinsi Sulawesi Tengah
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

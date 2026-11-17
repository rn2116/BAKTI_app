import { toast } from "sonner"

/**
 * Helper terpusat untuk menampilkan Toast Notifikasi kustom
 * dengan bahasa Indonesia baku, warna sesuai design.md, dan ikon elegan.
 */
export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3500,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4000,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3500,
    })
  },

  reward: (title: string, points: number, description?: string) => {
    toast(title, {
      description: description ?? `Selamat! Kamu mendapatkan +${points} XP dan poin tambahan.`,
      duration: 5000,
      icon: "✨",
      className: "border-l-4 border-l-[#D97706] bg-amber-50/90 text-amber-950",
    })
  },
}

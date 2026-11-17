"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, HelpCircle, Loader2, LogOut, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type ConfirmVariant = "danger" | "primary" | "warning"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  variant?: ConfirmVariant
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "primary",
  confirmText,
  cancelText = "Batal",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  // Tentukan ikon, teks default, dan styling berdasarkan variant
  const config = {
    danger: {
      icon: <Trash2 className="w-5 h-5 text-[#E11D48]" />,
      iconBg: "bg-rose-50 border-rose-100",
      defaultConfirmText: "Ya, Hapus",
      buttonClass: "bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-xs focus:ring-[#E11D48]",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-[#EA580C]" />,
      iconBg: "bg-amber-50 border-amber-100",
      defaultConfirmText: "Ya, Lanjutkan",
      buttonClass: "bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-xs focus:ring-[#EA580C]",
    },
    primary: {
      icon: <CheckCircle2 className="w-5 h-5 text-[#3C22BB]" />,
      iconBg: "bg-indigo-50 border-indigo-100",
      defaultConfirmText: "Ya, Konfirmasi",
      buttonClass: "bg-[#3C22BB] hover:bg-[#2E1994] text-white shadow-xs focus:ring-[#3C22BB]",
    },
  }[variant]

  async function handleConfirmClick() {
    if (isLoading) return
    await onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="max-w-md p-6 rounded-3xl border border-zinc-200/90 bg-white shadow-2xl gap-0 overflow-hidden sm:rounded-3xl">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${config.iconBg}`}
                >
                  {config.icon}
                </div>
                <div className="space-y-1.5 flex-1 pt-0.5">
                  <DialogTitle className="text-base sm:text-lg font-bold text-[#18181B] leading-snug">
                    {title}
                  </DialogTitle>
                  {description && (
                    <DialogDescription className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      {description}
                    </DialogDescription>
                  )}
                </div>
              </div>

              {/* Tombol Aksi: Touch target min-height 44px (min-h-11) */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => onOpenChange(false)}
                  className="min-h-11 text-xs font-semibold rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 w-full sm:w-auto px-5"
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirmClick}
                  className={`min-h-11 text-xs font-bold rounded-xl transition-all w-full sm:w-auto px-5 gap-2 ${config.buttonClass}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>{confirmText ?? config.defaultConfirmText}</span>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

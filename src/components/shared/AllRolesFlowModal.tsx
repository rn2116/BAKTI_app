"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ROLE_FLOW_LIST,
  type RoleFlowIconName,
} from "@/lib/role-flows"
import type { Role } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Compass,
  Layers,
  Award,
  Building2,
  ClipboardList,
  Mic,
  FileText,
  UserCheck,
  Languages,
  Volume2,
  ShieldCheck,
  Users,
  Settings,
  BarChart3,
  HelpCircle,
  ArrowRight,
  Route,
} from "lucide-react"

const FLOW_ICONS: Record<RoleFlowIconName, React.ElementType> = {
  BookOpen,
  Compass,
  Layers,
  Award,
  Building2,
  ClipboardList,
  Mic,
  FileText,
  UserCheck,
  Languages,
  Volume2,
  ShieldCheck,
  Users,
  Settings,
  BarChart3,
}

interface AllRolesFlowModalProps {
  initialRole?: Role
  triggerVariant?: "auth" | "desktop-header" | "mobile-header"
  isAuthenticated?: boolean
  currentUserRole?: Role
}

export function AllRolesFlowModal({
  initialRole = "SISWA",
  triggerVariant = "auth",
  isAuthenticated = false,
  currentUserRole,
}: AllRolesFlowModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole)

  const activeFlow =
    ROLE_FLOW_LIST.find((item) => item.role === selectedRole) ?? ROLE_FLOW_LIST[0]

  return (
    <>
      {triggerVariant === "mobile-header" ? (
        <button
          type="button"
          onClick={() => {
            setSelectedRole(initialRole)
            setOpen(true)
          }}
          aria-label="Panduan Alur Pengguna"
          title="Panduan Alur"
          className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-[#3C22BB] bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors min-h-10 shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden xs:inline text-[11px]">Alur</span>
        </button>
      ) : triggerVariant === "desktop-header" ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedRole(initialRole)
            setOpen(true)
          }}
          className="min-h-10 rounded-xl border-indigo-200 bg-indigo-50/70 text-[#3C22BB] hover:bg-indigo-100 text-xs font-bold gap-1.5 px-3"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Panduan Alur</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedRole(initialRole)
            setOpen(true)
          }}
          className="min-h-12 w-full sm:w-auto rounded-xl border-indigo-200 bg-white text-[#3C22BB] hover:bg-indigo-50 text-xs font-bold gap-2 px-4 shadow-2xs"
        >
          <Route className="w-4 h-4" />
          <span>Panduan Alur 4 Peran BAKTI</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-7">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge className="bg-indigo-50 text-[#3C22BB] border border-indigo-200 text-[11px] font-bold">
                Ekosistem LMS Bahasa &amp; Karakter
              </Badge>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-black text-[#1E135E] flex items-center gap-2">
              <Route className="w-5 h-5 text-[#3C22BB] shrink-0" />
              <span>Panduan Alur Pengguna Semua Peran BBPST</span>
            </DialogTitle>
            <p className="text-xs text-zinc-500 text-left leading-relaxed">
              Pilih peran di bawah ini untuk melihat alur aktivitas lengkap mulai dari Peserta Umum, Pendidik, Ahli Bahasa Daerah, hingga Administrator BBPST.
            </p>
          </DialogHeader>

          {/* Tab Pilihan 4 Peran */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {ROLE_FLOW_LIST.map((item) => {
              const isActive = item.role === selectedRole
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`min-h-12 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#3C22BB] text-white border-[#3C22BB] shadow-xs"
                      : "bg-[#FAFAF8] text-zinc-700 border-zinc-200 hover:border-[#3C22BB]/50 hover:text-[#3C22BB]"
                  }`}
                >
                  {item.tabLabel}
                </button>
              )
            })}
          </div>

          {/* Detail Alur Peran Terpilih */}
          <motion.div
            key={activeFlow.role}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-4 pt-2"
          >
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-zinc-200/90 space-y-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#065F46]">
                {activeFlow.badgeLabel}
              </div>
              <h3 className="text-base font-black text-[#1E135E]">
                {activeFlow.title}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {activeFlow.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeFlow.steps.map((step) => {
                const StepIcon = FLOW_ICONS[step.icon]
                const targetHref =
                  !isAuthenticated && activeFlow.role === "AHLI_BAHASA" && step.stepNumber === 1
                    ? "/daftar"
                    : step.href

                return (
                  <div
                    key={step.stepNumber}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-white text-xs font-black ${activeFlow.accentBgClass}`}
                        >
                          {step.stepNumber}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50/70 text-[#3C22BB] flex items-center justify-center">
                          <StepIcon className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="text-sm font-extrabold text-zinc-900">
                        {step.title}
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {isAuthenticated && currentUserRole === activeFlow.role ? (
                      <Link
                        href={targetHref}
                        onClick={() => setOpen(false)}
                        className="min-h-12 inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF8] border border-zinc-200 hover:border-[#3C22BB] text-[#3C22BB] text-xs font-bold transition-colors"
                      >
                        <span>{step.ctaLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </Link>
                    ) : null}
                  </div>
                )
              })}
            </div>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-500 text-center sm:text-left">
                  Siap bergabung sebagai Peserta Umum atau Ahli Bahasa Daerah?
                </p>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Link
                    href="/daftar"
                    onClick={() => setOpen(false)}
                    className="min-h-12 flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#3C22BB] hover:bg-[#2E1994] text-white text-xs font-bold"
                  >
                    <span>Daftar Akun Baru</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/masuk"
                    onClick={() => setOpen(false)}
                    className="min-h-12 flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold"
                  >
                    <span>Masuk Portal</span>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}

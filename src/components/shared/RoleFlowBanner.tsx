"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ROLE_FLOW_BY_ROLE, type RoleFlowIconName } from "@/lib/role-flows"
import type { Role } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  ChevronDown,
  ChevronUp,
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

interface RoleFlowBannerProps {
  role: Role
}

export function RoleFlowBanner({ role }: RoleFlowBannerProps) {
  const flow = ROLE_FLOW_BY_ROLE[role]
  const storageKey = `bk_flow_collapsed_${role}`
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved === "true") {
        setIsCollapsed(true)
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia pada peramban
    }
  }, [storageKey])

  function handleToggleCollapse() {
    const nextValue = !isCollapsed
    setIsCollapsed(nextValue)
    try {
      window.localStorage.setItem(storageKey, String(nextValue))
    } catch {
      // Abaikan kegagalan simpan preferensi lokal
    }
  }

  return (
    <Card className="rounded-3xl border-zinc-200/90 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-indigo-50 text-[#3C22BB] border border-indigo-200 hover:bg-indigo-100 font-bold text-[11px] gap-1.5">
              <Route className="w-3.5 h-3.5" />
              <span>Panduan Alur Pengguna</span>
            </Badge>
            <span className="text-[11px] font-semibold text-zinc-500">
              {flow.badgeLabel}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#1E135E] tracking-tight break-words">
            {flow.title}
          </h2>
          {!isCollapsed && (
            <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
              {flow.subtitle}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleToggleCollapse}
          aria-expanded={!isCollapsed}
          className="min-h-12 w-full sm:w-auto rounded-xl border-zinc-200 hover:border-[#3C22BB] hover:text-[#3C22BB] text-xs font-bold gap-2 shrink-0 px-4"
        >
          {isCollapsed ? (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Tampilkan Panduan Alur</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Sembunyikan Panduan</span>
            </>
          )}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="flow-steps"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-4 mt-4 border-t border-zinc-100"
          >
            {flow.steps.map((step) => {
              const StepIcon = FLOW_ICONS[step.icon]
              return (
                <div
                  key={step.stepNumber}
                  className="rounded-2xl border border-zinc-200/90 bg-[#FAFAF8] p-4 flex flex-col justify-between gap-3 hover:border-[#3C22BB]/40 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-white text-xs font-black shadow-2xs ${flow.accentBgClass}`}
                      >
                        {step.stepNumber}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200/80 text-[#1E135E] flex items-center justify-center">
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-extrabold text-[#1E135E] leading-snug break-words">
                      {step.title}
                    </h3>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <Link
                    href={step.href}
                    className={`min-h-12 inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-white border ${flow.accentBorderClass} ${flow.accentTextClass} hover:bg-indigo-50/70 text-xs font-bold transition-colors`}
                  >
                    <span>{step.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

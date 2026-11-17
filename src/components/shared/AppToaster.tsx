"use client"

import { useEffect, useState } from "react"
import { Toaster as SonnerToaster } from "sonner"
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

export function AppToaster() {
  const [position, setPosition] = useState<"top-center" | "bottom-right">("bottom-right")

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setPosition("top-center")
      } else {
        setPosition("bottom-right")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <SonnerToaster
      position={position}
      offset={16}
      gap={8}
      closeButton
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-[#059669]" />,
        error: <AlertCircle className="w-4 h-4 text-[#E11D48]" />,
        warning: <AlertTriangle className="w-4 h-4 text-[#EA580C]" />,
        info: <Info className="w-4 h-4 text-[#3C22BB]" />,
      }}
      toastOptions={{
        className:
          "rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-lg text-xs font-medium text-zinc-900 min-w-[300px]",
        classNames: {
          toast: "group rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-lg flex items-start gap-3",
          title: "text-xs font-bold text-zinc-900 leading-snug",
          description: "text-[11px] text-zinc-500 mt-0.5 leading-relaxed",
          success: "border-l-[5px] border-l-[#059669]",
          error: "border-l-[5px] border-l-[#E11D48]",
          warning: "border-l-[5px] border-l-[#EA580C]",
          info: "border-l-[5px] border-l-[#3C22BB]",
          closeButton:
            "!bg-zinc-100 !border-zinc-200 !text-zinc-500 hover:!text-zinc-900 !rounded-lg !w-5 !h-5 !top-2 !right-2",
        },
      }}
    />
  )
}

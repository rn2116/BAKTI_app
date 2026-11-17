"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Copy, Check } from "lucide-react"
import { notify } from "@/lib/notify"

export function PrintCertificateButton({
  certificateNo,
}: {
  certificateNo?: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!certificateNo) return
    navigator.clipboard.writeText(certificateNo)
    setCopied(true)
    notify.success("Nomor sertifikat berhasil disalin ke papan klip!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        type="button"
        onClick={() => window.print()}
        variant="outline"
        className="flex-1 text-xs gap-1.5 h-9 rounded-xl border-zinc-200 hover:bg-zinc-100"
      >
        <Printer className="w-3.5 h-3.5 text-[#3C22BB]" />
        Cetak PDF
      </Button>
      {certificateNo && (
        <Button
          type="button"
          onClick={handleCopy}
          variant="outline"
          size="icon"
          title="Salin Nomor Sertifikat"
          className="h-9 w-9 rounded-xl border-zinc-200 hover:bg-zinc-100 shrink-0"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </Button>
      )}
    </div>
  )
}

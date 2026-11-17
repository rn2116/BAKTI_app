"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintCertificateButton() {
  return (
    <Button
      onClick={() => window.print()}
      variant="outline"
      className="w-full text-xs gap-2"
    >
      <Printer className="w-3.5 h-3.5" />
      Cetak PDF
    </Button>
  )
}

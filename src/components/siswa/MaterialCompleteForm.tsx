"use client"
import { markMaterialComplete } from "@/actions/material"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface MaterialCompleteFormProps {
  materialId: string
  isDone: boolean
}

export default function MaterialCompleteForm({
  materialId,
  isDone,
}: MaterialCompleteFormProps) {
  const onSubmit = async (formData: FormData) => {
    const result = await markMaterialComplete(null, formData)
    if (result.success) {
      toast.success("Materi ditandai selesai!")
    } else {
      toast.error(result.error ?? "Gagal menyimpan progres")
    }
  }

  if (isDone) return null

  return (
    <form action={onSubmit} className="space-y-3">
      <input type="hidden" name="materialId" value={materialId} />
      <Button type="submit" className="w-full">
        Tandai Materi Selesai
      </Button>
    </form>
  )
}

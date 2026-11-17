"use client"
import { useState, useRef } from "react"
import { submitQuizAttempt } from "@/actions/quiz"
import { ConfettiTrigger } from "@/components/gamification/ConfettiTrigger"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface KuisMulaiFormProps {
  quiz: {
    id: string
    title: string
    description: string | null
    timeLimit: number
    passingScore: number
    questions: Array<{
      id: string
      question: string
      options: string
      points: number
      orderIndex: number
    }>
  }
  userId: string
}

export function KuisMulaiForm({ quiz, userId }: KuisMulaiFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true)
    const result = await submitQuizAttempt(null, formData)
    setIsSubmitting(false)

    if (result.success) {
      setShowConfetti(true)
      toast.success("Kuis selesai! Nilai telah disimpan.")
    } else {
      toast.error(result.error ?? "Gagal menyimpan kuis")
    }
  }

  return (
    <div className="space-y-6">
      <ConfettiTrigger
        trigger={showConfetti}
        onDismiss={() => setShowConfetti(false)}
      />

      <form action={onSubmit} ref={formRef} className="space-y-4 max-w-2xl">
        <input type="hidden" name="quizId" value={quiz.id} />
        <input type="hidden" name="answers" defaultValue="[]" />

        <Card className="flex flex-col gap-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mengerjakan Kuis</CardTitle>
              <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                ⏱ {quiz.timeLimit} menit
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-0 pt-0 space-y-4">
            {quiz.questions.map((q) => {
              const options = JSON.parse(q.options)
              return (
                <Card key={q.id} className="bg-background border-input p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-primary font-bold">{q.orderIndex}</span>
                    <p className="text-lg font-medium leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {options.map((opt: string, i: number) => (
                      <label
                        key={i}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors group"
                        )}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={i}
                          required
                          className="accent-primary h-4 w-4 shrink-0"
                          onChange={() => {
                            if (!formRef.current) return
                            const hidden =
                              formRef.current.querySelector(
                                'input[name="answers"]'
                              )
                            if (!(hidden instanceof HTMLInputElement)) return
                            const current: Array<{
                              questionId: string
                              selectedIndex: number
                            }> = JSON.parse(hidden.value)
                            const existing = current.findIndex(
                              (a) => a.questionId === q.id
                            )
                            const entry = {
                              questionId: q.id,
                              selectedIndex: i,
                            }
                            if (existing >= 0) current[existing] = entry
                            else current.push(entry)
                            hidden.value = JSON.stringify(current)
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              )
            })}
          </CardContent>
          <CardContent className="pt-0 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Cetak
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Selesai & Nilai"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center py-20">
      <CardContent className="pb-0 pt-0 flex flex-col items-center gap-3">
        {icon && <div className="opacity-50">{icon}</div>}
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground max-w-xs">{description}</p>
        )}
      </CardContent>
      {action && <div className="mt-6 w-full">{action}</div>}
    </Card>
  )
}

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18181B] break-words">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 break-words leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

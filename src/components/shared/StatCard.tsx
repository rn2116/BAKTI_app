import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  change?: string
  changePositive?: boolean
}

export function StatCard({
  title,
  value,
  icon,
  change,
  changePositive = true,
}: StatCardProps) {
  return (
    <Card className="p-3.5 sm:p-5 flex flex-col justify-between shadow-xs border-zinc-200">
      <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-xs sm:text-sm font-medium text-zinc-500 truncate">
          {title}
        </CardTitle>
        {icon && <div className="text-zinc-400 shrink-0">{icon}</div>}
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 font-mono">
          {value}
        </div>
        {change && (
          <div
            className={cn(
              "text-[10px] sm:text-xs font-semibold mt-1",
              changePositive ? "text-emerald-700" : "text-red-600"
            )}
          >
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

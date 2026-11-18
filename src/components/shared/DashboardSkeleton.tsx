import { cn } from "@/lib/utils"

interface DashboardSkeletonProps {
  variant?: "dashboard" | "cards" | "table"
  cardCount?: number
  className?: string
}

export function DashboardSkeleton({
  variant = "dashboard",
  cardCount = 6,
  className,
}: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6 animate-pulse select-none", className)}>
      {/* 1. Header Halaman Shimmer */}
      <div className="space-y-2">
        <div className="h-8 w-48 sm:w-64 bg-zinc-200/80 rounded-xl" />
        <div className="h-4 w-72 sm:w-96 bg-zinc-100 rounded-lg" />
      </div>

      {variant === "dashboard" && (
        <>
          {/* Row 4 Kartu Statistik Shimmer */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-zinc-100 rounded" />
                  <div className="w-8 h-8 rounded-xl bg-zinc-100" />
                </div>
                <div className="h-7 w-24 bg-zinc-200 rounded-lg" />
                <div className="h-2 w-32 bg-zinc-100 rounded" />
              </div>
            ))}
          </div>

          {/* Banner / Grafik Shimmer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-64 rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-2xs space-y-4">
              <div className="h-5 w-40 bg-zinc-200 rounded-lg" />
              <div className="h-44 bg-zinc-100/70 rounded-2xl" />
            </div>
            <div className="h-64 rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-2xs space-y-4">
              <div className="h-5 w-32 bg-zinc-200 rounded-lg" />
              <div className="space-y-2.5">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-14 bg-zinc-100/80 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Grid Rekomendasi Materi Shimmer */}
          <div className="space-y-3">
            <div className="h-5 w-44 bg-zinc-200 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((k) => (
                <div
                  key={k}
                  className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-2xs"
                >
                  <div className="h-32 bg-zinc-100" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 w-20 bg-zinc-200 rounded-full" />
                    <div className="h-5 w-full bg-zinc-200 rounded-lg" />
                    <div className="h-3 w-3/4 bg-zinc-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {variant === "cards" && (
        <>
          {/* Filter Bar Shimmer */}
          <div className="h-12 w-full max-w-md bg-white border border-zinc-200/80 rounded-2xl shadow-2xs" />

          {/* Grid Kartu Katalog Shimmer */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: cardCount }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 bg-zinc-100" />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-zinc-200 rounded-full" />
                      <div className="h-3 w-16 bg-zinc-100 rounded" />
                    </div>
                    <div className="h-5 w-4/5 bg-zinc-200 rounded-lg" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full bg-zinc-100 rounded" />
                      <div className="h-3 w-3/4 bg-zinc-100 rounded" />
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="h-10 w-full bg-zinc-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "table" && (
        <>
          {/* Action Header Shimmer */}
          <div className="flex justify-between items-center gap-4">
            <div className="h-10 w-64 bg-white border border-zinc-200/80 rounded-xl" />
            <div className="h-10 w-32 bg-zinc-200 rounded-xl" />
          </div>

          {/* Table Container Shimmer */}
          <div className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-2xs p-4 space-y-3">
            <div className="h-10 bg-zinc-100 rounded-xl" />
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="h-12 bg-zinc-50 rounded-xl flex items-center px-4 justify-between gap-4">
                <div className="h-4 w-1/4 bg-zinc-200 rounded" />
                <div className="h-4 w-1/4 bg-zinc-100 rounded" />
                <div className="h-4 w-1/6 bg-zinc-100 rounded" />
                <div className="h-8 w-16 bg-zinc-200 rounded-lg" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

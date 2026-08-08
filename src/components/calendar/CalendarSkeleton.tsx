import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";

export function CalendarSkeleton() {
  return (
    <div className="pb-32 pt-2 space-y-16 md:space-y-24">
      {/* Hero */}
      <ShimmerSkeleton className="h-[380px] rounded-[40px]" variant="glass" />

      {/* Year overview — 12 months */}
      <div>
        <ShimmerSkeleton className="mb-6 h-6 w-48 rounded-full" variant="line" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-40 rounded-2xl" variant="glass" />
          ))}
        </div>
      </div>

      {/* Monthly grid + daily panel */}
      <div>
        <ShimmerSkeleton className="mb-6 h-6 w-56 rounded-full" variant="line" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6">
            <ShimmerSkeleton className="h-[520px] rounded-2xl" variant="glass" />
            <ShimmerSkeleton className="h-40 rounded-3xl" variant="chart" />
          </div>
          <ShimmerSkeleton className="h-[700px] rounded-2xl" variant="glass" />
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <ShimmerSkeleton className="mb-6 h-6 w-44 rounded-full" variant="line" />
        <ShimmerSkeleton className="h-48 rounded-2xl" variant="glass" />
      </div>

      {/* Bento highlights */}
      <div>
        <ShimmerSkeleton className="mb-6 h-6 w-48 rounded-full" variant="line" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-[210px] rounded-[22px]" variant="glass" />
          ))}
        </div>
      </div>

      {/* Streaks */}
      <div>
        <ShimmerSkeleton className="mb-6 h-6 w-44 rounded-full" variant="line" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-[230px] rounded-2xl" variant="glass" />
          ))}
        </div>
      </div>

      {/* Releases */}
      <div>
        <ShimmerSkeleton className="mb-6 h-6 w-48 rounded-full" variant="line" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-32 rounded-[22px]" variant="glass" />
          ))}
        </div>
      </div>

      {/* Insights */}
      <div>
        <ShimmerSkeleton className="mb-6 h-6 w-44 rounded-full" variant="line" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-20 rounded-xl" variant="glass" />
          ))}
        </div>
      </div>
    </div>
  );
}

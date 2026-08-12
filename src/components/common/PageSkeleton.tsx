import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";

export function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading content"
      aria-busy="true"
      className="pt-2 space-y-8 px-4 md:px-8 max-w-[1600px] mx-auto w-full"
    >
      <ShimmerSkeleton className="h-[40vh] min-h-[300px] rounded-[40px] w-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <ShimmerSkeleton className="aspect-[2/3] w-full rounded-2xl" />
            <ShimmerSkeleton className="h-4 w-3/4 rounded" />
            <ShimmerSkeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

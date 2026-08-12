import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "poster" | "glass" | "line" | "chart";
}
export function ShimmerSkeleton({ className, variant = "glass" }: Props) {
  const reduced = useReducedMotion();
  const base = "relative overflow-hidden bg-foreground/[0.04] ring-1 ring-foreground/5";
  const shapes: Record<NonNullable<Props["variant"]>, string> = {
    poster: "aspect-[2/3] rounded-2xl",
    glass: "rounded-2xl",
    line: "h-3 rounded-full",
    chart: "h-40 rounded-3xl",
  };
  return (
    <div role="status" aria-label="Loading" className={cn(base, shapes[variant], className)}>
      {!reduced && (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / 0.12) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.4s linear infinite",
          }}
        />
      )}
    </div>
  );
}

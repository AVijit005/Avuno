import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0..100
  accent?: string;
  className?: string;
  height?: number;
}

export function PremiumProgress({ value, accent, className, height = 6 }: Props) {
  const reduced = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));
  const fill = accent ?? "var(--primary)";
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative w-full overflow-hidden rounded-full bg-foreground/[0.08]", className)}
      style={{ height }}
    >
      <motion.div
        initial={reduced ? { width: `${v}%` } : { width: 0 }}
        animate={{ width: `${v}%` }}
        transition={
          reduced ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
        }
        className="relative h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, color-mix(in oklab, ${fill} 60%, transparent), ${fill})`,
          boxShadow: `0 0 18px color-mix(in oklab, ${fill} 45%, transparent)`,
        }}
      >
        {/* leading edge glow */}
        <span
          aria-hidden
          className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full blur-[2px]"
          style={{ background: fill, boxShadow: `0 0 12px ${fill}` }}
        />
        {/* animated shine */}
        {!reduced && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              background:
                "linear-gradient(90deg, transparent 30%, oklch(1 0 0 / 0.3) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.6s linear infinite",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

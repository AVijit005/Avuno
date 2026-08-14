import { useReducedMotion } from "motion/react";
import { ParticleField } from "./ParticleField";
import { useTimeOfDay, timeOfDayTint } from "@/lib/useTimeOfDay";
import { cn } from "@/lib/utils";

interface Props {
  accent?: string;
  intensity?: "soft" | "normal" | "vivid";
  showParticles?: boolean;
  showBeams?: boolean;
}

const INTENSITY: Record<NonNullable<Props["intensity"]>, { op: number; blur: number }> = {
  soft: { op: 0.05, blur: 90 },
  normal: { op: 0.08, blur: 80 },
  vivid: { op: 0.12, blur: 70 },
};

/**
 * Animated iris aurora — layered, drifting radial blooms in the brand indigo
 * → cyan → magenta palette. Drift is a CSS keyframe (aurora-drift) so it is
 * automatically disabled by the global prefers-reduced-motion kill-switch.
 */
export function AtmosphereBackground({
  accent,
  intensity = "normal",
  showParticles = true,
  showBeams = true,
}: Props) {
  const reduced = useReducedMotion();
  const timeOfDay = useTimeOfDay();
  const tintColor = timeOfDayTint[timeOfDay];
  const cfg = INTENSITY[intensity];

  const blooms = [
    {
      className: "aurora-bloom-1",
      color: accent ?? "oklch(0.6 0.15 270)",
      style: {
        top: "-20%",
        left: "-10%",
        width: "52vw",
        height: "52vw",
        opacity: cfg.op,
      } as const,
    },
    {
      className: "aurora-bloom-2",
      color: "oklch(0.65 0.15 240)",
      style: {
        top: "-12%",
        right: "-12%",
        width: "44vw",
        height: "44vw",
        opacity: cfg.op * 0.8,
      } as const,
    },
    {
      className: "aurora-bloom-3",
      color: "oklch(0.6 0.14 320)",
      style: {
        bottom: "-25%",
        left: "20%",
        width: "48vw",
        height: "48vw",
        opacity: cfg.op * 0.7,
      } as const,
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {blooms.map((b) => (
        <div
          key={b.className}
          className={cn(
            "absolute rounded-full mix-blend-screen",
            !reduced && "animate-aurora-drift",
          )}
          style={{
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter: `blur(${cfg.blur}px)`,
            ...b.style,
          }}
        />
      ))}

      {showBeams && (
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            background: `linear-gradient(135deg, transparent, ${tintColor}, transparent)`,
          }}
          aria-hidden="true"
        />
      )}

      {showParticles && <ParticleField className="absolute inset-0 h-full w-full" />}
    </div>
  );
}

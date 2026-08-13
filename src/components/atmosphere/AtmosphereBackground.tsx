import { useReducedMotion } from "motion/react";
import { ParticleField } from "./ParticleField";
import { useTimeOfDay, timeOfDayTint } from "@/lib/useTimeOfDay";
import { useTheme } from "@/hooks/use-theme";

interface Props {
  accent?: string;
  intensity?: "soft" | "normal" | "vivid";
  showParticles?: boolean;
  showBeams?: boolean;
}

export function AtmosphereBackground({
  accent,
  intensity = "normal",
  showParticles = true,
  showBeams = true,
}: Props) {
  const reduced = useReducedMotion();
  const { isLight } = useTheme();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* Subtle top-left atmosphere (Indigo/Violet) */}
      <div
        className="absolute -top-[20%] -left-[10%] h-[50vw] w-[50vw] rounded-full mix-blend-screen opacity-[0.03] dark:opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.15 270) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      
      {/* Subtle top-right atmosphere (Cyan/Blue) */}
      <div
        className="absolute -top-[10%] -right-[10%] h-[40vw] w-[40vw] rounded-full mix-blend-screen opacity-[0.02] dark:opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.15 240) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}

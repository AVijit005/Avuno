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
  return null;
}

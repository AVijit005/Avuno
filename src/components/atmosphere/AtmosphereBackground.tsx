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
  const { isLight } = useTheme();

  const opacity = isLight
    ? intensity === "soft"
      ? 0.2
      : intensity === "vivid"
        ? 0.4
        : 0.3
    : intensity === "soft"
      ? 0.35
      : intensity === "vivid"
        ? 0.7
        : 0.5;
  const tod = useTimeOfDay();
  const tint = accent ?? timeOfDayTint[tod];
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* deep gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(125% 80% at 50% -10%, oklch(0.96 0.02 270) 0%, oklch(0.98 0.01 270) 55%, oklch(1 0 270) 100%)"
            : "radial-gradient(125% 80% at 50% -10%, oklch(0.22 0.04 270) 0%, oklch(0.14 0.012 270) 55%, oklch(0.09 0.01 270) 100%)",
        }}
      />

      <style>{`
        @keyframes mood-wash {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.28; }
        }
        @keyframes aurora-1 {
          0%, 100% { translate: 0px 0px; scale: 1; }
          33% { translate: 60px -30px; scale: 1.08; }
          66% { translate: -40px 40px; scale: 0.95; }
        }
        @keyframes aurora-2 {
          0%, 100% { translate: 0px 0px; scale: 1; }
          33% { translate: -50px 40px; scale: 0.92; }
          66% { translate: 30px -20px; scale: 1.07; }
        }
        @keyframes aurora-3 {
          0%, 100% { translate: 0px 0px; }
          33% { translate: 40px -20px; }
          66% { translate: -30px 30px; }
        }
        @keyframes beam-1 {
          0%, 100% { translate: 0px 0px; opacity: 0.4; }
          33% { translate: 40px 0px; opacity: 0.7; }
          66% { translate: -20px 0px; opacity: 0.4; }
        }
        @keyframes beam-2 {
          0%, 100% { translate: 0px 0px; opacity: 0.3; }
          33% { translate: -30px 0px; opacity: 0.6; }
          66% { translate: 20px 0px; opacity: 0.3; }
        }
      `}</style>

      {/* time-of-day mood wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(80% 60% at 50% 0%, ${tint} 0%, transparent 60%)`,
          opacity: 0.22,
          animation: reduced ? "none" : "mood-wash 30s ease-in-out infinite",
        }}
      />

      {/* aurora blobs */}
      <div
        className="absolute -top-1/4 -left-1/4 h-[80vh] w-[80vh] rounded-full blur-3xl"
        style={{
          background: tint,
          opacity: opacity * 0.55,
          animation: reduced ? "none" : "aurora-1 38s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{
          background: "var(--aurora-2)",
          opacity: opacity * 0.5,
          animation: reduced ? "none" : "aurora-2 44s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-1/4 left-1/3 h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{
          background: "var(--aurora-3)",
          opacity: opacity * 0.4,
          animation: reduced ? "none" : "aurora-3 50s ease-in-out infinite",
        }}
      />

      {/* cinematic light beams */}
      {showBeams && (
        <>
          <div
            className="absolute -top-40 left-1/4 h-[120vh] w-[40vh] rotate-12 rounded-full blur-3xl"
            style={{
              background: "linear-gradient(180deg, oklch(0.85 0.12 250 / 0.18), transparent 70%)",
              animation: reduced ? "none" : "beam-1 26s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-40 right-1/4 h-[100vh] w-[35vh] -rotate-12 rounded-full blur-3xl"
            style={{
              background: "linear-gradient(0deg, oklch(0.7 0.18 310 / 0.14), transparent 70%)",
              animation: reduced ? "none" : "beam-2 32s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* particles */}
      {showParticles && (
        <div className="absolute inset-0 opacity-60">
          <ParticleField count={tod === "night" ? 50 : 28} />
        </div>
      )}

      {/* noise */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(120% 80% at 50% 110%, oklch(0 0 0 / 0.1), transparent 55%)"
            : "radial-gradient(120% 80% at 50% 110%, oklch(0 0 0 / 0.6), transparent 55%)",
        }}
      />
    </div>
  );
}

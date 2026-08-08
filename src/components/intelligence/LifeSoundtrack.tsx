import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Headphones } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  topAlbum?: string;
  artist?: string;
  hoursPlayed?: number;
}

// Deterministic pseudo-random based on index (seedable)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function LifeSoundtrack({
  topAlbum = "Interstellar (Original Motion Picture Soundtrack)",
  artist = "Hans Zimmer",
  hoursPlayed = 42,
}: Props) {
  const reduced = useReducedMotion();
  // Generate deterministic random heights for the waveform — stable across renders
  const bars = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        height: 20 + seededRandom(i) * 80,
        delay: seededRandom(i + 100) * 1.5,
        duration: 0.8 + seededRandom(i + 200) * 0.8,
      })),
    [],
  );

  return (
    <PremiumGlass className="p-6 relative overflow-hidden group">
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.72_0.18_255)]/20 text-[oklch(0.72_0.18_255)]">
            <Headphones size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl tracking-tight">Life Soundtrack</h3>
            <p className="text-xs text-muted-foreground">The score to your recent memories</p>
          </div>
        </div>

        <div className="mt-8 mb-4 h-24 flex items-end justify-between gap-1 w-full px-2">
          {bars.map((bar) => (
            <motion.div
              key={bar.id}
              className="w-full bg-[oklch(0.72_0.18_255)]/40 rounded-t-sm"
              initial={{ height: "10%" }}
              animate={{ height: `${bar.height}%` }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: bar.duration,
                      delay: bar.delay,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }
              }
              style={{
                // Make the center bars taller on average
                maxHeight: `${Math.sin((bar.id / 40) * Math.PI) * 100 + 20}%`,
              }}
            />
          ))}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm font-medium">{topAlbum}</p>
            <p className="text-xs text-muted-foreground">{artist}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[oklch(0.72_0.18_255)] font-medium">Top Album</span>
            <p className="text-xs text-muted-foreground">{hoursPlayed} hours played</p>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[oklch(0.72_0.18_255)]/5 blur-3xl rounded-full" />
    </PremiumGlass>
  );
}

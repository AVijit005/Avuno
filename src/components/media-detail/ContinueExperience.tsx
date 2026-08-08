import { motion } from "motion/react";
import { Play, RefreshCw } from "lucide-react";
import type { UIMediaItem } from "@/lib/adapters/types";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { PremiumProgress } from "@/components/ui/PremiumProgress";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

const CONTINUE_LABEL: Record<string, string> = {
  movie: "Continue Watching",
  series: "Continue Watching",
  anime: "Continue Watching",
  book: "Continue Reading",
  manga: "Continue Reading",
  game: "Continue Playing",
  music: "Continue Listening",
  podcast: "Continue Listening",
  course: "Continue Learning",
  youtube: "Continue Watching",
};

export function ContinueExperience({ item }: { item: UIMediaItem }) {
  const continueLabel = CONTINUE_LABEL[item.kind] ?? "Continue";
  const accent = item.accent ?? "var(--primary)";
  const { openProgress } = useMediaActions();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative overflow-hidden rounded-3xl p-6 md:p-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {continueLabel}
          </div>
          <h3 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{item.title}</h3>
          <div className="mt-1 text-sm text-muted-foreground">
            {item.progressLabel ?? `${item.progress ?? 0}% complete`}
          </div>
          <div className="mt-5">
            <PremiumProgress value={item.progress ?? 0} accent={accent} />
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              <span>{item.progress ?? 0}%</span>
              <span>{item.runtime ?? ""}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 md:flex-row">
          <PremiumButton
            variant="primary"
            icon={<Play className="h-4 w-4 fill-black" />}
            onClick={() => openProgress(item.id)}
          >
            Continue
          </PremiumButton>
          <PremiumButton
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => openProgress(item.id)}
          >
            Update progress
          </PremiumButton>
        </div>
      </div>
    </motion.div>
  );
}

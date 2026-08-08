import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Play, NotebookPen, Clock, ChevronRight } from "lucide-react";

import { PremiumButton } from "@/components/ui/PremiumButton";
import { useDashboard } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { dur, ease } from "@/lib/motion";

export function ContinueJourneyHero({ className }: { className?: string }) {
  const { data: dashboard } = useDashboard();
  const j = dashboard?.continueWatching?.[0];
  if (!j) return null;
  const remaining = Math.max(0, 100 - (j.progressPercentage ?? 0));
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Continue your journey"
      className={cn("relative", className)}
    >
      <PremiumGlass variant="strong" className="hover-lift overflow-hidden">
        <div className="relative grid gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[280px]">
            <img src={j.posterUrl ?? ""} alt={j.title} className="h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, oklch(0.1 0.02 270 / 0.6))",
              }}
            />
          </div>
          <div className="relative p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-primary/85">
              Continue your journey
            </div>
            <h2 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{j.title}</h2>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Continue where you left off.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground md:grid-cols-3">
              <Meta k="Progress" v={`${j.progressPercentage ?? 0}%`} />
              <Meta k="Remaining" v={`${remaining}%`} />
            </div>

            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${j.progressPercentage ?? 0}%` }}
                transition={{ duration: dur.large, ease: ease.reveal, delay: 0.2 }}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <PremiumButton variant="primary" icon={<Play className="h-4 w-4" />} asChild>
                <Link to="/app/media/$id" params={{ id: j.mediaId }}>
                  Continue
                </Link>
              </PremiumButton>
              <PremiumButton
                variant="ghost"
                size="sm"
                icon={<NotebookPen className="h-3.5 w-3.5" />}
                asChild
              >
                <Link to="/app/journal">Journal</Link>
              </PremiumButton>
              <PremiumButton
                variant="ghost"
                size="sm"
                icon={<Clock className="h-3.5 w-3.5" />}
                asChild
              >
                <Link to="/app/timeline">Timeline</Link>
              </PremiumButton>
              <Link
                to="/app/media/$id"
                params={{ id: j.mediaId }}
                className="story-link ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Open <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </PremiumGlass>
    </motion.section>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">{k}</div>
      <div className="mt-0.5 text-foreground">{v}</div>
    </div>
  );
}

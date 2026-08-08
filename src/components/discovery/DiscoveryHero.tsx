import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles, BookmarkPlus, NotebookPen } from "lucide-react";

import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  recommendedToday?: {
    mediaId: string;
    mediaTitle: string;
    mediaSlug: string;
    mediaType: string;
    posterUrl: string | null;
    accent: string | null;
    reason: string;
    confidence: number;
    discoveryTags: string[];
    year: number;
    rating: number | null;
    genres: string[];
  } | null;
}

const secondaryBtnClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white/[0.03] text-xs text-muted-foreground ring-1 ring-white/10 backdrop-blur-xl transition-all duration-300 ease-out press-scale hover:-translate-y-[2px] hover:bg-white/[0.08] hover:text-foreground hover:ring-white/20 hover:shadow-[0_8px_16px_-4px_oklch(0_0_0/0.5),0_0_16px_oklch(1_1_1/0.1)]";

export function DiscoveryHero({ className, recommendedToday: rec }: Props) {
  if (!rec) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      aria-label="Today's recommendation"
      className={cn("relative", className)}
    >
      <PremiumGlass variant="strong" glow={rec.accent ?? undefined} className="overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr] md:gap-8 md:p-8">
          <Link to="/app/media/$id" params={{ id: rec.mediaId }} className="block">
            <img
              src={rec.posterUrl ?? ""}
              alt={rec.mediaTitle}
              className="h-[340px] w-full rounded-2xl object-cover ring-1 ring-white/10 shadow-2xl"
            />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-primary/80">
              <Sparkles className="h-3 w-3" /> Today's pick
            </div>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              {rec.mediaTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{rec.reason}</p>
            {rec.genres?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {rec.genres.map((g) => (
                  <span
                    key={g}
                    className="glass-subtle rounded-full px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              <Link to="/app/media/$id" params={{ id: rec.mediaId }}>
                <PremiumButton>See details</PremiumButton>
              </Link>
              <button className={secondaryBtnClass}>
                <BookmarkPlus className="h-3 w-3" /> Save
              </button>
              <button className={secondaryBtnClass}>
                <NotebookPen className="h-3 w-3" /> Journal
              </button>
            </div>
          </div>
        </div>
      </PremiumGlass>
    </motion.section>
  );
}

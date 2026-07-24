import { motion } from "motion/react";
import { ArrowUpRight, BookHeart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { EmptyState } from "@/components/ui/EmptyState";
import { MemoryChip } from "./MemoryChip";
import { MemoryBadges } from "./MemoryBadges";
import { getMemory } from "@/lib/memory";
import { t } from "@/lib/motion";

interface Props {
  mediaId: string;
  className?: string;
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MemorySummary({ mediaId, className }: Props) {
  const memory = getMemory(mediaId);
  if (!memory) {
    return (
      <EmptyState
        icon={<BookHeart className="h-6 w-6" />}
        title="Add your first memory."
        description="A line, a moment, a feeling — Chronicle remembers what your library cannot."
        hint="Memories are optional, never required."
        className={className}
      />
    );
  }
  return (
    <PremiumGlass variant="strong" className={className}>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={t.large}
        className="p-6 md:p-8"
        aria-label="Memory summary"
      >
        <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">A memory</div>
        <h3 className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
          {memory.memoryTitle}
        </h3>
        <p className="mt-3 max-w-2xl font-display text-lg italic leading-snug text-foreground/85">
          "{memory.memoryExcerpt}"
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          <MemoryChip variant="mood" label={memory.mood} />
          <MemoryChip variant="season" label={memory.season} />
          <MemoryChip variant="companion" label={memory.companion} />
        </div>
        <MemoryBadges badges={memory.badges} className="mt-3" max={3} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px]">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                First experienced
              </dt>
              <dd className="mt-0.5 text-foreground/80">{fmt(memory.firstExperiencedAt)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                Finished
              </dt>
              <dd className="mt-0.5 text-foreground/80">{fmt(memory.finishedAt)}</dd>
            </div>
          </dl>
          <Link
            to="/app/media/$id"
            params={{ id: mediaId }}
            className="inline-flex items-center gap-1.5 text-xs text-primary/90 hover:text-primary"
          >
            View memory <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.section>
    </PremiumGlass>
  );
}

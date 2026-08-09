import { motion } from "motion/react";
import { Star, CalendarDays, Sparkles, MapPin } from "lucide-react";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useMemories } from "@/hooks/use-journal";
import { adaptMemory } from "@/lib/adapters/journal";

export function PersonalMemory({ item }: { item: UIMediaItem }) {
  const accent = item.accent ?? "var(--primary)";
  const { data: memoriesData, isLoading } = useMemories({ limit: 1 });
  // The endpoint returns `{ items, ... }`. Reading `.data` produced
  // [undefined], which adaptMemory then dereferenced — crashing this component
  // on every media detail page.
  const memories = memoriesData?.pages.flatMap((p) => p.items).map(adaptMemory) ?? [];
  const latestMemory = memories[0];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
        <div className="hidden h-64 w-44 animate-pulse rounded-2xl bg-white/5 md:block" />
        <div className="glass rounded-3xl p-7 md:p-9">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-6 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-4 space-y-2">
            <div className="h-5 w-full animate-pulse rounded bg-white/5" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]"
    >
      <div className="relative hidden h-64 w-44 overflow-hidden rounded-2xl ring-1 ring-white/10 md:block">
        <img src={item.poster} alt="" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 60%, oklch(0 0 0 / 0.7))" }}
        />
      </div>
      <div className="glass relative overflow-hidden rounded-3xl p-7 md:p-9">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ background: accent }}
        />
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {latestMemory ? "Your memory" : "Your memory"}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />{" "}
            {latestMemory?.memoryDate
              ? new Date(latestMemory.memoryDate).toLocaleDateString()
              : item.lastInteractionAt
                ? new Date(item.lastInteractionAt).toLocaleDateString()
                : "No date recorded"}
          </span>
          {latestMemory?.emotion && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> {latestMemory.emotion}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5" /> {item.rating ? `${item.rating}/5` : "Not rated"}
          </span>
        </div>
        <h3 className="mt-3 font-display text-2xl tracking-tight">
          {latestMemory?.title || item.title}
        </h3>
        <p className="mt-3 font-display text-lg leading-snug text-foreground/85">
          {latestMemory?.description || item.synopsis || (
            <span className="inline-flex items-center gap-2 text-base text-muted-foreground">
              <Sparkles className="h-4 w-4 opacity-60" /> No memory recorded yet — this space is
              waiting for your words.
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

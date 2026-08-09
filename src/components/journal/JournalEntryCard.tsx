import { motion } from "motion/react";
import { Heart, Clock } from "lucide-react";
import { DropCap } from "@/components/editorial/DropCap";
import { cascade } from "@/lib/motion";
import { countWords } from "@/lib/utils/words";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIJournalEntry } from "@/lib/adapters/types";

interface Props {
  entry: UIJournalEntry;
  index: number;
}

export function JournalEntryCard({ entry, index }: Props) {
  return (
    <PremiumGlass
      interactive
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={cascade(index, 0.05)}
      className="group relative overflow-hidden rounded-3xl p-6"
      style={{ viewTransitionName: `journal-card-${entry.id}` } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-50 transition group-hover:opacity-80"
        style={{ background: "oklch(0.7 0.18 35)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {new Date(entry.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            · {entry.mood ?? "Neutral"}
          </div>
        </div>
        <h3 className="mt-3 font-display text-2xl tracking-tight">
          {entry.title || "Untitled Entry"}
        </h3>
        {index === 0 ? (
          <div className="mt-3">
            <DropCap tone="warm">{entry.content}</DropCap>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-foreground/85 line-clamp-3">
            {entry.content}
          </p>
        )}
        <div className="mt-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {Math.max(1, Math.round(countWords(entry.content) / 200))}{" "}
            min
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> Saved
          </span>
        </div>
      </div>
    </PremiumGlass>
  );
}

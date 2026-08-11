import { motion } from "motion/react";
import { Clock, Lock, Globe } from "lucide-react";
import { DropCap } from "@/components/editorial/DropCap";
import { cascade } from "@/lib/motion";
import { countWords } from "@/lib/utils/words";
import type { UIJournalEntry } from "@/lib/adapters/types";

interface Props {
  entry: UIJournalEntry;
  index: number;
}

export function JournalEntryCard({ entry, index }: Props) {
  const wordCount = countWords(entry.content);
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={cascade(index, 0.05)}
      className="group relative overflow-hidden rounded-[32px] p-6 md:p-8 bg-surface-1 border border-border/40 shadow-sm transition-colors hover:bg-surface-2"
      style={{ viewTransitionName: `journal-card-${entry.id}` } as React.CSSProperties}
    >
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-2">
            <span>
              {new Date(entry.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {entry.mood && <span>· {entry.mood}</span>}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]">
            {entry.isPrivate ? (
              <span
                className="flex items-center gap-1.5 text-muted-foreground"
                title="For your eyes only"
              >
                <Lock className="h-3 w-3" />
                <span className="hidden sm:inline">Private</span>
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 text-foreground/70"
                title="Visible on your profile"
              >
                <Globe className="h-3 w-3" />
                <span className="hidden sm:inline">Public</span>
              </span>
            )}
          </div>
        </div>

        {entry.title && (
          <h3 className="mt-4 font-display text-2xl tracking-tight text-foreground">
            {entry.title}
          </h3>
        )}

        {index === 0 ? (
          <div className="mt-4">
            <DropCap tone="warm">{entry.content}</DropCap>
          </div>
        ) : (
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/85 line-clamp-4">
            {entry.content}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> {readingTime} min read
          </span>
          <span className="flex items-center gap-1.5">{wordCount} words</span>
          {/* Phase 4C-3: Preserve as Memory action will go here */}
        </div>
      </div>
    </motion.div>
  );
}

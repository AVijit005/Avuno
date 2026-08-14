import { useReducedMotion, motion } from "motion/react";
import { Clock, Lock, Globe } from "lucide-react";
import { DropCap } from "@/components/editorial/DropCap";
import { cascade } from "@/lib/motion";
import { countWords } from "@/lib/utils/words";
import type { UIJournalEntry } from "@/lib/adapters/types";

interface Props {
  entry: UIJournalEntry;
  index: number;
}

const MOOD_COLORS: Record<string, string> = {
  Happy: "bg-rose-400",
  Inspired: "bg-amber-400",
  Emotional: "bg-indigo-400",
  Excited: "bg-orange-400",
  Relaxed: "bg-emerald-400",
  Thoughtful: "bg-blue-400",
};

export function JournalEntryCard({ entry, index }: Props) {
  const wordCount = countWords(entry.content);
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const reduced = useReducedMotion();
  const moodColor = entry.mood ? MOOD_COLORS[entry.mood] || "bg-primary" : "bg-primary";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index >= 0 ? index * 0.05 : 0 }}
      className="group relative overflow-hidden rounded-2xl glass p-6 card-interactive border border-foreground/[0.08] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-elevated"
      style={{ viewTransitionName: `journal-card-${entry.id}` } as React.CSSProperties}
    >
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-eyebrow flex items-center gap-2">
            <span>
              {new Date(entry.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {entry.mood && (
              <span className="flex items-center gap-1.5">
                <span>·</span>
                <span className={`h-1.5 w-1.5 rounded-full ${moodColor}`} aria-hidden="true" />
                {entry.mood}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-eyebrow">
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
          <h3 className="mt-4 font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {entry.title}
          </h3>
        )}

        {index === 0 ? (
          <div className="mt-4 text-sm leading-relaxed text-foreground/80">
            <DropCap tone="warm">{entry.content}</DropCap>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-foreground/80 line-clamp-4">
            {entry.content}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4 text-eyebrow">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> {readingTime} min read
          </span>
          <span className="flex items-center gap-1.5">{wordCount} words</span>
        </div>
      </div>
    </motion.div>
  );
}

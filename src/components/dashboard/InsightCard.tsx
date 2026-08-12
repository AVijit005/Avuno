import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { useIntelligence } from "@/hooks/use-analytics";

/**
 * Rotating insight, derived from the user's own library.
 *
 * This previously cycled three hardcoded sentences — "You've watched more
 * sci-fi this month than the past year combined", and similar — presented
 * under an "Insight" label as though computed from the user's data. They were
 * shown identically to every user, including one who had just signed up.
 *
 * Each statement now comes from /analytics/intelligence, which only emits one
 * when the underlying count actually supports it. When there is nothing true
 * to say, this renders nothing.
 */
export function InsightCard() {
  const { data } = useIntelligence();
  const statements = data?.personalStatements ?? [];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (statements.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % statements.length), 6000);
    return () => clearInterval(id);
  }, [statements.length]);

  useEffect(() => {
    // Keep the index valid if the list shrinks between fetches.
    if (i >= statements.length) setI(0);
  }, [i, statements.length]);

  if (statements.length === 0) return null;

  const current = statements[Math.min(i, statements.length - 1)];

  return (
    <div className="glass-elevated relative overflow-hidden rounded-3xl p-6">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-secondary/25 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
          <Lightbulb className="h-5 w-5 text-amber-200" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary/85">Insight</div>
          <AnimatePresence mode="wait">
            <motion.p
              key={current.statement}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1.5 font-display text-2xl leading-snug md:text-3xl"
            >
              {current.statement}
            </motion.p>
          </AnimatePresence>
          {/* Show what the claim is based on, so it is checkable. */}
          {current.evidence && (
            <p className="mt-2 text-[11px] text-muted-foreground">{current.evidence}</p>
          )}
        </div>
      </div>
    </div>
  );
}

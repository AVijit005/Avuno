// Live user-saved quotes rail.
import { motion } from "motion/react";
import { Quote, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { useUserQuotes } from "@/lib/store/liveSelectors";
import { useLibraryStore } from "@/lib/store/libraryStore";

export function YourQuotesRail({
  limit = 12,
  title = "Your saved quotes",
  eyebrow = "Lines you kept",
}: {
  limit?: number;
  title?: string;
  eyebrow?: string;
}) {
  const quotes = useUserQuotes();
  const removeUserQuote = useLibraryStore((s) => s.removeUserQuote);
  const shown = quotes.slice(0, limit);

  if (shown.length === 0) {
    return (
      <PremiumGlass variant="subtle" className="p-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </div>
        <div className="mt-2 font-display text-2xl tracking-tight">No quotes yet</div>
        <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground">
          Catch a line that stops you. From any media page, tap{" "}
          <span className="text-foreground">More → Save a quote</span>.
        </p>
      </PremiumGlass>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </div>
          <h3 className="font-display text-2xl tracking-tight">{title}</h3>
        </div>
        <div className="text-xs text-muted-foreground">{quotes.length} saved</div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {shown.map((q, i) => (
          <motion.figure
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="glass group relative overflow-hidden rounded-3xl p-6"
          >
            <div className="relative">
              <Quote className="h-4 w-4 text-primary/70" />
              <blockquote className="mt-2 font-display text-xl tracking-tight leading-snug text-foreground/95">
                "{q.text}"
              </blockquote>
              <figcaption className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>
                  {q.refId && q.refTitle ? (
                    <Link
                      to="/app/media/$id"
                      params={{ id: q.refId }}
                      className="story-link hover:text-foreground"
                    >
                      {q.refTitle}
                    </Link>
                  ) : (
                    (q.refTitle ?? "Personal")
                  )}
                </span>
                <button
                  onClick={() => removeUserQuote(q.id)}
                  aria-label="Remove quote"
                  className="press-scale grid h-6 w-6 place-items-center rounded-full bg-white/[0.04] text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </figcaption>
            </div>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}

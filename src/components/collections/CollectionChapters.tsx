import type { Collection } from "@/lib/types";

const CHAPTERS = [
  "The Beginning",
  "Discoveries",
  "Peak Era",
  "Favorites",
  "Modern Additions",
  "Future Plans",
];

export function CollectionChapters({ collection: _c }: { collection: Collection }) {
  return (
    <section aria-label="Chapters" className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Chapters</div>
      <ol className="grid gap-2 md:grid-cols-3">
        {CHAPTERS.map((c, i) => (
          <li key={c} className="glass flex items-center gap-3 rounded-2xl p-4 ring-1 ring-white/5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-[10px] tabular-nums text-muted-foreground">
              {i + 1}
            </div>
            <div className="font-display text-base tracking-tight">{c}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

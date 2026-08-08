import { PremiumGlass } from "@/components/ui/PremiumGlass";

import { getMemory } from "@/lib/memory";
import type { MediaItem } from "@/lib/types";

export function MemoryLayer({ item }: { item: MediaItem }) {
  const m = getMemory(item.id);
  if (!m) return null;
  const notes = [
    `"${m.memoryExcerpt}"`,
    `"${m.favoriteMoment}"`,
    `Watched while feeling ${m.mood.toLowerCase()}, in ${m.location}.`,
  ];
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {notes.map((n, i) => (
        <li key={i}>
          <PremiumGlass variant="subtle">
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
                {m.season} · {m.weather} · {m.companion}
              </div>
              <p className="mt-2 font-display text-lg leading-snug tracking-tight">{n}</p>
            </div>
          </PremiumGlass>
        </li>
      ))}
    </ul>
  );
}

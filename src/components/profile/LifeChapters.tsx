import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Link } from "@tanstack/react-router";

import { getLifeChapters } from "@/lib/lifeChapters";
import { useLibrary } from "@/hooks/use-library";
import { adaptLibraryItem } from "@/lib/adapters/media";

function stableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function LifeChapters() {
  const chapters = getLifeChapters();
  const { data: libraryData } = useLibrary();

  const libraryItems = libraryData?.pages.flatMap((p) => p.data).map(adaptLibraryItem) || [];

  return (
    <PremiumGlass variant="subtle">
      <div className="p-5 md:p-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Life chapters
        </div>
        <h3 className="mt-1 font-display text-2xl tracking-tight">Eras of your story</h3>
        <ol className="mt-5 space-y-4">
          {chapters.map((c) => (
            <li
              key={c.id}
              className="relative grid grid-cols-[100px_minmax(0,1fr)] gap-4 border-l-2 pl-4"
              style={{ borderColor: c.accent.replace(")", " / 0.5)") }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {c.era}
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg tracking-tight">{c.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {c.mediaIds.map((id) => {
                    const m =
                      libraryItems.find((x) => x.id === id || x.mediaId === id) ||
                      (libraryItems.length > 0
                        ? libraryItems[stableHash(c.id + id) % libraryItems.length]
                        : undefined);

                    if (!m) return null;
                    return (
                      <Link
                        key={m.id + c.id}
                        to="/app/media/$id"
                        params={{ id: m.id }}
                        className="glass-subtle inline-flex rounded-full px-2.5 py-1 hover:text-foreground"
                      >
                        {m.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PremiumGlass>
  );
}

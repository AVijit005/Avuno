import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useCollections } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";

const THEMES = [
  "Mind Bending",
  "Cozy Nights",
  "Feel Good",
  "Epic Adventures",
  "Hidden Anime",
  "Modern Classics",
  "Cyberpunk",
  "Space",
  "Magic",
  "History",
];

interface Props {
  className?: string;
}

export function DiscoveryCollections({ className }: Props) {
  const { data: collections } = useCollections();
  const allCollections = collections?.map(adaptCollectionResponse) ?? [];

  if (allCollections.length === 0) return null;

  return (
    <section aria-label="Discovery collections" className={cn("space-y-4", className)}>
      <header className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-tight">Editorial discovery</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Curated worlds
        </p>
      </header>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {THEMES.slice(0, 10).map((theme, i) => {
          const c = allCollections[i % allCollections.length]!;
          const coverSrc = c.cover ?? c.items?.[0]?.posterUrl ?? "";
          return (
            <li key={theme}>
              <Link
                to="/app/collections/$id"
                params={{ id: c.id }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/5 transition hover:ring-white/15"
              >
                <img
                  src={coverSrc}
                  alt=""
                  className="h-full w-full object-cover transition duration-[var(--dur-page)] ease-[var(--ease-out)] group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, transparent 50%, oklch(0 0 0 / 0.85))`,
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/65">Theme</div>
                  <div className="font-display text-base text-white">{theme}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

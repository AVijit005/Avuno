import { createFileRoute, Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { getAllFranchises } from "@/lib/franchiseEngine";
import { Collage } from "@/components/editorial/Collage";
import { ComingSoon } from "@/components/common/ComingSoon";

export const Route = createFileRoute("/app/franchises/")({ component: FranchisesIndex });

function FranchisesIndex() {
  const franchises = getAllFranchises();
  const featured = franchises.slice(0, 4);
  const rest = franchises.slice(4);
  const hero = featured[0];

  return (
    <div className="space-y-14 pb-16">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Worlds</div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          Universes you returned to
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground/70">
          The places that became destinations — sprawling enough to live in, familiar enough to come
          home to.
        </p>
      </header>

      {hero && (
        <Collage
          items={featured.map((f) => ({
            id: f.id,
            image: f.cover,
            alt: f.name,
            node: (
              <Link to="/app/franchises/$id" params={{ id: f.id }} className="block">
                <div className="rounded-2xl bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                    Universe
                  </div>
                  <div className="font-display text-xl tracking-tight text-white">{f.name}</div>
                </div>
              </Link>
            ),
          }))}
        />
      )}

      {rest.length > 0 && (
        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-2xl tracking-tight">More worlds in your library</h2>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              {rest.length} more
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {rest.map((f) => (
              <Link key={f.id} to="/app/franchises/$id" params={{ id: f.id }}>
                <PremiumGlass variant="subtle" glow={f.accent + " / 0.3"}>
                  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 p-4">
                    <div className="aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-white/10">
                      <img src={f.cover} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Universe
                      </div>
                      <div className="mt-0.5 font-display text-lg tracking-tight">{f.name}</div>
                      <p className="mt-1.5 line-clamp-3 text-xs text-foreground/65">
                        {f.description}
                      </p>
                    </div>
                  </div>
                </PremiumGlass>
              </Link>
            ))}
          </div>
        </section>
      )}
      {franchises.length === 0 && (
        <ComingSoon
          eyebrow="Coming soon"
          title="Franchise worlds"
          description="We're mapping every cinematic universe, book series, and game saga across your library. Come back soon."
        />
      )}
    </div>
  );
}

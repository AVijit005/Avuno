import { createFileRoute, Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { allCreators } from "@/lib/creatorEngine";
import { ComingSoon } from "@/components/common/ComingSoon";

export const Route = createFileRoute("/app/creators/")({ component: CreatorsIndex });

function CreatorsIndex() {
  const creators = allCreators();
  const hero = creators[0];
  const rest = creators.slice(1);

  return (
    <div className="space-y-14 pb-16">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Authorship</div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          Voices behind the stories
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground/70">
          The directors, writers and makers whose fingerprints keep showing up in your library —
          quietly shaping your taste.
        </p>
      </header>

      {hero && (
        <Link to="/app/creators/$id" params={{ id: hero.id }} className="block">
          <PremiumGlass variant="default" glow={hero.accent + " / 0.45"}>
            <div className="grid gap-8 p-8 md:grid-cols-[1fr_1.4fr] md:gap-12 md:p-10">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-primary/85">
                  Most present in your library
                </div>
                <h2 className="mt-3 font-display text-3xl tracking-tight md:text-5xl">
                  {hero.name}
                </h2>
                <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-foreground/80">
                  {hero.bio}
                </p>
                <span className="story-link mt-5 inline-block text-sm text-primary">
                  Visit the catalogue
                </span>
              </div>
              <div
                className="aspect-[4/5] w-full rounded-2xl ring-1 ring-white/10"
                style={{
                  background: `linear-gradient(160deg, ${hero.accent}33, transparent 60%), oklch(0.12 0.02 270)`,
                }}
              />
            </div>
          </PremiumGlass>
        </Link>
      )}

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-tight">Others worth knowing</h2>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            {rest.length} voices
          </div>
        </div>
        <div className="space-y-3">
          {rest.map((c, i) => (
            <Link
              key={c.id}
              to="/app/creators/$id"
              params={{ id: c.id }}
              className={
                (i % 3 === 0 ? "md:mr-16" : i % 3 === 1 ? "md:mx-8" : "md:ml-16") + " block"
              }
            >
              <PremiumGlass variant="subtle" glow={c.accent + " / 0.25"}>
                <div className="flex items-baseline justify-between gap-6 px-6 py-5">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Creator
                    </div>
                    <div className="mt-0.5 font-display text-xl tracking-tight">{c.name}</div>
                    <p className="mt-1 line-clamp-1 max-w-prose text-sm text-foreground/60">
                      {c.bio}
                    </p>
                  </div>
                  <span className="story-link shrink-0 text-xs text-muted-foreground">Open →</span>
                </div>
              </PremiumGlass>
            </Link>
          ))}
        </div>
      </section>
      {creators.length === 0 && (
        <ComingSoon
          eyebrow="Coming soon"
          title="Creator profiles"
          description="We're building detailed profiles for every director, author, and artist in your collection. Check back soon."
        />
      )}
    </div>
  );
}

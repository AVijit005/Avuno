import { createFileRoute, Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { CHARACTERS } from "@/lib/characters";
import { useLibrary } from "@/hooks/use-library";
import { MagazineBlock } from "@/components/editorial/MagazineBlock";

export const Route = createFileRoute("/app/characters/")({ component: CharactersIndex });

function CharactersIndex() {
  const { data: libraryData } = useLibrary({ limit: 50 });
  const MEDIA = libraryData?.pages.flatMap((p) => p.data || []) || [];
  const hero = CHARACTERS[0];
  const heroMediaItem = hero ? MEDIA.find((x) => x.media?.id === hero.mediaId) : null;
  const heroMedia = heroMediaItem?.media;
  const rest = CHARACTERS.slice(1);

  return (
    <div className="space-y-14 pb-16">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">The cast</div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          People who stayed with you
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground/70">
          Some characters leave when the credits roll. Others move in. These are the ones who kept a
          room in your head.
        </p>
      </header>

      {hero && heroMedia && (
        <MagazineBlock
          eyebrow={`Featured · ${hero.role}`}
          title={hero.name}
          body={
            <>
              <p>{hero.bio}</p>
              <Link
                to="/app/characters/$id"
                params={{ id: hero.id }}
                className="story-link mt-4 inline-block text-sm text-primary"
              >
                Spend more time with {hero.name.split(" ")[0]}
              </Link>
            </>
          }
          image={heroMedia.posterUrl || ""}
          side="left"
        />
      )}

      {rest.length > 0 && (
        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-2xl tracking-tight">The rest of the cast</h2>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              {rest.length} more
            </div>
          </div>
          <div className="space-y-3">
            {rest.map((c, i) => {
              const mItem = MEDIA.find((x) => x.media?.id === c.mediaId);
              const m = mItem?.media;
              const offset = i % 2 === 0 ? "md:ml-0 md:mr-12" : "md:ml-12 md:mr-0";
              return (
                <Link
                  key={c.id}
                  to="/app/characters/$id"
                  params={{ id: c.id }}
                  className={offset + " block"}
                >
                  <PremiumGlass variant="subtle" glow={c.accent + " / 0.25"}>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-5 p-4 md:gap-6">
                      {m && (
                        <img
                          src={m.posterUrl || undefined}
                          alt=""
                          className="aspect-[2/3] w-22 rounded-xl object-cover ring-1 ring-white/10"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {c.role}
                        </div>
                        <div className="mt-0.5 font-display text-xl tracking-tight">{c.name}</div>
                        <p className="mt-1 line-clamp-2 max-w-prose text-sm text-foreground/65">
                          {c.bio}
                        </p>
                      </div>
                      <div className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 md:block">
                        From {m?.title}
                      </div>
                    </div>
                  </PremiumGlass>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

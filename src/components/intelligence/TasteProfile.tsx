import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { TasteChip } from "./TasteChip";

import { cn } from "@/lib/utils";
import { cascade } from "@/lib/motion";

interface Props {
  className?: string;
  tasteProfile?: {
    favoriteGenres: { name: string; count: number }[];
    favoriteCreators: { name: string; count: number }[];
    favoriteEras: { name: string; count: number }[];
    favoriteRuntime: string;
    favoriteSeasons: string[];
    favoriteTimeOfDay: string;
    favoriteMood: string;
    favoriteCompanion: string;
    favoriteCompletionPattern: string;
  } | null;
}

const cardMotion = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" } as const,
  transition: cascade(i),
});

export function TasteProfile({ className, tasteProfile: tp }: Props) {
  if (!tp) return null;
  const t = tp;
  return (
    <section aria-label="Taste profile" className={cn("space-y-4", className)}>
      <header>
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          Taste profile
        </div>
        <h2 className="font-display text-2xl tracking-tight">This is how you watch</h2>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <PremiumGlass
          interactive
          variant="default"
          glow="oklch(0.65 0.22 295 / 0.35)"
          {...cardMotion(0)}
        >
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Favorite genres
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {t.favoriteGenres.map((g) => (
                <li key={g.name}>
                  <TasteChip label={g.name} count={g.count} />
                </li>
              ))}
            </ul>
          </div>
        </PremiumGlass>
        <PremiumGlass
          interactive
          variant="default"
          glow="oklch(0.72 0.18 255 / 0.35)"
          {...cardMotion(1)}
        >
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Favorite creators
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {t.favoriteCreators.map((c) => (
                <li key={c.name}>
                  <TasteChip label={c.name} count={c.count} />
                </li>
              ))}
            </ul>
          </div>
        </PremiumGlass>
        <PremiumGlass
          interactive
          variant="default"
          glow="oklch(0.72 0.16 160 / 0.35)"
          {...cardMotion(2)}
        >
          <div className="grid gap-3 p-5 md:grid-cols-2">
            <Fact label="Era" value={t.favoriteEras.map((e) => e.name).join(", ")} />
            <Fact label="Runtime" value={t.favoriteRuntime} />
            <Fact label="Time of day" value={t.favoriteTimeOfDay} />
            <Fact label="Season" value={t.favoriteSeasons.join(", ")} />
            <Fact label="Mood" value={t.favoriteMood} />
            <Fact label="Companion" value={t.favoriteCompanion} />
          </div>
        </PremiumGlass>
        <PremiumGlass
          interactive
          variant="default"
          glow="oklch(0.78 0.16 80 / 0.35)"
          {...cardMotion(3)}
        >
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Completion pattern
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {t.favoriteCompletionPattern}
            </p>
          </div>
        </PremiumGlass>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="group/fact cursor-pointer rounded-xl px-3 py-2.5 -mx-2 transition-[transform,background-color,box-shadow] duration-300 ease-out hover:bg-white/[0.08] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_0_16px_-4px_rgba(255,255,255,0.06)] active:scale-[0.98]">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 group-hover/fact:text-muted-foreground transition-colors duration-300">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground/65 group-hover/fact:text-foreground/90 transition-colors duration-300">
        {value}
      </div>
    </div>
  );
}

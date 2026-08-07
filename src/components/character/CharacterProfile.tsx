import { Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { Character } from "@/lib/characters";

export function CharacterProfile({ 
  character, 
  media 
}: { 
  character: Character;
  media?: { id: string; title: string; poster?: string } | null;
}) {
  return (
    <PremiumGlass variant="strong" glow={character.accent + " / 0.4"}>
      <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
        {media && (
          <div className="relative aspect-[3/4] overflow-hidden md:rounded-l-3xl">
            <img src={media.poster} alt={media.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-6 md:p-10">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Character · {character.role}
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight md:text-5xl">
            {character.name}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{character.bio}</p>
          {media && (
            <Link
              to="/app/media/$id"
              params={{ id: media.id }}
              className="story-link mt-4 inline-block text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              From {media.title} →
            </Link>
          )}
        </div>
      </div>
    </PremiumGlass>
  );
}

import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { getRelatedStories } from "@/lib/mediaGraph";
import { RelationshipCard } from "./RelationshipCard";
import { JourneyConnector } from "./JourneyConnector";
import { cn } from "@/lib/utils";

export function RelatedJourney({ mediaId, className }: { mediaId: string; className?: string }) {
  const items = getRelatedStories(mediaId, []).slice(0, 4);
  if (!items.length) return null;
  return (
    <section aria-label="Related journey" className={cn("space-y-3", className)}>
      <header>
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          A connected path
        </div>
        <h2 className="font-display text-2xl tracking-tight">You watched this, then…</h2>
      </header>
      <ul className="flex flex-col gap-2">
        {items.map((m, i) => (
          <li key={m.id} className="space-y-2">
            <RelationshipCard media={m} label={i === 0 ? "Then" : "Then"} />
            {i < items.length - 1 && <JourneyConnector label="Shared atmosphere" />}
          </li>
        ))}
      </ul>
    </section>
  );
}

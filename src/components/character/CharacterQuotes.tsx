import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function CharacterQuotes({ quotes, accent }: { quotes: string[]; accent: string }) {
  if (!quotes.length) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {quotes.map((q, i) => (
        <PremiumGlass key={i} variant="subtle" glow={accent + " / 0.3"}>
          <div className="p-5">
            <blockquote className="font-display text-lg leading-snug">"{q}"</blockquote>
          </div>
        </PremiumGlass>
      ))}
    </div>
  );
}

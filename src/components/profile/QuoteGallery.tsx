import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  limit?: number;
}

export function QuoteGallery({ limit = 6 }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Quotes</div>
      <h3 className="mt-1 font-display text-xl tracking-tight">The lines that stayed</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Quotes you have saved from the stories that moved you — words worth keeping.
      </p>
    </PremiumGlass>
  );
}

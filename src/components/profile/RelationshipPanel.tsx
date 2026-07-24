import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  kind?: string;
  id?: string;
  title?: string;
}

export function RelationshipPanel({ kind = "media", id, title }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {title ?? "Connections"}
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Related {kind} in your library</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Explore how this {kind} connects to others in your Chronicle — shared themes, creators, and narrative threads.
      </p>
    </PremiumGlass>
  );
}
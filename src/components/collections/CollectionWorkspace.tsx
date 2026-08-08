import { PremiumGlass } from "@/components/ui/PremiumGlass";
import {
  getWorkspace,
  type WorkspaceNote,
  type WorkspaceQuote,
  type WorkspaceMemory,
} from "@/lib/collectionWorkspace";
import type { Collection } from "@/lib/types";

export function CollectionWorkspace({ collection }: { collection: Collection }) {
  const w = getWorkspace(collection.id);
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <PremiumGlass variant="subtle">
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Pinned notes
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {w.notes.map((n: WorkspaceNote) => (
              <li key={n.id}>{n.text}</li>
            ))}
          </ul>
        </div>
      </PremiumGlass>
      <PremiumGlass variant="subtle">
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Pinned quotes
          </div>
          <ul className="mt-3 space-y-3">
            {w.quotes.map((q: WorkspaceQuote) => (
              <li key={q.id} className="border-l-2 border-primary/40 pl-3">
                <p className="text-sm italic">"{q.quote}"</p>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  {q.source}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </PremiumGlass>
      <PremiumGlass variant="subtle">
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Pinned memories
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {w.memories.map((m: WorkspaceMemory) => {
              return (
                <li key={m.id}>
                  <span className="text-muted-foreground">{m.note}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </PremiumGlass>
    </div>
  );
}

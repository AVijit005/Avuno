"use client";
import { useEffect, useState } from "react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { listSaved, removeSaved, type SavedItem } from "@/lib/saveForLater";
import { EmptyState } from "@/components/common/Section";

export function SaveForLaterPanel() {
  const [items, setItems] = useState<SavedItem[]>([]);
  useEffect(() => {
    setItems(listSaved());
  }, []);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing saved for later"
        description="Items you save for later will appear here."
      />
    );
  }

  return (
    <PremiumGlass variant="subtle">
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Save for later
        </div>
        <ul className="mt-3 divide-y divide-white/5">
          {items.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm">{s.title}</div>
                <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {s.priority} · {s.kind}
                  {s.expectedDate ? ` · ${s.expectedDate}` : ""}
                </div>
                {s.reason && <div className="mt-1 text-xs text-muted-foreground">{s.reason}</div>}
              </div>
              <button
                onClick={() => {
                  removeSaved(s.id);
                  setItems(listSaved());
                }}
                className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </PremiumGlass>
  );
}

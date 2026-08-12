"use client";
import { useEffect, useState } from "react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { listBookmarks, pinBookmark, type Bookmark } from "@/lib/bookmarks";
import { EmptyState } from "@/components/common/Section";

export function BookmarkPanel() {
  const [items, setItems] = useState<Bookmark[]>([]);
  useEffect(() => {
    setItems(listBookmarks());
  }, []);

  if (items.length === 0) {
    return (
      <EmptyState title="No bookmarks yet" description="Items you bookmark will appear here." />
    );
  }

  return (
    <PremiumGlass variant="subtle">
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Bookmarks
        </div>
        <ul className="mt-3 divide-y divide-white/5">
          {items.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm">{b.title}</div>
                <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {b.kind}
                  {b.subtitle ? ` · ${b.subtitle}` : ""}
                </div>
              </div>
              <button
                onClick={() => {
                  pinBookmark(b.id);
                  setItems(listBookmarks());
                }}
                className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                {b.pinned ? "Unpin" : "Pin"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </PremiumGlass>
  );
}

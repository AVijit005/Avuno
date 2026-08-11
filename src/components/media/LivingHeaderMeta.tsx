import type { UIMediaItem } from "@/lib/adapters/types";

export function LivingHeaderMeta({ item }: { item: UIMediaItem }) {
  const items = [
    { k: "Status", v: item.status.replace(/_/g, " ") },
    { k: "Progress", v: item.progress !== null ? `${item.progress}%` : "Not started" },
    { k: "Rating", v: item.rating ? `${item.rating}/5` : "Not rated" },
    { k: "Kind", v: item.kind },
    { k: "Year", v: String(item.year) },
    { k: "Genres", v: item.genres.slice(0, 2).join(", ") || "—" },
  ];
  return (
    <div className="mt-6 rounded-2xl bg-surface-1 border border-border/40 shadow-sm overflow-hidden">
      <ul className="grid grid-cols-2 gap-px md:grid-cols-3 lg:grid-cols-6 bg-border/20">
        {items.map((i) => (
          <li key={i.k} className="p-4 bg-surface-1">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
              {i.k}
            </div>
            <div className="mt-1 text-sm">{i.v}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

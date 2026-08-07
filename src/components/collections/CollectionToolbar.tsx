import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Rows3,
  Share2,
  Pencil,
  Newspaper,
} from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";

export type ViewMode = "editorial" | "grid" | "compact" | "list";

interface Props {
  view: ViewMode;
  onView: (v: ViewMode) => void;
  query: string;
  onQuery: (q: string) => void;
}
const VIEWS: { v: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { v: "editorial", icon: Newspaper, label: "Editorial" },
  { v: "grid", icon: LayoutGrid, label: "Grid" },
  { v: "compact", icon: Rows3, label: "Compact" },
  { v: "list", icon: List, label: "List" },
];

export function CollectionToolbar({ view, onView, query, onQuery }: Props) {
  return (
    <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-2.5">
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search inside this collection…"
          aria-label="Search inside this collection"
          className="w-full bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>
      <PremiumButton size="sm" variant="secondary" icon={<ArrowUpDown className="h-3.5 w-3.5" />}>
        Sort
      </PremiumButton>
      <PremiumButton
        size="sm"
        variant="secondary"
        icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
      >
        Filter
      </PremiumButton>
      <div className="glass-subtle inline-flex items-center rounded-xl p-0.5">
        {VIEWS.map((v) => {
          const I = v.icon;
          const on = view === v.v;
          return (
            <button
              key={v.v}
              onClick={() => onView(v.v)}
              aria-label={v.label}
              className={`grid h-8 w-8 place-items-center rounded-lg transition ${on ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <I className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
      <PremiumButton size="sm" variant="ghost" icon={<Share2 className="h-3.5 w-3.5" />}>
        Share
      </PremiumButton>
      <PremiumButton size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />}>
        Edit
      </PremiumButton>
    </div>
  );
}

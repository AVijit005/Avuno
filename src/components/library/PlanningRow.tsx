import { Link } from "@tanstack/react-router";
import { Flame, ChevronUp, Minus } from "lucide-react";
import type { UIMediaItem } from "@/lib/adapters/types";
import { metaOf } from "@/lib/library";

export function PlanningRow({ item }: { item: UIMediaItem }) {
  const m = metaOf(item.id);
  const PIcon = m.priority === "high" ? Flame : m.priority === "med" ? ChevronUp : Minus;
  const pColor =
    m.priority === "high"
      ? "oklch(0.78 0.18 25)"
      : m.priority === "med"
        ? "oklch(0.78 0.14 80)"
        : "oklch(0.65 0.02 270)";
  return (
    <Link
      to="/app/media/$id"
      params={{ id: item.id }}
      className="group glass flex items-center gap-4 rounded-2xl p-3 transition hover-lift"
    >
      <img
        src={item.poster || undefined}
        alt={item.title}
        className="h-20 w-14 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <PIcon className="h-3 w-3 shrink-0" style={{ color: pColor }} />
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: pColor }}>
            {m.priority ?? "med"} priority
          </span>
        </div>
        <div className="mt-1 truncate font-medium">{item.title}</div>
        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {item.year} · {item.kind} · added {m.addedAt ?? "recently"}
        </div>
        <div className="mt-1 hidden max-w-md truncate text-[11px] italic text-muted-foreground/80 opacity-0 transition group-hover:opacity-100 md:block">
          &ldquo;{m.reasonSaved ?? "Saved for later."}&rdquo;
        </div>
      </div>
      <div className="hidden text-right text-[11px] text-muted-foreground sm:block">
        <div>{item.runtime ?? "—"}</div>
        <div className="mt-0.5">est. {item.runtime?.includes("h") ? "1 weekend" : "2 weeks"}</div>
      </div>
    </Link>
  );
}

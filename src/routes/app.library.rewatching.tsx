import { createFileRoute, Link } from "@tanstack/react-router";
import { Repeat } from "lucide-react";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { rewatching, metaOf } from "@/lib/library";

export const Route = createFileRoute("/app/library/rewatching")({
  component: RewatchingPage,
});

function RewatchingPage() {
  const items = rewatching();
  return (
    <StatusPageShell
      status="rewatching"
      title="Stories you keep returning to"
      description="Old companions — visited again, on purpose."
      count={items.length}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((m) => {
          const meta = metaOf(m.id);
          return (
            <Link
              key={m.id}
              to="/app/media/$id"
              params={{ id: m.id }}
              className="glass flex items-center gap-4 rounded-2xl p-3 transition hover-lift"
            >
              <img
                src={m.poster || undefined}
                alt={m.title}
                className="h-20 w-14 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{m.title}</div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {m.year} · {m.kind}
                </div>
                <div
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]"
                  style={{
                    color: "color-mix(in oklab, var(--status-rewatching) 80%, oklch(0.97 0 0))",
                  }}
                >
                  <Repeat className="h-3 w-3" /> {meta.timesWatched ?? 1}× watched · last{" "}
                  {meta.lastActivityAt ?? "recently"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </StatusPageShell>
  );
}

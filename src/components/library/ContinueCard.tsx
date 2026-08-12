import { Link } from "@tanstack/react-router";
import { Play, NotebookPen } from "lucide-react";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

export function ContinueCard({ item }: { item: UIMediaItem }) {
  const { openProgress } = useMediaActions();
  const pct = item.progress ?? 0;
  const label = item.progressLabel ?? `${pct}% complete`;
  const accent = item.accent ?? "var(--primary)";

  // Derive continue label from media kind
  const continueLabel: Record<string, string> = {
    movie: "Continue Watching",
    series: "Continue Watching",
    anime: "Continue Watching",
    book: "Continue Reading",
    manga: "Continue Reading",
    game: "Continue Playing",
    music: "Continue Listening",
    podcast: "Continue Listening",
    course: "Continue Learning",
    youtube: "Continue Watching",
  };

  return (
    <div className="group relative w-[300px] shrink-0 overflow-hidden rounded-2xl border border-border/60">
      <Link to="/app/media/$id" params={{ id: item.mediaId }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={item.backdrop ?? item.poster}
            alt={item.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div
            className="absolute inset-0 opacity-0 transition group-hover:opacity-60"
            style={{
              background: `radial-gradient(60% 80% at 50% 100%, ${accent} / 0.35, transparent 70%)`,
            }}
          />
        </div>
      </Link>
      <div className="relative p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-primary/90">
          {continueLabel[item.kind] ?? "Continue"}
        </div>
        <div className="mt-1 truncate font-medium">{item.title}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => openProgress(item.id)}
            className="press-scale inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Play className="h-3 w-3 fill-current" /> Pick up
          </button>
          <Link
            to="/app/journal"
            className="press-scale glass-subtle inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <NotebookPen className="h-3 w-3" /> Journal
          </Link>
        </div>
      </div>
    </div>
  );
}

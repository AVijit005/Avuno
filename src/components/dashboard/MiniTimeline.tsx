import { PremiumGlass } from "@/components/ui/PremiumGlass";
import {
  Film,
  NotebookPen,
  Trophy,
  Target,
  Layers,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimelineEvents } from "@/hooks/use-journal";
import { adaptTimelineEvent } from "@/lib/adapters/journal";

const ICONS: Record<string, typeof Film> = {
  STARTED: Play,
  PAUSED: Pause,
  CONTINUED: RotateCcw,
  COMPLETED: CheckCircle2,
  JOURNAL: NotebookPen,
  COLLECTION: Layers,
  REWATCHED: RotateCcw,
  REREAD: RotateCcw,
  REPLAYED: RotateCcw,
  FAVORITED: Trophy,
  RATED: Trophy,
  MEMORY_CREATED: NotebookPen,
  JOURNAL_CREATED: NotebookPen,
  QUOTE_ADDED: NotebookPen,
  HIGHLIGHT_ADDED: NotebookPen,
};

export function MiniTimeline({ className }: { className?: string }) {
  const { data: timelineData, isLoading } = useTimelineEvents();

  if (isLoading) {
    return (
      <PremiumGlass variant="subtle" className={className}>
        <div className="p-6">
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Lately
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
            ))}
          </div>
        </div>
      </PremiumGlass>
    );
  }

  const events = (timelineData?.items ?? []).map(adaptTimelineEvent).slice(0, 10);

  if (events.length === 0) {
    return (
      <PremiumGlass variant="subtle" className={className}>
        <div className="p-6">
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Lately
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Film className="h-4 w-4 opacity-60" /> No recent activity.
          </div>
        </div>
      </PremiumGlass>
    );
  }

  return (
    <PremiumGlass variant="subtle" className={className}>
      <div className="p-6">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Lately</div>
        <ol className="mt-4 space-y-3 border-l border-white/10 pl-5">
          {events.map((ev) => {
            const Icon = ICONS[ev.type] ?? Film;
            return (
              <li key={ev.id} className="relative">
                <span className="absolute -left-[26px] top-1 grid h-4 w-4 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                  <Icon className="h-2.5 w-2.5 text-primary" />
                </span>
                <div className="text-sm">{ev.title}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                  {new Date(ev.eventDate).toLocaleDateString()}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </PremiumGlass>
  );
}

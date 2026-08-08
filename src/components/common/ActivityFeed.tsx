import { Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import {
  Film,
  NotebookPen,
  Trophy,
  Target,
  Layers,
  CheckCircle2,
  Sparkles,
  Heart,
} from "lucide-react";
import { useActivity } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

// Map backend 'type' strings to icons
const ICONS: Record<string, typeof Film> = {
  journal: NotebookPen,
  completion: CheckCircle2,
  achievement: Trophy,
  collection: Layers,
  timeline: Film,
  goal: Target,
  discovery: Sparkles,
  memory: Sparkles,
  favorite: Heart,
};

export function ActivityFeed({ className, limit = 10 }: { className?: string; limit?: number }) {
  const { data, isLoading } = useActivity();

  if (isLoading) {
    return (
      <div className="p-5 text-muted-foreground animate-pulse text-sm">Loading activity...</div>
    );
  }

  const feed = (data?.timeline ?? []).slice(0, limit);

  return (
    <PremiumGlass variant="subtle" className={cn(className)}>
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Activity
        </div>
        <ol className="mt-4 space-y-3">
          {feed.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No recent activity.
            </div>
          )}
          {feed.map((a) => {
            const Icon = ICONS[a.type] || Film;
            const node = (
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{a.title}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                    {new Date(a.date).toLocaleDateString()} {a.type}
                  </div>
                </div>
              </div>
            );
            return (
              <li key={a.id}>
                {a.metadata?.mediaId ? (
                  <Link
                    to="/app/media/$id"
                    params={{ id: String(a.metadata.mediaId) }}
                    className="block"
                  >
                    {node}
                  </Link>
                ) : (
                  node
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </PremiumGlass>
  );
}

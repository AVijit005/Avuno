import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/types";

export function RelationshipCard({
  media,
  label,
  className,
}: {
  media: MediaItem;
  label: string;
  className?: string;
}) {
  return (
    <Link
      to="/app/media/$id"
      params={{ id: media.id }}
      className={cn(
        "glass-subtle group flex items-center gap-3 rounded-2xl p-2.5 ring-1 ring-white/5 transition hover:ring-white/15",
        className,
      )}
    >
      <img
        src={media.poster || undefined}
        alt={media.title}
        className="h-14 w-10 flex-none rounded-md object-cover"
      />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-primary/75">{label}</div>
        <div className="truncate text-sm">{media.title}</div>
      </div>
    </Link>
  );
}

import { adaptLibraryItem } from "@/lib/adapters/media";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useLibrary } from "@/hooks/use-library";
import { Link } from "@tanstack/react-router";
import { MEMORIES_BY_MEDIA } from "@/lib/memory";
import { cn } from "@/lib/utils";

interface Props {
  mediaId: string;
  className?: string;
}
type Conn = { reason: string; mediaId: string };

export function MemoryConnections({ mediaId, className }: Props) {
  const { data: libraryData } = useLibrary({ limit: 100 });
  const MEDIA = libraryData?.pages.flatMap((p) => p.data.map(adaptLibraryItem)) || [];
  const base = MEDIA.find((m) => m.id === mediaId);
  const baseMem = MEMORIES_BY_MEDIA[mediaId];
  if (!base) return null;

  const conns: Conn[] = [];
  for (const other of MEDIA) {
    if (other.id === mediaId) continue;
    const otherMem = MEMORIES_BY_MEDIA[other.id];
    if (other.creator && other.creator === base.creator)
      conns.push({ reason: `Same creator · ${base.creator}`, mediaId: other.id });
    else if (other.year === base.year)
      conns.push({ reason: `Same year · ${base.year}`, mediaId: other.id });
    else if (otherMem && baseMem && otherMem.season === baseMem.season)
      conns.push({ reason: `Same season · ${baseMem.season}`, mediaId: other.id });
    else if (otherMem && baseMem && otherMem.companion === baseMem.companion)
      conns.push({ reason: `Same company · ${baseMem.companion}`, mediaId: other.id });
    else if (otherMem && baseMem && otherMem.mood === baseMem.mood)
      conns.push({ reason: `Shared mood · ${baseMem.mood}`, mediaId: other.id });
    if (conns.length >= 6) break;
  }
  if (!conns.length) return null;

  return (
    <section aria-label="Memory connections" className={cn("space-y-3", className)}>
      <header className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
        Connected memories
      </header>
      <ul className="divide-y divide-white/[0.06] rounded-2xl ring-1 ring-white/[0.06]">
        {conns.map((c) => {
          const m = MEDIA.find((x) => x.id === c.mediaId)!;
          return (
            <li key={c.mediaId + c.reason}>
              <Link
                to="/app/media/$id"
                params={{ id: m.id }}
                className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/[0.03]"
              >
                <img src={m.poster} alt={m.title} className="h-10 w-7 flex-none rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{m.title}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                    {c.reason}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { useLibrary } from "@/hooks/use-library";
import { ArrowUpRight } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { LifeChapter } from "@/lib/memoryInsights";
import { MemoryChip } from "./MemoryChip";
import { cn } from "@/lib/utils";
import { adaptLibraryItem } from "@/lib/adapters/media";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  chapter: LifeChapter;
  className?: string;
}

export function LifeChapterCard({ chapter, className }: Props) {
  const { data: libraryData } = useLibrary({ limit: 100 });
  const MEDIA: UIMediaItem[] = libraryData?.pages.flatMap((p) => p.data.map(adaptLibraryItem)) || [];
  const covers = chapter.coverIds
    .map((id) => MEDIA.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);
  const favorite = MEDIA.find((m) => m.id === chapter.favoriteMediaId);
  return (
    <PremiumGlass variant="default" className={className}>
      <article className="p-5 md:p-6" aria-label={`Life chapter: ${chapter.name}`}>
        <div className="grid grid-cols-4 gap-1 overflow-hidden rounded-xl">
          {covers.slice(0, 4).map((c) => (
            <img key={c.id} src={c.poster} alt={c.title} className="h-20 w-full object-cover" />
          ))}
        </div>
        <header className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Chapter</div>
          <h3 className="mt-1 font-display text-xl tracking-tight md:text-2xl">{chapter.name}</h3>
          <time className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {chapter.range}
          </time>
        </header>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{chapter.description}</p>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
          <div>
            <dt className="text-muted-foreground/70">Stories</dt>
            <dd className="mt-0.5 text-foreground/85">{chapter.mediaIds.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground/70">Journals</dt>
            <dd className="mt-0.5 text-foreground/85">{chapter.journalCount}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground/70">Hours</dt>
            <dd className="mt-0.5 text-foreground/85">{chapter.totalHours}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between">
          <MemoryChip variant="mood" label={chapter.dominantMood} />
          {favorite && (
            <span className={cn("inline-flex items-center gap-1.5 text-[11px] text-foreground/70")}>
              Favorite: {favorite.title} <ArrowUpRight className="h-3 w-3 opacity-70" />
            </span>
          )}
        </div>
      </article>
    </PremiumGlass>
  );
}

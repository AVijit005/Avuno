import type { UIMediaItem } from "@/lib/adapters/types";
import { MediaCard } from "@/components/media/MediaCard";
import type { MediaItem } from "@/lib/types";

export function CreatorWorks({ works }: { works: MediaItem[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {works.map((w) => (
        <MediaCard key={w.id} item={w as UIMediaItem} size="md" />
      ))}
    </div>
  );
}

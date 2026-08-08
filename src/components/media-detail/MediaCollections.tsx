import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ListPlus } from "lucide-react";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useCollections } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";

export function MediaCollections({ item }: { item: UIMediaItem }) {
  const { data: collections, isLoading } = useCollections();
  const allCollections = collections?.map(adaptCollectionResponse) ?? [];
  // Find collections that contain this media item
  const cols = allCollections.filter((c) => c.items?.some((i) => i.mediaId === item.mediaId));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[16/9] animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (cols.length === 0) {
    return (
      <div className="glass flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-primary ring-1 ring-white/10">
          <ListPlus className="h-4 w-4" />
        </span>
        Not in any collection yet — group it with other stories when it fits one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cols.map((c, i) => {
        const coverSrc = c.cover ?? c.items?.[0]?.posterUrl ?? "";
        const accent = c.color ?? "var(--primary)";
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/app/collections/$id"
              params={{ id: c.id }}
              className="group relative block aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-white/10"
            >
              <img
                src={coverSrc}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 35%, ${accent} / 0.45, oklch(0 0 0 / 0.85))`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-display text-lg text-white">{c.name}</div>
                <div className="text-[11px] text-white/70">{c.itemCount} items</div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

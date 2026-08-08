import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { metaOf } from "@/lib/library";

export function FavoritesGallery({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((m) => {
        const meta = metaOf(m.id);
        return (
          <Link key={m.id} to="/app/media/$id" params={{ id: m.id }} className="group block">
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border/60 transition duration-500"
              style={{ boxShadow: "0 30px 60px -25px oklch(0 0 0 / 0.7)" }}
            >
              <img
                src={m.poster || undefined}
                alt={m.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px color-mix(in oklab, var(--status-favorite) 60%, transparent), inset 0 -120px 120px -60px color-mix(in oklab, var(--status-favorite) 35%, transparent)",
                }}
              />
              <div
                className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: "color-mix(in oklab, var(--status-favorite) 22%, oklch(0 0 0 / 0.5))",
                  color: "oklch(0.97 0 0)",
                }}
              >
                <Heart className="h-2.5 w-2.5 fill-current" /> Favorite
              </div>
              <div className="absolute inset-x-2 bottom-2 flex items-center gap-1 text-[10px] text-white/80">
                <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />{" "}
                {(m.rating ?? 0).toFixed(1)} · {m.year}
              </div>
            </div>
            <div className="mt-3">
              <div className="truncate text-sm font-medium">{m.title}</div>
              {meta.journalExcerpt && (
                <p className="mt-1 line-clamp-2 font-display text-[13px] italic leading-snug text-muted-foreground">
                  &ldquo;{meta.journalExcerpt}&rdquo;
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

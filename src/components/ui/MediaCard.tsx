import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { Heart, Star, ImageOff } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { useState, type MouseEvent } from "react";
import { useLibraryStore } from "@/lib/store/libraryStore";
import { PremiumImage } from "@/components/ui/PremiumImage";

interface Props {
  item: MediaItem;
  size?: "sm" | "md" | "lg" | "fluid";
  showMeta?: boolean;
  className?: string;
}
const sizes = {
  sm: "w-32 md:w-36",
  md: "w-40 md:w-48",
  lg: "w-52 md:w-64",
  fluid: "w-full",
};

export function MediaCard({ item, size = "md", showMeta = true, className = "" }: Props) {
  const reduced = useReducedMotion();
  const fav = useLibraryStore((s) => s.meta[item.id]?.favorite) ?? false;
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const [errored, setErrored] = useState(false);

  return (
    <motion.div className={`group relative ${sizes[size]} shrink-0 ${className}`}>
      <Link
        to="/app/media/$id"
        params={{ id: item.id }}
        className="focus-ring card-interactive relative block aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-border transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-elevated glass"
        style={{ viewTransitionName: `poster-${item.id}` }}
        aria-label={`${item.title} — ${item.kind} (${item.year})`}
      >
        {errored ? (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.02]">
            <ImageOff className="h-6 w-6 text-foreground/30" />
          </div>
        ) : (
          <PremiumImage
            src={item.poster || ""}
            alt={item.title}
            aspectRatio="poster"
            className="transition-transform duration-300 ease-out group-hover:scale-[1.05]"
          />
        )}

        {/* gradient base for text */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 45%, oklch(0 0 0 / 0.5) 75%, oklch(0 0 0 / 0.95))",
          }}
        />

        {/* Status chip with primary tint */}
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/10 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/20">
          <Star className="h-2.5 w-2.5 fill-primary text-primary" />
          {(item.rating ?? 0).toFixed(1)}
        </div>

        {/* metadata */}
        {showMeta && (
          <div aria-hidden className="absolute inset-x-0 bottom-0 p-4 text-white">
            <div className="truncate font-display text-lg font-semibold leading-tight">
              {item.title}
            </div>
            <div className="mt-1 text-xs text-white/70">
              {item.kind} · {item.year}
            </div>
            {item.progress != null && item.progress > 0 && item.progress < 100 && (
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out bg-primary"
                  style={{
                    width: `${item.progress ?? 0}%`,
                    boxShadow: `0 0 8px var(--primary)`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Link>

      {/* favorite */}
      <button
        type="button"
        aria-label={fav ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
        aria-pressed={fav}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
        className="focus-ring absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white/90 opacity-100 transition-all duration-200 ease-out md:opacity-0 md:group-hover:opacity-100 hover:scale-110 hover:bg-black/60 hover:text-rose-400 ring-1 ring-white/10"
      >
        <Heart
          className={`h-4 w-4 transition-transform ${fav ? "fill-rose-400 text-rose-400" : ""}`}
        />
      </button>
    </motion.div>
  );
}

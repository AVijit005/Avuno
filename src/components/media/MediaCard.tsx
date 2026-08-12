import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Star,
  Film,
  Tv,
  Sparkles,
  BookOpen,
  BookMarked,
  Gamepad2,
  Music2,
  Mic,
  GraduationCap,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UIMediaItem, UIMediaKind } from "@/lib/adapters/types";
import { cn } from "@/lib/utils";
import { ItemActionBar } from "@/components/media/ItemActionBar";
import { imageReveal } from "@/lib/motion";

const KIND_GLYPH: Record<UIMediaKind, LucideIcon> = {
  movie: Film,
  series: Tv,
  anime: Sparkles,
  book: BookOpen,
  manga: BookMarked,
  game: Gamepad2,
  music: Music2,
  podcast: Mic,
  course: GraduationCap,
  youtube: Youtube,
};

export function MediaCard({
  item,
  size = "full",
}: {
  item: UIMediaItem;
  size?: "sm" | "md" | "lg" | "full";
}) {
  const w = size === "full" ? "w-full" : size === "sm" ? "w-36" : size === "lg" ? "w-56" : "w-44";
  const rating = item.rating ?? 0;
  const accent = item.accent ?? "var(--primary)";
  const [focused, setFocused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const Glyph = KIND_GLYPH[item.kind];
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate={focused ? "hover" : "rest"}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      className={cn("group relative flex flex-col min-w-0", size !== "full" && "shrink-0", w)}
    >
      <div className="relative">
        <motion.div
          variants={{ rest: { y: 0 }, hover: { y: -6 } }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[2/3] overflow-hidden rounded-2xl"
          style={{ boxShadow: "0 20px 40px -20px oklch(0 0 0 / 0.7)" }}
        >
          <Link
            to="/app/media/$id"
            params={{ id: item.mediaId || item.id }}
            className="absolute inset-0 z-10"
            aria-label={`View ${item.title}`}
          />
          {errored ? (
            <div className="absolute inset-0 grid h-full w-full place-items-center bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
              <Glyph className="h-8 w-8 text-muted-foreground/40" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate={loaded ? "visible" : "hidden"}
              variants={imageReveal}
              className="absolute inset-0 h-full w-full"
            >
              <motion.img
                layoutId={`poster-${item.mediaId || item.id}`}
                src={item.poster}
                alt={item.title}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
              />
            </motion.div>
          )}
          {/* gradient + sheen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(60% 80% at 50% 100%, color-mix(in oklch, ${accent} 35%, transparent), transparent 70%)`,
            }}
          />

          {/* Rating chip */}
          {rating > 0 && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[10px] text-white/90">
              <Star className="h-2.5 w-2.5 fill-[var(--status-favorite)] text-[var(--status-favorite)]" />{" "}
              {rating.toFixed(1)}
            </div>
          )}

          {/* Cross-media glyph — subtle medium identity */}
          <div
            aria-hidden
            className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/80 text-white/90 ring-1 ring-white/10 z-10"
            title={item.kind}
          >
            <Glyph className="h-3 w-3" />
          </div>

          {/* Progress bar (always when in-progress) */}
          {item.progress !== null && item.progress > 0 && item.progress < 100 && (
            <div className="absolute inset-x-2 bottom-2">
              <div className="h-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>
        <div className="pointer-events-none absolute inset-x-2 bottom-2 z-20 flex justify-center opacity-0 translate-y-2 scale-95 transition-[transform,opacity] duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
          <div className="pointer-events-auto w-full max-w-[220px]">
            <ItemActionBar id={item.id} title={item.title} variant="overlay" />
          </div>
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <div className="truncate text-sm font-medium">{item.title}</div>
        <div className="mt-0.5 truncate text-[11px] uppercase tracking-wider text-muted-foreground">
          {item.year} · {item.kind}
        </div>
      </div>
    </motion.div>
  );
}

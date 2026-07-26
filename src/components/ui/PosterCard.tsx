import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from "motion/react";
import { Heart, Star, ImageOff } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { useState, type MouseEvent } from "react";
import { useLibraryStore } from "@/lib/store/libraryStore";
import { imageReveal } from "@/lib/motion";

interface Props {
  item: MediaItem;
  size?: "sm" | "md" | "lg";
  showMeta?: boolean;
  className?: string;
}
const sizes = {
  sm: "w-32 md:w-36",
  md: "w-40 md:w-48",
  lg: "w-52 md:w-64",
};

export function PosterCard({ item, size = "md", showMeta = true, className = "" }: Props) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-50, 50], [1, -1]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-50, 50], [-1, 1]), { stiffness: 200, damping: 20 });
  const fav = useLibraryStore((s) => s.meta[item.id]?.favorite) ?? false;
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduced ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={`group relative ${sizes[size]} shrink-0 ${className}`}
    >
      <Link
        to="/app/media/$id"
        params={{ id: item.id }}
        className="focus-ring relative block aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-foreground/10 transition-shadow duration-[var(--dur-large)] ease-[var(--ease-out)] group-hover:shadow-[var(--shadow-poster-hover)]"
        aria-label={`${item.title} — ${item.kind} (${item.year})`}
      >
        {errored ? (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.02]">
            <ImageOff className="h-6 w-6 text-foreground/30" />
          </div>
        ) : (
          <motion.div initial="hidden" animate={loaded ? "visible" : "hidden"} variants={imageReveal}>
            <img
              src={item.poster || undefined}
              alt=""
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              className="h-full w-full object-cover transition-[transform,filter] duration-[var(--dur-large)] ease-[var(--ease-out)] group-hover:scale-[1.03] group-hover:brightness-[1.02] motion-reduce:group-hover:scale-100"
            />
          </motion.div>
        )}
        {/* gradient base */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 45%, oklch(0 0 0 / 0.35) 75%, oklch(0 0 0 / 0.85))",
          }}
        />
        {/* reflection sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition duration-[var(--dur-page)] ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:hidden"
          style={{
            background:
              "linear-gradient(120deg, transparent 35%, oklch(1 0 0 / 0.18) 50%, transparent 65%)",
            mixBlendMode: "overlay",
          }}
        />
        {/* accent edge glow */}
        {item.accent && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-[var(--dur-large)] ease-[var(--ease-out)] group-hover:opacity-100"
            style={{ boxShadow: `inset 0 0 0 1px ${item.accent ?? undefined}` }}
          />
        )}
        {/* rating chip */}
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/50 px-2 py-0.5 text-[10px] text-foreground/90 backdrop-blur">
          <Star className="h-2.5 w-2.5 fill-[var(--status-favorite)] text-[var(--status-favorite)]" />
          {(item.rating ?? 0).toFixed(1)}
        </div>
        {/* metadata */}
        {showMeta && (
          <div aria-hidden className="absolute inset-x-0 bottom-0 p-3 text-white transition-transform duration-[var(--dur-large)] ease-[var(--ease-out)] group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0">
            <div className="truncate font-display text-base leading-tight">{item.title}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/65">
              {item.kind} · {item.year}
            </div>
            {(item.progress ?? 0) !== undefined && (item.progress ?? 0) < 100 && (
              <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full transition-opacity duration-[var(--dur-large)] ease-[var(--ease-out)] group-hover:opacity-100"
                  style={{
                    width: `${(item.progress ?? 0)}%`,
                    background: item.accent ?? "var(--primary)",
                    boxShadow: `0 0 8px ${item.accent ?? "var(--primary)"}`,
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
          toggleFavorite(item.id);
        }}
        className="focus-ring absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white/80 opacity-0 backdrop-blur transition duration-[var(--dur-normal)] ease-[var(--ease-out)] group-hover:opacity-100 hover:scale-110 hover:text-rose-400 md:h-7 md:w-7"
      >
        <Heart
          className={`h-3.5 w-3.5 transition-transform duration-[var(--dur-normal)] ease-[var(--ease-out)] ${fav ? "fill-[var(--status-dropped)] text-[var(--status-dropped)] motion-safe:animate-pulse" : ""}`}
        />
      </button>
    </motion.div>
  );
}

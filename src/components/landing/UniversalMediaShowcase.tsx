import { motion } from "motion/react";
import {
  BookOpen,
  Film,
  Gamepad2,
  GraduationCap,
  Headphones,
  Mic,
  Music2,
  PlaySquare,
  Sparkles,
  Tv,
} from "lucide-react";
import type { MediaKind } from "@/lib/types";

const TYPES: {
  kind: MediaKind;
  label: string;
  tagline: string;
  icon: typeof Film;
  poster: string;
  tilt: number;
  offset: string;
}[] = [
  {
    kind: "movie",
    label: "Movies",
    tagline: "Films that stayed with you.",
    icon: Film,
    poster: "linear-gradient(135deg, #1a2e2d 0%, #164a4a 50%, #0f7a6f 100%)",
    tilt: -3,
    offset: "md:mt-0",
  },
  {
    kind: "anime",
    label: "Anime",
    tagline: "Long arcs, longer memories.",
    icon: Sparkles,
    poster: "linear-gradient(135deg, #2e2a1e 0%, #4a3d2d 50%, #7a5c3d 100%)",
    tilt: 2,
    offset: "md:mt-10",
  },
  {
    kind: "series",
    label: "Series",
    tagline: "Stories told in seasons.",
    icon: Tv,
    poster: "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)",
    tilt: -2,
    offset: "md:mt-4",
  },
  {
    kind: "book",
    label: "Books",
    tagline: "The ones that changed you.",
    icon: BookOpen,
    poster: "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)",
    tilt: 3,
    offset: "md:mt-16",
  },
  {
    kind: "manga",
    label: "Manga",
    tagline: "Panels you keep returning to.",
    icon: BookOpen,
    poster: "linear-gradient(135deg, #1e2a1e 0%, #2d4a2d 50%, #3d7a3d 100%)",
    tilt: -2,
    offset: "md:mt-2",
  },
  {
    kind: "game",
    label: "Games",
    tagline: "Worlds you lived inside.",
    icon: Gamepad2,
    poster: "linear-gradient(135deg, #2d1b2e 0%, #4a1942 50%, #7b2d5c 100%)",
    tilt: 3,
    offset: "md:mt-12",
  },
  {
    kind: "music",
    label: "Music",
    tagline: "Albums you wore out.",
    icon: Music2,
    poster: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    tilt: -3,
    offset: "md:mt-6",
  },
  {
    kind: "podcast",
    label: "Podcasts",
    tagline: "Voices you walked with.",
    icon: Mic,
    poster: "linear-gradient(135deg, #2e1e2a 0%, #4a2d3d 50%, #7a3d5c 100%)",
    tilt: 2,
    offset: "md:mt-14",
  },
  {
    kind: "course",
    label: "Courses",
    tagline: "Skills, season by season.",
    icon: GraduationCap,
    poster: "linear-gradient(135deg, #1a2e2d 0%, #164a4a 50%, #0f7a6f 100%)",
    tilt: -2,
    offset: "md:mt-2",
  },
  {
    kind: "youtube",
    label: "YouTube",
    tagline: "Long-watched, well-loved.",
    icon: PlaySquare,
    poster: "linear-gradient(135deg, #2e2a1e 0%, #4a3d2d 50%, #7a5c3d 100%)",
    tilt: 3,
    offset: "md:mt-10",
  },
];

export function UniversalMediaShowcase() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
      {TYPES.map((t, i) => {
        const Icon = t.icon;
        return (
          <motion.div
            key={t.kind}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, rotate: t.tilt * 0.4 }}
            className={`group relative aspect-[2/3] overflow-hidden rounded-3xl ring-1 ring-white/10 ${t.offset}`}
            style={{ transform: `rotate(${t.tilt}deg)` }}
          >
            {t.poster ? (
              <img
                src={t.poster}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/30 to-background/80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <Headphones className="hidden" aria-hidden />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
              <span className="glass-subtle grid h-7 w-7 place-items-center rounded-lg">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="glass-subtle rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/80">
                {t.label}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="font-display text-lg leading-tight text-white">{t.label}</div>
              <div className="mt-1 text-[11px] text-white/70 opacity-0 transition group-hover:opacity-100">
                {t.tagline}
              </div>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mix-blend-overlay opacity-0 transition group-hover:opacity-100"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

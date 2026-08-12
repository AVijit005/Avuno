import { motion } from "motion/react";
import { Play, BookmarkPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { MediaItem } from "@/lib/types";

export function CinematicHero({ item }: { item: MediaItem }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[40px]"
      style={{ boxShadow: "0 40px 100px -30px oklch(0 0 0 / 0.6)" }}
    >
      <div className="relative h-[58vh] min-h-[420px] w-full">
        <img
          src={(item.backdrop ?? item.poster) || undefined}
          alt={item.title}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, oklch(0 0 0 / 0.95) 0%, oklch(0 0 0 / 0.6) 45%, transparent 100%),
                         radial-gradient(circle at 75% 50%, transparent 20%, oklch(0 0 0 / 0.8) 100%),
                         radial-gradient(60% 80% at 100% 0%, color-mix(in oklch, ${item.accent ?? "var(--primary)"} 25%, transparent), transparent 60%)`,
          }}
        />

        <div className="absolute inset-0 flex items-end p-6 md:p-12">
          <div className="max-w-xl group/panel glass-subtle rounded-[2rem] p-8 transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_24px_48px_-12px_oklch(0_0_0/0.8),0_0_24px_oklch(0.72_0.18_255/0.15)]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Continue your story
            </div>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-white md:text-6xl text-balance">
              {item.title}
            </h2>
            <p className="mt-4 max-w-md text-sm text-white/70 md:text-base leading-relaxed text-balance">
              {item.synopsis}
            </p>

            {item.progress !== undefined && (
              <div className="mt-6 max-w-sm">
                <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-white/60 font-medium">
                  <span>{item.progress}% complete</span>
                  <span>{item.runtime}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_12px_oklch(0.72_0.18_255/0.6)] transition-[box-shadow,filter] duration-500 group-hover/panel:shadow-[0_0_20px_oklch(0.72_0.18_255/0.9)] group-hover/panel:brightness-110"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/app/media/$id"
                params={{ id: item.id }}
                className="glass press-scale inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium text-white transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out hover:-translate-y-[2px] hover:border-white/30 hover:bg-white/15 hover:shadow-[0_8px_16px_-4px_oklch(0_0_0/0.5),0_0_16px_oklch(0.72_0.18_255/0.3)] cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" /> Continue
              </Link>
              <Link
                to="/app/journal"
                className="glass press-scale inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium text-white/80 transition-[transform,border-color,background-color,color,box-shadow] duration-300 ease-out hover:-translate-y-[2px] hover:border-white/15 hover:bg-white/10 hover:text-white hover:shadow-[0_8px_16px_-4px_oklch(0_0_0/0.5)] cursor-pointer"
              >
                <BookmarkPlus className="h-4 w-4" /> Add to journal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// Live "Your Reflections" rail — reads user-written reflections from libraryStore.
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, Star, NotebookPen } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { useUserReflections } from "@/lib/store/liveSelectors";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

interface Props {
  limit?: number;
  emptyTo?: string;
  title?: string;
  eyebrow?: string;
}

export function YourReflectionsRail({
  limit = 8,
  title = "Your reflections",
  eyebrow = "Writing",
}: Props) {
  const rows = useUserReflections();
  const { openReflection } = useMediaActions();
  const shown = rows.slice(0, limit);

  if (shown.length === 0) {
    return (
      <PremiumGlass variant="subtle" className="p-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </div>
        <div className="mt-2 font-display text-2xl tracking-tight">No reflections yet</div>
        <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground">
          When you complete a story, capture what stayed with you. Your words will live here.
        </p>
      </PremiumGlass>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </div>
          <h3 className="font-display text-2xl tracking-tight">{title}</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? "entry" : "entries"}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {shown.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="glass group relative overflow-hidden rounded-3xl p-5"
          >
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-50 blur-3xl"
              style={{ background: r.item.accent ?? "var(--primary)" }}
            />
            <div className="relative flex gap-4">
              <img
                src={r.item.poster || undefined}
                alt=""
                className="h-24 w-16 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {r.completedAt ?? "Saved"} {r.mood && <>· {r.mood}</>}
                </div>
                <Link
                  to="/app/media/$id"
                  params={{ id: r.item.id }}
                  className="story-link mt-1 block truncate font-display text-xl tracking-tight"
                >
                  {r.item.title}
                </Link>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/85">
                  {r.reflection}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {typeof r.rating === "number" && r.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {r.rating}.0
                    </span>
                  )}
                  {r.favorite && (
                    <span className="flex items-center gap-1 text-rose-300">
                      <Heart className="h-3 w-3 fill-current" /> Favorite
                    </span>
                  )}
                  <button
                    onClick={() => openReflection(r.id)}
                    className="ml-auto flex items-center gap-1 hover:text-foreground"
                  >
                    <NotebookPen className="h-3 w-3" /> Edit
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export function MediaReflectionPanel({ id }: { id: string }) {
  const rows = useUserReflections();
  const { openReflection } = useMediaActions();
  const row = rows.find((r) => r.id === id);
  if (!row) {
    return (
      <PremiumGlass variant="subtle" className="p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Your reflection
        </div>
        <p className="mt-2 text-sm text-foreground/85">You haven't written about this yet.</p>
        <button
          onClick={() => openReflection(id)}
          className="press-scale mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-medium text-primary-foreground"
        >
          <NotebookPen className="h-3.5 w-3.5" /> Write a reflection
        </button>
      </PremiumGlass>
    );
  }
  return (
    <PremiumGlass className="p-6">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Your reflection {row.completedAt && <>· {row.completedAt}</>}{" "}
        {row.mood && <>· {row.mood}</>}
        {typeof row.rating === "number" && row.rating > 0 && (
          <span className="ml-auto flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {row.rating}.0
          </span>
        )}
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{row.reflection}</p>
      <button
        onClick={() => openReflection(id)}
        className="story-link mt-4 text-xs text-muted-foreground hover:text-foreground"
      >
        Edit reflection
      </button>
    </PremiumGlass>
  );
}

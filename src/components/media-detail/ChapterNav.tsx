import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { ArrowUp } from "lucide-react";
import { useShortcuts } from "@/lib/shortcuts";

export interface ChapterRef {
  id: string;
  label: string;
}

/** Sticky right-rail chapter nav + top reading-progress bar + condensed
 *  title bar once the hero has scrolled out of view.
 *  Watches anchor sections via IntersectionObserver. */
export function ChapterNav({ chapters, title }: { chapters: ChapterRef[]; title?: string }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothScaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40, mass: 0.2 });
  const [showSticky, setShowSticky] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const shouldShow = Boolean(title) && latest > 0.06;
    if (showSticky !== shouldShow) {
      setShowSticky(shouldShow);
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  // Number keys jump straight to a chapter — this component renders once per page.
  useShortcuts(Object.fromEntries(chapters.map((c, i) => [String(i + 1), () => go(c.id)])));

  return (
    <>
      {/* Reading progress bar — under TopBar height */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px]">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-primary via-secondary to-primary"
          style={{ scaleX: reduced ? scrollYProgress : smoothScaleX }}
        />
      </div>

      {/* Condensed sticky title bar — fades in once the hero has scrolled away */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            key="chapter-sticky-title"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-subtle pointer-events-auto fixed inset-x-6 top-[88px] z-30 flex items-center justify-between gap-3 rounded-2xl px-4 py-2 lg:inset-x-10"
          >
            <span className="truncate font-display text-sm tracking-tight md:text-base">
              {title}
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
              aria-label="Back to top"
              className="press-scale tap-target grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-rail nav — desktop only */}
      <nav
        aria-label="Chapter navigation"
        className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
      >
        <ul className="pointer-events-auto space-y-2">
          {chapters.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  onClick={() => go(c.id)}
                  className="group flex items-center gap-3"
                  aria-current={active ? "true" : undefined}
                >
                  <span
                    className={`h-px transition-[width,background-color] duration-300 ${
                      active
                        ? "w-10 bg-primary"
                        : "w-5 bg-foreground/25 group-hover:w-8 group-hover:bg-foreground/60"
                    }`}
                  />
                  <span
                    className={`text-[11px] uppercase tracking-[0.22em] transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground/70 group-hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

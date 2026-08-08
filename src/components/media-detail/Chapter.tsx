import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { dur, ease } from "@/lib/motion";

export type ChapterTone =
  | "cinematic" // Story
  | "journal" // Memory
  | "essay" // Reflection
  | "diagram" // Connections
  | "timeline" // Journey
  | "technical"; // Archive

interface Props {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  tone?: ChapterTone;
  accent?: string;
  children: ReactNode;
}

/** Editorial chapter wrapper with per-tone visual personality.
 *  Tones tune max-width, numeral treatment, spacing, lighting, eyebrow style. */
export function Chapter({
  id,
  number,
  eyebrow,
  title,
  description,
  collapsible = false,
  defaultOpen = true,
  tone = "cinematic",
  accent,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const t = TONES[tone];

  return (
    <section id={id} className={`scroll-mt-28 ${t.pad}`}>
      {/* Soft lighting behind heading — cinematic + diagram only */}
      {t.lighting && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{
            width: "min(90vw, 1100px)",
            height: 320,
            marginTop: -120,
            background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${accent ?? "oklch(0.72 0.18 255 / 0.18)"}, transparent 65%)`,
            filter: "blur(20px)",
            position: "relative",
            zIndex: -1,
          }}
        />
      )}

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.7, ease: ease.reveal }}
        className={t.header}
      >
        <span aria-hidden className={t.numeral} style={accent ? { color: `${accent}` } : undefined}>
          {number}
        </span>
        <div className="min-w-0">
          <div className={t.eyebrow}>{eyebrow}</div>
          <h2 className={t.title}>{title}</h2>
          {description && <p className={t.desc}>{description}</p>}
        </div>
        {collapsible && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={`${id}-content`}
            className="press-scale glass-subtle inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            {open ? "Collapse" : "Read more"}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
              style={{
                transitionDuration: `${dur.large * 1000}ms`,
                transitionTimingFunction: `cubic-bezier(${ease.reveal.join(",")})`,
              }}
            />
          </button>
        )}
      </motion.header>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-content`}
            key="content"
            initial={collapsible ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: ease.reveal }}
            className="overflow-hidden"
          >
            <div className={`${t.body} ${t.spacing}`}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const TONES: Record<
  ChapterTone,
  {
    pad: string;
    header: string;
    numeral: string;
    eyebrow: string;
    title: string;
    desc: string;
    body: string;
    spacing: string;
    lighting?: boolean;
  }
> = {
  cinematic: {
    pad: "relative pt-28 md:pt-36",
    header:
      "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-6 border-b border-border/40 pb-7",
    numeral:
      "font-display text-[5.5rem] leading-[0.85] tracking-tighter text-foreground/10 md:text-[8rem]",
    eyebrow: "text-[10px] uppercase tracking-[0.32em] text-primary/85",
    title: "mt-3 font-display text-4xl tracking-tight md:text-6xl",
    desc: "mt-3 max-w-prose text-base text-foreground/70",
    body: "pt-14 md:pt-20",
    spacing: "space-y-20 md:space-y-24",
    lighting: true,
  },
  journal: {
    pad: "relative pt-24 md:pt-28",
    header:
      "relative mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-5 border-b border-amber-100/10 pb-6",
    numeral: "font-display italic text-4xl leading-none text-amber-100/20 md:text-5xl",
    eyebrow: "text-[10px] uppercase tracking-[0.28em] text-amber-200/70",
    title: "mt-2 font-display italic text-3xl tracking-tight md:text-4xl",
    desc: "mt-2 max-w-prose text-sm text-muted-foreground",
    body: "mx-auto max-w-3xl pt-10 md:pt-14",
    spacing: "space-y-14 md:space-y-16",
  },
  essay: {
    pad: "pt-24 md:pt-32",
    header:
      "mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-5 border-b border-border/30 pb-6",
    numeral: "font-display text-4xl leading-none text-foreground/15 md:text-5xl",
    eyebrow: "text-[10px] uppercase tracking-[0.32em] text-primary/85",
    title: "mt-2 font-display text-3xl tracking-tight md:text-5xl",
    desc: "mt-3 max-w-prose text-[15px] text-foreground/75",
    body: "mx-auto max-w-3xl pt-10 md:pt-14",
    spacing: "space-y-10 md:space-y-12",
  },
  diagram: {
    pad: "relative pt-24 md:pt-32",
    header:
      "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-6 border-b border-dashed border-border/40 pb-6",
    numeral: "font-mono text-3xl leading-none text-foreground/30 md:text-4xl",
    eyebrow: "font-mono text-[10px] uppercase tracking-[0.22em] text-primary/85",
    title: "mt-2 font-display text-3xl tracking-tight md:text-4xl",
    desc: "mt-2 max-w-prose text-sm text-muted-foreground",
    body: "pt-12 md:pt-16",
    spacing: "space-y-12",
    lighting: true,
  },
  timeline: {
    pad: "pt-24 md:pt-32",
    header:
      "grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-6 border-b border-border/40 pb-6",
    numeral: "font-display text-5xl leading-none text-foreground/15 md:text-6xl",
    eyebrow: "text-[10px] uppercase tracking-[0.28em] text-primary/85",
    title: "mt-2 font-display text-3xl tracking-tight md:text-4xl",
    desc: "mt-2 max-w-prose text-sm text-muted-foreground",
    body: "relative pt-12 md:pt-16",
    spacing: "space-y-16 md:space-y-20",
  },
  technical: {
    pad: "pt-20 md:pt-24",
    header:
      "grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-border/50 pb-4",
    numeral: "font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground/70",
    eyebrow: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80",
    title: "font-display text-2xl tracking-tight md:text-3xl",
    desc: "mt-1 max-w-prose text-xs text-muted-foreground",
    body: "pt-8",
    spacing: "space-y-8",
  },
};

import type { Variants, Transition } from "motion/react";

/* ============================================================
 * CHRONICLE — Motion Tokens
 * One source of truth for durations, easings, and shared
 * variants across the entire application.
 * ============================================================ */

/** Durations (seconds) — matches the spec in Prompt Pack 06. */
export const dur = {
  micro: 0.14,
  normal: 0.24,
  large: 0.36,
  page: 0.56,
} as const;

/** Easings — one consistent family. */
export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  reveal: [0.22, 1, 0.36, 1] as const,
  page: [0.65, 0, 0.35, 1] as const,
} as const;

/** Backwards-compatible alias used across the codebase. */
export const easeOut = ease.out;

/** Standard transitions. */
export const t = {
  micro: { duration: dur.micro, ease: ease.out } satisfies Transition,
  normal: { duration: dur.normal, ease: ease.out } satisfies Transition,
  large: { duration: dur.large, ease: ease.reveal } satisfies Transition,
  page: { duration: dur.page, ease: ease.page } satisfies Transition,
  spring: { type: "spring", stiffness: 380, damping: 32 } satisfies Transition,
  drawer: { type: "spring", stiffness: 280, damping: 30 } satisfies Transition,
  /** Snappier — for primary/high-emphasis hover feedback. */
  springSnappy: { type: "spring", stiffness: 480, damping: 28 } satisfies Transition,
  /** Softer — for secondary/glass-surface hover feedback. */
  springGentle: { type: "spring", stiffness: 220, damping: 26 } satisfies Transition,
} as const;

/* ----- Reveal variants ----- */

export const fadeBlurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 16 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.7, ease: ease.out } },
};

/** Blur-up image reveal — pair with an onLoad-gated `animate` state. */
export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.02, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: dur.large, ease: ease.out },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.large, ease: ease.out } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: dur.large, ease: ease.out } },
};

export const stagger = (delay = 0.06): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay, delayChildren: 0.08 } },
});

/** Index-based cascade — use on siblings that would otherwise share an identical
 *  `whileInView`. Caps the delay so long lists don't drag. */
export const cascade = (i: number, base = 0.04, cap = 8) => ({
  duration: dur.large,
  ease: ease.reveal,
  delay: Math.min(i, cap) * base,
});

/* ----- Interaction variants ----- */

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.015, transition: { duration: dur.large, ease: ease.out } },
};

export const hoverLift: Variants = {
  rest: { y: 0 },
  hover: { y: -2, transition: { duration: dur.normal, ease: ease.out } },
};

export const pressScale: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.98, transition: { duration: dur.micro, ease: ease.in } },
};

/* ----- Surfaces ----- */

export const tooltipIn: Variants = {
  hidden: { opacity: 0, y: 4, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: dur.normal, ease: ease.out } },
};

export const toastIn: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: dur.normal, ease: ease.out },
  },
};

export const modalIn: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: dur.large, ease: ease.out } },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: dur.normal, ease: ease.in } },
};

export const drawerSpring: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: t.drawer },
  exit: { x: "100%", transition: { duration: dur.normal, ease: ease.in } },
};

/* ----- Page transitions ----- */

export const pagePresence: Variants = {
  hidden: { opacity: 0, filter: "blur(2px)", scale: 0.995 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: dur.page, ease: ease.page },
  },
  exit: {
    opacity: 0,
    filter: "blur(2px)",
    scale: 0.995,
    transition: { duration: dur.normal, ease: ease.in },
  },
};

/** Reduced-motion alternative to pagePresence — opacity only, near-instant. */
export const pagePresenceReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.08 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};

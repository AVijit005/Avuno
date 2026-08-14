import { motion, useReducedMotion, type Variants } from "motion/react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BlurInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p" | "section";
}

/**
 * Blur-in entrance: opacity + slight rise + blur dissolve.
 * Honors the global MotionConfig reducedMotion setting.
 */
export function BlurIn({
  children,
  className,
  delay = 0,
  duration = 0.8,
  as = "div",
}: BlurInProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

/**
 * Scroll-triggered reveal (fade + rise) when the element enters the viewport.
 * Use for in-app grids, cards, and section headers.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 20,
  once = true,
}: ScrollRevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.08) => ({
    transition: { staggerChildren: stagger },
  }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Wrap a list of <StaggerItem> children to reveal them in a sequence as the
 * group scrolls into view.
 */
export function StaggerGroup({ children, className, stagger = 0.08 }: StaggerGroupProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <motion.div className={className} initial="hidden" animate="show" variants={container}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={container}
      custom={stagger}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      variants={reduced ? undefined : item}
      initial={reduced ? { opacity: 0 } : undefined}
      animate={reduced ? { opacity: 1 } : undefined}
    >
      {children}
    </motion.div>
  );
}

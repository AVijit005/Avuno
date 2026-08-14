import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
    >
      <div className="min-w-0">
        {eyebrow && <div className="text-eyebrow mb-1">{eyebrow}</div>}
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}

export function RevealSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      id={id}
      initial={reduced ? false : { opacity: 0, y: 26, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduced ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`mt-24 md:mt-28 ${className}`}
    >
      {children}
    </motion.section>
  );
}

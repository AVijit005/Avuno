import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ease } from "@/lib/motion";

interface Props {
  title?: string;
  description?: string;
  children: ReactNode;
  reverse?: boolean;
}

/** Wraps a chart with an informational side rail. */
export function ChartStory({ title, description, children, reverse }: Props) {
  const rail = (
    <motion.aside
      initial={{ opacity: 0, x: reverse ? 10 : -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: ease.out }}
      className="space-y-3 self-start lg:sticky lg:top-24"
    >
      {title && <h2 className="text-xl font-display text-foreground tracking-tight">{title}</h2>}
      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </motion.aside>
  );

  return (
    <div
      className={`grid items-start gap-8 lg:gap-12 ${reverse ? "lg:grid-cols-[1fr_minmax(260px,320px)]" : "lg:grid-cols-[minmax(260px,320px)_1fr]"}`}
    >
      {!reverse && rail}
      <div className="min-w-0">{children}</div>
      {reverse && rail}
    </div>
  );
}

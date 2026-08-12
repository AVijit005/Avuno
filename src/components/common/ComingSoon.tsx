import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function ComingSoon({
  eyebrow,
  title,
  description,
  preview,
}: {
  eyebrow: string;
  title: string;
  description: string;
  preview?: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="pt-2">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-elevated relative overflow-hidden rounded-4xl p-10 md:p-16"
      >
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-3 py-1 text-eyebrow">
            <Sparkles className="h-3 w-3 text-primary" /> {eyebrow}
          </div>
          <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">{title}</h1>
          <p className="mt-5 text-muted-foreground md:text-lg">{description}</p>
        </div>

        {preview && <div className="relative mt-10">{preview}</div>}
      </motion.div>
    </div>
  );
}

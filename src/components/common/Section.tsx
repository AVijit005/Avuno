import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mt-12 md:mt-16", className)}
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-2xl tracking-tight md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <PremiumGlass
      glow={accent ?? "oklch(0.72 0.18 255 / 0.35)"}
      className="p-5 cursor-pointer press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-4xl tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </PremiumGlass>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <PremiumGlass
      className="relative overflow-hidden p-10 text-center cursor-pointer press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
    >
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30">
        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-secondary animate-slow-float" />
      </div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </PremiumGlass>
  );
}

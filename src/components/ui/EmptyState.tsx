import { useTheme } from "@/hooks/use-theme";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useState, useEffect } from "react";
import { dur, ease } from "@/lib/motion";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  hint?: string;
  className?: string;
}
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  hint,
  className = "",
}: Props) {
  const reduced = useReducedMotion();
  const { isLight } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 12, filter: reduced ? "none" : "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: reduced ? "none" : "blur(0px)" }}
      transition={{ duration: reduced ? 0 : dur.large, ease: ease.out }}
      className={`glass relative grid place-items-center overflow-hidden rounded-[32px] px-8 py-14 text-center md:px-12 ${className}`}
    >
      {/* ambient glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-20 blur-2xl"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.18 255 / 0.35), transparent 65%)",
        }}
      />
      {icon && (
        <motion.div
          animate={reduced ? {} : { y: [0, -6, 0] }}
          transition={{ duration: reduced ? 0 : 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative grid h-16 w-16 place-items-center rounded-2xl text-primary ring-1"
          style={{
            backgroundColor: isLight ? "oklch(0 0 0 / 0.04)" : "oklch(1 0 0 / 0.04)",
            boxShadow: `inset 0 1px 0 ${isLight ? "oklch(0 0 0 / 0.08)" : "oklch(1 0 0 / 0.08)"}`,
            borderColor: isLight ? "oklch(0 0 0 / 0.1)" : "oklch(1 0 0 / 0.1)",
          }}
        >
          {icon}
        </motion.div>
      )}
      <h3 className="relative mt-5 font-display text-2xl tracking-tight">{title}</h3>
      {description && (
        <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
      {hint && (
        <p className="relative mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          {hint}
        </p>
      )}
    </motion.div>
  );
}

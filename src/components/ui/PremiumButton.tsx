import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Loader2, Check } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "ghost" | "icon";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  success?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  asChild?: boolean;
}

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs rounded-xl",
  md: "h-11 px-5 text-sm rounded-2xl",
  lg: "h-12 px-6 text-sm rounded-2xl",
};

export const PremiumButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      success,
      icon,
      className,
      children,
      asChild,
      ...rest
    },
    ref,
  ) => {
    const reduced = useReducedMotion();
    const stateKey = loading ? "loading" : success ? "success" : "icon";
    const base =
      "group relative inline-flex shrink-0 select-none items-center justify-center gap-2 font-medium transition-[transform,box-shadow,filter,background] duration-[var(--dur-normal)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:translate-y-[1px] active:duration-[var(--dur-micro)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden motion-reduce:transition-none motion-reduce:hover:translate-y-0";

    const variantClass: Record<Variant, string> = {
      primary:
        "bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-[1px]",
      secondary:
        "glass-subtle text-foreground hover:-translate-y-[1px] hover:shadow-[var(--shadow-ghost-hover)]",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
      icon: "h-11 w-11 p-0 rounded-2xl glass-subtle hover:bg-foreground/5 hover:text-primary",
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        {...rest}
        className={cn(base, variant !== "icon" && sizes[size], variantClass[variant], className)}
      >
        <span className="relative inline-flex items-center gap-2">
          <AnimatePresence initial={false}>
            <motion.span
              key={stateKey}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.75 }}
              transition={{ duration: reduced ? 0.1 : 0.18 }}
              className="inline-flex items-center"
              aria-live="polite"
              role="status"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <Check className="h-4 w-4" />
              ) : (
                icon
              )}
            </motion.span>
          </AnimatePresence>
          {children}
        </span>
      </Comp>
    );
  },
);
PremiumButton.displayName = "PremiumButton";

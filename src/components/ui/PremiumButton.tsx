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
      "group relative inline-flex shrink-0 select-none items-center justify-center gap-2 font-medium transition-[transform,box-shadow,filter,background] duration-[var(--dur-normal)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:translate-y-[1px] active:duration-[var(--dur-micro)] focus-ring overflow-hidden motion-reduce:transition-none motion-reduce:hover:translate-y-0";

    const variantClass: Record<Variant, string> = {
      primary:
        "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_oklch(0.72_0.18_255/0.6),inset_0_1px_0_oklch(1_1_1/0.2)] hover:bg-primary/90 hover:shadow-[0_6px_16px_-4px_oklch(0.72_0.18_255/0.7),inset_0_1px_0_oklch(1_1_1/0.25)] hover:-translate-y-[1px]",
      secondary:
        "glass text-foreground hover:bg-foreground/[0.08] hover:-translate-y-[1px] hover:shadow-md",
      ghost: "hover:bg-foreground/[0.08] hover:text-foreground",
      icon: "h-11 w-11 p-0 rounded-2xl glass-subtle hover:bg-foreground/[0.08] hover:text-primary active:scale-[0.95]",
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

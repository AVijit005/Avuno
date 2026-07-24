import { useTheme } from "@/hooks/use-theme";
import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef, useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

type Variant = "subtle" | "default" | "strong";

interface Props extends HTMLMotionProps<"div"> {
  variant?: Variant;
  reflection?: boolean;
  glow?: string; // oklch
  interactive?: boolean;
}

const variantClass: Record<Variant, string> = {
  subtle: "glass-subtle",
  default: "glass",
  strong: "glass-strong",
};

/**
 * Living Glass — pointer-tracked diagonal reflection + proximity border
 * illumination. The reflection slides with the cursor while hovering and
 * fades smoothly on leave. No layout work, only CSS variable writes; safe
 * on reduced-motion (the reflection simply never reveals).
 */
export const PremiumGlass = forwardRef<HTMLDivElement, Props>(
  (
    {
      variant = "default",
      reflection = true,
      glow,
      interactive = false,
      className,
      children,
      style,
      onPointerMove,
      onPointerLeave,
      onPointerEnter,
      ...rest
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const { isLight } = useTheme();

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    const handleMove = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        const el = innerRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          const px = ((e.clientX - r.left) / Math.max(1, r.width)) * 100;
          const py = ((e.clientY - r.top) / Math.max(1, r.height)) * 100;
          el.style.setProperty("--glass-px", `${px}%`);
          el.style.setProperty("--glass-py", `${py}%`);
        }
        onPointerMove?.(e);
      },
      [onPointerMove],
    );

    const handleEnter = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        innerRef.current?.style.setProperty("--glass-rev", "1");
        onPointerEnter?.(e);
      },
      [onPointerEnter],
    );

    const handleLeave = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        innerRef.current?.style.setProperty("--glass-rev", "0");
        onPointerLeave?.(e);
      },
      [onPointerLeave],
    );

    return (
      <motion.div
        ref={setRefs}
        {...rest}
        onPointerMove={handleMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        className={cn(
          "group/glass relative rounded-3xl",
          interactive && 
            "cursor-pointer transition-all duration-[300ms] ease-out hover:-translate-y-1 hover:shadow-[0_12px_24px_var(--glass-highlight),0_0_20px_color-mix(in_oklch,var(--primary),transparent_90%)] active:scale-[0.98]",
          className
        )}
        style={
          {
            ...style,
            borderColor: interactive ? (isLight ? "oklch(0 0 0 / 0.2)" : "oklch(1 0 0 / 0.2)") : undefined,
            ["--glass-px" as string]: "50%",
            ["--glass-py" as string]: "0%",
            ["--glass-rev" as string]: "0",
          } as React.CSSProperties
        }
      >
        {/* 2. ISOLATION / CLIPPING CONTAINER */}
        <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", variantClass[variant])}>
          
          {/* 3. ABSOLUTE REFLECTION LAYERS */}
          {/* outer highlight */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, ${isLight ? "oklch(0 0 0 / 0.35)" : "oklch(1 0 0 / 0.35)"}, transparent)`,
              opacity: interactive ? "calc(0.5 + var(--glass-rev)*0.5)" : "1"
            }}
          />
          
          {/* inner highlight + proximity border */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-[box-shadow] duration-[450ms] ease-out"
            style={{
              borderRadius: "inherit",
              boxShadow:
                `inset 0 -1px 0 ${isLight ? "oklch(1 0 0 / 0.25)" : "oklch(0 0 0 / 0.25)"}, inset 0 0 0 1px ${isLight ? "oklch(0 0 0 / calc(0.04 + var(--glass-rev)*0.06))" : "oklch(1 0 0 / calc(0.04 + var(--glass-rev)*0.06))"}`,
            }}
          />
          
          {/* artwork tint glow */}
          {glow && (
            <span
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{ background: glow }}
            />
          )}
          
          {/* Living diagonal reflection — follows pointer, fades on leave. */}
          {reflection && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-[600ms] ease-out mix-blend-screen"
                style={{
                  borderRadius: "inherit",
                  opacity: "calc(var(--glass-rev)*0.65)",
                  background:
                    "radial-gradient(420px circle at var(--glass-px) var(--glass-py), color-mix(in oklch, var(--primary), transparent 85%), transparent 60%)"
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-[700ms] ease-out mix-blend-overlay"
                style={{
                  borderRadius: "inherit",
                  opacity: "calc(var(--glass-rev)*0.5)",
                  background:
                    `linear-gradient(125deg, transparent calc(var(--glass-px) - 22%), ${isLight ? "oklch(0 0 0 / 0.08)" : "oklch(1 0 0 / 0.08)"} var(--glass-px), transparent calc(var(--glass-px) + 22%))`
                }}
              />
            </>
          )}
        </div>
        
        {/* 4. CONTENT LAYER */}
        <div className="relative z-10 h-full w-full">
          {children as React.ReactNode}
        </div>
      </motion.div>
    );
  },
);
PremiumGlass.displayName = "PremiumGlass";

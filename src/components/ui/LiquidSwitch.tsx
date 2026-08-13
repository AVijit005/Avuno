import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LiquidSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function LiquidSwitch({
  checked,
  onChange,
  className,
  disabled = false,
}: LiquidSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative shrink-0 outline-none select-none rounded-full transition-[box-shadow] duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Track */}
      <motion.div
        className="relative flex items-center rounded-full"
        style={{
          width: 36,
          height: 21,
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
        animate={{
          backgroundColor: checked
            ? "var(--primary)"         // app's primary color
            : "oklch(0.5 0 0 / 0.15)", // glass grey
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glass gloss overlay on track */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 60%)",
          }}
        />

        {/* Thumb */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 15,
            height: 15,
            top: 3,
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(230,230,235,0.9) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.22), 0 0.5px 1px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.9)",
          }}
          animate={{ left: checked ? 36 - 15 - 3 : 3 }}

          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.6,
          }}
        />
      </motion.div>
    </button>
  );
}

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { dur, ease } from "@/lib/motion";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  icon?: ReactNode;
  error?: string;
  helperText?: string;
}

/**
 * Premium authentication input component following Phase 14 Liquid Glass principles.
 * - Glass-subtle material with proper blur
 * - Refined focus states
 * - Accessible keyboard navigation
 * - Password visibility toggle
 * - Progressive validation feedback
 */
export const PremiumInput = forwardRef<HTMLInputElement, Props>(function PremiumInput(
  { label, icon, error, helperText, id, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? `premium-input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const isPassword = rest.type === "password";
  const currentType = isPassword && showPassword ? "text" : rest.type;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {/* Label */}
      <motion.label
        htmlFor={inputId}
        className="mb-2 block text-[10.5px] font-medium uppercase tracking-[0.32em]"
        animate={{
          color: hasError
            ? "oklch(0.66 0.22 18)"
            : focused
              ? "oklch(0.72 0.18 255)"
              : "oklch(0.68 0.012 270 / 0.7)",
        }}
        transition={{ duration: dur.micro, ease: ease.out }}
      >
        {label}
      </motion.label>

      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <motion.div
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2"
            animate={{
              color: hasError
                ? "oklch(0.66 0.22 18 / 0.8)"
                : focused
                  ? "oklch(0.72 0.18 255 / 0.9)"
                  : "oklch(0.68 0.012 270 / 0.4)",
            }}
            transition={{ duration: dur.micro, ease: ease.out }}
          >
            {icon}
          </motion.div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          {...rest}
          type={currentType}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`
            relative z-0 h-[54px] w-full rounded-2xl
            border transition-[border-color,background-color,box-shadow]
            text-[15px] font-normal tracking-wide
            text-[oklch(0.97_0.005_270)]
            placeholder:text-[oklch(0.68_0.012_270_/_0.35)]
            focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-60
            ${icon ? "pl-12" : "pl-5"}
            ${isPassword ? "pr-12" : "pr-5"}
          `}
          style={{
            background: focused ? "oklch(0.2 0.013 270 / 0.5)" : "oklch(0.18 0.014 270 / 0.4)",
            borderColor: hasError
              ? "oklch(0.66 0.22 18 / 0.4)"
              : focused
                ? "oklch(0.72 0.18 255 / 0.4)"
                : "oklch(1 0 0 / 0.08)",
            boxShadow: focused
              ? hasError
                ? "0 0 0 3px oklch(0.66 0.22 18 / 0.12), inset 0 1px 0 oklch(1 0 0 / 0.08)"
                : "0 0 0 3px oklch(0.72 0.18 255 / 0.12), inset 0 1px 0 oklch(1 0 0 / 0.08)"
              : "inset 0 1px 0 oklch(1 0 0 / 0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-[oklch(0.68_0.012_270_/_0.5)] transition-colors hover:bg-white/5 hover:text-[oklch(0.68_0.012_270_/_0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.18_255_/_0.3)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Error or helper text */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: dur.micro, ease: ease.out }}
            className="mt-1.5 pl-5 text-[12px] tracking-wide text-[oklch(0.66_0.22_18)]"
          >
            {error}
          </motion.p>
        ) : helperText ? (
          <motion.p
            key="helper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 pl-5 text-[11.5px] tracking-wide text-[oklch(0.68_0.012_270_/_0.6)]"
          >
            {helperText}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

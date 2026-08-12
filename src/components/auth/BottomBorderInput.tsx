import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  success?: boolean;
}

export const BottomBorderInput = forwardRef<HTMLInputElement, Props>(function BottomBorderInput(
  { label, icon, error, success, id, className, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? `bb-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const isPassword = rest.type === "password";
  const currentType = isPassword && showPassword ? "text" : rest.type;

  const isError = Boolean(error);

  return (
    <div className={className}>
      {/* Label */}
      <motion.label
        htmlFor={inputId}
        className="mb-2 block text-[10px] uppercase tracking-[0.30em]"
        animate={{
          color: isError
            ? "rgba(252,165,165,0.85)"
            : focused
              ? "rgba(190,182,255,0.95)"
              : hovered
                ? "rgba(255,255,255,0.55)"
                : "rgba(255,255,255,0.38)",
        }}
        transition={{ duration: 0.25 }}
      >
        {label}
      </motion.label>

      <motion.div
        className="relative flex items-center w-full"
        animate={isError ? { x: [0, -5, 5, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Icon */}
        {icon && (
          <motion.span
            className="absolute left-5 z-10 flex-shrink-0 pointer-events-none"
            animate={{
              color: isError
                ? "rgba(252,165,165,0.75)"
                : focused
                  ? "rgba(190,182,255,0.92)"
                  : "rgba(255,255,255,0.28)",
            }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.span>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          {...(rest as object)}
          type={currentType}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholder={`Enter ${label.toLowerCase()}`}
          className={`login-input-field relative z-0 flex-1 w-full h-[52px] rounded-full text-base tracking-wide placeholder:text-white/20 transition-[padding,border-color] ${icon ? "pl-12" : "pl-5"} ${success ? "pr-12" : "pr-5"}`}
          style={{
            caretColor: "#b0a8ff",
            ...(isError ? { borderColor: "rgba(252,165,165,0.5)" } : {}),
          }}
        />

        {/* Success */}
        <AnimatePresence>
          {success && !isPassword && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-5 z-10 flex-shrink-0 text-emerald-300/90 pointer-events-none"
            >
              <Check className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 z-10 flex h-6 w-6 items-center justify-center rounded-md text-white/40 hover:text-white/80 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-1.5 pl-5 text-[11px] tracking-wide"
            style={{ color: "rgba(252,165,165,0.85)" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

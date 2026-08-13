import { createFileRoute, Link, useNavigate, Outlet, useMatchRoute } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { analytics } from "@/lib/analytics";
import { API_BASE_URL } from "@/lib/api/constants";
import { ArchiveVisual } from "@/components/auth/ArchiveVisual";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Enter Avuno — your personal media archive" },
      {
        name: "description",
        content: "Sign in to Avuno. Your personal media archive — connected.",
      },
    ],
  }),
  component: AuthLayout,
});

// ── Schemas ──────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(12, "At least 12 characters"),
    confirmPassword: z.string().min(12, "At least 12 characters"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignIn = z.infer<typeof signInSchema>;
type SignUp = z.infer<typeof signUpSchema>;
type Mode = "signin" | "signup";
type Status = "idle" | "loading" | "success" | "error";

// ── Route layout ──────────────────────────────────────────────────────────────

function AuthLayout() {
  const matchRoute = useMatchRoute();
  const isChildRoute =
    matchRoute({ to: "/auth/callback" }) ||
    matchRoute({ to: "/auth/forgot-password" }) ||
    matchRoute({ to: "/auth/reset-password" });

  if (isChildRoute) return <Outlet />;
  return <AuthPage />;
}

// ── Password strength ─────────────────────────────────────────────────────────

function calcStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

// ── Main Auth Page ────────────────────────────────────────────────────────────

function AuthPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const pending = timeoutRefs.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const safeTimeout = (cb: () => void, ms: number) => {
    const id = setTimeout(cb, ms);
    timeoutRefs.current.push(id);
  };

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const signIn = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });
  const signUp = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (mode !== "signup") return;
    const sub = signUp.watch((v) => setPasswordStrength(v.password ? calcStrength(v.password) : 0));
    return () => sub.unsubscribe();
  }, [mode, signUp]);

  const onSubmit = async (data: SignIn | SignUp) => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      if (mode === "signin") {
        const v = data as SignIn;
        const user = await loginMutation.mutateAsync({ email: v.email, password: v.password });
        analytics.identify(user.user.id);
        setStatus("success");
        safeTimeout(() => navigate({ to: "/app" }), 500);
      } else {
        const v = data as SignUp;
        await registerMutation.mutateAsync({
          email: v.email,
          password: v.password,
          name: v.fullName,
        });
        try {
          const user = await loginMutation.mutateAsync({ email: v.email, password: v.password });
          analytics.identify(user.user.id);
          analytics.track("signup");
          setStatus("success");
          safeTimeout(() => navigate({ to: "/app" }), 500);
        } catch (loginErr: unknown) {
          const e = loginErr as { message?: string; status?: number };
          analytics.track("signup");
          setStatus("success");
          if (e?.message === "Email not verified" || e?.status === 403) {
            setErrorMessage("Account created! Please check your email to verify.");
          } else {
            setErrorMessage("Account created! Please sign in.");
          }
          safeTimeout(() => {
            setStatus("idle");
            switchMode("signin");
          }, 4000);
        }
      }
    } catch (err: unknown) {
      setStatus("error");
      const e = err as { message?: string; status?: number };
      let msg = "Something went wrong. Please try again.";
      if (e.status === 401) msg = "Email or password is incorrect.";
      else if (e.status === 429)
        msg = "Too many attempts. Please wait a moment before trying again.";
      else if (e.status === 403 && e.message?.includes("verified"))
        msg = "Please verify your email before signing in.";
      else if (e.status === 409) msg = "An account with this email already exists.";
      else if (e.message?.includes("network") || e.message?.includes("fetch"))
        msg = "We couldn't reach Avuno. Check your connection and try again.";
      else if (e.message) msg = e.message;
      setErrorMessage(msg);
      safeTimeout(() => setStatus("idle"), 5000);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setStatus("idle");
    setErrorMessage(null);
    setPasswordStrength(0);
  };

  return (
    <div
      className="flex min-h-[100dvh] w-full"
      style={{ background: "oklch(0.08 0.02 270)", color: "oklch(0.97 0.005 270)" }}
    >
      {/* ─── LEFT: Archive Visual ─────────────────────────────────── */}
      <div
        className="relative hidden flex-col lg:flex"
        style={{ width: "54%", flexShrink: 0, borderRight: "1px solid oklch(1 0 0 / 0.04)" }}
      >
        <ArchiveVisual />

        {/* Logo — absolute top-left over the visual */}
        <div className="absolute left-10 top-8 z-10 flex items-center gap-2.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.18_255)] rounded-lg"
          >
            <div
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{
                background: "linear-gradient(145deg, oklch(0.58 0.26 292), oklch(0.55 0.24 218))",
                boxShadow:
                  "0 0 0 1px oklch(1 0 0 / 0.12), 0 4px 12px -4px oklch(0.58 0.26 268 / 0.5)",
              }}
            >
              <span className="font-display text-base font-bold leading-none text-white">A</span>
            </div>
            <span className="font-display text-xl tracking-tight text-white">Avuno</span>
          </Link>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-8 left-10 z-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 1.0 }}
            className="text-[11px] tracking-[0.18em] uppercase"
            style={{ color: "oklch(0.68 0.012 270 / 0.55)" }}
          >
            Your media. Your journal. Your story.
          </motion.p>
        </div>
      </div>

      {/* ─── RIGHT: Form Panel ───────────────────────────────────────── */}
      <div
        className="relative flex w-full flex-1 flex-col overflow-y-auto"
        style={{ background: "oklch(0.09 0.018 270)" }}
      >
        {/* Subtle top-left ambient inside form panel */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-[40%] w-[60%]"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, oklch(0.45 0.18 255 / 0.06) 0%, transparent 70%)",
          }}
        />

        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 px-6 pt-8 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.18_255)] rounded-lg"
          >
            <div
              className="grid h-7 w-7 place-items-center rounded-lg"
              style={{
                background: "linear-gradient(145deg, oklch(0.58 0.26 292), oklch(0.55 0.24 218))",
              }}
            >
              <span className="font-display text-sm font-bold leading-none text-white">A</span>
            </div>
            <span className="font-display text-lg tracking-tight">Avuno</span>
          </Link>
        </div>

        {/* Form content — vertically centered */}
        <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[400px]">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: reduced ? 0 : 0.22 }}
                >
                  <h1
                    className="font-display text-[2rem] leading-[1.1] tracking-tight lg:text-[2.2rem]"
                    style={{ color: "oklch(0.97 0.005 270)" }}
                  >
                    {mode === "signin" ? "Welcome back." : "Join Avuno."}
                  </h1>
                  <p
                    className="mt-2 text-[13px] leading-relaxed"
                    style={{ color: "oklch(0.68 0.012 270)" }}
                  >
                    {mode === "signin"
                      ? "Enter your archive."
                      : "Start building your personal media archive."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Mode switcher */}
            <motion.div
              className="mt-7"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <AuthModeSwitcher mode={mode} onChange={switchMode} />
            </motion.div>

            {/* Google OAuth */}
            <motion.div
              className="mt-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <GoogleButton />
            </motion.div>

            {/* Divider */}
            <motion.div
              className="my-5 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.16 }}
            >
              <div className="h-px flex-1" style={{ background: "oklch(1 0 0 / 0.07)" }} />
              <span
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "oklch(0.68 0.012 270 / 0.5)" }}
              >
                or continue with email
              </span>
              <div className="h-px flex-1" style={{ background: "oklch(1 0 0 / 0.07)" }} />
            </motion.div>

            {/* Error banner */}
            <AnimatePresence>
              {errorMessage && status === "error" && <AuthErrorBanner message={errorMessage} />}
            </AnimatePresence>

            {/* Success info (account created) */}
            <AnimatePresence>
              {errorMessage && status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 flex items-start gap-3 rounded-xl border p-4 text-[13px]"
                  style={{
                    borderColor: "oklch(0.72 0.16 160 / 0.25)",
                    background: "oklch(0.72 0.16 160 / 0.05)",
                    color: "oklch(0.72 0.16 160)",
                  }}
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <AnimatePresence mode="wait">
                {mode === "signin" ? (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={signIn.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                  >
                    <AuthInput
                      label="Email"
                      type="email"
                      autoComplete="email"
                      error={signIn.formState.errors.email?.message}
                      {...signIn.register("email")}
                    />
                    <AuthInput
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      error={signIn.formState.errors.password?.message}
                      {...signIn.register("password")}
                    />
                    <div className="flex justify-end pt-1">
                      <Link
                        to="/auth/forgot-password"
                        className="text-[11.5px] transition-colors focus-visible:outline-none focus-visible:underline"
                        style={{ color: "oklch(0.68 0.012 270 / 0.6)" }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="pt-2">
                      <AuthCTAButton status={status} label="Continue" />
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={signUp.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                  >
                    <AuthInput
                      label="Full Name"
                      type="text"
                      autoComplete="name"
                      error={signUp.formState.errors.fullName?.message}
                      {...signUp.register("fullName")}
                    />
                    <AuthInput
                      label="Email"
                      type="email"
                      autoComplete="email"
                      error={signUp.formState.errors.email?.message}
                      {...signUp.register("email")}
                    />
                    <div>
                      <AuthInput
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        error={signUp.formState.errors.password?.message}
                        helperText={
                          !signUp.formState.errors.password?.message
                            ? "At least 12 characters"
                            : undefined
                        }
                        {...signUp.register("password")}
                      />
                      {/* Password strength */}
                      <AnimatePresence>
                        {passwordStrength > 0 && !signUp.formState.errors.password?.message && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 overflow-hidden"
                          >
                            <PasswordStrength strength={passwordStrength} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AuthInput
                      label="Confirm Password"
                      type="password"
                      autoComplete="new-password"
                      error={signUp.formState.errors.confirmPassword?.message}
                      {...signUp.register("confirmPassword")}
                    />
                    <div className="pt-2">
                      <AuthCTAButton status={status} label="Begin Chronicle" />
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Footer */}
            <motion.p
              className="mt-8 text-center text-[11px]"
              style={{ color: "oklch(0.68 0.012 270 / 0.35)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.4 }}
            >
              By continuing you agree to our{" "}
              <Link
                to="/terms"
                className="underline underline-offset-2 transition-colors"
                style={{ color: "oklch(0.68 0.012 270 / 0.55)" }}
              >
                Terms
              </Link>{" "}
              &{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-2 transition-colors"
                style={{ color: "oklch(0.68 0.012 270 / 0.55)" }}
              >
                Privacy
              </Link>
              .
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Auth Mode Switcher ────────────────────────────────────────────────────────

function AuthModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Authentication mode"
      className="relative flex w-full rounded-xl p-[3px]"
      style={{
        background: "oklch(1 0 0 / 0.03)",
        border: "1px solid oklch(1 0 0 / 0.07)",
      }}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute bottom-[3px] top-[3px] w-[calc(50%-3px)] rounded-[9px]"
        animate={{ left: mode === "signin" ? "3px" : "calc(50%)" }}
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
        style={{
          background: "oklch(0.18 0.016 270)",
          boxShadow: "0 2px 8px oklch(0 0 0 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.06)",
        }}
      />
      <button
        role="tab"
        aria-selected={mode === "signin"}
        type="button"
        onClick={() => onChange("signin")}
        className="relative z-10 w-1/2 rounded-[9px] py-2.5 text-[12.5px] font-medium transition-colors duration-200"
        style={{
          color: mode === "signin" ? "oklch(0.97 0.005 270)" : "oklch(0.68 0.012 270 / 0.55)",
        }}
      >
        Sign in
      </button>
      <button
        role="tab"
        aria-selected={mode === "signup"}
        type="button"
        onClick={() => onChange("signup")}
        className="relative z-10 w-1/2 rounded-[9px] py-2.5 text-[12.5px] font-medium transition-colors duration-200"
        style={{
          color: mode === "signup" ? "oklch(0.97 0.005 270)" : "oklch(0.68 0.012 270 / 0.55)",
        }}
      >
        Create Account
      </button>
    </div>
  );
}

// ── Google Button ─────────────────────────────────────────────────────────────

function GoogleButton() {
  return (
    <motion.button
      type="button"
      onClick={() => {
        window.location.href = `${API_BASE_URL}/auth/google`;
      }}
      className="group flex w-full items-center justify-center gap-3 rounded-xl py-3 text-[13px] font-medium transition-colors"
      style={{
        background: "oklch(1 0 0 / 0.03)",
        border: "1px solid oklch(1 0 0 / 0.08)",
        color: "oklch(0.90 0.005 270)",
      }}
      whileHover={{ scale: 1.008 }}
      whileTap={{ scale: 0.995 }}
      onHoverStart={(e) => {
        (e.target as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.15)";
        (e.target as HTMLElement).style.background = "oklch(1 0 0 / 0.05)";
      }}
      onHoverEnd={(e) => {
        (e.target as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.08)";
        (e.target as HTMLElement).style.background = "oklch(1 0 0 / 0.03)";
      }}
    >
      <GoogleColorIcon />
      Continue with Google
    </motion.button>
  );
}

// ── Auth Input ────────────────────────────────────────────────────────────────

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, type = "text", id, ...props }, ref) => {
    const inputId = id ?? `auth-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div>
        <div
          className="relative overflow-hidden rounded-xl transition-all duration-150"
          style={{
            background: "oklch(1 0 0 / 0.02)",
            border: error
              ? "1px solid oklch(0.66 0.22 18 / 0.45)"
              : focused
                ? "1px solid oklch(0.72 0.18 255 / 0.45)"
                : "1px solid oklch(1 0 0 / 0.09)",
            boxShadow:
              focused && !error
                ? "0 0 0 3px oklch(0.72 0.18 255 / 0.06)"
                : error
                  ? "0 0 0 3px oklch(0.66 0.22 18 / 0.06)"
                  : "none",
          }}
        >
          <label
            htmlFor={inputId}
            className="block px-4 pt-3 text-[10px] font-medium uppercase tracking-[0.1em]"
            style={{ color: error ? "oklch(0.66 0.22 18 / 0.8)" : "oklch(0.68 0.012 270 / 0.7)" }}
          >
            {label}
          </label>
          <div className="flex items-center">
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              className="w-full bg-transparent px-4 pb-3 pt-1 text-[14.5px] outline-none"
              style={{ color: "oklch(0.97 0.005 270)" }}
              aria-label={label}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined
              }
              onFocus={(e) => {
                setFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                props.onBlur?.(e);
              }}
              {...props}
            />
            {isPassword && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-colors"
                style={{ color: "oklch(0.68 0.012 270 / 0.5)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-[15px] w-[15px]" />
                ) : (
                  <Eye className="h-[15px] w-[15px]" />
                )}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.p
              id={`${inputId}-error`}
              role="alert"
              key="error"
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-1.5 flex items-center gap-1.5 px-1 text-[11px]"
              style={{ color: "oklch(0.66 0.22 18)" }}
            >
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
              {error}
            </motion.p>
          ) : helperText ? (
            <motion.p
              id={`${inputId}-hint`}
              key="hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-1.5 px-1 text-[11px]"
              style={{ color: "oklch(0.68 0.012 270 / 0.5)" }}
            >
              {helperText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";

// ── Password Strength ─────────────────────────────────────────────────────────

function PasswordStrength({ strength }: { strength: number }) {
  const label = strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : strength <= 4 ? "Good" : "Strong";
  const segmentColor =
    strength <= 2
      ? "oklch(0.66 0.22 18)"
      : strength <= 3
        ? "oklch(0.82 0.16 80)"
        : "oklch(0.72 0.16 160)";

  return (
    <div className="px-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-full"
            style={{ background: "oklch(1 0 0 / 0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              animate={{
                width: i < strength ? "100%" : "0%",
                backgroundColor: segmentColor,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <p
        className="mt-1.5 text-[11px]"
        style={{
          color: strength <= 2 ? "oklch(0.66 0.22 18 / 0.8)" : "oklch(0.68 0.012 270 / 0.55)",
        }}
      >
        {label} password
      </p>
    </div>
  );
}

// ── Auth CTA Button ───────────────────────────────────────────────────────────

function AuthCTAButton({ status, label }: { status: Status; label: string }) {
  const isDisabled = status === "loading" || status === "success";
  return (
    <motion.button
      type="submit"
      disabled={isDisabled}
      className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl py-3.5 text-[14px] font-medium tracking-wide"
      style={{
        background: isDisabled ? "oklch(0.85 0.005 270)" : "oklch(0.97 0.005 270)",
        color: "oklch(0.10 0.015 270)",
        boxShadow: isDisabled
          ? "none"
          : "0 1px 0 oklch(1 0 0 / 0.7) inset, 0 8px 20px -8px oklch(1 0 0 / 0.15)",
        transition: "background 150ms ease, box-shadow 150ms ease, opacity 150ms ease",
        opacity: isDisabled && status !== "success" ? 0.7 : 1,
      }}
      whileHover={!isDisabled ? { scale: 1.012 } : undefined}
      whileTap={!isDisabled ? { scale: 0.988 } : undefined}
    >
      {/* Shimmer on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-[100%] w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[200%] group-hover:opacity-100"
      />
      <AnimatePresence mode="wait">
        {(status === "idle" || status === "error") && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2"
          >
            {label}
            <ArrowRight
              className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </motion.span>
        )}
        {status === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Authenticating…
          </motion.span>
        )}
        {status === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2"
          >
            <Check className="h-4 w-4" aria-hidden />
            Welcome
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Error Banner ──────────────────────────────────────────────────────────────

function AuthErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      role="alert"
      aria-live="polite"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="mb-5 flex items-start gap-3 rounded-xl border p-4 text-[13px] leading-relaxed"
      style={{
        borderColor: "oklch(0.66 0.22 18 / 0.25)",
        background: "oklch(0.66 0.22 18 / 0.05)",
        color: "oklch(0.75 0.12 18)",
      }}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{message}</p>
    </motion.div>
  );
}

// ── Google Color Icon ─────────────────────────────────────────────────────────

function GoogleColorIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// Export for re-use across auth sub-pages
export { AuthInput, AuthCTAButton, AuthErrorBanner, GoogleColorIcon };

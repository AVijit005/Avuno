import { createFileRoute, Link, useNavigate, Outlet, useMatchRoute } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { analytics } from "@/lib/analytics";
import { API_BASE_URL } from "@/lib/api/constants";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";

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
    <div className="relative min-h-[100dvh] w-full grid lg:grid-cols-2 selection:bg-primary/30">
      {/* Left Column (Brand Narrative) - Hidden on mobile */}
      <div className="hidden lg:flex relative flex-col justify-center px-12 xl:px-20 overflow-hidden bg-background">
        <AtmosphereBackground showParticles={true} intensity="vivid" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[120px] w-[600px] h-[400px] pointer-events-none" />

        <div className="relative z-10 max-w-lg">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg mb-16"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-button)]">
              <span className="font-display text-base font-bold leading-none">A</span>
            </div>
            <span className="font-display text-xl tracking-tight text-foreground">Avuno</span>
          </Link>

          <h1 className="font-display text-4xl xl:text-5xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
            A quiet place to remember every story{" "}
            <span className="text-gradient-aurora">you've lived.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Track your movies, books, games, and shows in one unified library. Journal your
            thoughts, map your timeline, and discover your patterns.
          </p>

          <ul className="space-y-4">
            {["Private by design", "No ads, ever", "Free forever for core features"].map(
              (bullet, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-foreground/80 font-medium"
                >
                  <div className="rounded-full bg-primary/20 p-1">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {bullet}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex flex-col justify-center items-center px-4 py-12 lg:px-12 relative">
        {/* Mobile background fallback */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none z-0">
          <AtmosphereBackground showParticles={true} intensity="soft" />
        </div>

        {/* Mobile top logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-20 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-button)]">
              <span className="font-display text-base font-bold leading-none">A</span>
            </div>
            <span className="font-display text-xl tracking-tight text-foreground">Avuno</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] relative z-10 mt-12 lg:mt-0"
        >
          <div className="glass-elevated rounded-[2rem] p-8 sm:p-10 card-interactive">
            <div className="flex flex-col items-center text-center space-y-2 mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <h1 className="font-display text-3xl font-medium tracking-tight">
                    {mode === "signin" ? "Welcome back" : "Join Avuno"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {mode === "signin"
                      ? "Enter your personal archive."
                      : "Start tracking your stories."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <AuthModeSwitcher mode={mode} onChange={switchMode} />

            <div className="mt-8">
              <GoogleButton />
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-foreground/[0.08]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                or continue with email
              </span>
              <div className="h-px flex-1 bg-foreground/[0.08]" />
            </div>

            <AnimatePresence>
              {errorMessage && status === "error" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-[13px] text-destructive overflow-hidden"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </motion.div>
              )}
              {errorMessage && status === "success" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-[13px] text-primary overflow-hidden"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <AnimatePresence mode="wait">
                {mode === "signin" ? (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
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
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="pt-2">
                      <PremiumButton
                        type="submit"
                        variant="primary"
                        className="w-full h-12"
                        loading={status === "loading"}
                        success={status === "success"}
                        icon={
                          status === "idle" || status === "error" ? (
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          ) : undefined
                        }
                      >
                        {status === "idle" || status === "error" ? "Continue" : ""}
                      </PremiumButton>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
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
                        {...signUp.register("password")}
                      />
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
                      <PremiumButton
                        type="submit"
                        variant="primary"
                        className="w-full h-12"
                        loading={status === "loading"}
                        success={status === "success"}
                        icon={
                          status === "idle" || status === "error" ? (
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          ) : undefined
                        }
                      >
                        {status === "idle" || status === "error" ? "Begin Chronicle" : ""}
                      </PremiumButton>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Links */}
          <motion.p
            className="mt-8 text-center text-[11px] text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            By continuing you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Terms
            </Link>{" "}
            &{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            .
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Shared UI Components ────────────────────────────────────────────────────────

function AuthModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="relative flex w-full rounded-[14px] bg-foreground/[0.04] border border-foreground/[0.08] p-1">
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[10px] bg-background shadow-sm border border-foreground/[0.05]"
        animate={{ left: mode === "signin" ? "4px" : "calc(50%)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => onChange("signin")}
        className={cn(
          "relative z-10 w-1/2 rounded-[10px] py-2 text-xs font-medium transition-colors",
          mode === "signin" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onChange("signup")}
        className={cn(
          "relative z-10 w-1/2 rounded-[10px] py-2 text-xs font-medium transition-colors",
          mode === "signup" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Create Account
      </button>
    </div>
  );
}

function GoogleButton() {
  return (
    <PremiumButton
      variant="secondary"
      className="w-full h-11 bg-foreground/[0.03] border-foreground/[0.08] hover:bg-foreground/[0.06] hover:border-foreground/[0.12]"
      onClick={() => {
        window.location.href = `${API_BASE_URL}/auth/google`;
      }}
    >
      <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24">
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
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </PremiumButton>
  );
}

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
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            placeholder={label}
            className={cn(
              "h-12 w-full rounded-xl border bg-foreground/[0.04] px-4 text-sm transition-[border-color,box-shadow,background-color] duration-[140ms] ease-out placeholder:text-transparent",
              error
                ? "border-destructive/50 focus:border-destructive/70 focus:ring-2 focus:ring-destructive/30"
                : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05] focus:border-ring/50 focus:ring-2 focus:ring-ring/30 focus:bg-foreground/[0.05]",
              "peer",
            )}
            aria-invalid={!!error}
            {...props}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-all duration-[200ms] ease-out pointer-events-none",
              focused || props.value
                ? "-translate-y-[28px] text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-background px-1 left-3"
                : "text-muted-foreground/70",
            )}
          >
            {label}
          </label>
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 flex items-center gap-1.5 px-1 text-[11px] text-destructive"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";

function PasswordStrength({ strength }: { strength: number }) {
  const label = strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : strength <= 4 ? "Good" : "Strong";
  const segmentColor =
    strength <= 2 ? "bg-destructive" : strength <= 3 ? "bg-amber-500" : "bg-primary";

  return (
    <div className="px-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/[0.08]">
            <motion.div
              className={cn("h-full rounded-full", segmentColor)}
              animate={{ width: i < strength ? "100%" : "0%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{label} password</p>
    </div>
  );
}

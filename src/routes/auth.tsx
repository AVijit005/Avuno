import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Lock, Mail, Check, Loader as Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { AuthStage } from "@/components/auth/AuthStage";
import { MobileMemoryHero } from "@/components/auth/MobileMemoryHero";
import { BottomBorderInput } from "@/components/auth/BottomBorderInput";
import { LiquidGlassCard } from "@/components/auth/LiquidGlassCard";
import { ParticleBurst } from "@/components/auth/ParticleBurst";
import { useMouseParallax } from "@/lib/useParallax";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { analytics } from "@/lib/analytics";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Enter Chronicle — the portal" },
      {
        name: "description",
        content: "Sign in to Chronicle. Pick up your story where you left it.",
      },
    ],
  }),
  component: Auth,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  remember: z.boolean().optional(),
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

/* ── Stagger variants ── */
const cardContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.55 } },
};
const cardLine = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};



function Auth() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { x: ax, y: ay } = useMouseParallax(18);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  // Forms
  const signIn = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", remember: false },
  });
  const signUp = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      if (mode === "signin") {
        const values = signIn.getValues();
        const user = await loginMutation.mutateAsync({
          email: values.email,
          password: values.password,
        });
        analytics.identify(user.user.id);
        setStatus("success");
        setTimeout(() => navigate({ to: "/app" }), 700);
      } else {
        const values = signUp.getValues();
        await registerMutation.mutateAsync({
          email: values.email,
          password: values.password,
          name: values.fullName,
        });
        
        // Automatically log the user in after successful registration
        const user = await loginMutation.mutateAsync({
          email: values.email,
          password: values.password,
        });
        
        analytics.identify(user.user.id);
        analytics.track("signup");
        setStatus("success");
        setTimeout(() => navigate({ to: "/app" }), 700);
      }
    } catch (err: unknown) {
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setStatus("idle");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[oklch(0.08_0.02_270)]">
      <AtmosphereBackground intensity="vivid" />

      {/* Full-canvas memory stage */}
      <div className="absolute inset-0">
        <AuthStage />
      </div>

      {/* Mobile memory hero */}
      <MobileMemoryHero />

      {/* === AURORA HALO behind card === */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] top-1/2 z-[2] hidden h-[900px] w-[900px] -translate-y-1/2 rounded-full lg:block"
        style={{
          background:
            "radial-gradient(circle, oklch(0.52 0.24 290 / 0.32) 0%, oklch(0.60 0.22 240 / 0.20) 35%, transparent 68%)",
          filter: "blur(90px)",
          x: reduced ? 0 : (ax as never),
          y: reduced ? 0 : (ay as never),
        }}
        animate={
          reduced
            ? undefined
            : { scale: [1, 1.07, 0.97, 1], opacity: [0.85, 1, 0.88, 0.85] }
        }
        transition={
          reduced ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* warm counter-leak */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-22%] right-[6%] z-[2] hidden h-[560px] w-[560px] rounded-full lg:block"
        style={{
          background:
            "radial-gradient(circle, oklch(0.80 0.18 35 / 0.24) 0%, transparent 68%)",
          filter: "blur(75px)",
          x: reduced ? 0 : (ax as never),
          y: reduced ? 0 : (ay as never),
        }}
        animate={
          reduced
            ? undefined
            : { scale: [1, 1.05, 0.98, 1], opacity: [0.7, 0.95, 0.75, 0.7] }
        }
        transition={
          reduced ? undefined : { duration: 14, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* cool top-right leak */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-[8%] right-[10%] z-[2] hidden h-[480px] w-[480px] rounded-full lg:block"
        style={{
          background:
            "radial-gradient(circle, oklch(0.70 0.20 220 / 0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={
          reduced
            ? undefined
            : { opacity: [0.6, 0.9, 0.6], scale: [1, 1.04, 1] }
        }
        transition={
          reduced ? undefined : { duration: 20, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* === FLOATING CARD ZONE === */}
      <div className="relative z-10 flex min-h-screen items-end justify-center px-4 pb-6 lg:items-center lg:justify-end lg:px-0 lg:pb-0 lg:pr-[5vw] xl:pr-[7vw]">

        {/* Ambient light depth — violet halo that drifts slowly behind the card */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute hidden lg:block"
            style={{
              width: "560px",
              height: "560px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(130,108,255,0.07) 0%, rgba(100,80,220,0.04) 45%, transparent 72%)",
              filter: "blur(60px)",
              zIndex: 0,
            }}
            animate={{
              x: [0, 28, -18, 10, 0],
              y: [0, -16, 22, -8, 0],
              opacity: [0.6, 1, 0.7, 0.9, 0.6],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <LiquidGlassCard className="relative z-10 w-full max-w-[448px] p-7 md:p-9">
          <ParticleBurst active={status === "success"} />

          {/* Staggered card content */}
          <motion.div
            className="relative"
            variants={cardContainer}
            initial="hidden"
            animate="show"
          >
            {/* Mobile brand */}
            <motion.div variants={cardLine}>
              <Link to="/" className="mb-5 inline-flex items-center gap-2 lg:hidden">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  <span className="font-display leading-none">C</span>
                </div>
                <span className="font-display text-lg">Chronicle</span>
              </Link>
            </motion.div>

            {/* Portal label — frosted glass pill badge */}
            <motion.div variants={cardLine} className="mb-4 inline-flex">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[9.5px] uppercase tracking-[0.32em]"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(160,145,255,0.10) 0%, rgba(120,110,210,0.06) 60%, rgba(255,180,200,0.07) 100%)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 12px rgba(130,110,255,0.08)",
                  color: "rgba(255,255,255,0.52)",
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(180,165,255,0.95) 0%, rgba(140,120,240,0.70) 100%)",
                    boxShadow: "0 0 6px rgba(160,145,255,0.60)",
                    animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                  }}
                />
                Portal
              </span>
            </motion.div>

            {/* Living Text Area — illuminated sanctuary prose */}
            <motion.div variants={cardLine} className="relative mt-1 mb-1 py-5 text-center">
              {/* Slow-breathing violet radial glow */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(148,128,255,0.13) 0%, rgba(120,100,240,0.06) 55%, transparent 80%)",
                  borderRadius: "16px",
                }}
                animate={{ opacity: [0.45, 1, 0.45], scale: [0.94, 1.04, 0.94] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Primary line — crisp off-white with violet bloom */}
              <p
                className="relative font-display text-[1.55rem] leading-snug md:text-[1.75rem]"
                style={{
                  letterSpacing: "0.02em",
                  fontWeight: 300,
                  color: "#f8f8ff",
                  textShadow: "0 0 10px rgba(139,92,246,0.50), 0 1px 2px rgba(0,0,0,0.30)",
                }}
              >
                Welcome back
              </p>

              {/* Secondary — airy, readable grey */}
              <p
                className="relative mt-2.5 text-[12.5px]"
                style={{
                  letterSpacing: "0.02em",
                  lineHeight: 1.6,
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.70)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                }}
              >
                Your personal media sanctuary.{" "}
                Track, collect, and curate your digital history.
              </p>
            </motion.div>

            {/* Google button */}
            <motion.div variants={cardLine}>
              <a
                href="/api/auth/google"
                className="group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[12.5px] font-medium tracking-wide text-white/90 transition-all duration-300 hover:scale-[1.015] hover:border-white/18 hover:bg-white/[0.08] active:scale-[0.99]"
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)" }}
              >
                <GoogleColorIcon />
                Continue with Google
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -translate-x-full opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
                  }}
                />
              </a>
            </motion.div>

            {/* Divider */}
            <motion.div
              variants={cardLine}
              className="my-6 flex items-center gap-3"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[9px] uppercase tracking-[0.28em] text-white/30">
                or with email
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </motion.div>

            {/* ── TAB TOGGLE — right above the email field ── */}
            <motion.div variants={cardLine} className="mb-5">
              <motion.div
                className="relative flex rounded-full p-[3px]"
                style={{ background: "transparent", backdropFilter: "blur(12px)" }}
                animate={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}
                whileHover={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.22)", scale: 1.005 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Sliding active-tab glass pill */}
                <motion.div
                  className="absolute inset-[3px] w-[calc(50%-3px)] rounded-full"
                  animate={{ x: mode === "signin" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.18)",
                  }}
                />
                <motion.button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="relative z-10 flex-1 rounded-full py-2 text-[11.5px] font-medium tracking-wide"
                  style={{ color: mode === "signin" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)" }}
                  whileHover={{ color: mode === "signin" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.65)" }}
                  transition={{ duration: 0.2 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="relative z-10 flex-1 rounded-full py-2 text-[11.5px] font-medium tracking-wide"
                  style={{ color: mode === "signup" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)" }}
                  whileHover={{ color: mode === "signup" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.65)" }}
                  transition={{ duration: 0.2 }}
                >
                  Create Account
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Forms */}
            <motion.div variants={cardLine}>
              <AnimatePresence mode="wait">
                {mode === "signin" ? (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={signIn.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <BottomBorderInput
                      label="Email"
                      type="email"
                      icon={<Mail className="h-4 w-4" />}
                      error={signIn.formState.errors.email?.message}
                      {...signIn.register("email")}
                    />
                    <BottomBorderInput
                      label="Password"
                      type="password"
                      icon={<Lock className="h-4 w-4" />}
                      error={signIn.formState.errors.password?.message}
                      {...signIn.register("password")}
                    />

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <motion.label
                        className="inline-flex cursor-pointer items-center gap-2 text-white/45"
                        whileHover={{ scale: 1.02, color: "rgba(255,255,255,0.72)" }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        <input
                          type="checkbox"
                          {...signIn.register("remember")}
                          className="peer sr-only"
                        />
                        <span className="grid h-3.5 w-3.5 place-items-center rounded-sm border border-white/20 bg-white/[0.04] transition-all duration-200 peer-checked:border-white/70 peer-checked:bg-white/80 hover:border-white/35">
                          <Check className="h-2.5 w-2.5 text-black opacity-0 peer-checked:opacity-100" />
                        </span>
                        Remember me
                      </motion.label>
                      <Link
                        to="/auth/forgot-password"
                        className="text-white/45 hover:text-white/85 transition-colors duration-150"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <PremiumButton status={status} label="Continue" error={errorMessage} />
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={signUp.handleSubmit(onSubmit, (errors) => {
                      console.error("Form validation failed:", errors);
                      setErrorMessage(Object.values(errors)[0]?.message || "Validation failed");
                    })}
                    className="space-y-5"
                  >
                    <BottomBorderInput
                      label="Full Name"
                      type="text"
                      icon={<User className="h-4 w-4" />}
                      error={signUp.formState.errors.fullName?.message}
                      {...signUp.register("fullName")}
                    />
                    <BottomBorderInput
                      label="Email"
                      type="email"
                      icon={<Mail className="h-4 w-4" />}
                      error={signUp.formState.errors.email?.message}
                      {...signUp.register("email")}
                    />
                    <BottomBorderInput
                      label="Password"
                      type="password"
                      icon={<Lock className="h-4 w-4" />}
                      error={signUp.formState.errors.password?.message}
                      {...signUp.register("password")}
                    />
                    <BottomBorderInput
                      label="Confirm Password"
                      type="password"
                      icon={<Lock className="h-4 w-4" />}
                      error={signUp.formState.errors.confirmPassword?.message}
                      {...signUp.register("confirmPassword")}
                    />
                    <PremiumButton status={status} label="Begin Chronicle" error={errorMessage} />
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Footer */}
            <motion.p
              variants={cardLine}
              className="mt-6 text-center text-[10.5px] tracking-wide text-white/30"
            >
              By continuing you agree to our{" "}
              <Link className="text-white/50 underline-offset-4 hover:underline" to="/terms">
                Terms
              </Link>{" "}
              &{" "}
              <Link className="text-white/50 underline-offset-4 hover:underline" to="/privacy">
                Privacy
              </Link>
              .
            </motion.p>
          </motion.div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}

/* ─── Premium CTA button ─── */
function PremiumButton({
  status,
  label,
  error,
}: {
  status: "idle" | "loading" | "success" | "error";
  label: string;
  error?: string | null;
}) {
  return (
    <>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[11px] text-red-400/90"
        >
          {error}
        </motion.p>
      )}
      <motion.button
        type="submit"
        disabled={status !== "idle" && status !== "error"}
      className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#F8F8F5] px-5 py-3.5 text-[13.5px] font-medium tracking-wide text-black disabled:opacity-95"
      style={{
        boxShadow:
          "0 18px 50px -18px rgba(255,255,255,0.50), inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
      animate={
        status === "idle"
          ? {
              boxShadow: [
                "0 18px 50px -18px rgba(255,255,255,0.45), inset 0 1px 0 rgba(255,255,255,0.85)",
                "0 22px 65px -14px rgba(255,255,255,0.72), inset 0 1px 0 rgba(255,255,255,0.90)",
                "0 18px 50px -18px rgba(255,255,255,0.45), inset 0 1px 0 rgba(255,255,255,0.85)",
              ],
            }
          : {}
      }
      transition={
        status === "idle"
          ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.975, transition: { duration: 0.12 } }}
    >
      {/* shimmer sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -translate-x-full opacity-0 transition-all duration-[900ms] ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)",
        }}
      />
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.span
            key="i"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="inline-flex items-center gap-2"
          >
            {label}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.span>
        )}
        {status === "loading" && (
          <motion.span
            key="l"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="inline-flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" /> Entering…
          </motion.span>
        )}
        {status === "success" && (
          <motion.span
            key="s"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2"
          >
            <Check className="h-4 w-4" /> Welcome
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
    </>
  );
}

/* ─── Full-color Google icon ─── */
function GoogleColorIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
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

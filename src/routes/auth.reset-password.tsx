import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { authApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Check } from "lucide-react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "New Password — Avuno" },
      {
        name: "description",
        content: "Choose a new password for your Avuno account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

const MIN_PW = 12;

function calcStrength(pw: string): number {
  let s = 0;
  if (pw.length >= MIN_PW) s++;
  if (pw.length >= 16) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const val = new URLSearchParams(window.location.search).get("token");
    setToken(val);
    if (val) window.history.replaceState({}, "", "/auth/reset-password");
  }, []);

  useEffect(() => {
    setStrength(password ? calcStrength(password) : 0);
  }, [password]);

  const tooShort = password.length > 0 && password.length < MIN_PW;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = !!token && password.length >= MIN_PW && password === confirm && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.resetPassword({ token, password });
      setIsSuccess(true);
      toast.success("Password updated. Please sign in.");
      setTimeout(() => navigate({ to: "/auth" }), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "This reset link is invalid or has expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-12 selection:bg-primary/30">
      <AtmosphereBackground showParticles={true} intensity="vivid" />
      
      {/* Top Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-8 left-8 sm:left-12 flex items-center gap-2.5 z-20"
      >
        <Link to="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-button)]">
            <span className="font-display text-base font-bold leading-none">A</span>
          </div>
          <span className="font-display text-xl tracking-tight text-foreground">Avuno</span>
        </Link>
      </motion.div>

      {/* Main Glass Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="glass-floating rounded-[2rem] p-8 sm:p-10 card-interactive">
          <Link
            to="/auth"
            className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to sign in
          </Link>

          <div className="flex flex-col mb-8">
            <h1 className="font-display text-3xl font-medium tracking-tight">
              New password
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Resetting your password signs you out on all other devices.
            </p>
          </div>

          {!token ? (
            <div className="flex items-start gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
              <div>
                <p className="text-[13.5px] font-medium text-destructive">
                  Invalid reset link
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  This link is missing its token. Request a new one to continue.
                </p>
                <Link
                  to="/auth/forgot-password"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12px] underline underline-offset-2 text-primary hover:text-primary/80 transition-colors"
                >
                  Request a new link
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-start gap-4 rounded-xl border border-primary/30 bg-primary/10 p-5">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                  <Check className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <p className="text-[13.5px] font-medium text-primary">
                    Password updated
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    You'll be redirected to sign in shortly.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-[13px] text-destructive overflow-hidden"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="leading-relaxed">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  className={cn(
                    "peer h-12 w-full rounded-xl border bg-foreground/[0.04] px-4 text-sm transition-[border-color,box-shadow,background-color] duration-[140ms] ease-out placeholder:text-transparent",
                    tooShort
                      ? "border-destructive/50 focus:border-destructive/70 focus:ring-2 focus:ring-destructive/30"
                      : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05] focus:border-ring/50 focus:ring-2 focus:ring-ring/30 focus:bg-foreground/[0.05]"
                  )}
                />
                <label
                  htmlFor="new-password"
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-all duration-[200ms] ease-out pointer-events-none",
                    password
                      ? "-translate-y-[28px] text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-background px-1 left-3"
                      : "text-muted-foreground/70"
                  )}
                >
                  New Password
                </label>
                
                <AnimatePresence>
                  {tooShort ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 px-1 text-[11px] text-destructive"
                    >
                      Use at least {MIN_PW} characters
                    </motion.p>
                  ) : !tooShort && !password ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 px-1 text-[11px] text-muted-foreground"
                    >
                      At least {MIN_PW} characters
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {strength > 0 && !tooShort && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden px-1"
                    >
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const segColor = strength <= 2 ? "bg-destructive" : strength <= 3 ? "bg-amber-500" : "bg-primary";
                          return (
                            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/[0.08]">
                              <motion.div
                                className={cn("h-full rounded-full", segColor)}
                                animate={{ width: i < strength ? "100%" : "0%" }}
                                transition={{ duration: 0.25 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : strength <= 4 ? "Good" : "Strong"} password
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative pt-2">
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm New Password"
                  className={cn(
                    "peer h-12 w-full rounded-xl border bg-foreground/[0.04] px-4 text-sm transition-[border-color,box-shadow,background-color] duration-[140ms] ease-out placeholder:text-transparent",
                    mismatch
                      ? "border-destructive/50 focus:border-destructive/70 focus:ring-2 focus:ring-destructive/30"
                      : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05] focus:border-ring/50 focus:ring-2 focus:ring-ring/30 focus:bg-foreground/[0.05]"
                  )}
                />
                <label
                  htmlFor="confirm-password"
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-all duration-[200ms] ease-out pointer-events-none mt-1",
                    confirm
                      ? "-translate-y-[28px] text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-background px-1 left-3"
                      : "text-muted-foreground/70"
                  )}
                >
                  Confirm New Password
                </label>
                
                <AnimatePresence>
                  {mismatch && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 px-1 text-[11px] text-destructive"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-2">
                <PremiumButton
                  type="submit"
                  variant="primary"
                  className="w-full h-12"
                  disabled={!canSubmit}
                  loading={isSubmitting}
                >
                  {!isSubmitting ? "Update password" : ""}
                </PremiumButton>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

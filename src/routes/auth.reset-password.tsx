import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { LiquidGlassCard } from "@/components/auth/LiquidGlassCard";
import { PremiumInput } from "@/components/auth/PremiumInput";
import { authApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Avuno" },
      {
        name: "description",
        content: "Choose a new password for your Avuno account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

/** Mirrors the backend constraint so the user is told before submitting. */
const MIN_PASSWORD_LENGTH = 12;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("token");
    setToken(value);
    // Scrub the token from the URL so it does not linger in history or leak
    // via Referer to anything this page loads.
    if (value) window.history.replaceState({}, "", "/auth/reset-password");
  }, []);

  // Password strength calculation
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= MIN_PASSWORD_LENGTH) strength += 1;
      if (password.length >= 16) strength += 1;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
      if (/\d/.test(password)) strength += 1;
      if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
      setPasswordStrength(Math.min(strength, 5));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    !!token && password.length >= MIN_PASSWORD_LENGTH && password === confirm && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !token) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success("Password updated", { description: "Please sign in with your new password." });
      navigate({ to: "/auth" });
    } catch (error) {
      // The server returns one message for expired, already-used and unknown
      // tokens, so nothing can be inferred from the failure.
      toast.error(
        error instanceof Error ? error.message : "This reset link is invalid or has expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.08_0.02_270)] px-4">
      <AtmosphereBackground intensity="soft" />
      <LiquidGlassCard className="w-full max-w-md">
        <h1 className="font-display text-[2rem] leading-tight tracking-tight text-[oklch(0.97_0.005_270)]">
          Choose a new password
        </h1>

        {!token ? (
          <>
            <div className="mt-6 rounded-2xl bg-[oklch(0.66_0.22_18_/_0.1)] p-5">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-[oklch(0.66_0.22_18)]" />
                <div>
                  <p className="text-[13px] font-medium text-[oklch(0.66_0.22_18)]">
                    Invalid reset link
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[oklch(0.66_0.22_18_/_0.8)]">
                    This link is missing its token. Request a new one and try again.
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/auth/forgot-password"
              className="mt-6 inline-block text-[13px] text-[oklch(0.68_0.012_270_/_0.7)] underline underline-offset-4 transition-colors hover:text-[oklch(0.72_0.18_255)]"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <PremiumInput
                label="New Password"
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                error={tooShort ? `Use at least ${MIN_PASSWORD_LENGTH} characters` : undefined}
                helperText={
                  !tooShort && password ? `At least ${MIN_PASSWORD_LENGTH} characters` : undefined
                }
              />

              {/* Password strength indicator */}
              {passwordStrength > 0 && !tooShort && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pl-5"
                >
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: i < passwordStrength ? "100%" : "0%",
                            backgroundColor:
                              passwordStrength <= 2
                                ? "oklch(0.66 0.22 18)"
                                : passwordStrength <= 3
                                  ? "oklch(0.82 0.16 80)"
                                  : "oklch(0.72 0.16 160)",
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10.5px] text-[oklch(0.68_0.012_270_/_0.5)]">
                    {passwordStrength <= 2
                      ? "Weak password"
                      : passwordStrength <= 3
                        ? "Good password"
                        : "Strong password"}
                  </p>
                </motion.div>
              )}
            </div>

            <PremiumInput
              label="Confirm New Password"
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              error={mismatch ? "Passwords do not match" : undefined}
            />

            <motion.button
              type="submit"
              disabled={!canSubmit}
              className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-[oklch(0.97_0.005_270)] px-5 text-[14px] font-medium tracking-wide text-[oklch(0.12_0.02_270)] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              whileHover={{ scale: canSubmit ? 1.01 : 1 }}
              whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </motion.button>
          </form>
        )}

        <p className="mt-6 text-[11.5px] leading-relaxed text-[oklch(0.68_0.012_270_/_0.6)]">
          Resetting your password signs you out everywhere else.
        </p>
      </LiquidGlassCard>
    </div>
  );
}

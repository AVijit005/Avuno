import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { authApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { ArchiveVisual } from "@/components/auth/ArchiveVisual";
import { AuthInput, AuthErrorBanner } from "@/routes/auth";

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
    <div
      className="flex min-h-[100dvh] w-full"
      style={{ background: "oklch(0.08 0.02 270)", color: "oklch(0.97 0.005 270)" }}
    >
      {/* Left visual */}
      <div
        className="relative hidden flex-col lg:flex"
        style={{ width: "54%", flexShrink: 0, borderRight: "1px solid oklch(1 0 0 / 0.04)" }}
      >
        <ArchiveVisual />
        <div className="absolute left-10 top-8 z-10 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
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
        <div className="absolute bottom-8 left-10 z-10">
          <p
            className="text-[11px] tracking-[0.18em] uppercase"
            style={{ color: "oklch(0.68 0.012 270 / 0.5)" }}
          >
            Your media. Your journal. Your story.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div
        className="relative flex w-full flex-1 flex-col overflow-y-auto"
        style={{ background: "oklch(0.09 0.018 270)" }}
      >
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
          <Link to="/" className="flex items-center gap-2.5">
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

        <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[400px]">
            {/* Back */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to="/auth"
                className="mb-8 inline-flex items-center gap-1.5 text-[12px] transition-colors"
                style={{ color: "oklch(0.68 0.012 270 / 0.55)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Back to sign in
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="font-display text-[2rem] leading-[1.1] tracking-tight"
                style={{ color: "oklch(0.97 0.005 270)" }}
              >
                New password.
              </h1>
              <p
                className="mt-2 text-[13px] leading-relaxed"
                style={{ color: "oklch(0.68 0.012 270)" }}
              >
                Resetting your password signs you out on all other devices.
              </p>
            </motion.div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {!token ? (
                /* Invalid / missing token */
                <div
                  className="flex items-start gap-4 rounded-xl border p-5"
                  style={{
                    borderColor: "oklch(0.66 0.22 18 / 0.25)",
                    background: "oklch(0.66 0.22 18 / 0.05)",
                  }}
                >
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: "oklch(0.66 0.22 18)" }}
                    aria-hidden
                  />
                  <div>
                    <p
                      className="text-[13.5px] font-medium"
                      style={{ color: "oklch(0.75 0.12 18)" }}
                    >
                      Invalid reset link
                    </p>
                    <p
                      className="mt-1 text-[12.5px] leading-relaxed"
                      style={{ color: "oklch(0.68 0.012 270)" }}
                    >
                      This link is missing its token. Request a new one to continue.
                    </p>
                    <Link
                      to="/auth/forgot-password"
                      className="mt-3 inline-flex items-center gap-1.5 text-[12px] underline underline-offset-2 transition-colors"
                      style={{ color: "oklch(0.72 0.18 255)" }}
                    >
                      Request a new link
                    </Link>
                  </div>
                </div>
              ) : isSuccess ? (
                /* Success */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div
                    className="flex items-start gap-4 rounded-xl border p-5"
                    style={{
                      borderColor: "oklch(0.72 0.16 160 / 0.25)",
                      background: "oklch(0.72 0.16 160 / 0.05)",
                    }}
                  >
                    <div
                      className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                      style={{
                        background: "oklch(0.72 0.16 160 / 0.15)",
                        color: "oklch(0.72 0.16 160)",
                      }}
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                      <p
                        className="text-[13.5px] font-medium"
                        style={{ color: "oklch(0.72 0.16 160)" }}
                      >
                        Password updated
                      </p>
                      <p
                        className="mt-1 text-[12.5px] leading-relaxed"
                        style={{ color: "oklch(0.68 0.012 270)" }}
                      >
                        You'll be redirected to sign in shortly.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <AnimatePresence>{error && <AuthErrorBanner message={error} />}</AnimatePresence>

                  <div>
                    <AuthInput
                      label="New Password"
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={tooShort ? `Use at least ${MIN_PW} characters` : undefined}
                      helperText={
                        !tooShort && password ? `At least ${MIN_PW} characters` : undefined
                      }
                    />
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
                              const segColor =
                                strength <= 2
                                  ? "oklch(0.66 0.22 18)"
                                  : strength <= 3
                                    ? "oklch(0.82 0.16 80)"
                                    : "oklch(0.72 0.16 160)";
                              return (
                                <div
                                  key={i}
                                  className="h-[3px] flex-1 overflow-hidden rounded-full"
                                  style={{ background: "oklch(1 0 0 / 0.06)" }}
                                >
                                  <motion.div
                                    className="h-full rounded-full"
                                    animate={{
                                      width: i < strength ? "100%" : "0%",
                                      backgroundColor: segColor,
                                    }}
                                    transition={{ duration: 0.25 }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <p
                            className="mt-1.5 text-[11px]"
                            style={{
                              color:
                                strength <= 2
                                  ? "oklch(0.66 0.22 18 / 0.8)"
                                  : "oklch(0.68 0.012 270 / 0.55)",
                            }}
                          >
                            {strength <= 2
                              ? "Weak"
                              : strength <= 3
                                ? "Fair"
                                : strength <= 4
                                  ? "Good"
                                  : "Strong"}{" "}
                            password
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AuthInput
                    label="Confirm New Password"
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    error={mismatch ? "Passwords do not match" : undefined}
                  />

                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-medium tracking-wide"
                      style={{
                        background: canSubmit ? "oklch(0.97 0.005 270)" : "oklch(0.85 0.005 270)",
                        color: "oklch(0.10 0.015 270)",
                        boxShadow: "0 1px 0 oklch(1 0 0 / 0.7) inset",
                        opacity: !canSubmit ? 0.6 : 1,
                        transition: "background 150ms ease, opacity 150ms ease",
                      }}
                      whileHover={{ scale: canSubmit ? 1.012 : 1 }}
                      whileTap={{ scale: canSubmit ? 0.988 : 1 }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Updating…
                        </>
                      ) : (
                        "Update password"
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

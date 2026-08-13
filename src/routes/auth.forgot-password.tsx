import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { authApi } from "@/lib/api";
import { useState } from "react";
import { ArrowLeft, Mail, Check } from "lucide-react";
import { ArchiveVisual } from "@/components/auth/ArchiveVisual";
import { AuthInput, AuthErrorBanner } from "@/routes/auth";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Avuno" },
      {
        name: "description",
        content: "Reset your Avuno password securely.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email });
    } catch {
      // Intentional: reveal nothing for security
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
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
        {/* Ambient */}
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
            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to="/auth"
                className="mb-8 inline-flex items-center gap-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:underline"
                style={{ color: "oklch(0.68 0.012 270 / 0.55)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Back to sign in
              </Link>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="font-display text-[2rem] leading-[1.1] tracking-tight"
                style={{ color: "oklch(0.97 0.005 270)" }}
              >
                Reset your password.
              </h1>
              <p
                className="mt-2 text-[13px] leading-relaxed"
                style={{ color: "oklch(0.68 0.012 270)" }}
              >
                Enter your email and we'll send a secure reset link.
              </p>
            </motion.div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    noValidate
                  >
                    <AnimatePresence>
                      {error && <AuthErrorBanner message={error} />}
                    </AnimatePresence>

                    <AuthInput
                      label="Email Address"
                      type="email"
                      id="forgot-email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="group flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-[14px] font-medium tracking-wide"
                        style={{
                          background:
                            isSubmitting || !email
                              ? "oklch(0.85 0.005 270)"
                              : "oklch(0.97 0.005 270)",
                          color: "oklch(0.10 0.015 270)",
                          boxShadow: "0 1px 0 oklch(1 0 0 / 0.7) inset",
                          opacity: !email ? 0.6 : 1,
                          transition: "background 150ms ease, opacity 150ms ease",
                        }}
                        whileHover={{ scale: email && !isSubmitting ? 1.012 : 1 }}
                        whileTap={{ scale: email && !isSubmitting ? 0.988 : 1 }}
                      >
                        {isSubmitting ? (
                          <>
                            <Mail className="h-4 w-4 animate-pulse" aria-hidden />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4" aria-hidden />
                            Send reset link
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Success state */}
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
                          Check your inbox
                        </p>
                        <p
                          className="mt-1 text-[12.5px] leading-relaxed"
                          style={{ color: "oklch(0.68 0.012 270)" }}
                        >
                          If an account exists for{" "}
                          <span className="font-medium" style={{ color: "oklch(0.85 0.012 270)" }}>
                            {email}
                          </span>
                          , we've sent a reset link. Check your inbox and spam folder.
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/auth"
                      className="mt-6 inline-flex items-center gap-1.5 text-[12px] transition-colors"
                      style={{ color: "oklch(0.68 0.012 270 / 0.6)" }}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                      Return to sign in
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

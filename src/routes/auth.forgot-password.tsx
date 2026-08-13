import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { authApi } from "@/lib/api";
import { useState } from "react";
import { ArrowLeft, Mail, Check, AlertCircle } from "lucide-react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";

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
              Reset password
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your email and we'll send a secure reset link.
            </p>
          </div>

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
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="peer h-12 w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] px-4 text-sm transition-[border-color,box-shadow,background-color] duration-[140ms] ease-out placeholder:text-transparent hover:border-foreground/20 hover:bg-foreground/[0.05] focus:border-ring/50 focus:ring-2 focus:ring-ring/30 focus:bg-foreground/[0.05]"
                  />
                  <label
                    htmlFor="forgot-email"
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-all duration-[200ms] ease-out pointer-events-none",
                      email
                        ? "-translate-y-[28px] text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-background px-1 left-3"
                        : "text-muted-foreground/70"
                    )}
                  >
                    Email Address
                  </label>
                </div>

                <div className="pt-2">
                  <PremiumButton
                    type="submit"
                    variant="primary"
                    className="w-full h-12"
                    disabled={isSubmitting || !email}
                    loading={isSubmitting}
                    icon={!isSubmitting && <Mail className="h-4 w-4" />}
                  >
                    {!isSubmitting ? "Send reset link" : ""}
                  </PremiumButton>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-start gap-4 rounded-xl border border-primary/30 bg-primary/10 p-5">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                    <Check className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-medium text-primary">
                      Check your inbox
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                      If an account exists for{" "}
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                      , we've sent a reset link. Check your inbox and spam folder.
                    </p>
                  </div>
                </div>

                <Link
                  to="/auth"
                  className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Return to sign in
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

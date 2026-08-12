import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { LiquidGlassCard } from "@/components/auth/LiquidGlassCard";
import { PremiumInput } from "@/components/auth/PremiumInput";
import { authApi } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      setIsSubmitted(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch {
      setIsSubmitted(true);
      toast.success("If an account exists, a reset link has been sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.08_0.02_270)] p-4">
      <AtmosphereBackground intensity="soft" />
      <LiquidGlassCard className="w-full max-w-md">
        <Link
          to="/auth"
          className="mb-6 inline-flex items-center gap-2 text-[11px] text-[oklch(0.68_0.012_270_/_0.6)] transition-colors hover:text-[oklch(0.72_0.18_255)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>

        <h1 className="font-display text-[2rem] leading-tight tracking-tight text-[oklch(0.97_0.005_270)]">
          Reset your password
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[oklch(0.68_0.012_270)]">
          Enter your email and we'll send you a link to get back into your account.
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <PremiumInput
              label="Email Address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              placeholder="you@example.com"
              required
            />
            <motion.button
              type="submit"
              disabled={isSubmitting || !email}
              className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-[oklch(0.97_0.005_270)] px-5 text-[14px] font-medium tracking-wide text-[oklch(0.12_0.02_270)] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </motion.button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="rounded-2xl bg-[oklch(0.72_0.16_160_/_0.1)] p-5">
              <p className="text-[13px] leading-relaxed text-[oklch(0.72_0.16_160)]">
                If an account with that email exists, we've sent a password reset link. Please check
                your inbox and spam folder.
              </p>
            </div>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center gap-2 text-[12px] text-[oklch(0.68_0.012_270_/_0.7)] transition-colors hover:text-[oklch(0.72_0.18_255)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </motion.div>
        )}
      </LiquidGlassCard>
    </div>
  );
}

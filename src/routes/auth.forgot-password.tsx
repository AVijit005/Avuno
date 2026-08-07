import { createFileRoute, Link } from "@tanstack/react-router";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { LiquidGlassCard } from "@/components/auth/LiquidGlassCard";
import { authApi } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success("If an account exists, a reset link has been sent.");
      setEmail("");
    } catch {
      toast.success("If an account exists, a reset link has been sent.");
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.08_0.02_270)] flex items-center justify-center p-4">
      <AtmosphereBackground intensity="soft" />
      <LiquidGlassCard className="w-full max-w-md">
        <h1 className="font-display text-2xl tracking-tight mb-2">Reset your password</h1>
        <p className="text-white/60 text-sm">Enter your email and we'll send you a link to get back into your account.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-full bg-white/5 border border-white/10 px-5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-white text-black font-medium text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link to="/auth" className="text-white/40 hover:text-white/80 text-xs mt-4 block text-center">
          Back to login
        </Link>
      </LiquidGlassCard>
    </div>
  );
}

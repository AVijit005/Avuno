import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { LiquidGlassCard } from "@/components/auth/LiquidGlassCard";
import { authApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/reset-password")({
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("token");
    setToken(value);
    // Scrub the token from the URL so it does not linger in history or leak
    // via Referer to anything this page loads.
    if (value) window.history.replaceState({}, "", "/auth/reset-password");
  }, []);

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
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AtmosphereBackground intensity="soft" />
      <LiquidGlassCard className="w-full max-w-md p-8">
        <h1 className="font-display text-2xl tracking-tight text-white">Choose a new password</h1>

        {!token ? (
          <>
            <p className="mt-3 text-sm text-white/70">
              This link is missing its token. Request a new one and try again.
            </p>
            <Link
              to="/auth/forgot-password"
              className="mt-6 inline-block text-sm text-white/70 underline underline-offset-4 hover:text-white"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="new-password" className="sr-only">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/25"
              />
              <p className="mt-1 text-xs text-white/60">
                At least {MIN_PASSWORD_LENGTH} characters.
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/25"
              />
              {tooShort && (
                <p className="mt-1 text-xs text-white/70">
                  Use at least {MIN_PASSWORD_LENGTH} characters.
                </p>
              )}
              {mismatch && <p className="mt-1 text-xs text-white/70">Passwords do not match.</p>}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition disabled:opacity-40"
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-white/60">
          Resetting your password signs you out everywhere else.
        </p>
      </LiquidGlassCard>
    </div>
  );
}

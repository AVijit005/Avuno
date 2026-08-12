import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { setAccessToken, apiPost } from "@/lib/api/fetch";
import { toast } from "sonner";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — Avuno" },
      {
        name: "description",
        content: "Completing your sign-in to Avuno.",
      },
    ],
  }),
  component: AuthCallback,
});

interface ExchangeResponse {
  accessToken: string;
}

function AuthCallback() {
  // The code is single-use; React 18/19 StrictMode double-invokes effects in
  // development, and a second exchange would fail against an already-consumed
  // code and bounce the user to /auth.
  const exchanged = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || exchanged.current) return;
    exchanged.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    // Scrub the query string immediately. Even though it now carries only a
    // short-lived single-use code rather than a JWT, there is no reason to
    // leave it in history or expose it via Referer.
    window.history.replaceState({}, "", "/auth/callback");

    const fail = (message: string) => {
      toast.error(message, { duration: 10000 });
      setTimeout(() => {
        window.location.replace("/auth");
      }, 5000);
    };

    if (error) {
      fail(
        error === "invalid_state"
          ? "Sign-in session expired or could not be verified. Please try again."
          : "Authentication failed. Please try again.",
      );
      return;
    }

    if (!code) {
      fail("Authentication failed. Please try again.");
      return;
    }

    // The server verified the CSRF state before issuing this code, so the
    // client does not need to (and cannot meaningfully) re-check it.
    apiPost<ExchangeResponse>("/auth/exchange", { code }, { skipAuth: true })
      .then((res) => {
        if (!res?.accessToken) {
          fail("Authentication failed. Please try again.");
          return;
        }
        setAccessToken(res.accessToken);
        router.navigate({ to: "/app", replace: true });
      })
      .catch((err) => fail(`Authentication failed. ${err.message || "Please try again."}`));
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.08_0.02_270)] px-4">
      <AtmosphereBackground intensity="soft" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-sm rounded-3xl p-10 text-center"
        style={{
          background: "oklch(0.18 0.014 270 / 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid oklch(1 0 0 / 0.08)",
          boxShadow: "0 20px 40px -10px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.08)",
        }}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.58_0.26_292)] to-[oklch(0.55_0.24_218)]">
          <span className="font-display text-2xl font-bold leading-none text-white">A</span>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mx-auto mt-6"
        >
          <Loader2 className="h-6 w-6 text-[oklch(0.72_0.18_255)]" />
        </motion.div>
        <h2 className="mt-5 font-display text-xl tracking-tight text-[oklch(0.97_0.005_270)]">
          Logging you into Avuno…
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-[oklch(0.68_0.012_270)]">
          Setting up your personal media universe
        </p>
      </motion.div>
    </div>
  );
}

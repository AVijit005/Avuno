import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { setAccessToken, apiPost } from "@/lib/api/fetch";
import { toast } from "sonner";
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
  // React 18/19 StrictMode double-invokes effects; guard against
  // a second code exchange on an already-consumed single-use code.
  const exchanged = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || exchanged.current) return;
    exchanged.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    // Scrub query string immediately — no reason to leave it in history.
    window.history.replaceState({}, "", "/auth/callback");

    const fail = (message: string) => {
      toast.error(message, { duration: 10000 });
      setTimeout(() => window.location.replace("/auth"), 5000);
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
    <div
      className="flex min-h-[100dvh] items-center justify-center"
      style={{ background: "oklch(0.08 0.02 270)" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.45 0.18 255 / 0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
        style={{ maxWidth: "320px" }}
      >
        {/* Avuno mark */}
        <div
          className="grid h-12 w-12 place-items-center rounded-xl"
          style={{
            background: "linear-gradient(145deg, oklch(0.58 0.26 292), oklch(0.55 0.24 218))",
            boxShadow: "0 0 0 1px oklch(1 0 0 / 0.1), 0 8px 24px -8px oklch(0.58 0.26 268 / 0.5)",
          }}
        >
          <span className="font-display text-xl font-bold leading-none text-white">A</span>
        </div>

        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-5 w-5" style={{ color: "oklch(0.72 0.18 255)" }} aria-hidden />
        </motion.div>

        {/* Copy */}
        <div>
          <h1
            className="font-display text-xl tracking-tight"
            style={{ color: "oklch(0.97 0.005 270)" }}
          >
            Signing you in…
          </h1>
          <p
            className="mt-2 text-[12.5px] leading-relaxed"
            style={{ color: "oklch(0.68 0.012 270)" }}
          >
            Opening your personal archive
          </p>
        </div>
      </motion.div>
    </div>
  );
}

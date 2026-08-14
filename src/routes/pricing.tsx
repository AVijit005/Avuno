import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ArrowLeft, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { useReducedMotion, motion } from "motion/react";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <main className="min-h-screen bg-background pt-20 pb-32">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 glass rounded-xl px-4 py-2.5 hover:bg-foreground/[0.07] text-sm font-medium focus-ring min-h-[44px] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="py-20 text-center">
          <div className="text-eyebrow mb-4">Simple, honest pricing</div>
          <h1 className="font-display text-display font-semibold tracking-tight">Free to start.</h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
            Avuno is free forever. Pro unlocks the full experience when you're ready.
          </p>
        </div>

        <motion.div
          variants={reduced ? undefined : containerVariants}
          initial="hidden"
          animate="show"
          className="md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-16 grid grid-cols-1"
        >
          {/* Free Tier */}
          <motion.div
            variants={reduced ? undefined : itemVariants}
            className="glass rounded-[28px] p-8 flex flex-col card-interactive"
          >
            <div className="font-display text-2xl font-semibold">Free</div>
            <div className="mt-4 font-display text-5xl font-semibold tracking-tight">
              $0<span className="text-lg text-muted-foreground font-sans font-normal"> /mo</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">Perfect for getting started.</div>

            <ul className="mt-8 flex-1 space-y-4 text-sm">
              {[
                "Unlimited library tracking",
                "Journal & reflections",
                "Timeline & memories",
                "Collections",
                "Analytics dashboard",
                "Google sign-in",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <PremiumButton
              onClick={() => navigate({ to: "/auth" })}
              className="mt-8 w-full min-h-[44px]"
              variant="secondary"
            >
              Get started free
            </PremiumButton>
          </motion.div>

          {/* Pro Tier */}
          <motion.div
            variants={reduced ? undefined : itemVariants}
            className="glass-elevated rounded-[28px] p-8 flex flex-col relative overflow-hidden border border-primary/[0.2] card-interactive"
          >
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider rounded-full px-3 py-1 font-medium">
              Most Popular
            </div>

            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/[0.08] rounded-full blur-3xl pointer-events-none" />

            <div className="font-display text-2xl font-semibold text-primary relative z-10">
              Pro
            </div>
            <div className="mt-4 font-display text-5xl font-semibold tracking-tight relative z-10">
              $8<span className="text-lg text-muted-foreground font-sans font-normal"> /mo</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 relative z-10">
              For complete personal tracking.
            </div>

            <ul className="mt-8 flex-1 space-y-4 text-sm relative z-10">
              {[
                "Everything in Free",
                "Priority sync (Coming soon)",
                "Advanced memory insights (Coming soon)",
                "Custom smart collections (Coming soon)",
                "Wrapped year in review",
                "Early access to new features",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary" />
                  <span className={f.includes("Coming soon") ? "text-muted-foreground" : ""}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <PremiumButton
              onClick={() => {
                analytics.track("upgrade_click");
                navigate({ to: "/app/settings/email-capture" });
              }}
              className="mt-8 w-full min-h-[44px] relative z-10"
              variant="primary"
            >
              Upgrade to Pro
            </PremiumButton>
          </motion.div>
        </motion.div>

        <div className="mt-24 space-y-4 max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-medium text-foreground">Is it really free?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Yes. Core features are free forever.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-medium text-foreground">When is Pro available?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pro features are in development. Join the waitlist to get early access.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-medium text-foreground">Can I export my data?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your data is yours. Export anytime.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

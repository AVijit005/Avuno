import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Check, Sparkles } from "lucide-react";
import { analytics } from "@/lib/analytics";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-background pb-32 pt-24 md:pt-32">
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <div className="text-center">
          <div className="glass-subtle mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Chronicle Plus
          </div>
          <h1 className="mt-8 font-display text-5xl tracking-tight md:text-7xl">
            <span className="text-gradient-aurora">Upgrade your story.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Unlock unlimited memories, advanced analytics, and cross-media intelligence.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Free Tier */}
          <PremiumGlass className="flex flex-col p-8 md:p-10">
            <div className="text-2xl font-medium">Free</div>
            <div className="mt-4 text-sm text-muted-foreground">
              For casual explorers.
            </div>
            <div className="mt-8 font-display text-5xl">$0<span className="text-xl text-muted-foreground">/mo</span></div>
            <ul className="mt-8 flex-1 space-y-4 text-sm">
              {["Track up to 100 items", "Basic timeline", "Standard statistics"].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <PremiumButton onClick={() => navigate({ to: "/app" })} className="mt-8 w-full" variant="secondary">
              Current Plan
            </PremiumButton>
          </PremiumGlass>

          {/* Plus Tier */}
          <PremiumGlass variant="strong" glow="oklch(0.72 0.18 255 / 0.4)" className="relative flex flex-col p-8 md:p-10">
            <div className="absolute -top-4 right-8 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-wider text-primary-foreground">
              Most Popular
            </div>
            <div className="text-2xl font-medium text-gradient-aurora">Plus</div>
            <div className="mt-4 text-sm text-muted-foreground">
              For complete cinematic journaling.
            </div>
            <div className="mt-8 font-display text-5xl">$8<span className="text-xl text-muted-foreground">/mo</span></div>
            <ul className="mt-8 flex-1 space-y-4 text-sm">
              {[
                "Unlimited library items",
                "Advanced memory insights",
                "Cross-media intelligence",
                "Custom smart collections",
                "Priority syncing",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <PremiumButton
              onClick={() => {
                analytics.track("upgrade_click");
                navigate({ to: "/app/settings/email-capture" as any });
              }}
              className="mt-8 w-full"
            >
              Upgrade to Plus
            </PremiumButton>
          </PremiumGlass>
        </div>
      </div>
    </main>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { QuickActionsMenu } from "@/components/common/QuickActionsMenu";

export const Route = createFileRoute("/app/dev")({
  beforeLoad: () => {
    if (import.meta.env.PROD) {
      throw notFound();
    }
  },
  component: DevPlayground,
});

function DevPlayground() {
  const findings: Array<{ severity: string; area: string; message: string }> = [];
  return (
    <div className="space-y-10 pb-24 pt-4">
      <header>
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
          Development only
        </div>
        <h1 className="font-display text-3xl tracking-tight">QA playground</h1>
        <p className="text-sm text-muted-foreground">
          Component previews and audit output. Not linked publicly.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <PremiumButton>Primary</PremiumButton>
          <PremiumButton variant="secondary">Secondary</PremiumButton>
          <PremiumButton variant="ghost">Ghost</PremiumButton>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Glass</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <PremiumGlass variant="subtle">
            <div className="p-5">Subtle</div>
          </PremiumGlass>
          <PremiumGlass>
            <div className="p-5">Default</div>
          </PremiumGlass>
          <PremiumGlass variant="strong">
            <div className="p-5">Strong</div>
          </PremiumGlass>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Skeleton & empty</h2>
        <ShimmerSkeleton className="h-20 w-full rounded-2xl" />
        <EmptyState title="Nothing yet" description="A clean slate." />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Error state</h2>
        <PremiumErrorState
          title="We couldn't find this memory."
          description="Try going home or opening your library."
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Quick actions</h2>
        <QuickActionsMenu />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Product audit</h2>
        <PremiumGlass variant="subtle">
          <ul className="divide-y divide-white/5">
            {findings.length === 0 ? (
              <li className="p-4 text-sm text-muted-foreground">All clean.</li>
            ) : (
              findings.map((f, i) => (
                <li key={i} className="p-3 text-xs">
                  <span className="mr-2 inline-block rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                    {f.severity}
                  </span>
                  <span className="text-muted-foreground">[{f.area}]</span> {f.message}
                </li>
              ))
            )}
          </ul>
        </PremiumGlass>
      </section>
    </div>
  );
}

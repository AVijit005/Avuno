import { createFileRoute } from "@tanstack/react-router";
import { SaveForLaterPanel } from "@/components/profile/SaveForLaterPanel";
import { PullQuote } from "@/components/editorial/PullQuote";

export const Route = createFileRoute("/app/save-for-later")({ component: SaveForLaterPage });

function SaveForLaterPage() {
  return (
    <div className="pb-16">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
          The waiting list
        </div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          Stories waiting for their moment
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground/70">
          Not a backlog. A reading room. Things you set down because the timing wasn't right — ready
          when you are.
        </p>
      </header>

      <SaveForLaterPanel />
    </div>
  );
}

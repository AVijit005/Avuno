import { createFileRoute } from "@tanstack/react-router";

import { PullQuote } from "@/components/editorial/PullQuote";
import { YourQuotesRail } from "@/components/memory/YourQuotesRail";

export const Route = createFileRoute("/app/quotes")({ component: QuotesPage });

function QuotesPage() {
  return (
    <div className="pb-16">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Quote book</div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          Lines that stayed with you
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground/70">
          The sentences you underlined, transcribed, repeated to a friend. A small private
          anthology, kept in the order you found them.
        </p>
      </header>

      <section className="mt-12">
        <YourQuotesRail />
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Museum } from "@/components/profile/Museum";
import { PullQuote } from "@/components/editorial/PullQuote";

export const Route = createFileRoute("/app/museum")({ component: MuseumPage });

function MuseumPage() {
  return (
    <div className="pb-16">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">The archive</div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          A gallery of your story
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground/70">
          Curated rooms for the work that moved you most. Walk slowly — every wall is something you
          chose to remember.
        </p>
      </header>

      <Museum />
    </div>
  );
}

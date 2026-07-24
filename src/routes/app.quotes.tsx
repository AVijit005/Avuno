import { createFileRoute } from "@tanstack/react-router";
import { QuoteGallery } from "@/components/profile/QuoteGallery";
import { PullQuote } from "@/components/editorial/PullQuote";
import { YourQuotesRail } from "@/components/memory/YourQuotesRail";

export const Route = createFileRoute("/app/quotes")({ component: QuotesPage });

function QuotesPage() {
  const quotes = [
    { text: "Some stories ask you to finish them. Others wait quietly until you're ready to be changed.", author: "Chronicle", context: "Weekly Reflection" },
    { text: "The stories we return to say more about us than the stories we finish.", author: "Chronicle", context: "Taste Profile" },
    { text: "Memory isn't about perfect recall. It's about what chooses to stay.", author: "Chronicle", context: "Journal" },
    { text: "Every library is a self-portrait painted in other people's stories.", author: "Chronicle", context: "Quiet Thought" },
  ];
  const hero = quotes[0];
  const rest = quotes.slice(1, 37);

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

      {hero && <PullQuote attribution={`${hero.author} · ${hero.context}`}>{hero.text}</PullQuote>}

      <section className="mt-12">
        <YourQuotesRail />
      </section>

      <section className="mt-16">
        <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          From across your library
        </div>
        <QuoteGallery limit={rest.length} />
      </section>
    </div>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { PosterCard } from "@/components/ui/PosterCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import type { MediaItem } from "@/lib/types";

/**
 * Visual-regression harness route — DO NOT link from the app.
 *
 * Renders a fixed, deterministic gallery of premium interaction primitives
 * against a flat background with stable IDs so a Playwright runner can capture
 * default / hover / active screenshots without remote images, network jitter,
 * or random data. All motion is preserved; the test harness controls reduced
 * motion via the browser context.
 *
 * Reach via http://localhost:8080/visual?ready=1 — the `?ready=1` flag adds a
 * `data-vr-ready` attribute the test waits on before screenshotting.
 */
export const Route = createFileRoute("/visual")({
  beforeLoad: () => {
    if (import.meta.env.PROD) {
      throw notFound();
    }
  },
  component: VisualHarness,
});

const POSTER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23334155'/><stop offset='100%25' stop-color='%231e293b'/></linearGradient></defs><rect width='200' height='300' fill='url(%23g)'/><circle cx='100' cy='150' r='44' fill='%2348596f'/></svg>";

const ITEM = {
  id: "vr-fixture",
  mediaId: "vr-fixture",
  title: "Fixture Title",
  kind: "movie" as const,
  year: 2024,
  rating: 4.2,
  poster: POSTER,
  backdrop: POSTER,
  accent: "var(--primary)",
  progress: 64,
  progressLabel: null,
  status: "in_progress",
  genres: ["Drama"],
  runtime: null,
  creator: null,
  synopsis: "Deterministic fixture for visual regression.",
  favorite: false,
  slug: "vr-fixture",
  mediaType: "movie",
  lastInteractionAt: null,
  rewatchCount: 0,
};

function VisualHarness() {
  return (
    <div
      data-vr-ready="1"
      className="min-h-screen bg-background p-12"
      style={{ fontFeatureSettings: "normal" }}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-12">
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">PosterCard</h2>
          <div data-vr-id="poster-card" className="w-fit">
            <PosterCard item={ITEM} size="md" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            PremiumButton — primary
          </h2>
          <div data-vr-id="btn-primary" className="w-fit">
            <PremiumButton>Continue</PremiumButton>
          </div>

          <h2 className="mt-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            PremiumButton — secondary
          </h2>
          <div data-vr-id="btn-secondary" className="w-fit">
            <PremiumButton variant="secondary">Secondary</PremiumButton>
          </div>

          <h2 className="mt-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            PremiumButton — ghost
          </h2>
          <div data-vr-id="btn-ghost" className="w-fit">
            <PremiumButton variant="ghost">Ghost</PremiumButton>
          </div>
        </section>
      </div>
    </div>
  );
}

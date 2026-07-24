/**
 * Wrapped adapter: API responses → UIWrappedSlide[]
 */

import type { UIWrappedSlide } from "./types";
import type { WrappedResponse } from "@/lib/api/wrapped";

export function adaptWrappedResponse(w: WrappedResponse): UIWrappedSlide[] {
  const slides: UIWrappedSlide[] = [];

  // Intro slide
  slides.push({
    key: "intro",
    eyebrow: `Chronicle ${w.year}`,
    title: "Your year in stories.",
    subtitle: "Pause. Press play. Reflect.",
  });

  // Card slides
  for (const card of w.cards ?? []) {
    slides.push({
      key: `card-${card.rank}`,
      eyebrow: card.type,
      title: card.title,
      subtitle: card.subtitle ?? undefined,
      poster: card.imageUrl ?? undefined,
      value: card.stat ?? undefined,
    });
  }

  // Stat slides
  for (const stat of w.stats ?? []) {
    slides.push({
      key: `stat-${stat.sortOrder}`,
      eyebrow: stat.title,
      value: stat.value,
      accent: undefined,
    });
  }

  // Insight slides
  for (const insight of w.insights ?? []) {
    slides.push({
      key: `insight-${insight.category}`,
      eyebrow: insight.category,
      caption: insight.text,
    });
  }

  // Summary slide
  slides.push({
    key: "summary",
    eyebrow: "Summary",
    caption: w.summary,
  });

  return slides;
}

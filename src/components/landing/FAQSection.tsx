import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What media types does Avuno support?",
    a: "Movies, TV series, anime, books, manga, games, music, podcasts, courses, and YouTube. All ten live under one unified library with a single design language — no switching between apps.",
  },
  {
    q: "Is Avuno really free?",
    a: "Yes. The free plan gives you unlimited media tracking across all categories, a personal timeline, journal entries, and basic analytics. No trial period, no credit card, no surprise paywalls.",
  },
  {
    q: "Can I import from Letterboxd, Goodreads, or MyAnimeList?",
    a: "Import support is on our roadmap. We're building one-click importers for Letterboxd, Goodreads, Backloggd, and MAL so you can bring your entire history with you — no manual re-entry.",
  },
  {
    q: "Who can see my library?",
    a: "Nobody, unless you choose otherwise. Your entire library and journal are private by default. When we launch social features, everything will remain opt-in — you decide what's visible.",
  },
  {
    q: "Can I export my data?",
    a: "Absolutely. We believe your data belongs to you. You can export your full library, journal, and analytics at any time in a standard format. No lock-in, ever.",
  },
  {
    q: "What makes Avuno different from Letterboxd or Goodreads?",
    a: "Those platforms are brilliant — but each covers only one media type. Avuno unifies every kind of story you experience into a single timeline, a single analytics view, and a single memory. Your taste isn't fragmented across five different apps.",
  },
  {
    q: "Is there a mobile app?",
    a: "Avuno is a progressive web app that works beautifully on any device — phone, tablet, or desktop. The same atmosphere, the same calm typography, the same memories. A native app is on the roadmap.",
  },
  {
    q: "How do you make money if it's free?",
    a: "We're building an optional premium tier with advanced analytics, Wrapped history, and AI-powered recommendations. The core tracking experience will always be free.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">
            Questions
          </div>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Everything you'd want to know.
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            And if something isn't here, reach out — we actually reply.
          </p>
        </motion.div>

        <div className="mt-14 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.04,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={`group flex w-full items-start gap-4 rounded-2xl px-6 py-5 text-left transition-all duration-300 ${
                    isOpen
                      ? "glass-strong ring-1 ring-primary/15"
                      : "glass ring-1 ring-white/[0.04] hover:ring-white/[0.08]"
                  }`}
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-[15px] tracking-tight text-foreground md:text-base">
                      {faq.q}
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                            opacity: { duration: 0.25, delay: 0.05 },
                          }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-0.5 shrink-0"
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </motion.div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* soft bleed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(180deg, transparent, oklch(0.14 0.012 270 / 0.6))",
        }}
      />
    </section>
  );
}

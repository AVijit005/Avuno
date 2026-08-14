import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, BookOpen, Clock, Library } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { BlurIn } from "@/components/motion/BlurIn";

// New flagship components
import { InteractiveProductDemo } from "@/components/landing/InteractiveProductDemo";
import { ConnectedSystemVisual } from "@/components/landing/ConnectedSystemVisual";

// Supporting elements
import { MagneticButton } from "@/components/landing/MagneticButton";
import { FAQSection } from "@/components/landing/FAQSection";
import { PremiumButton } from "@/components/ui/PremiumButton";

import { MediaCard } from "@/components/ui/MediaCard";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import type { MediaItem } from "@/lib/types";
import type { UIJournalEntry } from "@/lib/adapters/types";

const DUMMY_MEDIA: MediaItem = {
  id: "dummy-media-1",
  kind: "movie",
  title: "Dune: Part Two",
  year: 2024,
  poster:
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800",
  creator: "Denis Villeneuve",
  status: "completed",
  genres: ["Sci-Fi", "Adventure"],
  synopsis:
    "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
};

const DUMMY_JOURNAL: UIJournalEntry = {
  id: "dummy-journal-1",
  title: "A visually stunning masterpiece",
  content:
    "The scale of this film is unmatched. Villeneuve perfectly captures the essence of Herbert's world.",
  isPrivate: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mood: "Inspired",
  weather: null,
  location: null,
  coverImage: null,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avuno — Your personal media archive, connected" },
      {
        name: "description",
        content:
          "Track what you watch, read, play, and listen to. Your journal, memories, and timeline — connected to every story you finish. Free, private, and beautifully designed.",
      },
      { property: "og:title", content: "Avuno — Your personal media archive, connected" },
      {
        property: "og:description",
        content:
          "Track what you watch, read, play, and listen to. Your journal, memories, and timeline — connected to every story you finish.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://avuno.xyz" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Avuno — Your personal media archive, connected" },
      {
        name: "twitter:description",
        content:
          "Track what you watch, read, play, and listen to. Your journal, memories, and timeline connected.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const reduced = useReducedMotion();
  const [year] = useState(() => new Date().getFullYear());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen selection:bg-primary/30 selection:text-white"
    >
      <AtmosphereBackground />

      {/* 1. LandingNav */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/60 backdrop-blur-xl border-b border-white/[0.04] shadow-sm py-3"
            : "py-6"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 md:px-10">
          <Link to="/" className="flex items-center gap-2 group focus-ring rounded-md outline-none">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <span className="font-display text-sm font-semibold leading-none">A</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground tracking-tight">
              Avuno
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#system"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm"
            >
              Features
            </a>
            <a
              href="#faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors focus-ring"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        {/* 2. Hero Section */}
        <section className="relative px-6 pt-20 pb-32 md:px-10 md:pt-32 md:pb-40 overflow-hidden">
          {/* Soft aurora blob */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[120px] w-[600px] h-[400px] pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            {/* Headline */}
            <BlurIn
              as="h1"
              duration={0.8}
              className="font-display text-display text-foreground mx-auto max-w-3xl"
            >
              A quiet place to remember every story you&apos;ve lived.
            </BlurIn>

            {/* Subcopy */}
            <BlurIn
              as="p"
              delay={0.2}
              className="mx-auto mt-6 max-w-xl text-lg md:text-xl text-muted-foreground"
            >
              Track your movies, books, games, and shows in one unified library. Journal your
              thoughts, map your timeline, and discover your patterns.
            </BlurIn>

            {/* CTA */}
            <BlurIn
              as="div"
              delay={0.3}
              className="mt-10 flex flex-col items-center justify-center gap-4"
            >
              <MagneticButton>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-medium text-black press-scale animate-pulse-glow focus-ring"
                >
                  Start your archive <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </MagneticButton>
              <div className="text-eyebrow text-muted-foreground/60">
                Free forever · No ads · Privacy-first
              </div>
            </BlurIn>
          </div>
        </section>

        {/* 3. Interactive Product Demo */}
        <section id="system" className="relative px-6 py-28 md:px-10 md:py-36">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <div className="text-eyebrow text-primary/80 mb-3">How it works</div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Everything in one place.
              </h2>
            </div>
            <InteractiveProductDemo />
          </div>
        </section>

        {/* 4. Connected System Visual */}
        <section className="relative px-6 py-28 md:px-10 md:py-36">
          <div className="mx-auto max-w-6xl">
            <ConnectedSystemVisual />
          </div>
        </section>

        {/* 5. Feature Showcase */}
        <section id="features" className="relative px-6 py-28 md:px-10 md:py-36 overflow-hidden">
          <div className="mx-auto max-w-5xl space-y-32">
            {/* Feature 1: Library */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
            >
              <div>
                <div className="text-eyebrow text-primary/80 mb-4">Library</div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  All your media, side by side.
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Track eight different media types natively. No switching between apps for movies,
                  games, or books. Every item has a status, optional rating, and lives in a single,
                  unified library.
                </p>
              </div>
              <div className="flex items-center justify-center p-4">
                <div className="w-56 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <MediaCard item={DUMMY_MEDIA} />
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Journal */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
            >
              <div className="order-2 md:order-1 flex items-center justify-center p-4">
                <div className="w-full max-w-sm transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <JournalEntryCard entry={DUMMY_JOURNAL} index={0} />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="text-eyebrow text-primary/80 mb-4">Journal</div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  Your thoughts belong to you.
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Write a journal entry tied directly to the media you just finished. Private,
                  searchable, and always connected back to the thing that sparked it.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Timeline */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
            >
              <div>
                <div className="text-eyebrow text-primary/80 mb-4">Timeline</div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  The shape of your years.
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Every story leaves a node. Scroll back and watch your years rebuild themselves —
                  ratings, journal notes, and memories threaded together chronologically.
                </p>
              </div>
              <div className="flex items-center justify-center p-4">
                <div className="glass rounded-2xl p-6 relative card-interactive w-full max-w-sm">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-primary/20" />
                  <div className="absolute left-[-4px] top-8 w-2 h-2 rounded-full bg-primary" />
                  <div className="pl-6 space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">
                      Oct 24, 2024
                    </div>
                    <div className="font-medium">
                      Finished reading <span className="italic">Dune</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rated 5 stars · Added a memory
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Journal */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
            >
              <div className="order-2 md:order-1 glass rounded-2xl p-6 md:p-8 card-interactive border border-foreground/[0.08]">
                <div className="glass-subtle rounded-2xl p-8 flex items-center justify-center aspect-video">
                  <BookOpen className="w-12 h-12 text-primary/60" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="text-eyebrow text-primary/80 mb-4">Journal</div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  Your thoughts belong to you.
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Write a journal entry tied directly to the media you just finished. Private,
                  searchable, and always connected back to the thing that sparked it.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Timeline */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
            >
              <div>
                <div className="text-eyebrow text-primary/80 mb-4">Timeline</div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  The shape of your years.
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Every story leaves a node. Scroll back and watch your years rebuild themselves —
                  ratings, journal notes, and memories threaded together chronologically.
                </p>
              </div>
              <div className="glass rounded-2xl p-6 md:p-8 card-interactive border border-foreground/[0.08]">
                <div className="glass-subtle rounded-2xl p-8 flex items-center justify-center aspect-video">
                  <Clock className="w-12 h-12 text-primary/60" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 6. Pricing Teaser */}
        <section className="relative px-6 py-28 md:px-10 md:py-36">
          <div className="mx-auto max-w-4xl">
            <div className="glass-subtle rounded-3xl py-16 px-8 text-center border border-foreground/[0.06]">
              <div className="text-eyebrow text-primary/80 mb-4">Simple pricing</div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
                Free to start. Pro when you're ready.
              </h2>
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="glass rounded-full px-4 py-1.5 text-xs font-medium text-foreground">
                  Free tier
                </span>
                <span className="glass rounded-full px-4 py-1.5 text-xs font-medium text-primary border-primary/20">
                  Pro tier
                </span>
              </div>
              <PremiumButton variant="secondary" asChild>
                <Link to="/pricing">View pricing plans</Link>
              </PremiumButton>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <div id="faq">
          <FAQSection />
        </div>
      </main>

      {/* 8. Footer */}
      <footer
        className="relative border-t border-foreground/[0.06] bg-background/50 backdrop-blur-md px-6 py-12 text-xs text-muted-foreground md:px-10"
        role="contentinfo"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground"
                aria-hidden="true"
              >
                <span className="font-display text-xs font-semibold leading-none">A</span>
              </div>
              <span className="font-display text-sm font-semibold text-foreground">Avuno</span>
            </div>
            <p className="max-w-[200px] leading-relaxed text-muted-foreground/70">
              Your personal media archive — connected.
            </p>
            <p className="mt-3 text-muted-foreground/50">© {year} Avuno</p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Product
              </div>
              <nav className="flex flex-col gap-2" aria-label="Product navigation">
                <a href="#system" className="hover:text-foreground transition-colors">
                  How it works
                </a>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  FAQ
                </a>
              </nav>
            </div>

            <div>
              <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Account
              </div>
              <nav className="flex flex-col gap-2" aria-label="Account navigation">
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Sign in
                </Link>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Get started
                </Link>
              </nav>
            </div>

            <div>
              <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Legal
              </div>
              <nav className="flex flex-col gap-2" aria-label="Legal navigation">
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
                <a
                  href="mailto:press@avuno.xyz"
                  className="hover:text-foreground transition-colors"
                >
                  Press
                </a>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

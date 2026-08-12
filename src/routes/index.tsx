import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";

import { LivingHero } from "@/components/landing/LivingHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductStory } from "@/components/landing/ProductStory";
import { SceneSection } from "@/components/landing/SceneSection";
import { UniversalMediaShowcase } from "@/components/landing/UniversalMediaShowcase";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { TimelinePreview } from "@/components/landing/TimelinePreview";
import { AnalyticsPreview } from "@/components/landing/AnalyticsPreview";
import { CollectionsPreview } from "@/components/landing/CollectionsPreview";
import { MemoryCapsule } from "@/components/landing/MemoryCapsule";
import { WrappedPreview } from "@/components/landing/WrappedPreview";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { TrustSignals } from "@/components/landing/TrustSignals";
import { FAQSection } from "@/components/landing/FAQSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avuno — Your personal media archive, connected" },
      {
        name: "description",
        content:
          "Track what you watch, read, play, and listen to. Keep your journal, memories, and timeline beautifully connected to every story you finish.",
      },
      { property: "og:title", content: "Avuno — Your personal media archive, connected" },
      {
        property: "og:description",
        content:
          "Track what you watch, read, play, and listen to. Keep your journal, memories, and timeline beautifully connected.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Avuno — Your personal media archive, connected" },
      {
        name: "twitter:description",
        content:
          "Track what you watch, read, play, and listen to. Keep your journal, memories, and timeline connected.",
      },
    ],
  }),
  component: Landing,
});

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Library", href: "#library" },
  { label: "Journal", href: "#journal" },
  { label: "Timeline", href: "#timeline" },
  { label: "Analytics", href: "#analytics" },
];

function Landing() {
  const navRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const navBlur = useTransform(scrollY, [0, 200], [8, 24]);
  const navBg = useTransform(
    scrollY,
    [0, 200],
    ["oklch(0.14 0.012 270 / 0.35)", "oklch(0.14 0.012 270 / 0.75)"],
  );
  const [year, setYear] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => setYear(new Date().getFullYear().toString()), []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AtmosphereBackground intensity="vivid" />

      {/* Nav */}
      <motion.header
        ref={navRef}
        style={{
          backdropFilter: useTransform(navBlur, (v) => `blur(${v}px) saturate(180%)`),
          backgroundColor: navBg,
        }}
        className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="Avuno home">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <span className="font-display text-base leading-none">A</span>
            </div>
            <span className="font-display text-lg leading-none">Avuno</span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden items-center gap-1 rounded-2xl px-1 py-1 text-sm md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-xl px-3 py-1.5 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden text-sm text-muted-foreground transition hover:text-foreground md:inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
            >
              Sign in
            </Link>
            <MagneticButton>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black press-scale hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Start with Avuno <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </MagneticButton>

            {/* Mobile menu toggle */}
            <button
              className="ml-1 grid h-9 w-9 place-items-center rounded-xl glass md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open navigation menu"
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1">
                <span
                  className={`block h-px w-5 bg-foreground transition-transform ${mobileMenuOpen ? "translate-y-1 rotate-45" : ""}`}
                />
                <span
                  className={`block h-px w-5 bg-foreground transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block h-px w-5 bg-foreground transition-transform ${mobileMenuOpen ? "-translate-y-1 -rotate-45" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/[0.06] px-6 py-4 md:hidden glass"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <Link
                  to="/auth"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start with Avuno <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

      <main>
        {/* Hero */}
        <LivingHero />

        {/* How it works — step-by-step system explanation */}
        <HowItWorks />

        {/* Media types showcase */}
        <SceneSection
          id="library"
          eyebrow="Universal library"
          title={<>Ten media types. One quiet home.</>}
          intro="Movies, series, anime, books, manga, games, music, podcasts, courses, and YouTube — every kind of story you experience, organized under one design language and one timeline."
        >
          <UniversalMediaShowcase />
        </SceneSection>

        {/* Continue / Dashboard */}
        <SceneSection
          eyebrow="Continue your story"
          align="center"
          title={<>A library that knows where you left off.</>}
          intro="Avuno greets you with the story you're in the middle of — themed to whatever you're watching, reading, or playing right now."
        >
          <DashboardShowcase />
        </SceneSection>

        {/* Product Story — the connected narrative */}
        <ProductStory />

        {/* Journal */}
        <SceneSection
          id="journal"
          eyebrow="Journal"
          title={<>Your thoughts belong to you.</>}
          intro="Write a journal entry tied directly to the media you just finished. Private, searchable, and always connected back to the thing that sparked it."
        >
          <MemoryCapsule />
        </SceneSection>

        {/* Timeline */}
        <SceneSection
          id="timeline"
          eyebrow="Timeline"
          title={<>The shape of your years.</>}
          intro="Every story leaves a node. Scroll back and watch your years rebuild themselves — ratings, journal notes, and memories threaded together chronologically."
        >
          <TimelinePreview />
        </SceneSection>

        {/* Analytics */}
        <SceneSection
          id="analytics"
          eyebrow="Analytics"
          align="center"
          title={<>The patterns you didn't notice.</>}
          intro="Hours, genres, monthly rhythm — visualized clearly, without performance pressure. Your data, your picture."
        >
          <AnalyticsPreview />
        </SceneSection>

        {/* Collections */}
        <SceneSection
          eyebrow="Collections"
          title={<>Curate like a film festival.</>}
          intro="Group anything with anything — a Nolan retrospective, a 2025 reading shelf, a Soulslike pilgrimage. Covers drift; labels float; nothing feels generic."
        >
          <CollectionsPreview />
        </SceneSection>

        {/* Wrapped */}
        <SceneSection eyebrow="Wrapped" align="center">
          <WrappedPreview />
        </SceneSection>

        {/* Trust */}
        <TrustSignals />

        {/* FAQ */}
        <FAQSection />

        {/* Final CTA */}
        <section className="relative px-6 py-36 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.24em] text-primary"
            >
              Begin
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-display text-5xl tracking-tight md:text-7xl"
            >
              <span className="text-gradient-aurora">What does</span>
              <br />
              <span className="italic text-muted-foreground">your archive look like?</span>
            </motion.h2>
            <p className="mx-auto mt-6 max-w-lg text-muted-foreground md:text-lg">
              Your library, your timeline, your memories — waiting to be connected.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-medium text-black press-scale animate-pulse-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Start with Avuno <ArrowRight className="h-4 w-4" />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.18}>
                <a
                  href="#how-it-works"
                  className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-medium press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  See how it works
                </a>
              </MagneticButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border/40 px-6 py-12 text-xs text-muted-foreground md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <span className="font-display text-xs leading-none">A</span>
              </div>
              <span className="font-display text-sm text-foreground">Avuno</span>
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
              <div className="flex flex-col gap-2">
                <a href="#how-it-works" className="hover:text-foreground transition">
                  How it works
                </a>
                <a href="#library" className="hover:text-foreground transition">
                  Library
                </a>
                <a href="#journal" className="hover:text-foreground transition">
                  Journal
                </a>
                <a href="#timeline" className="hover:text-foreground transition">
                  Timeline
                </a>
                <a href="#analytics" className="hover:text-foreground transition">
                  Analytics
                </a>
              </div>
            </div>

            <div>
              <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Account
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/auth" className="hover:text-foreground transition">
                  Sign in
                </Link>
                <Link to="/auth" className="hover:text-foreground transition">
                  Get started
                </Link>
              </div>
            </div>

            <div>
              <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Legal
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/privacy" className="hover:text-foreground transition">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-foreground transition">
                  Terms
                </Link>
                <a href="mailto:press@avuno.xyz" className="hover:text-foreground transition">
                  Press
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

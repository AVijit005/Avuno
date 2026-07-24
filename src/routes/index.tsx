import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRef } from "react";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";

import { LivingHero } from "@/components/landing/LivingHero";
import { SceneSection } from "@/components/landing/SceneSection";
import { UniversalMediaShowcase } from "@/components/landing/UniversalMediaShowcase";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { TimelinePreview } from "@/components/landing/TimelinePreview";
import { AnalyticsPreview } from "@/components/landing/AnalyticsPreview";
import { CollectionsPreview } from "@/components/landing/CollectionsPreview";
import { MemoryCapsule } from "@/components/landing/MemoryCapsule";
import { WrappedPreview } from "@/components/landing/WrappedPreview";
import { CrossPlatform } from "@/components/landing/CrossPlatform";
import { MagneticButton } from "@/components/landing/MagneticButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chronicle — Every story you finish becomes part of your story" },
      {
        name: "description",
        content:
          "A cinematic personal media journal for movies, anime, books, games, music and more. Beautifully organized, gently remembered.",
      },
      { property: "og:title", content: "Chronicle" },
      { property: "og:description", content: "Every story you finish becomes part of your story." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const navBlur = useTransform(scrollY, [0, 200], [8, 24]);
  const navBg = useTransform(
    scrollY,
    [0, 200],
    ["oklch(0.14 0.012 270 / 0.35)", "oklch(0.14 0.012 270 / 0.7)"],
  );

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
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <span className="font-display text-base leading-none">C</span>
            </div>
            <span className="font-display text-lg leading-none">Chronicle</span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-2xl px-1 py-1 text-sm md:flex">
            {[
              { l: "Experience", h: "#experience" },
              { l: "Library", h: "#library" },
              { l: "Timeline", h: "#timeline" },
              { l: "Wrapped", h: "#wrapped" },
            ].map((l) => (
              <a
                key={l.l}
                href={l.h}
                className="rounded-xl px-3 py-1.5 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
              >
                {l.l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden text-sm text-muted-foreground transition hover:text-foreground md:inline-block"
            >
              Sign in
            </Link>
            <MagneticButton>
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black press-scale hover:bg-white/90"
              >
                Enter <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </motion.header>

      <main>
        <LivingHero />

      <SceneSection
        id="experience"
        eyebrow="One library"
        title={
          <>
            <span className="text-gradient-aurora">Ten media types.</span>
            <br />
            One quiet memory.
          </>
        }
        intro="Movies, series, anime, books, manga, games, music, podcasts, courses, YouTube — every kind of story you experience lives under a single roof, with one design language and one timeline."
      >
        <UniversalMediaShowcase />
      </SceneSection>

      <SceneSection
        id="library"
        eyebrow="Continue your story"
        align="center"
        title={<>A cinematic command center.</>}
        intro="Chronicle greets you with the story you're already in the middle of — themed to whatever you're watching, reading or playing right now."
      >
        <DashboardShowcase />
      </SceneSection>

      <SceneSection
        id="timeline"
        eyebrow="Memory Timeline"
        title={<>The shape of your years.</>}
        intro="Every story leaves a node. Scroll back and watch your years rebuild themselves — ratings, journal notes, achievements quietly threaded together."
      >
        <TimelinePreview />
      </SceneSection>

      <SceneSection
        eyebrow="Analytics"
        align="center"
        title={<>The patterns you didn't notice.</>}
        intro="Hours, streaks, genres, monthly rhythm — visualized as gently as the rest of Chronicle, never as a productivity dashboard."
      >
        <AnalyticsPreview />
      </SceneSection>

      <SceneSection
        eyebrow="Collections"
        title={<>Curate like a film festival.</>}
        intro="Group anything with anything — a Nolan retrospective, a 2025 reading shelf, a Soulslike pilgrimage. Covers drift; labels float; nothing feels generic."
      >
        <CollectionsPreview />
      </SceneSection>

      <SceneSection eyebrow="Memory capsule" align="center">
        <MemoryCapsule />
      </SceneSection>

      <SceneSection id="wrapped" eyebrow="">
        <WrappedPreview />
      </SceneSection>

      <SceneSection
        eyebrow="Everywhere you are"
        title={<>The same Chronicle, beautifully adapted.</>}
        intro="Desktop, tablet, phone. The same atmosphere, the same calm typography, the same memories — wherever your story finds you."
      >
        <CrossPlatform />
      </SceneSection>

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
            <span className="text-gradient-aurora">Start building</span>
            <br />
            <span className="italic text-muted-foreground">your story today.</span>
          </motion.h2>
          <p className="mx-auto mt-6 max-w-lg text-muted-foreground md:text-lg">
            One quiet place to hold every story you've ever finished — and the ones still unfolding.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-medium text-black press-scale animate-pulse-glow"
              >
                Enter Chronicle <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.18}>
              <Link
                to="/app"
                className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-medium press-scale"
              >
                <Sparkles className="h-4 w-4 text-primary" /> Experience the demo
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>
      </main>

      <footer className="relative border-t border-border/40 px-6 py-12 text-xs text-muted-foreground md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <span className="font-display text-xs leading-none">C</span>
            </div>
            <span>Chronicle © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-5">
            <a href="mailto:press@chronicle.app" className="hover:text-foreground">
              Press
            </a>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

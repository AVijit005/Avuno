import { CountUp } from "@/components/analytics/AnalyticsKit";
import { MemoryMilestones } from "@/components/memory/MemoryMilestones";
import { FirstMoments } from "@/components/memory/FirstMoments";
import { LiveStatsStrip } from "@/components/memory/LiveStatsStrip";
import { YourReflectionsRail } from "@/components/memory/YourReflectionsRail";
import { YourQuotesRail } from "@/components/memory/YourQuotesRail";
import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Share2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useOverview, useInsights } from "@/hooks/use-analytics";
import { adaptOverview, adaptInsights } from "@/lib/adapters/analytics";
import type { UIOverview, UIInsights, UIWrappedSlide } from "@/lib/adapters/types";

export const Route = createFileRoute("/app/wrapped")({ 
  component: WrappedPage,
  pendingComponent: PageSkeleton,
});

declare global {
  // eslint-disable-next-line no-var
  var html2canvas: ((target: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>) | undefined;
}

function downloadAsImage() {
  if (typeof window === 'undefined') return;
  if (window.html2canvas) {
    captureAndDownload();
    return;
  }
  const existing = document.querySelector('script[src*="html2canvas"]');
  if (existing) {
    captureAndDownload();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSK/6d101tGsAHZI/A94g==';
  script.crossOrigin = 'anonymous';
  script.onload = () => captureAndDownload();
  script.onerror = () => toast.error("Failed to load image generator. Check your connection.");
  document.head.appendChild(script);
}

function captureAndDownload() {
  const el = document.getElementById('chronicle-wrapped-root');
  if (!el || !window.html2canvas) {
    toast.error("Failed to generate image.");
    return;
  }
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#090a0f';
  window.html2canvas(el, { backgroundColor: bg }).then((canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = 'chronicle-wrapped.png';
    link.href = canvas.toDataURL();
    link.click();
  }).catch((err: unknown) => {
    console.error("Failed to generate image", err);
    toast.error("Failed to generate image.");
  });
}

function WrappedPage() {
  const { data: overview, isLoading: oLoad, isError: oErr, refetch: oRef } = useOverview();
  const { data: insights, isLoading: iLoad, isError: iErr, refetch: iRef } = useInsights();

  if (oLoad || iLoad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Sparkles className="h-8 w-8 animate-pulse text-primary/50" />
        <p className="text-muted-foreground animate-pulse">Preparing your wrapped...</p>
      </div>
    );
  }

  if (oErr || iErr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
        <p className="text-destructive">Failed to load wrapped.</p>
        <PremiumButton onClick={() => { oRef(); iRef(); }} variant="secondary">Retry</PremiumButton>
      </div>
    );
  }

  if (!overview || !insights) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-muted-foreground">No data available.</p>
      </div>
    );
  }

  const o = adaptOverview(overview);
  const i = adaptInsights(insights);

  const slides: UIWrappedSlide[] = [
    {
      key: "intro",
      eyebrow: "Welcome to Chronicle",
      title: "Your Year in Stories",
      caption: "A look back at everything you watched, read, played, and lived.",
      accent: "var(--primary)",
    },
    {
      key: "total-items",
      eyebrow: "A vast journey",
      value: o.totalItems,
      caption: "stories kept you company this year.",
      accent: "oklch(0.65 0.22 295)",
    },
    {
      key: "hours-spent",
      eyebrow: "Time well spent",
      value: o.hoursSpent,
      unit: "h",
      caption: "immersed in different worlds.",
      accent: "oklch(0.72 0.16 160)",
    },
    {
      key: "favorite-genre",
      eyebrow: "Your anchor",
      value: i.favoriteGenre || "Unknown",
      caption: "was your genre of choice when you needed a sure thing.",
      accent: "oklch(0.82 0.16 80)",
    },
    {
      key: "thanks",
      eyebrow: "Thank you",
      title: "Here's to the next chapter.",
      caption: "Keep exploring.",
      accent: "var(--primary)",
    },
  ];

  return (
    <div className="-mx-4 -mt-6 md:-mx-8" id="chronicle-wrapped-root">
      {/* Snap-scroll container */}
      <div className="snap-y snap-mandatory overflow-y-auto">
        {slides.map((s, idx) => (
          <Slide key={s.key} index={idx} slide={s} last={idx === slides.length - 1} totalSlides={slides.length} />
        ))}
        <ShareSection overview={o} insights={i} />
      </div>

      {/* Memory · Milestones & firsts */}
      <div className="mx-4 mt-12 space-y-16 pb-24 md:mx-8">
        <LiveStatsStrip eyebrow="Your real year" />

        <YourReflectionsRail title="Reflections that defined your year" eyebrow="Your words" />
        <YourQuotesRail title="Lines you kept" eyebrow="Your quotes" />
      </div>
    </div>
  );
}

function Slide({ slide, index, last, totalSlides }: { slide: UIWrappedSlide; index: number; last: boolean; totalSlides: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const accent = "accent" in slide ? slide.accent : "oklch(0.65 0.22 295)";
  const poster = "poster" in slide ? slide.poster : undefined;

  // intro / outro / value slides
  const isText = slide.key === "intro" || slide.key === "thanks";

  return (
    <section
      ref={ref}
      className="relative grid min-h-[100svh] snap-start place-items-center overflow-hidden px-6 py-16"
    >
      {/* Background lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(ellipse 80% 60% at 50% 40%, ${accent}/25, transparent 60%)`.replace(
                "/25",
                " / 0.25",
              ),
          }}
        />
        {poster && (
          <>
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
          </>
        )}
      </div>

      <motion.div style={{ y, opacity }} className="relative mx-auto w-full max-w-3xl text-center">
        {isText ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
            >
              {slide.eyebrow}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, filter: "blur(0)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
              className="mt-8 font-display text-6xl tracking-tight md:text-8xl leading-[1]"
            >
              <span className="text-gradient-aurora">
                {"title" in slide ? slide.title : slide.value}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-lg text-muted-foreground"
            >
              {"subtitle" in slide ? slide.subtitle : slide.caption}
            </motion.p>
            {last && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-10 flex justify-center gap-3"
              >
                <PremiumButton variant="primary" icon={<Share2 className="h-4 w-4" />} onClick={() => navigator.share?.({ title: "Chronicle Wrapped", url: window.location.href }).catch(e => console.error("Share failed", e))}>
                  Share your year
                </PremiumButton>
                <PremiumButton variant="secondary" icon={<Download className="h-4 w-4" />} onClick={downloadAsImage}>
                  Download
                </PremiumButton>
              </motion.div>
            )}
          </>
        ) : (
          <div
            className={`grid items-center gap-10 ${
              index % 3 === 0
                ? "md:grid-cols-[auto_1fr]"
                : index % 3 === 1
                  ? "md:grid-cols-[1fr_auto]"
                  : "md:grid-cols-1 md:text-center"
            }`}
          >
            {poster && index % 3 !== 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, rotate: index % 2 === 0 ? -2 : 2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative mx-auto overflow-hidden rounded-3xl ${
                  index % 4 === 0 ? "h-80 w-56" : index % 4 === 1 ? "h-72 w-72" : "h-96 w-64"
                } ${index % 3 === 1 ? "md:order-2" : ""}`}
              >
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />
                <img src={poster} alt="" className="h-full w-full object-cover" />
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  style={{ boxShadow: `0 0 60px ${accent}` }}
                />
              </motion.div>
            )}
            <div
              className={
                poster && index % 3 !== 2
                  ? index % 3 === 1
                    ? "text-right md:order-1"
                    : "text-left"
                  : "text-center"
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
              >
                {slide.eyebrow}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, filter: "blur(0)" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.15 }}
                className={`mt-6 font-display tracking-tight leading-[0.95] ${
                  index % 5 === 0
                    ? "text-7xl md:text-[10rem]"
                    : index % 5 === 1
                      ? "text-5xl md:text-7xl"
                      : "text-6xl md:text-8xl"
                }`}
              >
                {typeof slide.value === "number" ? (
                  <span style={{ color: accent }}>
                    <CountUp to={slide.value} suffix={"unit" in slide ? (slide.unit ?? "") : ""} />
                  </span>
                ) : (
                  <span className="text-gradient-aurora">{slide.value}</span>
                )}
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-5 text-lg text-muted-foreground max-w-md"
              >
                {slide.caption}
              </motion.p>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="mt-12 flex justify-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-6 rounded-full"
              style={{ background: i === index ? "var(--foreground)" : "oklch(1 0 0 / 0.15)" }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function ShareSection({ overview: o, insights: i }: { overview: UIOverview; insights: UIInsights }) {
  return (
    <section className="relative grid min-h-[100svh] snap-start place-items-center px-6 py-16">
      <PremiumGlass
        variant="strong"
        className="relative w-full max-w-md overflow-hidden rounded-[36px] p-8"
        glow="oklch(0.65 0.22 295 / 0.5)"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-amber-300/10" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            Chronicle {new Date().getFullYear()} · Share card
          </div>
          <div className="mt-4 font-display text-4xl tracking-tight">Your year in stories</div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { l: "Most Rewatched", v: i.mostRewatchedMedia || "N/A" },
              { l: "Hours", v: o.hoursSpent.toLocaleString() },
              { l: "Favorite Genre", v: i.favoriteGenre || "N/A" },
              { l: "Stories Completed", v: o.completedItems.toLocaleString() },
            ].map((s) => (
              <div key={s.l} className="glass-subtle rounded-2xl p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.l}
                </div>
                <div className="mt-1 font-display text-xl tracking-tight">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <PremiumButton variant="primary" size="sm" icon={<Share2 className="h-3.5 w-3.5" />} onClick={() => navigator.share?.({ title: "Chronicle Wrapped", url: window.location.href }).catch(e => console.error("Share failed", e))}>
              Share
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={downloadAsImage}
            >
              Download
            </PremiumButton>
          </div>
        </div>
      </PremiumGlass>
    </section>
  );
}

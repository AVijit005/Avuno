import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Calendar,
  AlignLeft,
  BarChart3,
  Clock,
  Star,
  Heart,
} from "lucide-react";
import { useMouseParallax } from "@/lib/useParallax";
import { MagneticButton } from "./MagneticButton";

export function LivingHero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.94]);
  const { x: mx, y: my } = useMouseParallax(15);

  const px = useTransform(mx, (v) => v * 0.8);
  const py = useTransform(my, (v) => v * 0.8);
  const pxDeep = useTransform(mx, (v) => v * 1.5);
  const pyDeep = useTransform(my, (v) => v * 1.5);
  const rx = useTransform(my, (v) => v * -0.05);
  const ry = useTransform(mx, (v) => v * 0.05);

  const headline = ["Your", "personal", "media", "archive", "—", "connected."];

  return (
    <section ref={ref} className="relative px-6 pt-36 pb-24 md:px-10 md:pt-44 md:pb-32">
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="mx-auto max-w-6xl">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-subtle mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-primary" /> The Cinematic Journal
          </motion.div>

          <h1 className="mt-8 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-[6.5rem]">
            <span className="block">
              {headline.map((w, i) => (
                <motion.span
                  key={w + i}
                  initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block whitespace-pre text-gradient-aurora"
                >
                  {w + (w === "—" ? " " : " ")}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mx-auto mt-8 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Track what you watch, read, play, and listen to. Keep your journal, memories, and
            timeline beautifully connected to every story you finish.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.45 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <MagneticButton>
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-medium text-black press-scale animate-pulse-glow"
              >
                Start with Avuno
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.18}>
              <a
                href="#experience"
                className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium press-scale"
              >
                See how it works
              </a>
            </MagneticButton>
          </motion.div>
        </div>

        {/* 3D Product Composition */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-20 h-[400px] w-full max-w-5xl md:h-[600px] perspective-1000"
        >
          <motion.div
            style={{ x: px, y: py, rotateX: rx, rotateY: ry }}
            className="relative h-full w-full transform-style-3d"
          >
            {/* Background Library Window */}
            <div className="glass-subtle absolute inset-0 md:inset-12 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transform-z-[-20px]">
              <div className="flex h-12 items-center border-b border-white/5 px-4 gap-4 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex gap-4 text-xs font-medium text-muted-foreground/50 ml-4">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <LayoutGrid className="h-3.5 w-3.5" /> Library
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Timeline
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlignLeft className="h-3.5 w-3.5" /> Journal
                  </div>
                  <div className="flex items-center gap-1.5 hidden md:flex">
                    <BarChart3 className="h-3.5 w-3.5" /> Analytics
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden relative opacity-40 blur-[1px]">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/5"
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
            </div>

            {/* Foreground Detail & Memory Window (The core connection) */}
            <motion.div
              style={{ x: pxDeep, y: pyDeep }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[700px] h-[300px] md:h-[400px] glass rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden transform-z-[40px]"
            >
              {/* Left Side: Media Focus */}
              <div className="w-2/5 md:w-1/3 bg-black/40 border-r border-white/5 p-4 md:p-6 flex flex-col justify-end relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4a2d3d]/40 to-transparent mix-blend-overlay" />
                <div className="relative z-10">
                  <div className="text-[10px] uppercase tracking-widest text-primary/80 mb-2">
                    Movie
                  </div>
                  <h3 className="font-display text-xl md:text-3xl text-white leading-tight">
                    Interstellar
                  </h3>
                  <div className="flex items-center gap-2 mt-3 text-xs text-white/60">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span>5.0</span>
                    <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                    <span>2014</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Connections (Journal + Timeline) */}
              <div className="flex-1 p-5 md:p-8 flex flex-col justify-center gap-6 relative">
                {/* Connection line */}
                <div className="absolute left-6 md:left-9 top-8 bottom-8 w-px bg-gradient-to-b from-white/10 via-primary/30 to-transparent" />

                <div className="relative pl-6 md:pl-8">
                  <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border border-primary bg-background shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                    <Clock className="h-3 w-3" /> Today, 10:42 PM
                  </div>
                  <div className="glass-subtle rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-white/90 font-medium font-serif leading-relaxed italic">
                      "Love is the one thing we're capable of perceiving that transcends dimensions
                      of time and space."
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-[11px] text-white/50 uppercase tracking-widest">
                      <Heart className="h-3 w-3 fill-primary/30 text-primary/50" />
                      Marked as Memory
                    </div>
                  </div>
                </div>

                <div className="relative pl-6 md:pl-8 opacity-70">
                  <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-white/20" />
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                    Added to Timeline
                  </div>
                  <div className="text-sm text-white/70">First watched in IMAX</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

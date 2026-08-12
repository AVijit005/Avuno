import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { CountUp } from "@/components/landing/CountUp";
import { useCollections } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";

export function CollectionsHero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const { data: collections } = useCollections();
  const allCollections = collections?.map(adaptCollectionResponse) ?? [];
  const totalMedia = allCollections.reduce((s, c) => s + c.itemCount, 0);
  const drift = allCollections.slice(0, 6);

  return (
    <div
      ref={ref}
      className="relative isolate overflow-hidden rounded-[40px] ring-1 ring-white/10"
      style={{ boxShadow: "0 60px 140px -40px oklch(0 0 0 / 0.65)" }}
    >
      {/* atmosphere */}
      <div aria-hidden className="absolute inset-0"></div>

      <div className="relative grid grid-cols-1 gap-10 p-8 md:grid-cols-[1.1fr_1fr] md:items-center md:p-14 lg:p-20">
        <motion.div style={{ y }}>
          <div className="text-[10px] uppercase tracking-[0.22em] text-primary/90">Collections</div>
          <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
            Curated shelves
            <br />
            from your story.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Every collection is a part of your personality &mdash; arranged the way only you would.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            <Stat label="Collections" value={allCollections.length} />
            <Stat label="Total media" value={totalMedia} />
            <Stat label="Updated this week" value={3} />
          </div>
        </motion.div>

        {/* floating collage */}
        <div className="relative h-[360px] md:h-[440px]">
          {drift.map((c, i) => {
            const covers =
              (c.items
                ?.slice(0, 4)
                .map((item) => item.posterUrl)
                .filter(Boolean) as string[]) ?? [];
            const coverImg = c.cover ?? covers[0] ?? "";
            const top = `${10 + (i % 3) * 28}%`;
            const left = `${5 + ((i * 14) % 75)}%`;
            const rot = (i % 2 === 0 ? -1 : 1) * (4 + i);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20, rotate: rot }}
                animate={{ opacity: 1, y: 0, rotate: rot }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, rotate: 0, scale: 1.04 }}
                className="absolute h-28 w-44 overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-[0_20px_50px_-15px_oklch(0_0_0/0.7)]"
                style={{ top, left, animation: `slow-float ${6 + i}s ease-in-out infinite` }}
              >
                <img
                  src={coverImg}
                  alt=""
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, transparent 40%, ${c.color ?? "var(--primary)"} / 0.5, oklch(0 0 0 / 0.8))`,
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-2 text-[10px] text-white">
                  {c.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-3xl tracking-tight tabular-nums">
        <CountUp to={value} />
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

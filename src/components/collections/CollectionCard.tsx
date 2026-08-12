import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import type { UICollection } from "@/lib/adapters/types";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumImage } from "@/components/ui/PremiumImage";

export function CollectionCard({
  collection: c,
  size = "md",
}: {
  collection: UICollection;
  size?: "sm" | "md" | "lg";
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-60, 60], [1, -1]), { stiffness: 200, damping: 22 });
  const ry = useSpring(useTransform(x, [-60, 60], [-1, 1]), { stiffness: 200, damping: 22 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const aspect =
    size === "lg" ? "aspect-[16/10]" : size === "sm" ? "aspect-square" : "aspect-[4/5]";

  const accent = c.color ?? "var(--primary)";
  const coverImages =
    (c.items
      ?.slice(0, 4)
      .map((item) => item.posterUrl)
      .filter(Boolean) as string[]) ?? [];
  const coverSrc = c.cover ?? coverImages[0] ?? "";

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}
      className="group relative h-full"
    >
      <PremiumGlass
        interactive
        glow={accent}
        className={`relative block ${aspect} overflow-hidden rounded-3xl transition-shadow duration-300 group-hover:shadow-[0_20px_40px_-20px_oklch(0_0_0/0.5)]`}
      >
        <Link
          to="/app/collections/$id"
          params={{ id: c.id }}
          aria-label={`View collection: ${c.name}`}
          className="absolute inset-0"
        >
          {/* collage of covers */}
          {coverImages.length >= 4 ? (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {coverImages.slice(0, 4).map((src, i) => (
                <PremiumImage
                  key={i}
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                />
              ))}
            </div>
          ) : (
            <PremiumImage
              src={coverSrc}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            />
          )}
          {/* tinted gradient */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 35%, ${accent.startsWith("var(") ? `color-mix(in oklch, ${accent}, transparent 58%)` : `${accent}66`}, oklch(0 0 0 / 0.9))`,
            }}
          />
          {/* accent edge */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
            style={{ boxShadow: `inset 0 0 0 1px ${accent}` }}
          />

          {/* meta */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="glass-subtle inline-block rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
              {c.itemCount} items
            </div>
            <div className="mt-2 font-display text-2xl leading-tight text-white">{c.name}</div>
            <div className="mt-1 max-w-md translate-y-2 text-[12px] text-white/75 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {c.description}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
              Updated {new Date(c.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </Link>
      </PremiumGlass>
    </motion.div>
  );
}

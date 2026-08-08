import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import type { UICollection } from "@/lib/adapters/types";

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
      className="group relative"
    >
      <Link
        to="/app/collections/$id"
        params={{ id: c.id }}
        aria-label={`View collection: ${c.name}`}
        className={`relative block ${aspect} overflow-hidden rounded-3xl ring-1 ring-white/10 transition-shadow duration-500 group-hover:shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)]`}
      >
        {/* collage of covers */}
        {coverImages.length >= 4 ? (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {coverImages.slice(0, 4).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.08]"
              />
            ))}
          </div>
        ) : (
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.08]"
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
        {/* reflection */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition duration-700 group-hover:translate-x-0 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(120deg, transparent 35%, oklch(1 0 0 / 0.16) 50%, transparent 65%)",
            mixBlendMode: "overlay",
          }}
        />
        {/* accent edge */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${accent}` }}
        />

        {/* meta */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="glass-subtle inline-block rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-white/85">
            {c.itemCount} items
          </div>
          <div className="mt-2 font-display text-2xl leading-tight text-white">{c.name}</div>
          <div className="mt-1 max-w-md translate-y-2 text-[12px] text-white/75 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {c.description}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
            Updated {new Date(c.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

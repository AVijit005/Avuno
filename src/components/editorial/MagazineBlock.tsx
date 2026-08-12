import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ease } from "@/lib/motion";

/** Magazine layout: large image left, narrow text column right.
 *  Use sparingly to break dashboard rhythm. */
export function MagazineBlock({
  eyebrow,
  title,
  body,
  image,
  side = "left",
  footer,
}: {
  eyebrow?: string;
  title: ReactNode;
  body: ReactNode;
  image: string;
  side?: "left" | "right";
  footer?: ReactNode;
}) {
  const imageFirst = side === "left";
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, ease: ease.reveal }}
      className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12 lg:gap-16"
    >
      <div className={imageFirst ? "order-1" : "md:order-2"}>
        <div
          className="relative aspect-[5/6] overflow-hidden rounded-3xl ring-1 ring-white/8"
          style={{ boxShadow: "0 40px 80px -40px oklch(0 0 0 / 0.85)" }}
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 55%, oklch(0 0 0 / 0.55))" }}
          />
        </div>
      </div>
      <div className={imageFirst ? "order-2" : "md:order-1"}>
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.28em] text-primary/85">{eyebrow}</div>
        )}
        <h2 className="mt-3 font-display text-3xl tracking-tight md:text-5xl">{title}</h2>
        <div className="mt-5 max-w-prose text-[15px] leading-relaxed text-foreground/85">
          {body}
        </div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </motion.section>
  );
}

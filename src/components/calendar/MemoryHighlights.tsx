import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "motion/react";


interface Props {
  highlights?: { label: string; value: string; note: string; media: { poster: string | null } }[];
}

const BENTO_SPANS = ["md:col-span-2", "md:col-span-1", "md:col-span-1", "md:col-span-2", "md:col-span-2", "md:col-span-1"];

export function MemoryHighlights({ highlights: propHighlights }: Props) {
  const highlights = propHighlights?.length ? propHighlights.map((h) => ({ ...h, media: { backdrop: h.media.poster, poster: h.media.poster } })) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {highlights.slice(0, 6).map((h, i) => (
        <BentoCard key={h.label} h={h} colSpan={BENTO_SPANS[i] ?? "md:col-span-1"} index={i} />
      ))}
    </div>
  );
}

function BentoCard({ h, colSpan, index }: { h: { label: string; value: string; note: string; media: { backdrop?: string | null; poster?: string | null } }; colSpan: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const radialGlow = useMotionTemplate`radial-gradient(180px circle at ${cursorX}px ${cursorY}px, rgba(139,92,246,0.18), transparent 70%)`;

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  }

  return (
    <motion.div
      ref={ref}
      className={`${colSpan} relative overflow-hidden rounded-[22px] cursor-pointer min-h-[210px] border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.45)]`}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={onMouseMove}
    >
      <motion.img src={(h.media.backdrop ?? h.media.poster ?? "") as string} alt="" className="absolute inset-0 h-full w-full object-cover object-center"
        animate={{ scale: hovered ? 1.08 : 1, filter: hovered ? "brightness(0.75) saturate(1.2)" : "brightness(0.45) saturate(0.7)" }}
        transition={{ duration: 0.7, ease: "easeOut" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background: radialGlow, opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} />
      <motion.div className="absolute top-0 bottom-0 pointer-events-none" style={{ width: "55%", background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)" }}
        initial={{ left: "-60%" }} animate={hovered ? { left: "160%" } : { left: "-60%" }} transition={{ duration: 0.85, ease: "easeOut" }} />
      <motion.div className="absolute bottom-0 left-0 right-0 border-t border-white/10 backdrop-blur-[16px] bg-black/25"
        initial={{ height: "38%" }} animate={{ height: hovered ? "46%" : "38%" }} transition={{ type: "spring", stiffness: 220, damping: 28 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-b-[22px]" />
        <div className="relative h-full px-5 py-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <motion.span className="h-[5px] w-[5px] rounded-full bg-primary flex-shrink-0"
              animate={{ boxShadow: hovered ? "0 0 10px 3px oklch(0.72 0.18 255 / 0.7)" : "0 0 4px 1px oklch(0.72 0.18 255 / 0.3)" }} transition={{ duration: 0.4 }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/55">{h.label}</span>
          </div>
          <div className="flex flex-col gap-1">
            <motion.div className="font-display font-semibold tracking-tight text-white leading-tight drop-shadow-md"
              animate={{ fontSize: hovered ? "1.75rem" : "1.5rem" }} transition={{ type: "spring", stiffness: 220, damping: 28 }}>{h.value}</motion.div>
            <motion.div className="text-[11px] font-medium tracking-wide leading-snug"
              animate={{ color: hovered ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)" }} transition={{ duration: 0.4 }}>{h.note}</motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div className="absolute inset-0 rounded-[22px] border border-primary/40 pointer-events-none" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.35 }} />
    </motion.div>
  );
}

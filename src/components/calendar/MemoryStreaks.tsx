import { motion, useMotionValue, useTransform } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { CountUp } from "@/components/analytics/AnalyticsKit";

interface StreakData {
  label: string;
  value: number;
  total: number;
  accent: string;
}

interface Props {
  streaks?: StreakData[];
}

function StreakCard({ s, idx }: { s: StreakData; idx: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - (rect.left + rect.width / 2));
    y.set(event.clientY - (rect.top + rect.height / 2));
  }
  const rotateX = useTransform(y, [-100, 100], [10, -10], { clamp: true });
  const rotateY = useTransform(x, [-100, 100], [-10, 10], { clamp: true });

  const progress = (s.value / s.total) * 100;
  const r = 42;
  const c = 2 * Math.PI * r;
  const easing = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ y: -6, scale: 1.02, zIndex: 50 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full relative group cursor-pointer"
      role="figure"
      aria-label={`${s.label}: ${s.value} of ${s.total} days, ${Math.round(progress)}% complete`}
    >
      <PremiumGlass className="h-full border-white/[0.04] group-hover:border-white/[0.1] shadow-lg group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden">
        <div className="flex flex-col items-center justify-between px-4 py-8 h-full relative box-border w-full z-10 min-h-[230px]">
          <div className="relative flex items-center justify-center w-28 h-28 mb-6">
            <div className="absolute inset-0 rounded-full blur-[24px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none mix-blend-screen" style={{ backgroundColor: s.accent }} />
            <svg width="112" height="112" className="-rotate-90 relative z-10" viewBox="0 0 112 112">
              <defs>
                <linearGradient id={`grad-s-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={s.accent} stopOpacity="0.5" />
                  <stop offset="50%" stopColor={s.accent} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={s.accent} stopOpacity="1" />
                </linearGradient>
              </defs>
              <circle cx="56" cy="56" r={r} stroke="oklch(1 1 1 / 0.04)" strokeWidth="12" fill="none" className="transition-colors duration-500 group-hover:stroke-white/10" />
              <motion.circle cx="56" cy="56" r={r} stroke={`url(#grad-s-${idx})`} strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray={c}
                initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c - (c * Math.max(progress, 1)) / 100 }}
                viewport={{ once: true }} transition={{ duration: 2.2 + idx * 0.1, ease: easing }}
                style={{ filter: `drop-shadow(0 4px 12px ${s.accent}80)` }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 flex-col">
              <span className="font-display font-medium text-[22px] text-white tracking-tight drop-shadow-md leading-none"><CountUp to={Math.round(progress)} />%</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center mt-auto">
            <div className="flex items-baseline justify-center gap-1.5">
              <div className="font-display text-[32px] font-medium tracking-tighter text-white drop-shadow-sm group-hover:scale-105 transition-transform duration-500 ease-out"><CountUp to={s.value} /></div>
              <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">/ {s.total}d</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.25em] mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ color: s.accent, textShadow: `0 0 10px ${s.accent}` }}>{s.label}</div>
          </div>
        </div>
      </PremiumGlass>
    </motion.div>
  );
}

export function MemoryStreaks({ streaks: propStreaks }: Props) {
  const streaks = propStreaks?.length ? propStreaks : [];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {streaks.map((s, idx: number) => (
        <StreakCard key={s.label} s={s} idx={idx} />
      ))}
    </div>
  );
}

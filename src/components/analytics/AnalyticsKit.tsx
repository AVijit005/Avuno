import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// ============ Animated counter ============
export function CountUp({
  to,
  duration = 1.4,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <span>
      {prefix}
      {v.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

// ============ Segmented filter ============
export function SegmentedFilter<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="glass inline-flex items-center gap-1 rounded-full p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative px-3.5 py-1.5 text-xs uppercase tracking-[0.15em] transition rounded-full",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="seg-active"
                className="absolute inset-0 rounded-full bg-white/[0.08]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============ Premium stat card ============
export function StatCardPremium({
  label,
  value,
  delta,
  accent,
  decimals = 0,
  suffix = "",
  icon,
}: {
  label: string;
  value: number | string;
  delta?: number | null;
  accent?: string;
  decimals?: number;
  suffix?: string;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass group relative overflow-hidden rounded-3xl p-5"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-50 transition group-hover:opacity-80"
        style={{ background: accent ?? "oklch(0.72 0.18 255 / 0.4)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.35), transparent)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
          {icon}
        </div>
        <div className="mt-3 font-display text-4xl tracking-tight">
          {typeof value === "number" ? (
            <CountUp to={value} decimals={decimals} suffix={suffix} />
          ) : (
            value
          )}
        </div>
        {delta != null && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span className={delta < 0 ? "text-rose-400/90" : "text-emerald-300/90"}>{delta > 0 ? `+${delta}` : delta}</span> · vs last period
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============ Progress ring ============
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  accent = "var(--primary)",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  accent?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Number.isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
  
  return (
    <div className="relative flex items-center justify-center mb-5" style={{ width: size, height: size }}>
      {/* Detached Glow Layer (.ring-glow-layer) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 pointer-events-none rounded-full" 
        style={{ zIndex: 0, filter: `blur(24px)`, background: accent, opacity: 0.25 }}
      />

      {/* Primary Rings */}
      <svg width={size} height={size} className="-rotate-90 relative z-10" style={{ overflow: "visible" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * v) / 100 }}
          
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center z-10">{children}</div>
    </div>
  );
}

// ============ Glass chart tooltip ============
export function GlassTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; color?: string; name?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-2xl px-3.5 py-2.5 text-xs shadow-2xl">
      {label && (
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      )}
      <div className="mt-1 space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: p.color ?? "var(--primary)" }}
            />
            <span className="text-muted-foreground">{p.name ?? "value"}</span>
            <span className="ml-auto font-medium">
              {typeof p.value === "number"
                ? p.value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Zone heading ============
export function ZoneHeading({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h2 className="mt-1 font-display text-3xl tracking-tight md:text-4xl">{title}</h2>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

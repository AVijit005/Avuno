import { motion, useMotionValue, useTransform, useMotionTemplate } from "motion/react";

interface ReleaseItem {
  title: string;
  poster: string;
  when: string;
  countdown: string;
  accent: string;
}

interface Props {
  releases?: ReleaseItem[];
}

function HolographicReleaseCard({ u }: { u: ReleaseItem }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    tiltX.set(event.clientX - (rect.left + rect.width / 2));
    tiltY.set(event.clientY - (rect.top + rect.height / 2));
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }
  const rotateX = useTransform(tiltY, [-150, 150], [15, -15], { clamp: true });
  const rotateY = useTransform(tiltX, [-150, 150], [-15, 15], { clamp: true });

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={{ scale: 1.05, zIndex: 30 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className="relative flex items-center gap-5 overflow-hidden p-4 rounded-[22px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer group hover:border-white/[0.15] transition-colors duration-500"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: useMotionTemplate`radial-gradient(200px circle at ${x}px ${y}px, rgba(255,255,255,0.4), transparent 70%)`,
        }}
      />
      <div className="relative shrink-0">
        <motion.img
          src={u.poster}
          alt={u.title}
          className="h-[90px] w-[64px] rounded-xl object-cover shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none mix-blend-overlay group-hover:border-white/40 transition-colors duration-500" />
      </div>
      <div className="min-w-0 flex-1 relative z-10">
        <div className="truncate text-lg font-display tracking-tight text-white/90 group-hover:text-white transition-colors duration-300">
          {u.title}
        </div>
        <div className="mt-1 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide group-hover:text-muted-foreground/90 transition-colors duration-300">
          {u.when}
        </div>
        <div className="mt-3">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            style={{ background: u.accent, color: "oklch(0.12 0 0)" }}
          >
            {u.countdown}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function UpcomingReleases({ releases: propReleases }: Props) {
  const releases = propReleases?.length ? propReleases : [];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {releases.map((u) => (
        <HolographicReleaseCard key={u.title} u={u} />
      ))}
    </div>
  );
}

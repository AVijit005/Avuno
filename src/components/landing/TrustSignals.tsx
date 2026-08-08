import { motion } from "motion/react";
import { Shield, CreditCard, Download, Eye, Zap, Infinity as InfinityIcon } from "lucide-react";

const SIGNALS = [
  {
    icon: CreditCard,
    label: "No credit card",
    detail: "Start immediately — nothing to enter, nothing to forget to cancel.",
  },
  {
    icon: InfinityIcon,
    label: "Free forever plan",
    detail: "Track unlimited media across every category without ever paying.",
  },
  {
    icon: Download,
    label: "Export anytime",
    detail: "Your data belongs to you. One-click export — no hostage situations.",
  },
  {
    icon: Shield,
    label: "Privacy-first",
    detail: "Your library is private by default. We never sell personal data.",
  },
  {
    icon: Zap,
    label: "No cold starts",
    detail: "Always-on infrastructure. Your dashboard loads in under a second.",
  },
  {
    icon: Eye,
    label: "No ads, ever",
    detail: "Avuno is designed for calm, not engagement farming. Zero ads.",
  },
];

export function TrustSignals() {
  return (
    <section className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">
            Built on trust
          </div>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            <span className="text-gradient-aurora">No tricks.</span>
            <br />
            <span className="italic text-muted-foreground">Just a quiet, honest tool.</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            We believe the best products don't need to trap you. Avuno earns your attention by being
            genuinely useful — not by locking your data behind paywalls.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNALS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group glass-strong relative overflow-hidden rounded-3xl p-6 ring-1 ring-white/[0.06] transition-all duration-500 hover:ring-primary/20"
            >
              {/* Hover glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), oklch(0.72 0.18 255 / 0.06), transparent 60%)",
                }}
              />

              <div className="relative flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 ring-1 ring-white/[0.08]">
                  <s.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base tracking-tight text-foreground">
                    {s.label}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* soft bleed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background: "linear-gradient(180deg, transparent, oklch(0.14 0.012 270 / 0.6))",
        }}
      />
    </section>
  );
}

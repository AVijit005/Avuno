import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { dur, ease } from "@/lib/motion";

const QUOTES = [
  "Stories don't end when the credits roll.",
  "Some memories deserve more than a watch history.",
  "Everything you finish leaves something behind.",
  "One day you'll forget the date, but never how it felt.",
  "Chronicle remembers what algorithms forget.",
];

export function MemoryQuote({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % QUOTES.length), 10_000);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div
      aria-live="polite"
      className={`relative min-h-[3.25rem] max-w-md ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
          transition={{ duration: dur.large, ease: ease.out }}
          className="font-display text-[15px] italic leading-relaxed text-foreground/70"
        >
          &ldquo;{QUOTES[i]}&rdquo;
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

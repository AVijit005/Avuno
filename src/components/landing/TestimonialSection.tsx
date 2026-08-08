import { motion, useReducedMotion } from "motion/react";
import { SceneSection } from "./SceneSection";
import { PremiumGlass } from "@/components/ui/PremiumGlass";

const TESTIMONIALS = [
  {
    quote: "It replaced Letterboxd, Goodreads, and Backloggd for me. It's so quiet and beautiful.",
    author: "Alex",
    role: "Designer",
  },
  {
    quote: "Finally, a place to log what I play and read without it feeling like a competition.",
    author: "Sam",
    role: "Software Engineer",
  },
  {
    quote: "The timeline feature makes me actually want to reflect on the media I consume.",
    author: "Taylor",
    role: "Writer",
  },
];

export function TestimonialSection() {
  const reduced = useReducedMotion();
  return (
    <SceneSection eyebrow="Stories" title="Join the quiet corner of the internet.">
      <div className="mx-auto mt-10 max-w-5xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: reduced ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduced ? 0 : i * 0.1, duration: reduced ? 0 : 0.6 }}
            >
              <PremiumGlass className="flex h-full flex-col p-8">
                <div className="flex-1 font-display text-2xl text-foreground">"{t.quote}"</div>
                <div className="mt-8 text-sm text-muted-foreground">
                  <span className="text-foreground">{t.author}</span> · {t.role}
                </div>
              </PremiumGlass>
            </motion.div>
          ))}
        </div>
      </div>
    </SceneSection>
  );
}

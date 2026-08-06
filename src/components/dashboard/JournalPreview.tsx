import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Quote, ArrowUpRight, BookOpen } from "lucide-react";
import { useJournalEntries } from "@/hooks/use-journal";

export function JournalPreview() {
  const { data, isLoading } = useJournalEntries({ limit: 3 });
  const entries = data?.pages?.flatMap((p: any) => p.items ?? p.data ?? [])?.slice(0, 3) ?? [];

  if (isLoading) return null;
  if (entries.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No journal entries yet. Start writing.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {entries.map((j: any, i: number) => (
        <motion.div
          key={j.id}
          initial={{ opacity: 0, y: 16, rotate: -1 + i * 0.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="glass relative overflow-hidden rounded-3xl p-6"
          style={{
            background: `linear-gradient(180deg, color-mix(in oklab, var(--card) 65%, transparent), color-mix(in oklab, var(--card) 45%, transparent))`,
          }}
        >
          <div
            className="absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--primary)" }}
          />
          <div className="relative">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>{new Date(j.createdAt).toLocaleDateString()}</span>
              {j.mood && <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px]">{j.mood}</span>}
            </div>
            <div className="mt-3 font-display text-2xl leading-tight">{j.title ?? "Untitled"}</div>
            <div className="text-[11px] text-muted-foreground">{j.location ?? ""}</div>
            <div className="mt-4 flex gap-2 text-sm text-foreground/85">
              <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="font-display italic leading-snug line-clamp-3">{j.content}</p>
            </div>
            <Link
              to="/app/journal"
              className="mt-5 inline-flex items-center gap-1.5 text-xs text-primary press-scale"
            >
              Open journal <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

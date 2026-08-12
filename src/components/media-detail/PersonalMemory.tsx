import { motion } from "motion/react";
import { Camera, ArrowRight } from "lucide-react";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useMemories } from "@/hooks/use-journal";

export function PersonalMemory({ item }: { item: UIMediaItem }) {
  const { data: memoriesData, isLoading } = useMemories({ mediaId: item.mediaId });

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  const memories = memoriesData?.pages.flatMap((p) => p.items) ?? [];

  if (memories.length === 0) {
    return null;
  }

  const latestMemory = memories[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass-subtle relative mt-8 overflow-hidden rounded-3xl p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Camera className="h-3 w-3" /> Latest Memory
          </div>
          <h4 className="mt-2 text-lg font-medium text-foreground">{latestMemory.title}</h4>
        </div>
      </div>
      {latestMemory.description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {latestMemory.description}
        </p>
      )}
      {memories.length > 1 && (
        <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium cursor-pointer">
          View all {memories.length} memories <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </motion.div>
  );
}

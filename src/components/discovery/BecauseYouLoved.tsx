import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { useRelatedMedia } from "@/hooks/use-media";
import { adaptMediaResponse } from "@/lib/adapters/media";
import { MediaCard } from "@/components/media/MediaCard";
import { Sparkles } from "lucide-react";

export function BecauseYouLoved({ anchorId }: { anchorId: string }) {
  const { data: relatedData, isLoading } = useRelatedMedia(anchorId);

  if (isLoading || !relatedData || relatedData.length === 0) return null;

  const items = relatedData.map(adaptMediaResponse);

  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-2xl tracking-tight">Because you loved this</h3>
          <p className="text-sm text-muted-foreground">Stories that share its DNA.</p>
        </div>
      </div>
      <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 lg:-mx-10 lg:px-10">
        {items.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="w-40 shrink-0 snap-start md:w-48"
          >
            <MediaCard item={m} size="md" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

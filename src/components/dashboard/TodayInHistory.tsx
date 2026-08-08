import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { CalendarClock } from "lucide-react";
import { motion } from "motion/react";

import { useDashboard } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { cascade } from "@/lib/motion";

export function TodayInHistory({ className }: { className?: string }) {
  const { data: dashboard } = useDashboard();
  const memories = dashboard?.recentMemories ?? [];

  if (memories.length === 0) {
    return null;
  }

  return (
    <PremiumGlass
      variant="subtle"
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          <CalendarClock className="h-3 w-3" /> Recent Memories
        </div>
        <ol className="mt-4 space-y-3">
          {memories.map((e, i) => {
            const when = formatDistanceToNow(new Date(e.date), { addSuffix: true });
            const title = e.metadata?.mediaTitle as string | undefined;

            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={cascade(i)}
                className="flex items-center gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-primary/75">
                    {when}
                  </div>
                  <div className="text-sm">
                    {e.title} {title && <span className="text-muted-foreground">— {title}</span>}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </PremiumGlass>
  );
}

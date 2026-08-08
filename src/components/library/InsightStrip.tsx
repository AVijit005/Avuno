import { Sparkles } from "lucide-react";
import { useInsights } from "@/hooks/use-analytics";
import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function InsightStrip() {
  const { data: insights } = useInsights();

  const items = [];
  if (insights?.mostActiveWeekday) items.push(`Most active on ${insights.mostActiveWeekday}s`);
  if (insights?.favoriteGenre) items.push(`Favorite genre is ${insights.favoriteGenre}`);
  if (insights?.mostProductiveMonth)
    items.push(`Most productive in ${insights.mostProductiveMonth}`);
  if (insights?.totalUniqueMedia) items.push(`Tracked ${insights.totalUniqueMedia} items total`);

  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((text, i) => (
        <PremiumGlass
          key={i}
          interactive
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start gap-3 rounded-2xl px-4 py-3 cursor-pointer"
        >
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" />
          <p className="text-[12px] leading-snug text-muted-foreground">{text}</p>
        </PremiumGlass>
      ))}
    </div>
  );
}

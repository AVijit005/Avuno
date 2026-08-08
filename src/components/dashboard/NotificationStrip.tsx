import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { adaptNotification } from "@/lib/adapters/notifications";

export function NotificationStrip({ className }: { className?: string }) {
  const { data } = useNotifications({ limit: 5 });
  const items = (data?.items || []).map(adaptNotification);

  if (items.length === 0) return null;

  return (
    <section aria-label="Notifications" className={cn(className)}>
      <PremiumGlass
        variant="subtle"
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 p-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06]">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <ul className="flex min-w-0 flex-1 flex-wrap gap-x-6 gap-y-1">
            {items.map((n) => (
              <li key={n.id} className="text-xs text-muted-foreground">
                <span className="text-[9px] uppercase tracking-[0.22em] text-primary/80">
                  {n.type}
                </span>
                <span className="ml-2 text-foreground/85">{n.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </PremiumGlass>
    </section>
  );
}

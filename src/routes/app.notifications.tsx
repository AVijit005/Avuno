import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, CheckCircle2 } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { adaptNotification } from "@/lib/adapters/notifications";

export const Route = createFileRoute("/app/notifications")({ component: Page });

function Page() {
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = (data?.items || []).map(adaptNotification);
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="pt-2">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="press-scale inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/[0.08]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center rounded-[40px] p-16 text-center text-muted-foreground">
            <Bell className="mb-4 h-8 w-8 opacity-20" />
            <p>You're all caught up.</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={cn(
                "glass flex items-start gap-4 rounded-2xl p-4 transition",
                !n.isRead && "ring-1 ring-primary/40 bg-primary/5",
              )}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06]">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {n.actionUrl ? (
                    <Link to={n.actionUrl ?? "/app"} className="hover:underline">
                      {n.title}
                    </Link>
                  ) : (
                    n.title
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{n.body}</div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markRead.mutate(n.id)}
                    disabled={markRead.isPending}
                    className="press-scale grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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
import { EmptyState } from "@/components/ui/EmptyState";

export const Route = createFileRoute("/app/notifications")({ component: Page });

function Page() {
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = (data?.items || []).map(adaptNotification);
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="pt-2">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-eyebrow mb-2">Inbox</div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm ring-1 ring-white/10 rounded-xl glass-subtle hover:bg-foreground/[0.07] active:scale-[0.98] focus-ring"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <EmptyState
            illustration={<Bell className="h-6 w-6" />}
            title="You're all caught up."
            description="When there's activity, it will show up here."
          />
        ) : (
          <div className="glass rounded-2xl overflow-hidden card-interactive">
            {items.map((n, i) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 p-4 transition min-h-[44px]",
                  i !== items.length - 1 && "border-b border-foreground/[0.06]",
                  !n.isRead && "bg-primary/5",
                )}
              >
                <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground/[0.04]">
                  <Bell className="h-4 w-4 text-foreground/70" />
                  {!n.isRead && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {n.actionUrl ? (
                      <Link
                        to={n.actionUrl ?? "/app"}
                        className="hover:underline focus-ring rounded-sm"
                      >
                        {n.title}
                      </Link>
                    ) : (
                      n.title
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{n.body}</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      disabled={markRead.isPending}
                      className="grid h-8 w-8 place-items-center text-primary rounded-xl hover:bg-foreground/[0.07] active:scale-[0.98] focus-ring"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

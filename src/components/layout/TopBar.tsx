import { useRouterState, Link } from "@tanstack/react-router";
import { Bell, Search, Settings, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useMediaActions } from "@/lib/store/MediaActionsContext";
import { useNotifications } from "@/hooks/use-notifications";

const TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/app/library": { title: "Your Library", subtitle: "Everything you've experienced." },
  "/app/collections": { title: "Collections", subtitle: "Curated stories, grouped your way." },
  "/app/analytics": { title: "Analytics", subtitle: "Patterns in how you spend your attention." },
  "/app/calendar": { title: "Calendar", subtitle: "A memory map of your year." },
  "/app/journal": { title: "Journal", subtitle: "Words for the stories that stayed." },
  "/app/timeline": { title: "Timeline", subtitle: "Your life, told through media." },
  "/app/wrapped": { title: "Wrapped", subtitle: "Your year as a cinematic short." },
  "/app/profile": { title: "Profile" },
  "/app/settings": { title: "Settings" },
};

export function TopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { openAdd } = useMediaActions();
  const { data: notifications } = useNotifications();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/app" || pathname === "/app/";
  const meta =
    TITLES[pathname] ?? Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? null;

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 px-6 pt-5 lg:px-10"
    >
      <div className="glass-subtle flex items-center justify-between gap-4 rounded-2xl px-3 py-2 md:px-4">
        <div className="flex min-w-0 items-center gap-4">
          {isHome ? (
            <div className="hidden flex-col leading-tight md:flex" suppressHydrationWarning>
              <span className="font-display text-base text-foreground tabular-nums">
                {now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {now
                  ? now.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </span>
            </div>
          ) : (
            meta && (
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg md:text-xl">{meta.title}</h1>
                {meta.subtitle && (
                  <p className="hidden truncate text-[11px] text-muted-foreground md:block">
                    {meta.subtitle}
                  </p>
                )}
              </div>
            )
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="hidden items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground ring-1 ring-white/5 transition hover:text-foreground md:flex press-scale"
          >
            <Search className="h-3.5 w-3.5" /> Search across Chronicle
            <kbd className="rounded-md border border-border/70 bg-background/60 px-1.5 py-0.5 tracking-wider">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/5 transition hover:text-primary md:hidden press-scale"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={openAdd}
            aria-label="Add to Chronicle"
            title="Add (⌘N)"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/5 transition hover:text-primary press-scale"
          >
            <Plus className="h-4 w-4" />
          </button>
          <Link
            to="/app/notifications"
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/5 transition hover:text-primary press-scale"
          >
            <Bell className="h-4 w-4" />
            {notifications?.unreadCount ? (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.18_255)]" />
            ) : null}
          </Link>
          <Link
            to="/app/settings"
            aria-label="Quick settings"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/5 transition hover:text-primary press-scale"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            to="/app/profile"
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/70 to-secondary/70 text-xs font-medium text-primary-foreground ring-1 ring-white/20 press-scale"
          >
            AY
          </Link>
        </div>
      </div>
    </motion.header>
  );
}


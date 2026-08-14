import { useRouterState, Link } from "@tanstack/react-router";
import { Bell, Search, Settings, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useMediaActions } from "@/lib/store/MediaActionsContext";
import { useNotifications } from "@/hooks/use-notifications";
import { useCurrentUser } from "@/hooks/use-auth";

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
  const { data: user } = useCurrentUser();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.slice(0, 2).toUpperCase() ?? "U");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/app" || pathname === "/app/";
  const meta =
    TITLES[pathname] ?? Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? null;

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!isHome) {
      setNow(null);
      return;
    }
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [isHome]);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-10"
    >
      <div className="glass-subtle backdrop-blur-xl flex items-center justify-between gap-4 px-3 py-2.5 md:px-5 rounded-2xl border border-foreground/[0.07] shadow-[0_1px_0_oklch(1_0_0_/_0.06)_inset,_0_2px_8px_-2px_oklch(0_0_0_/_0.15)]">
        <div className="flex min-w-0 items-center gap-4">
          {isHome ? (
            <div className="hidden flex-col leading-tight md:flex" suppressHydrationWarning>
              <span className="font-display text-base text-foreground tabular-nums">
                {now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}
              </span>
              <span className="text-eyebrow">
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
                <p className="truncate font-display text-lg md:text-xl">{meta.title}</p>
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
            aria-label="Search"
            className="grid h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 place-items-center rounded-xl bg-foreground/[0.04] ring-1 ring-foreground/[0.06] transition-[background-color,color,transform] duration-[140ms] hover:bg-foreground/[0.08] hover:text-primary active:scale-[0.95] cursor-pointer md:hidden focus-ring"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={openAdd}
            aria-label="Add to Avuno"
            title="Add (⌘N)"
            className="hidden md:grid h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 place-items-center rounded-xl bg-foreground/[0.04] ring-1 ring-foreground/[0.06] transition-[background-color,color,transform] duration-[140ms] hover:bg-foreground/[0.08] hover:text-primary active:scale-[0.95] cursor-pointer focus-ring"
          >
            <Plus className="h-4 w-4" />
          </button>
          <Link
            to="/app/notifications"
            aria-label="Notifications"
            className="relative grid h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 place-items-center rounded-xl bg-foreground/[0.04] ring-1 ring-foreground/[0.06] transition-[background-color,color,transform] duration-[140ms] hover:bg-foreground/[0.08] hover:text-primary active:scale-[0.95] cursor-pointer focus-ring"
          >
            <Bell className="h-4 w-4" />
            {notifications?.unreadCount ? (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.18_255)]" />
            ) : null}
          </Link>
          <Link
            to="/app/settings"
            aria-label="Quick settings"
            className="grid h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 place-items-center rounded-xl bg-foreground/[0.04] ring-1 ring-foreground/[0.06] transition-[background-color,color,transform] duration-[140ms] hover:bg-foreground/[0.08] hover:text-primary active:scale-[0.95] cursor-pointer focus-ring"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            to="/app/profile"
            aria-label="Profile"
            style={{ viewTransitionName: "user-avatar" }}
            className="grid h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/70 to-secondary/70 text-xs font-semibold text-primary-foreground ring-1 ring-foreground/20 transition-transform duration-[140ms] active:scale-[0.95] focus-ring"
          >
            {initials}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

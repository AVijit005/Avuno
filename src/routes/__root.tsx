import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, Suspense } from "react";
import { MotionConfig } from "motion/react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { analytics } from "../lib/analytics";
import { queryKeys } from "../lib/api/query-keys";
import { authApi } from "../lib/api";
import {
  setAccessToken,
  getAccessToken,
  AUTH_EXPIRED_EVENT,
  forceRefreshValidToken,
} from "../lib/api/fetch";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { PageSkeleton } from "../components/common/PageSkeleton";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Avuno — Every story you finish becomes part of your story" },
      {
        name: "description",
        content:
          "Avuno is a personal media journal for movies, anime, books, games, music and more. Organize, remember and rediscover everything you experience.",
      },
      { name: "author", content: "Avuno" },
      { name: "theme-color", content: "#0d0d14" },
      { property: "og:site_name", content: "Avuno" },
      { property: "og:title", content: "Avuno — Your personal media journal" },
      { property: "og:description", content: "Every story you finish becomes part of your story." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://avuno.xyz" },
      { property: "og:image", content: "https://avuno.xyz/og-image.png" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "864" },
      {
        property: "og:image:alt",
        content:
          "Avuno — a cinematic memory journal for everything you watch, read, play and listen to.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Avuno — Your personal media journal" },
      {
        name: "twitter:description",
        content: "Every story you finish becomes part of your story.",
      },
      { name: "twitter:image", content: "https://avuno.xyz/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Avuno",
          description: "A quiet place to remember every story you've lived.",
          url: "https://avuno.xyz",
          image: "https://avuno.xyz/og-image.png",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "Avuno", url: "https://avuno.xyz" },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isLight = storedTheme === 'light' || ((!storedTheme || storedTheme === 'system') && !isSystemDark);
                if (isLight) {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      let token = getAccessToken();
      if (!token) {
        try {
          token = await forceRefreshValidToken();
        } catch {
          if (mounted) setIsRestoring(false);
          return;
        }
      }
      try {
        const user = await authApi.getCurrentUser();
        queryClient.setQueryData(queryKeys.auth.me(), user);
      } catch (err) {
        setAccessToken(null);
      } finally {
        if (mounted) setIsRestoring(false);
      }
    };
    if (!queryClient.getQueryData(queryKeys.auth.me())) {
      restoreSession();
    } else {
      setIsRestoring(false);
    }
    return () => {
      mounted = false;
    };
  }, [queryClient]);

  // Terminal session expiry: the refresh token is gone or rejected, so no
  // amount of retrying will recover. Clear cached user data and send the user
  // to /auth once, instead of leaving the SPA in a logged-in-looking state
  // where every request 401s.
  useEffect(() => {
    const onExpired = () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
      const { pathname } = window.location;
      if (pathname.startsWith("/auth")) return;
      const next = encodeURIComponent(pathname + window.location.search);
      window.location.replace(`/auth?next=${next}`);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  // Apply theme on boot
  useEffect(() => {
    // Initial sync
    const saved = queryClient.getQueryData<{ themePreference?: string }>(queryKeys.auth.me());
    const applyPref = (pref: string) => {
      const isLight =
        pref === "light" ||
        (pref === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
      if (isLight) {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
      if (pref !== "system" && localStorage.getItem("theme") !== pref) {
        localStorage.setItem("theme", pref);
      }
    };

    applyPref(saved?.themePreference || localStorage.getItem("theme") || "system");

    // Listen for auth user data changes (e.g. login / session restore completion)
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.query.queryKey.join(",") === queryKeys.auth.me().join(",") &&
        event.query.state.status === "success" &&
        event.query.state.data
      ) {
        const user = event.query.state.data as { themePreference?: string };
        if (user.themePreference) {
          applyPref(user.themePreference);
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const router = useRouter();
  useEffect(() => {
    analytics.page(router.state.location.pathname);
  }, [router.state.location.pathname]);

  if (isRestoring) {
    return <PageSkeleton />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    </MotionConfig>
  );
}

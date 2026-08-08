type PageViewPayload = {
  path: string;
  title: string;
  referrer: string;
  timestamp: string;
};

export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return;
  const payload: PageViewPayload = {
    path,
    title: title ?? (typeof document !== "undefined" ? document.title : ""),
    referrer: typeof document !== "undefined" ? document.referrer : "",
    timestamp: new Date().toISOString(),
  };

  // Beacon API for non-blocking delivery
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/pageview", JSON.stringify(payload));
  } else {
    // Fallback: fire and forget fetch
    fetch("/api/analytics/pageview", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }
}

export function trackEvent(category: string, action: string, label?: string, value?: number): void {
  if (typeof window === "undefined") return;
  const payload = {
    category,
    action,
    label,
    value,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/event", JSON.stringify(payload));
  } else {
    fetch("/api/analytics/event", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }
}

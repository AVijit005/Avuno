// Product Analytics Wrapper
// Switch to PostHog or Plausible in production by implementing these methods.
//
// NOTE: do not `import "./types/global"` here. That file is an ambient
// declaration file (.d.ts) with no runtime output, so TypeScript resolves it
// but the bundler cannot, which fails `vite build` with UNRESOLVED_IMPORT.
// Its `Window` augmentation already applies globally via tsconfig `include`.

/**
 * Analytics must never break the app, but failures should not be invisible
 * either — a silently dead analytics pipeline is indistinguishable from one
 * that is simply not configured. Log in dev, stay quiet in production.
 */
function swallow(operation: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(`[Analytics] ${operation} failed:`, error);
  }
}

export const analytics = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Track: ${eventName}`, properties);
    }
    if (typeof window === "undefined") return;
    try {
      window.posthog?.capture(eventName, properties);
      window.plausible?.(eventName, { props: properties });
    } catch (error) {
      swallow(`track(${eventName})`, error);
    }
  },

  page: (path: string) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] PageView: ${path}`);
    }
    if (typeof window === "undefined") return;
    try {
      window.posthog?.capture("$pageview", { $current_url: path });
      window.plausible?.("pageview", { u: path });
    } catch (error) {
      swallow(`page(${path})`, error);
    }
  },

  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Identify: ${userId}`, traits);
    }
    if (typeof window === "undefined") return;
    try {
      window.posthog?.identify(userId, traits);
    } catch (error) {
      swallow("identify", error);
    }
  },
};

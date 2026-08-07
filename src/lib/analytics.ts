// Product Analytics Wrapper
// Switch to PostHog or Plausible in production by implementing these methods.

import "./types/global";

export const analytics = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Track: ${eventName}`, properties);
    }
    try {
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture(eventName, properties);
      }
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(eventName, { props: properties });
      }
    } catch {}
  },

  page: (path: string) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] PageView: ${path}`);
    }
    try {
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('$pageview', { $current_url: path });
      }
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('pageview', { u: path });
      }
    } catch {}
  },

  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Identify: ${userId}`, traits);
    }
    try {
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.identify(userId, traits);
      }
    } catch {}
  }
};

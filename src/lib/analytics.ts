// Product Analytics Wrapper
// Switch to PostHog or Plausible in production by implementing these methods.

export const analytics = {
  track: (eventName: string, properties?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Track: ${eventName}`, properties);
    }
    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(eventName, properties);
      }
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(eventName, { props: properties });
      }
    } catch {}
  },
  
  page: (path: string) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] PageView: ${path}`);
    }
    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('$pageview', { $current_url: path });
      }
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('pageview', { u: path });
      }
    } catch {}
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Identify: ${userId}`, traits);
    }
    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.identify(userId, traits);
      }
    } catch {}
  }
};

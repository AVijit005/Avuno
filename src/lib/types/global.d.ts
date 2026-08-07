interface PostHogInstance {
  capture: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

interface PlausibleInstance {
  (eventName: string, options?: Record<string, unknown>): void;
}

interface Window {
  posthog?: PostHogInstance;
  plausible?: PlausibleInstance;
}

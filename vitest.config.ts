import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Test config is kept separate from vite.config.ts on purpose.
 *
 * vite.config.ts uses @lovable.dev/vite-tanstack-config, which bundles the
 * TanStack Start, Nitro and PWA plugins. Those are build-time concerns that
 * pull in the backend workspace and a service worker during test runs. This
 * config loads only what the component tests need.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    // Frontend only. apps/backend runs on `bun test` (bun:test imports are not
    // resolvable by vitest), so it must never be picked up here.
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "apps/**",
      "tests/visual/**",
      "tests/e2e.test.ts",
      "dist/**",
      ".output/**",
    ],
  },
});

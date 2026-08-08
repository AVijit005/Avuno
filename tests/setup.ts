import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL only auto-registers cleanup when vitest runs with `globals: true`.
// This config uses explicit imports, so without this each render() leaves its
// markup in the document and later queries match elements from earlier tests.
afterEach(() => {
  cleanup();
});

/**
 * jsdom does not implement the observer/media APIs that `motion` and several
 * layout components rely on. Without these, any component using whileInView,
 * a ResizeObserver or matchMedia throws on mount.
 */

if (!("IntersectionObserver" in globalThis)) {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(
      private callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) {}
    observe(target: Element): void {
      // Report the element as immediately visible so `whileInView` content
      // renders synchronously in tests.
      this.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 1,
            target,
            time: 0,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
          } as IntersectionObserverEntry,
        ],
        this,
      );
    }
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

if (!("ResizeObserver" in globalThis)) {
  class MockResizeObserver implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (typeof window !== "undefined" && !window.scrollTo) {
  window.scrollTo = (() => {}) as unknown as typeof window.scrollTo;
}

if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

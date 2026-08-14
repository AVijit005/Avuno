# AVUNO — DETAILED TECHNICAL IMPLEMENTATION SPECIFICATION

*Role: Lead Frontend Architect & Senior Motion Engineer*
*Status: Engineering Build Plan — Locked*

---

## 1. Repository Audit
The existing repository has been inspected. The stack is strictly enforced:
*   **Framework:** TanStack Start (React 19, Vite 8).
*   **Routing:** `@tanstack/react-router` (file-based in `src/routes`).
*   **Styling:** Tailwind CSS v4 with highly customized OKLCH tokens in `src/styles.css`.
*   **Animation:** `motion/react` (v11+).
*   **Components:** Radix UI primitives, Lucide React icons.
*   **Existing Assets:** A robust `src/styles.css` is already present, exporting tokens like `glass`, `text-display`, `focus-ring`, and standard elevation classes. We will heavily reuse these.
*   **Status:** Do NOT migrate frameworks. We build the locked design using the existing stack.

---

## 2. Final Architecture
The architecture relies on a Single Scroll Coordinate system. The entire page is wrapped in a `useScroll` tracking container. Child components (Scenes) receive the `scrollYProgress` context and use `useTransform` to map their local animations. We do not use manual DOM resize measurements during scroll loops.

---

## 3. File Tree
```text
src/
├── routes/
│   └── index.tsx (Main entry point wrapping the scroll container)
│
├── components/
│   ├── landing/
│   │   ├── AvunoLanding.tsx (The global scroll coordinator)
│   │   ├── LandingNavigation.tsx (Sticky translucent pill)
│   │   ├── HeroScene.tsx (0-15vh)
│   │   ├── ScatterScene.tsx (15-35vh)
│   │   ├── MemoryCascade.tsx (Core animation engine)
│   │   ├── ArchiveScene.tsx (35-55vh)
│   │   ├── ThreadScene.tsx (55-75vh)
│   │   ├── RelationalThread.tsx (SVG Path drawing)
│   │   ├── TrustScene.tsx (75-85vh)
│   │   ├── HorizonScene.tsx (85-100vh)
│   │   └── LandingFooter.tsx
│   │
│   ├── ui/
│   │   ├── MemoryCard.tsx (Reusable data renderer)
│   │   ├── JournalEntryCard.tsx (Existing)
│   │   └── VideoBackground.tsx (Reusable cinematic video handler)
│   │
│   └── motion/
│       └── BlurIn.tsx (Existing)
│
├── hooks/
│   ├── useLandingScroll.ts (Abstracts motion progress)
│   └── useResponsiveLayout.ts (Calculates grid columns safely on mount/resize)
│
└── lib/
    ├── memoryData.ts (Deterministic coordinate/asset data)
    └── motionTokens.ts (Reusable spring configs)
```

---

## 4. Component Tree
```text
Route (/)
└── AvunoLanding (Tracks global scroll)
    ├── LandingNavigation
    ├── VideoBackground (The Sanctuary - 0-85vh)
    ├── HeroScene (Typography)
    ├── ScatterScene
    │   └── MemoryCascade (The Engine)
    │       ├── MemoryCard × 8 (Floating to Grid)
    │       └── PrimaryMemoryCard (The Apollo Photo)
    ├── ThreadScene
    │   ├── RelationalThread (SVG)
    │   ├── PrimaryMemoryCard (Locked in Grid)
    │   ├── JournalEntryCard
    │   └── TimelineNode
    ├── TrustScene
    └── HorizonScene
        ├── VideoBackground (The Horizon - 80-100vh)
        └── LandingFooter
```

---

## 5. Component Contracts

**MemoryCascade**
*   **Props:** `globalProgress: MotionValue<number>`, `reducedMotion: boolean`
*   **Responsibilities:** Maps the global progress to local progress chunks (Scatter -> Alignment -> Archive). Passes strictly mapped `MotionValue`s (x, y, rotate) to children.
*   **Must NOT:** Execute `setState` on scroll. Trigger React re-renders during the scroll phase.

**RelationalThread**
*   **Props:** `progress: MotionValue<number>`, `startRef: RefObject`, `endRef: RefObject`
*   **Responsibilities:** Draws an SVG line between nodes.
*   **Must NOT:** Call `getBoundingClientRect()` on every frame. Coordinates are calculated once on mount/resize and updated via `ResizeObserver`, not scroll.

**VideoBackground**
*   **Props:** `src`, `poster`, `opacity: MotionValue<number>`, `priority: boolean`
*   **Responsibilities:** Auto-plays muted inline video. Uses `opacity` MotionValue to gracefully fade. Provides `poster` fallback.

---

## 6. Scroll Architecture
We strictly use `motion/react`'s `useScroll` attached to the `main` container.
*   **Why:** It offloads scroll tracking from the main thread directly to the compositor via Worklets.
*   **Rule:** No `window.addEventListener('scroll')` inside components for visual changes.

---

## 7. Scene Progress Map
Global progress (`0.0` to `1.0`):
*   **0.00 – 0.15:** `HeroScene` (Sanctuary is dark, text enters).
*   **0.15 – 0.35:** `ScatterScene` (Items float randomly on Y axis).
*   **0.35 – 0.55:** `ArchiveScene` (Spring physics interpolate items to `{x:0, y:0, rotate:0}` in Grid).
*   **0.55 – 0.75:** `ThreadScene` (Items remain locked; SVG `pathLength` animates from `0` to `1`).
*   **0.75 – 0.85:** `TrustScene` (Video 1 fades out, factual text fades in).
*   **0.85 – 1.00:** `HorizonScene` (Video 2 crossfades in, CTA enters).

---

## 8. Video Architecture
Two massive videos drive the experience. They require careful memory management.
`VideoBackground` handles the heavy lifting.
*   `preload="auto"` for Video 1.
*   `preload="none"` + IntersectionObserver for Video 2.
*   Both use `playsInline muted loop`.

---

## 9. Hero Implementation
*   **Structure:** Absolutely positioned flex container within `HeroScene`.
*   **Typography:** Uses `text-display` and `font-display` tokens from `styles.css`.
*   **Motion:** `initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}` -> `animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}`.

---

## 10. Navigation Implementation
*   **Initial:** `opacity: 0, y: -20`.
*   **Scrolled (past 10vh):** Fades in as a translucent pill using the `glass-floating` Tailwind v4 utility token already defined in `styles.css`.
*   **Mobile:** Logo left, `[Start Free]` right. Hidden links.

---

## 11. Scatter System
*   Items do not use `Math.random()` to prevent hydration mismatches. 
*   Initial state is mapped from hardcoded `data/memoryItems.ts` (e.g., `scatter: { x: -120, y: 300, rotate: -12, scale: 0.9 }`).
*   They drift using a standard `useTransform` tied to the 0.15–0.35 progress range.

---

## 12. Memory Data Model
```typescript
type MemoryItem = {
  id: string;
  type: 'movie' | 'book' | 'journal' | 'photo';
  assetSrc: string;
  scatterConfig: { x: number; y: number; rotate: number; scale: number; zIndex: number };
  gridConfig: { desktopRow: number; desktopCol: number; mobileOrder: number };
}
```

---

## 13. Memory Cascade Engine
*   **Input:** `sceneProgress` (0 to 1 over the 0.35-0.55 global range).
*   **Output:** For each item, `useTransform` interpolates from `scatterConfig` to `{x:0, y:0, rotate:0, scale:1}`.
*   Because the items exist inside a native CSS Grid container, when they reach `{x:0, y:0}`, they perfectly align with their rigid grid cells without manual coordinate calculations.

---

## 14. Grid System
The final resting place is a strictly defined CSS Grid container.
*   **Desktop:** `grid-cols-4`, `gap-8`, `max-w-6xl`.
*   **Tablet:** `grid-cols-2`.
*   **Mobile:** `grid-cols-1`.
*   The `PrimaryMemoryItem` sits at column 1, row 1 on all breakpoints.

---

## 15. Traveling Object System
The Apollo Photograph is the `PrimaryMemoryItem`.
It is defined exactly once in the DOM inside the `MemoryCascade`. We do not unmount and remount it. The camera/scroll simply follows it as it locks into the grid, and the SVG thread draws out from it in the next scene.

---

## 16. Relational Thread Engine
*   The SVG is an absolute overlay on top of the Grid container.
*   Using `useLayoutEffect`, we map the center coordinate of the `PrimaryMemoryItem` and the center coordinate of the `JournalCard`.
*   We draw a `<path>` using an elegant bezier curve (`C` command) between them.
*   `pathLength={threadProgress}` draws the line between 0.55 and 0.75 global progress.

---

## 17. Product UI Architecture
*   We use existing UI components (`JournalEntryCard.tsx`, `MediaCard.tsx`) rendered with mocked `DUMMY_JOURNAL` data.
*   They sit in the Grid alongside the visual memory items, proving the relationship visually. No fake dashboards.

---

## 18. Trust Architecture
*   A static layout spanning 75-85vh.
*   Uses `text-h2` typography.
*   Claims are hardcoded: "Private by design. Export anytime. No ads." 
*   No animations beyond a simple slow fade-up.

---

## 19. Horizon CTA
*   Fades in over Video 2 at 90vh.
*   Typography is center-aligned, massive scale.
*   Button uses the `MagneticButton` wrapper already present in the codebase.

---

## 20. Responsive Architecture
*   **1440px:** 8 items, 4 columns, full scatter layout.
*   **768px:** 6 items, 2 columns, tighter scatter.
*   **375px:** 4 items, 1 column. The scatter is replaced by a simple vertical stack parallax.
*   We use Tailwind's `md:` and `lg:` classes to alter the underlying CSS grid, allowing the `MemoryCascade` to naturally snap items to the new layouts.

---

## 21. Reduced Motion
*   If `useReducedMotion()` returns true:
*   Video components receive `pause()` commands (fallback to poster).
*   `MemoryCascade` skips the scatter `useTransform` logic entirely. Items instantly snap to `{x:0, y:0}` and simply `opacity: 1` on scroll.
*   `RelationalThread` `pathLength` is hardcoded to `1`, using `opacity` to fade in instead of drawing.

---

## 22. Accessibility
*   Videos use `aria-hidden="true"` as they are atmospheric.
*   The `ScatterScene` container uses `aria-hidden="true"` to hide the chaotic layout from screen readers, while a visually hidden `<h2>` provides the narrative text.
*   SVG Thread uses `role="presentation"`.

---

## 23. Asset Pipeline
```text
public/
  videos/
    sanctuary-1080p.webm (Target <2.5MB)
    sanctuary-poster.jpg
    horizon-1080p.webm (Target <2.5MB)
    horizon-poster.jpg
  memories/
    apollo-mission.jpg (CC0 Public Domain)
    vintage-journal.jpg (CC0)
```

---

## 24. Typography
*   We inherit `styles.css`.
*   `font-display` (Fraunces) for Hero, Trust, CTA.
*   `font-sans` (Geist) for UI metadata, labels, paragraphs.
*   `tracking-display` applied to all large headings to ensure premium kerning.

---

## 25. Design Tokens & 26. Motion Tokens
*   We use the strict Phase 1 tokens already in `:root` of `styles.css` (e.g., `--color-bg`, `--color-surface-1`, `--shadow-glass`).
*   **Motion Token:** Exported in `lib/motionTokens.ts`:
    `export const springPhysics = { type: 'spring', stiffness: 100, damping: 20 };`

---

## 27. Performance Architecture
*   `AvunoLanding` is a Client Component (requires hydration for `motion/react`).
*   Videos are muted/inline with `poster` attributes heavily optimized to prevent LCP hits.
*   We use zero `backdrop-filter: blur` over moving elements, preventing catastrophic mobile GPU repaints.

---

## 28. Error Handling
*   If `motion/react` fails to hydrate, native CSS fallback ensures the grid is `opacity: 1`.
*   Video tags include `<img src="poster.jpg" />` fallback for aggressive battery-saving modes.

---

## 29. SEO
*   Handled via `@tanstack/react-router` `head()` export in `routes/index.tsx`.
*   Title: `Avuno — A quiet place to remember.`

---

## 30. Testing Strategy
*   Playwright visual regression tests on the `0.5` scroll progress marker to ensure the CSS grid layout snaps identically across Chrome/Safari.

---

## 31. Browser Matrix
*   **Tier 1:** Chrome (Desktop/Android), Safari (macOS/iOS).
*   **Tier 2:** Firefox.
*   **Edge Case:** iOS Low Power Mode (Videos will not autoplay; poster fallbacks must look cinematic).

---

## 32. Debugging Strategy
*   **SVG Line misalignment:** Check the `ResizeObserver` firing timing. Ensure it triggers *after* fonts load.
*   **Scroll Jank:** Profile Chrome DevTools. If composite layers are thrashing, ensure `will-change: transform` is applied to the MemoryCards during the Scatter phase, and removed during Archive.

---

## 33. Phase-by-Phase Implementation Roadmap
*   **PHASE 1:** Layout Foundation (Setup global scroll container, apply tokens).
*   **PHASE 2:** Video Backbone (Implement Sanctuary & Horizon containers with lazy loading).
*   **PHASE 3:** The Scatter Engine (Build data model, configure spring physics, test floating mechanics).
*   **PHASE 4:** Grid Integration (Ensure floating objects mathematically resolve to their CSS Grid cells).
*   **PHASE 5:** The Relational Thread (Build dynamic SVG drawing logic between specific Grid coordinates).
*   **PHASE 6:** Typography & Trust (Implement Hero, Trust, and CTA scenes with proper fade triggers).
*   **PHASE 7:** Polish (Reduced motion, mobile layout overrides, performance audit).

---

## 34. Definition of Done
*   [ ] The codebase exactly matches the design blueprint.
*   [ ] No `window.addEventListener('scroll')` is used for visual effects outside `motion/react`.
*   [ ] The Apollo Photo connects to the Journal Card via SVG thread perfectly on 1440px and 375px.
*   [ ] The site scores 95+ on Mobile Lighthouse Performance.
*   [ ] Unlicensed copyrighted assets are entirely absent.

---
*End of Technical Specification. Ready to write code.*

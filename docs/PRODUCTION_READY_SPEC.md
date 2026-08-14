# AVUNO: PRE-IMPLEMENTATION RED TEAM AUDIT & PRODUCTION SPEC
**Role:** Principal Product Designer & Staff Frontend Engineer
**Objective:** Brutal critique of the Billion-Dollar Spec, followed by the finalized Production-Ready Specification.

---

## PART 1: THE RED TEAM AUDIT FINDINGS

### 1. First Principle Test
* **Would I understand what Avuno is within 15–30s?** PARTIALLY. The poetic copy ("A quiet place to remember...") is beautiful but slightly ambiguous. We need a secondary sub-headline that explicitly grounds it: "Your personal archive for movies, books, and memories."
* **Would I understand WHY it exists?** YES. The "Scattered" narrative hits the exact pain point of modern digital fragmentation.
* **Would I trust it?** YES, if the Trust section is factual, not fluffy.
* **Would I sign up?** YES, the emotional crescendo is strong.

### 2. Product Truth Audit
| Claim | Required Capability | Verified? | Risk | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| "Ask your archive anything" | Semantic/AI natural language search | **UNVERIFIED** | HIGH | Downgrade to standard keyword/tag filtering unless AI search is built. |
| "Private by design" | Encrypted database | **YELLOW** | MED | Clarify if it's E2E encryption or just standard TLS/Auth. |
| "Local-first" | Offline capability / IndexedDB | **UNVERIFIED** | HIGH | Remove "Local-first" unless technically true. Replace with "Your data, exportable anytime." |

### 3. Asset Legality Audit (CRITICAL FLAW)
The previous spec suggested using the *Interstellar* movie poster. **This is a massive copyright violation** for commercial marketing.
* **Fix:** We MUST use public domain art (e.g., classical paintings representing "collections"), CC0 photography (Unsplash) representing "memories", and stylized, anonymized book covers. We cannot use licensed pop culture properties on a public SaaS landing page.

### 4. Performance & UX Flaws
* **The Memory Cascade (18 Images):** Loading 18 high-res images at the top of the page will destroy our Core Web Vitals (LCP). **Fix:** Reduce to 8-10 highly curated images. Use aggressively compressed WebP (max 50kb each). Prioritize the top 4 for immediate loading, lazy-load the rest.
* **The Memory Thread:** Tracking moving DOM coordinates to draw an SVG line is brittle and causes layout thrashing. **Fix:** The objects must be fixed in a CSS Grid container. The SVG sits absolutely positioned beneath them. We animate the `strokeDasharray` using Framer Motion's `useScroll`, completely decoupling the animation from DOM position calculations.
* **Search Section:** Dedicating 12% of the scroll depth to search is excessive if search isn't the primary USP. **Fix:** Reduce search to a static, beautiful UI demonstration card within the "Product Depth" section.

---

## PART 2: THE FINAL CUT LIST

**REMOVE:**
* The "Interactive Search" scroll section (merged into a smaller UI demo).
* Copyrighted movie/book posters (replace with CC0/Public Domain).
* Claims of "Local-first" and AI-driven search (until verified).
* 8 of the 18 Memory Cascade images (reduce to 10 for performance).
* Overly complex DOM-tracking SVG logic.

**KEEP:**
* The 2-Video cinematic background system.
* The Scattered → Connected → Archived narrative.
* The Trust Vault section.
* The Horizon transition for the final CTA.

**MODIFY:**
* Make the hero sub-copy more literal and descriptive.
* Simplify the Memory Thread to a static SVG overlay with a drawn stroke.

---

## PART 3: AVUNO — PRODUCTION-READY LANDING PAGE SPECIFICATION

### A. Final Product Positioning
Avuno is the definitive personal archive. A private, beautifully crafted space connecting the media you consume with the memories you live.

### B. Final Messaging
* **Headline:** A quiet place to remember every story you've lived.
* **Sub-headline:** Connect the movies, books, and music you love with the journals and memories that make them yours.

### C. Final User Journey
Curiosity (Hero) → Recognition (Problem) → Connection (Thread) → Proof (UI Depth) → Trust (Vault) → Release (CTA).

### D. Final Section Architecture & E. Final Scroll Map (Tightened to 800vh)
1. **0–15% (Arrival):** Hero text over dark Sanctuary video.
2. **15–30% (The Problem & Cascade):** "Your life is scattered." 10 CC0 memory objects float up and snap into a grid.
3. **30–50% (The Memory Thread):** A glowing SVG line connects 3 objects. "Avuno remembers why it mattered."
4. **50–70% (Product Depth):** 3 asymmetric glass cards float up: Library, Journal, Collections. (UI proof).
5. **70–85% (Trust):** "Your Archive. Your Control."
6. **85–100% (Horizon):** Video 1 transitions to Video 2. Final CTA.

### F. Final Copy
*(See Section B for Hero. Other copy refined for strict product truth).*

### G. Final Video Integration
* **Video 1 (Sanctuary):** Autoplays constantly. Opacity fades out at 85% scroll.
* **Video 2 (Horizon):** Lazy-loaded. Autoplays. Opacity fades in at 85% scroll.

### H. Final Memory Cascade
10 optimized WebP images (CC0 photography, public domain art). Initially scattered using CSS `translate` and `rotate`. At 25% scroll, they snap to `translate: 0, rotate: 0` inside a CSS Grid. 

### I. Final Memory Thread
A static `<svg>` overlay covering the Grid container. Uses `motion.path` from `framer-motion` to animate `pathLength` from 0 to 1 based on scroll progress. 

### J & K. Final Product Demo & Search
No interactive search section. Instead, high-fidelity UI components (a Journal card, a Media card) float into view during the "Product Depth" section, proving the UI exists and looks premium.

### L. Final Trust Section
* Private by design.
* Export your data anytime.
* No advertising, ever.

### M. Final CTA
"Your archive is waiting. A lifetime of stories deserves somewhere to stay." -> `[ Begin Your Archive ]`

### N. Final Navigation
Fades in after 10% scroll. Center glass pill: `Avuno | Library | Journal`. Right aligned: `Sign In`.

### O. Final Mobile Experience
The Grid becomes a single column. The Memory Thread becomes a straight vertical line. Parallax is disabled (`useReducedMotion` logic applied based on screen width) to save mobile battery and prevent jank.

### P. Final Reduced-Motion Experience
If OS `prefers-reduced-motion` is true: Videos pause on first frame. Lenis scroll-hijacking is completely disabled. Elements fade in via standard standard CSS transitions on intersection, rather than scrubbing.

### Q. Final Performance Requirements
* Target: 100 Lighthouse score.
* Videos: WebM VP9, max 2.5MB.
* Images: WebP, max 50kb each. Next/Image for automatic sizing.

### R, S, T, U, V. (Accessibility, Assets, SEO, Analytics)
* **Assets:** 100% CC0 or legally owned.
* **SEO:** Semantic HTML5 (`header`, `section`, `main`). `h1` for hero, `h2` for sections.
* **Analytics:** Plausible or Vercel Web Analytics (cookie-less, privacy-first).

### W & X. Final React & Animation Architecture
* **Lenis:** Wrapped in a top-level `<ReactLenis root>` provider.
* **Framer Motion:** A custom hook `useScrollProgress()` provides the global `scrollYProgress`. Sections receive derived transforms: `const opacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1])`.

### Y & Z. Implementation Order
1. Setup Next.js, Tailwind, Lenis, Framer Motion.
2. Implement `<VideoCanvas>` (the two background videos).
3. Build Typography and layout primitives.
4. Build Hero and Trust sections (static text).
5. Build Memory Cascade and SVG Thread (the hardest part).
6. Polish and Performance audit.

---

## PART 4: IMPLEMENTATION GATE

🟢 **GREEN — READY TO IMPLEMENT:**
* The 2-Video Background Architecture.
* The Lenis + Framer Motion scroll architecture.
* The Typography and Color system.
* The Memory Cascade & SVG Thread (using CSS Grid + absolute SVG).
* The Horizon CTA section.

🟡 **YELLOW — NEEDS PRODUCT CONFIRMATION:**
* The exact copy in the Trust section (Verify export capabilities and encryption level before deploying to production).
* The Navigation links (Do "Library" and "Journal" public routes exist, or should they just be "Sign In" / "Features"?).

🔴 **RED — DO NOT IMPLEMENT YET:**
* Copyrighted movie posters. (Must swap to CC0 assets before launch).
* Any claims of "AI Search" or "Local-first" (Removed from spec).

---

## PART 5: THE MOST IMPORTANT QUESTION

> *If Avuno becomes a major product five years from now, will this landing page still feel like the beginning of that company—or will it feel like a beautiful concept from its early days?*

**Answer:** With the Red Team revisions applied, it will feel like the beginning of a major company. The original spec leaned too heavily into "concept site" territory (complex DOM tracking, 1000vh scrolling, interactive fake search, copyrighted assets). By stripping away the gimmicks, locking down the asset legality, optimizing the CSS architecture for 60fps, and focusing the messaging strictly on verified product truths, we have transitioned this from an *award-winning design concept* into a *production-grade, trust-inspiring software platform.* 

It is now ready for code.

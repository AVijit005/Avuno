# AVUNO — BILLION-DOLLAR LANDING PAGE MASTER SPEC

*Prepared for Avuno Product Leadership*
*Role: Principal Product Designer & Architect*

---

## 1. PRODUCT POSITIONING
Avuno is the definitive personal archive. It is a beautifully crafted, private ecosystem designed to connect the media you consume with the memories you live. It sits at the intersection of a media tracker, a personal journal, and a digital museum.

## 2. BRAND THESIS
**"Premium comes from restraint."**
Avuno is not a flashy SaaS startup trying to get acquired; it is a permanent institution built for an individual. It values quietness, typographic excellence, and emotional resonance over gimmicks, noise, and artificial urgency. 

## 3. TARGET USER PSYCHOLOGY
The user is experiencing "digital fatigue." Their life is scattered across Netflix history, Goodreads accounts, Apple Photos, and physical journals. They don't want another "productivity app" with a kanban board. They want a **sanctuary**. They crave ownership, privacy, and a sense of legacy.

## 4. INFORMATION HIERARCHY
1. **Primary Message:** A quiet place to remember every story you've lived.
2. **Secondary Message:** Your life is scattered; Avuno connects it.
3. **Supporting Message:** Track media, write journals, see connections.
4. **Trust Message:** Private by design, yours forever.
5. **Conversion Message:** Begin your archive today.

## 5. FINAL NARRATIVE
The emotional journey: **Curiosity → Recognition → Connection → Trust → Release.**
Visually, the narrative is: **SCATTERED → CONNECTED → ARCHIVED.**

## 6. FINAL SECTION ARCHITECTURE
1. **The Arrival (Hero):** Immersion into the Sanctuary.
2. **The Problem:** The Scattered Life.
3. **The Core Mechanic:** The Memory Cascade & The Thread.
4. **The Intelligence:** Interactive Cinematic Search.
5. **The Depth:** Library, Journal, Timeline, Collections.
6. **The Vault (Trust):** Privacy and Permanence.
7. **The Horizon (CTA):** Emotional Release.

## 7. EXACT SCROLL MAP
* **0–12% (Arrival):** Hero text over dark Sanctuary video. Very still.
* **12–25% (Problem):** "Your life is scattered." Disconnected objects float upward.
* **25–45% (Memory Cascade):** The objects slow down and align into a beautiful grid.
* **45–60% (The Thread):** A glowing line connects a Movie → a Journal → a Date. "Avuno remembers why it mattered."
* **60–72% (Interactive Search):** "Ask your archive anything." The search UI appears and filters the background objects.
* **72–82% (Product Depth):** Glass cards revealing Library, Timeline, Collections.
* **82–92% (Trust):** "Your Archive. Your Control." Information about privacy.
* **92–100% (Horizon & Vault):** Video 1 transitions to Video 2 (The Horizon). The final, elegant CTA.

## 8. FINAL COPY
* **Hero Headline:** A quiet place to remember every story you've lived.
* **Hero Subtext:** Your media, memories, and journals—connected in one private archive.
* **Problem:** Your life is scattered across places that were never designed to remember it together.
* **Transition:** It’s time to bring it home.
* **Product:** Not just what you consumed. Why it mattered.
* **Trust:** Private by design. Export anytime. No ads.
* **CTA:** Your archive is waiting. A lifetime of stories deserves somewhere to stay.

## 9. BACKGROUND VIDEO INTEGRATION
* **Video 1 (The Sanctuary):** Dark room, single light shaft, drifting dust. Plays 0-80%. Dark, intimate, provides massive negative space for the UI.
* **Video 2 (The Horizon):** Deep twilight ocean. Plays 80-100%. Expansive, peaceful.
* **Implementation:** Both autoplay continuously. We scrub their *opacity* based on scroll, not their playback progress, to ensure buttery 60fps performance.

## 10. MEMORY CASCADE SYSTEM
12-18 high-quality visual objects (Interstellar poster, a worn journal page, a Polaroid, a concert ticket). 
**Animation:** They drift up loosely (Scattered). As the user scrolls, they magnetically snap into a rigid, beautiful masonry layout (Archived).

## 11. MEMORY THREAD
A signature SVG interaction. An elegant, glowing 1px line draws itself as you scroll, connecting the Interstellar poster → to a Journal Entry ("Watched with Sarah") → to a Date (Oct 2014) → to a Collection ("Defining Moments"). It proves Avuno is a relational database of life, not just a list.

## 12. PRODUCT DEMONSTRATION
No massive dashboard screenshots. Instead, we show isolated, perfect components (a beautiful movie card, an elegant journal text editor) floating in the Sanctuary, proving the UI is flawless.

## 13. INTERACTIVE SEARCH
A massive, focused search input appears: `Show me the summer of 2019`. 
As it "types", the objects in the background immediately filter down to just 3 items from that summer. It demonstrates power without a boring feature list.

## 14. FEATURE PRESENTATION
Instead of 6 generic boxes, we use 4 asymmetric glass cards:
1. **Library** (The Media)
2. **Journal** (The Meaning)
3. **Timeline** (The History)
4. **Collections** (The Organization)

## 15. TRUST / PRIVACY
A stark, text-heavy section that feels like a legal promise, not marketing.
**YOUR ARCHIVE. YOUR CONTROL.**
* Private by design (Your data is encrypted).
* Export anytime (No vendor lock-in).
* Long-term ownership (Built to outlast the device you're reading this on).

## 16. NAVIGATION
Ultra-minimal. It is invisible at 0% scroll. It fades in as a tiny, blurred glass pill at top-center after 10% scroll: `[ Avuno ]   Library   Journal   Sign In`. 

## 17. CTA STRATEGY
* **Hero:** `[ Explore the archive ]` (Scrolls down, low friction).
* **Final (Horizon):** `[ Begin Your Archive ]` (The true conversion point).

## 18. MOTION SYSTEM
* **Rule:** Motion explains relationships.
* **Springs:** Stiff, critically damped springs (no bouncy/childish physics).
* **Parallax:** Very subtle (0.95x to 1.05x speed) just to separate foreground from the video.

## 19. TYPOGRAPHY
* **Display:** Fraunces (Editorial, serif, emotional, italicized accents).
* **Body:** Geist or Inter (Highly legible, wide tracking, modern).
* **Eyebrow:** Uppercase, tracking `0.1em`, muted.

## 20. COLOR SYSTEM
* **Background:** Deep Charcoal / Obsidian.
* **Foreground:** Off-white (`rgba(255,255,255, 0.9)`).
* **Accent:** Iris / Muted Indigo.
* **Glass:** `rgba(255,255,255, 0.03)` with `backdrop-blur(16px)`.

## 21. RESPONSIVE STRATEGY
* **Desktop:** Wide spatial choreography, heavy parallax, large typography.
* **Mobile:** Linear storytelling. The Memory Cascade becomes a single vertical stack. The Memory Thread becomes a straight vertical line connecting elements. Video 1 is cropped to keep the light shaft visible.

## 22. ACCESSIBILITY
* `useReducedMotion` hooks disable the Lenis smooth scroll, pause the background videos, and replace scroll-linked animations with simple `IntersectionObserver` fade-ins.
* Focus rings on all interactive elements.
* `aria-hidden` on decorative floating objects.

## 23. PERFORMANCE
* **DOM limits:** The Memory Cascade uses maximum 18 DOM nodes.
* **Video:** `WebM` VP9, heavily compressed (< 3MB), lazy-loaded where appropriate.
* **CSS:** Use `will-change: transform, opacity` only on currently animating elements.

## 24. ASSET STRATEGY
We use real, recognizable movie posters and book covers (Fair Use for product demonstration) rather than generic stock vectors, because memory is tied to real pop culture. High-res, compressed as WebP.

## 25. REACT ARCHITECTURE
* `app/page.tsx`: Server component for layout.
* `components/landing/LandingClient.tsx`: Client boundary for Lenis and Framer Motion.
* `components/landing/Scene1_Hero.tsx`: Modular scenes mapped to scroll progress.

## 26. ANIMATION ARCHITECTURE
* A single `useScroll()` hook at the top level passes `scrollYProgress` down to scenes via React Context.
* Components use `useTransform(scrollYProgress, [start, end], [val1, val2])`.

## 27. DATA MODEL (IMPLIED)
The page implies a graph database: `User -> consumes -> Media -> triggers -> Journal Entry -> belongs to -> Collection`. 

## 28. CONVERSION PSYCHOLOGY
* **Arrival:** Intrigued.
* **Problem:** Understood ("Yes, my life is scattered").
* **Solution:** Impressed ("This looks beautiful").
* **Trust:** Relieved ("They won't sell my data").
* **Action:** Ready ("I want this space").

## 29. COMPETITIVE DIFFERENTIATION
* **vs Notion:** We are opinionated and beautiful; they are a blank spreadsheet.
* **vs Letterboxd:** We are private and multi-media; they are public and movies-only.
* **vs Apple Journal:** We connect media to the journal; they are siloed.
* **Visual Differentiator:** Editorial Dark Academia vs standard SaaS blue/white.

## 30. BILLION-DOLLAR QUALITY AUDIT
* Brand maturity: 10
* Emotional resonance: 10
* Visual sophistication: 9 (Relies heavily on execution)
* Trust: 9
* Performance: 9 (Scroll scrubbing avoided)
* **Overall Score:** 9.4 / 10

## 31. BRUTAL SELF-CRITIQUE
* *Critique 1:* Is it too dark? Will people think it's a horror movie app?
* *Fix:* The accent color (Iris) and the photography (bright Polaroids, colorful movie posters) must provide warmth. The light shaft in Video 1 must feel like morning/evening sun, not a flashlight.
* *Critique 2:* Is the "Memory Thread" too technically complex to build?
* *Fix:* Yes, tracking 5 moving DOM elements with an SVG line on scroll is brittle. We will fake it: The elements lock into place, *then* the SVG draws itself relative to the container, rather than tracking moving coordinates.
* *Critique 3:* Does it look like a template?
* *Fix:* Generic templates use floating 3D dashboard mockups. We are explicitly banning floating dashboards and using the raw components (isolated posters, isolated text inputs) to break the SaaS mold.

## 32. FINAL REVISED ARCHITECTURE
The architecture holds. The core modification from the critique is restricting the complex SVG line animations to static container boundaries rather than tracking moving objects, ensuring flawless performance across all screen sizes. The emotional journey remains fully intact. We are ready to build.

---
*End of Master Specification. Authorized for implementation phase.*

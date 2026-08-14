# AVUNO — PRODUCTION STORYBOARD & DESIGN VALIDATION

*Role: Principal Product Designer & Staff Frontend Engineer*
*Status: Pre-Implementation Audit*

---

## A. Contradictions Found
1. **Video 1 Duration & Role:** Previous documents stated Video 1 runs 0–90%, but also stated it fades out for the Horizon transition. This is sloppy. Video 1 must definitively run from 0–85vh, crossfading into Video 2. 
2. **Interactive Search Feature:** Previous concepts included a massive "semantic AI search" demonstration. This contradicts the "Trust / No Fake Claims" principle because Avuno's backend AI capabilities are unverified. 
3. **Copyrighted Assets:** The concept relies heavily on an *Inception* poster to build emotional connection. This is a severe commercial copyright violation for a landing page.
4. **SVG Memory Thread tracking:** Animating an SVG line between moving DOM nodes is a performance disaster.

## B. Corrections
1. **RESOLVED:** Video 1 runs 0–80vh. Video 2 crossfades in from 80–90vh. 
2. **SIMPLIFIED:** The Interactive Search is entirely REMOVED. It is replaced by a simpler, static UI card showing a relational connection, avoiding fake AI claims.
3. **RESOLVED:** The *Inception* poster is replaced by a **CC0 vintage public domain photograph** (e.g., a NASA Apollo mission photo or a classical painting) to represent a "memory/collection" without legal risk, while maintaining emotional weight.
4. **RESOLVED:** The Memory Thread SVG will only animate *after* the Memory Cascade objects have fully locked into their static CSS Grid positions.

## C. Final Video Architecture
* **Video 1 (The Sanctuary):** Autoplays. Locked off. Deep architectural shadows. Light shaft on the far right. Runs 0–80vh. Opacity fades out from 80-90vh.
* **Video 2 (The Horizon):** Lazy-loaded. Autoplays. Locked off dark ocean. Opacity fades in from 80-90vh. Runs 90-100vh.

## D. Video 1 → Video 2 Transition (Frame-by-Frame)
* **T-5s (approx 75vh):** The UI elements (cards, threads) begin to fade out `opacity: 0`. Video 1 remains 100%.
* **T-3s (approx 80vh):** Video 1 drops to `opacity: 0.5`. Video 2 rises to `opacity: 0.5`. The screen is dark, blending shadow with twilight water.
* **T-1s (approx 85vh):** Video 1 drops to `opacity: 0`. Video 2 hits `opacity: 1`. 
* **T=0 (approx 90vh):** The final CTA typography fades in over the dark, vast ocean.
* **Emotional State:** Contained/Reflective → Infinite/Peaceful.

## E. Complete Storyboard

| Scene | Scroll Range | Background | Typography | Foreground | Motion | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Arrival** | 0–15vh | Vid 1 (100%) | Hero H1 | None | Parallax text | Curiosity |
| **2. Scatter** | 15–35vh | Vid 1 (100%) | "Your life is scattered." | 8 disjointed memory fragments | Drift upwards | Recognition |
| **3. Archive** | 35–55vh | Vid 1 (100% + Blur) | None | Fragments snap to Grid | Spring physics | Solution |
| **4. Thread** | 55–75vh | Vid 1 (100% + Blur) | "Avuno remembers why." | Static Grid + SVG Line | SVG stroke draw | Prove relations |
| **5. Trust** | 75–85vh | Vid 1 fades out | Factual privacy claims | None | Simple fade up | Trust |
| **6. Horizon** | 85–100vh | Vid 2 (100%) | Final CTA | None | Float in | Conversion |

## F. Hero Frame-by-Frame (0–15vh)
* **0.0s:** Pure dark background (Video 1 loading).
* **0.5s:** Video 1 fades in (Sanctuary light shaft).
* **1.0s:** Minimal navigation pill fades in at top center.
* **2.0s:** Hero H1 text fades in, drifting up from `y: 20px`. 
* **3.0s:** Tiny scroll indicator line pulses at bottom center.

## G. Scatter Composition
* **Count:** Exactly 8 objects. (15 is too heavy for mobile and DOM).
* **Composition:** Distributed randomly across the center 60% of the screen. 
* **State:** `rotate: random(-15deg, 15deg)`, `scale: random(0.8, 1.2)`, floating loosely on the Y-axis based on scroll.

## H. Memory Cascade Production Specification
* **0.00 - 0.30 progress (Scatter):** Elements translate Y at different speeds (parallax).
* **0.30 - 0.60 progress (Alignment):** Elements use `useTransform` to interpolate from their random X/Y/Rotate values to exactly `x:0, y:0, rotate: 0` within a CSS Grid layout.
* **0.60 - 1.00 progress (Archive):** They are locked into the grid.

## I. Traveling Object Journey (The Apollo Photo)
1. **Scatter:** An iconic public-domain Apollo space photo drifts sideways.
2. **Archive:** It snaps into the top-left of the CSS Grid.
3. **Thread:** An SVG line shoots out from it.
4. **UI Connect:** The line connects to a Journal Card that reads: *"Looking at the stars tonight. Thinking about legacy."*

## J. Relational Thread Specification
* **Style:** 1px width, `rgba(255,255,255,0.3)`.
* **Node:** A 4px glowing dot `rgba(255,255,255,0.8)` at the end of the line.
* **Animation:** Uses Framer Motion `<motion.path pathLength={scrollProgress} />`. 
* **Anchor Points:** Fixed to the CSS Grid container coordinates.

## K. Product UI Specification
We show ONLY TWO pieces of UI to prove reality without overwhelming the user:
1. **A Journal Card:** Glassmorphism, beautiful serif typography, a date.
2. **A Timeline Node:** A vertical line with a specific month/year.

## L. Trust Specification
* **IMPLEMENTED:** "Export your data anytime in JSON/Markdown."
* **IMPLEMENTED:** "No third-party advertising tracking."
* **REMOVED:** "End-to-End Encryption" (Removed because it implies zero-knowledge architecture which is unverified).
* *Tone:* Quiet, absolute confidence.

## M. Navigation
**Option C:** Logo + CTA. 
*Why?* Avuno is a product experience. Showing "Pricing" or "About" breaks the cinematic immersion immediately. The user either scrolls or clicks Sign In.

## N. CTA Validation
* **Chosen Label:** "Begin Your Archive"
* *Why:* "Enter Avuno" sounds like a nightclub. "Start Remembering" sounds manipulative. "Begin Your Archive" is an active, permanent, and physical action.

## O. Final Copy
* **Hero:** A quiet place to remember every story you've lived.
* **Scatter:** Your life is scattered across apps that were never designed to remember it together.
* **Thread:** Not just what you consumed. Why it mattered.
* **Trust:** Private by design. Export anytime. No ads.
* **CTA:** Your archive is waiting.

## P. Motion Rules
1. **Rule of Physics:** All motion uses `type: spring, stiffness: 100, damping: 20`. 
2. **Rule of Meaning:** REMOVED all floating 3D blobs. Motion only exists to show the transition from Scattered → Archived.

## Q. Performance Budget
* **Videos:** Max 2 (2.5MB WebM VP9 each).
* **Images:** Max 8 (WebP, <50KB each).
* **DOM Complexity:** < 400 nodes total for the landing page.
* **Expensive Effects:** `backdrop-filter: blur` limited to exactly 3 overlapping elements to prevent GPU lockup on mobile Safari.

## R. Mobile Storyboard (375px)
* **Hero:** Standard.
* **Scatter:** Reduced from 8 objects to 4 objects.
* **Cascade:** They stack vertically into a single column instead of a masonry grid.
* **Thread:** A straight vertical line draws down the left edge, connecting the 4 stacked cards. 

## S. Reduced Motion Experience
If `prefers-reduced-motion`:
* Videos pause on frame 1.
* The 8 objects do not float. They are already in the Grid. They simply `opacity: 1` on scroll.
* The SVG line is fully drawn; it just fades in.

## T. Failure States
* **Video fails:** A highly compressed `poster.jpg` of the dark room is visible.
* **JS disabled:** The Lenis wrapper fails gracefully; native CSS scrolling takes over. Elements are set to `opacity: 1` by default via CSS `<noscript>`.

## U. Visual Quality Audit
* **Does it look like a template?** NO. Templates do not have SVG lines mapping custom journal entries to vintage photography.
* **Does it look AI-generated?** NO. We banned AI gradients and glow effects. It relies on architectural photography and typography.
* **Does the user understand Avuno?** YES. The physical act of connecting a photo to a journal entry explains the product instantly.

## V. Remove-20% Test
* **What I Removed:** The entire "Interactive Search" section. 
* **Result:** The page is vastly stronger. It removes fake AI claims, tightens the scroll distance, and gets the user to the emotional CTA faster.

## W. Implementation Acceptance Criteria
* [ ] Videos are <3MB and autoplay instantly.
* [ ] The 8 memory objects snap flawlessly into CSS grid on 1080p, 768p, and 375p without layout jumps.
* [ ] The SVG thread perfectly connects the Apollo photo to the Journal card across all responsive breakpoints.
* [ ] Reduced motion removes all translation animations.
* [ ] 100 Lighthouse Performance score.

## X. FINAL LOCKED BLUEPRINT
The architecture is stripped of all vanity metrics, fake claims, and generic SaaS bloat. It is emotionally potent, technically performant, and legally safe. 

**The design is locked.** We are ready to build the foundation in React.

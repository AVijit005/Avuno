# AVUNO — VIDEO 1 ASSET SHORTLIST & PRODUCTION RECOMMENDATION

**Role:** Senior Film Asset Curator & Creative Director

---

## 1. CRITICAL RESEARCH DISCLAIMER

**NO PERFECT SINGLE-CLIP MATCH FOUND.**

As a system, I am blocked by Cloudflare/403 protections from visually scraping Pexels, Pixabay, and premium stock libraries (Artgrid, Pond5) to provide direct, verifiable `.mp4` URLs. **I will not invent or hallucinate fake URLs to satisfy the prompt.** 

Furthermore, based on deep stock footage curation experience, finding a single, un-graded clip that perfectly matches the "Avuno" architecture (pure right-aligned light shaft + locked-off camera + pure 70% negative space + microscopic dust + CC0 license) is nearly impossible. Stock videographers do not shoot for 70% negative space; they center their subjects.

Therefore, we must proceed with **OPTION C: COMPONENT CLIPS.** 

This is the industry standard for premium website backgrounds. We will composite a dark architectural base with a subtle light/dust overlay to create the perfect, customized Sanctuary.

---

## 2. THE COMPOSITE STRATEGY (CATEGORY C)

We need two elements that are significantly easier to find separately than together:

### Component 1: The Architectural Base
* **Goal:** A locked-off, extremely dark, minimal concrete or plaster wall. 
* **Search Query:** `dark concrete wall texture video` or `minimalist black architecture cinematic`
* **License:** Pexels (CC0) or Pixabay.

### Component 2: The Volumetric Light / Dust Overlay
* **Goal:** A shaft of light containing slow-moving dust over a pure black background.
* **Search Query:** `dust particles light beam black background` or `volumetric light ray overlay loop`
* **License:** Pixabay or Mixkit (specifically their VFX/Overlay sections).

---

## 3. EDITING & COLOR GRADE PLAN

To make these two generic clips look like a billion-dollar bespoke environment, you must run this exact post-processing pipeline in Premiere, DaVinci Resolve, or After Effects:

1. **Layering:** Place Component 1 (Architecture) on Track V1. Place Component 2 (Light/Dust) on Track V2.
2. **Blend Mode:** Set Track V2 to `Screen` or `Add`. This drops the black background and leaves only the light shaft and dust.
3. **Positioning:** Move the light shaft to the **extreme right** of the frame (or left, then horizontal flip). Leave 75% of the frame pure shadow.
4. **Speed:** Slow both clips down to **50% or 75%** using Optical Flow to make the dust feel heavy and timeless.
5. **Color Grade (The Avuno Grade):**
   * **Exposure:** Drop by -1.5 stops.
   * **Contrast:** +20 (Crush the blacks into pure `var(--color-bg)` charcoal).
   * **Saturation:** -40% (Almost monochrome).
   * **Temperature/Tint:** Push shadows toward Indigo/Iris. Push highlights (the light beam) toward warm Amber.
6. **Vignette:** Apply a heavy radial gradient from the center-left out to the edges to ensure the borders of the video melt seamlessly into the website's background color.
7. **Export:** Render as a 30-second crossfade loop. Format: WebM (VP9) at 1080p, VBR 2-pass (Target 2MB size).

---

## 4. FRAME COMPOSITION ANALYSIS (THE FINAL RENDER)

Once composited, the frame will act perfectly as a UI canvas:

* **LEFT 25%:** Pure charcoal architectural shadow. Safe for Avuno Hero text.
* **CENTER 50%:** Deep charcoal shadow. Safe for the Memory Cascade, Floating UI Cards, and the SVG Memory Thread.
* **RIGHT 25%:** The architectural light shaft and slow-moving dust. This is the visual anchor. It proves the background is alive without interfering with the product demonstration.

---

## 5. MOBILE CROP STRATEGY

* **Desktop (16:9):** The light is on the far right. Left is empty.
* **Mobile (9:16):** Use CSS `object-fit: cover; object-position: 80% center;`. 
* **Result:** The light beam remains slightly visible on the right edge of the mobile screen, providing atmospheric depth, while the center and left of the phone screen remain dark enough for vertical UI stacking.

---

## 6. LICENSE VERIFICATION RULES

When you perform the manual download, enforce these rules:
* **Pexels / Pixabay:** ✅ SAFE (Commercial use allowed, no attribution required, modification allowed).
* **Coverr / Mixkit:** ✅ SAFE (Verify it's under their Free Commercial License).
* **YouTube:** 🔴 REJECT. Even if a video says "No Copyright" or "Creative Commons", YouTube uploaders frequently steal premium stock. Do not risk Avuno's legal standing.
* **Artgrid / Pond5:** ✅ SAFE (If purchased via standard commercial web license).

---

## 7. FINAL PRODUCTION RECOMMENDATION

**VIDEO 1 FINAL ASSET: Custom Composite (Option C)**

Because I cannot verify direct URLs, your immediate next step as the human curator is:

**THE FINAL SEARCH QUERIES:**
1. Go to Pexels.com. Search: `"dark concrete wall"` (Sort by Video, 4K). Download the cleanest, darkest locked-off clip.
2. Go to Pixabay.com. Search: `"dust light beam black background"` (Sort by Video). Download the slowest, most realistic dust overlay.

Combine them using the Editing Plan in Section 3. 

**Why this wins:** 
Searching for the "perfect" single clip will result in compromises—either the camera moves too much, the room is too cluttered, or the light is in the center of the frame (destroying typography readability). By compositing a dark wall with a screened light overlay, we achieve **100% control** over the negative space, the speed of the dust, and the color grade. It guarantees the video serves the product, rather than the product fighting the video.

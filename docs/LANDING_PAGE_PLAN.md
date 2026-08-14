# AVUNO: MASTER CINEMATIC LANDING PAGE BLUEPRINT
**Version:** 6.0 (The Kinetic Symphony)
**Role:** World-Class Creative Director & Frontend Architect
**Objective:** Design a premium digital experience, not a SaaS landing page.

---

## PART 1: THE VISION & PSYCHOLOGY

### 1. Executive Vision
Avuno is not a tool; it is a sanctuary. The landing page must instantly convey that this is a quiet, profound place to remember every story you've lived. It is the digital equivalent of an oak-paneled library combined with a modern art gallery. We are selling clarity, nostalgia, and emotional safety.

### 2. The Core Metaphor: The Kinetic Symphony
The entire page is a single, continuous performance linked directly to the user's scroll. Nothing jumps, nothing flashes. Content *breathes* into existence. We will use exactly two continuous, high-fidelity background videos that span the entire vertical journey, serving as the canvas upon which typography and interface elements dance. 

### 3. Target Audience Psychology
Our visitors are overwhelmed by digital noise, fragmented memory apps, and aggressive "BUY NOW" SaaS culture. They seek permanence. They will respond to an experience that feels intentionally crafted, calm, and highly respectful of their time.

### 4. The Emotional Arc
As the user scrolls, they must pass through these psychological states:
1. **Curiosity:** "What is this dark, beautiful space?"
2. **Recognition:** "Ah, a place for my memories and media."
3. **Emotion:** "This feels deeply personal and significant."
4. **Discovery:** "The interface looks powerful but invisible."
5. **Interaction:** "Scrolling this feels incredible."
6. **Attachment:** "I don't want to leave this environment."
7. **Desire:** "I need my personal archive to look like this."

### 5. Brand Voice & Tone
Editorial. Confident. Whisper-quiet. We use fewer words, chosen perfectly.
*Instead of:* "Manage your digital assets with our AI-powered dashboard."
*Use:* "Your life, cataloged. A quiet place for every story."

### 6. Anti-Patterns (What We Will Never Do)
- No "Netflix/Goodreads" grid walls.
- No glowing purple buttons or generic "AI SaaS" gradients.
- No floating 3D dashboards angled at 45 degrees.
- No desperate exit-intent popups.
- No visible scrollbars.

---

## PART 2: AESTHETICS & ART DIRECTION

### 7. Global Art Direction
"Editorial Dark Academia meets Modern Swiss." The page feels like a high-end coffee table book made of glass and light.

### 8. The 2-Video Strategy (Constraints as Art)
To maintain 60fps performance and a cohesive mood, the page is powered by just two looping videos (muted, heavily darkened, cinematic lighting):
- **Video 1 (0% to 70% scroll): "The Sanctuary."** Dust motes catching a beam of light in a dark, textured room. Slow, almost imperceptible movement.
- **Video 2 (70% to 100% scroll): "The Horizon."** A slow pan over a vast, twilight landscape or ocean, representing the expanse of a lifetime's memories.

### 9. Color Palette
- **Canvas:** `var(--color-bg)` (Deep Charcoal/Obsidian)
- **Primary Text:** `var(--color-foreground)` (Off-white, 90% opacity for softness)
- **Accent:** `var(--color-accent)` (Muted Iris/Indigo with Amber highlights)
- **Glass:** `bg-foreground/[0.03]` with heavy background blur.

### 10. Typography Strategy
- **Display:** Fraunces (Italicized accents, massive font sizes for impact).
- **Body:** Inter or Geist (Extremely legible, wide letter spacing).
- **Eyebrow:** Uppercase, tracked out (`letter-spacing: 0.1em`), muted.

### 11. Spacing & Grid System
Massive negative space. Components should feel like they are floating in an empty room. Padding is measured in `vmax` and `vh` to scale relative to the emotional weight of the screen.

### 12. Motion Logic
Driven by `framer-motion` and `lenis`.
- **Scroll-Linked Opacity & Blur:** Text fades in from 0, blurs from 10px to 0px, and translates Y slightly based on scroll progress.
- **Magnetic Physics:** Hovering over buttons or image cards applies a slight magnetic pull.
- **Parallax Subtlety:** Elements move at 0.9x or 1.1x scroll speed to create optical depth against the video.

### 13. UI Component DNA
- Edges: Soft rounded (`rounded-3xl` or `rounded-[32px]`).
- Borders: `1px solid rgba(255, 255, 255, 0.05)`.
- Shadows: Soft, diffuse, under-lit. 

### 14. Accessibility (Reduced Motion)
If `prefers-reduced-motion` is active, the videos pause, Lenis scroll hijacking is disabled, and elements fade in via standard Intersection Observer rather than scroll scrubbing.

---

## PART 3: THE CHOREOGRAPHY (SCENE BY SCENE)

### 15. Scene 1: The Arrival (Curiosity)
- **Visual:** Video 1 begins playing underneath. A heavy dark overlay `bg-black/40` sits on top.
- **Action:** A single line of Fraunces text fades in: "A quiet place to remember."
- **Interaction:** A subtle, glowing vertical line pulses at the bottom, urging a scroll. No nav bar is visible yet.

### 16. Scene 2: The Sanctuary (Recognition)
- **Visual:** As the user scrolls, the title fades up and out. A massive, beautiful interface mockup (glassy, borderless) rises from the bottom.
- **Action:** The mockup doesn't look like software; it looks like an editorial spread of memories.
- **Copy:** "Everything you've lived, curated in one beautiful archive."

### 17. Scene 3: The Tapestry (Emotion)
- **Visual:** The mockup dissolves into 3 floating cards (Memories, Books, Cinema) that parallax at different speeds.
- **Action:** The user scrolls past them, feeling the z-index depth as cards overlap the Video 1 background.
- **Copy:** "Not just data. Context. Emotion. Time."

### 18. Scene 4: The Tooling (Discovery)
- **Visual:** The typography switches to a technical, precise layout.
- **Action:** Text-reveal animation scrubs across the words: "End-to-end encryption. Local-first architecture. Uncompromising performance."
- **Interaction:** Hovering over technical words highlights them with a soft amber glow.

### 19. Scene 5: The Interactive Object (Interaction)
- **Visual:** A single, giant input box appears. 
- **Action:** "Ask your archive anything." (e.g., "Show me the summer of 2019"). It auto-types a query to demonstrate the search capability without needing a dashboard screenshot.

### 20. Scene 6: The Transition (Attachment)
- **Visual:** The scroll hits 70%.
- **Action:** Video 1 slowly crossfades into Video 2 (The Horizon). The color temperature cools down. The music (implied tone) shifts from intimate to vast.

### 21. Scene 7: The Horizon (Desire)
- **Visual:** The text becomes massive again. 
- **Copy:** "Your legacy, secured for a lifetime." 
- **Action:** A cascade of beautiful, blurred photos drift upward in the background, out of focus.

### 22. Scene 8: The Threshold (Action)
- **Visual:** The final stop. The video dims almost to black.
- **Action:** A single, beautifully crafted glass button: "Begin Your Archive."
- **Interaction:** The button has a magnetic hover effect. A tiny, elegant footer sits below.

---

## PART 4: TECHNICAL ARCHITECTURE

### 23. Frontend Stack
- **Framework:** Next.js (App Router).
- **Animation:** Framer Motion (`useScroll`, `useTransform`).
- **Smooth Scroll:** Lenis (React wrapper).
- **Styling:** Tailwind CSS (with specific custom utility variables for glassmorphism).

### 24. Video Delivery Strategy
- The 2 videos must be compressed heavily.
- Formats: `.webm` (VP9) and `.mp4` (H.265) fallbacks.
- Strategy: Load Video 1 on mount. Lazy load Video 2 via an Intersection Observer placed halfway down the page to ensure zero blocking on initial paint.

### 25. Scroll Synchronization Logic
- We will map the entire page to a single `scrollYProgress` (0 to 1).
- Every component receives a slice of this progress (e.g., Scene 2 runs from 0.1 to 0.25).
- Opacity, Y-transform, and Blur (`filter: blur(x)`) will be directly interpolated from these progress values.

### 26. Performance & Core Web Vitals
- `will-change: transform, opacity` applied to moving elements.
- Absolute minimal DOM depth.
- Next/Font optimization for Fraunces and Inter to prevent layout shifts.

### 27. Mobile & Responsive Reflow Strategy
- On mobile (width < 768px), disable heavy parallax.
- Videos will crop to `object-cover`.
- The experience remains scroll-linked but prioritizes legibility over complex spatial overlaps.

---

## PART 5: EXECUTION

### 28. Final Implementation Roadmap
1. **Phase 1: Foundation.** Setup Lenis in a `SmoothScrollProvider`. Build the `<VideoCanvas>` component to handle the 2-video crossfade based on scroll height.
2. **Phase 2: Typography & Tokens.** Install Fraunces, setup exact letter-spacing, and create the `TextReveal` and `FadeIn` reusable motion components.
3. **Phase 3: Scene Assembly.** Build Scenes 1 through 8 as tall `100vh` or `200vh` sections to provide enough scroll track.
4. **Phase 4: Component Polish.** Add the magnetic buttons, glass cards, and the mock-interface assets.
5. **Phase 5: Performance Audit.** Test 60fps locking, reduced motion checks, and mobile reflow testing.

---
*End of Blueprint. This document supersedes all previous landing page designs.*

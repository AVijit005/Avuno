# AVUNO: VIDEO DIRECTION & SELECTION DOSSIER
**Prepared by:** World-Class Creative Director & Frontend Architect
**Target:** The Kinetic Symphony (2-Video Architecture)

---

## PART 1 — THE FUNCTION OF A BACKGROUND VIDEO

**The Principle: The background is the canvas, not the subject.**
If a background video demands conscious attention, it has failed. The visitor must interact with the typography, the memory objects, and the UI before they realize the environment they are sitting in is alive. 

This principle completely changes footage selection:
- We do not want a "beautiful video." We want **beautiful negative space.**
- The footage must lack a traditional focal point or subject.
- The footage must have uniform contrast in the areas where text sits, otherwise typography becomes illegible (the "clashing contrast" problem).
- The video provides *texture* (film grain, subtle light shifts, dust, mist) and *emotional temperature*, rather than narrative.

---

## PART 2 — ANALYZING AVUNO'S VISUAL IDENTITY

We need an environment that represents "A quiet place to remember every story you've lived."

* **A. Dark rainy city window:** Cliché. Feels like a 24/7 lo-fi hip hop stream. Too specific, implies a certain type of urban loneliness rather than a personal archive.
* **B. Dark private study:** Strong, but can feel stuffy, old-fashioned, or too small.
* **C. Vintage library:** Too literal. Avuno is digital and modern, not a literal dusty book app.
* **D. Projector room:** Excellent cinematic connection to "memory", but a visible projector is too distracting.
* **E. Warm desk / journal environment:** Looks like a generic productivity SaaS (Notion/Evernote clones).
* **F. Architectural abstraction (Museum/Gallery concept):** Dark, undefined architectural space with a single shaft of light and suspended dust motes.

**The Winner: The Abstract Archive (A hybrid of B and F).**
We do not want a recognizable room. We want the *feeling* of a room. Deep charcoal darkness, with a single soft shaft of volumetric light cutting through, illuminating slow-moving dust motes. It feels timeless, safe, and cinematic, without locking the user into a literal location (like a specific desk or window).

---

## PART 3 — DESIGNING VIDEO 1: "THE SANCTUARY"

### What visual movement survives a 70% scroll journey?
Anything with velocity becomes annoying. Rapid rain is distracting. Flickering lamps cause eye strain.
The only movement that survives a 3-minute scroll interaction is **suspended particle movement** (dust motes in light) and **imperceptible shadow shifts**.

### Environment Design
- **Location:** Undefined deep architectural space. No visible walls, just the suggestion of a vast, quiet room.
- **Time:** Midnight. Timeless.
- **Lighting:** A single, soft, volumetric key light (like moonlight or a streetlamp through an unseen high window). 
- **Color:** Deep charcoal (`var(--color-bg)` equivalent) with the light beam offering a very subtle, desaturated cool-ivory/iris tint.

### Camera Movement
**Strictly Locked-off.** Zero camera movement. 
When the user is scrolling the page, the foreground elements are translating vertically. If the background camera is also panning or tilting, it induces motion sickness and breaks the scroll illusion. The camera must be on a heavy tripod. The only movement is the dust/light *within* the frame.

### Composition & Safe Zones
The light shaft should occupy the far right (80% to 100% of screen width) or far left.
The center and opposite side must be deep, uniform shadow. This provides a massive, high-contrast **safe zone** for our white/off-white typography and glass UI cards.

### Loopability
A 30 to 60-second video with a **crossfade loop**. Because the subject is just light and dust, a 2-second crossfade at the end of the clip will be completely invisible to the human eye. 

### Scoring System for Candidates
- **Negative Space (Safe Zones):** 20%
- **Motion Subtlety (Is it too fast?):** 20%
- **Atmosphere / Cinematic Realism:** 15%
- **Color Compatibility (Can it be graded to charcoal?):** 15%
- **Loopability:** 10%
- **Mobile Crop Safety:** 10%
- **Resolution (4K source downsampled?):** 10%

### Strict Rejection List
NEVER use footage with:
- Recognizable furniture (chairs, desks, laptops)
- Visible people or silhouettes
- Panning, tilting, or handheld camera shake
- Flashing lights, lightning, or fast-moving headlights
- AI-generated morphing artifacts
- High-contrast textures in the center of the frame

---

## PART 4 — DESIGNING VIDEO 2: "THE HORIZON"

Video 2 (70% - 100% scroll) represents release, clarity, the future, and permanence. 
Video 1 was contained; Video 2 must be vast.

### Comparing Possibilities
* A. Misty pine forest: A bit too "outdoor lifestyle brand."
* B. Mountain valley: Beautiful, but heavily tied to a specific geography.
* C. Ocean horizon: Universal. The clean horizontal line creates perfect typographic structure.
* E. Vast sky/clouds: Can feel too religious or abstract.

**The Winner: Deep Twilight Ocean (C).**
A locked-off shot of the ocean horizon just after sunset (blue hour). The water is dark and heavy, moving very slowly. The sky is a smooth gradient of deep blue to charcoal. The horizon line provides a psychological anchor. 

### Emotional Meaning
"Everything has found its place." The vastness of the ocean represents the capacity of the archive. The slow, rhythmic movement of the dark water lowers the visitor's heart rate right before the final Call to Action.

### Camera Movement
**Locked-off or microscopic slow push-in.** 
We want the water to move, not the camera. 

### Light Transition
The sky should not be bright. It should be the exact same charcoal/deep-indigo value as the shadows in Video 1, creating a seamless emotional bridge.

---

## PART 5 — VIDEO 1 → VIDEO 2 TRANSITION

**The Chosen Method: Method D (Darkness becomes the Horizon) + Scroll Interpolation.**

At 70% scroll, Video 1 is already mostly deep charcoal shadow.
As the user scrolls from 70% to 80%:
1. Video 1 opacity scrubs from 100% to 0%.
2. Video 2 opacity scrubs from 0% to 100%.
3. Because the deep shadows of Video 1 perfectly match the dark twilight sky of Video 2, the transition feels like the walls of the "Sanctuary" simply fall away, revealing the "Horizon" outside. It is an emotional expansion.

---

## PART 6 — THE FOREGROUND MATRIX

| Foreground | Video 1 (Sanctuary) | Video 2 (Horizon) |
| :--- | :--- | :--- |
| **Hero Headline** | Crystal clear over deep shadow safe zone. | N/A |
| **Manifesto Text** | Light shaft slightly blurs (`blur(4px)`) behind text. | N/A |
| **Memory Cards** | Float above the light, casting subtle drop shadows. | N/A |
| **Bento UI** | Glass cards catch the light shaft behind them. | N/A |
| **Final CTA** | N/A | Placed dead center over the calm, dark ocean water. |

---

## PART 7 — VIDEO COLOR GRADING

We must apply a CSS/Canvas grade to the video, or pre-render it.
- **Exposure/Contrast:** Crush the blacks. `contrast(1.1) brightness(0.7)`. We want deep, rich blacks to blend seamlessly with the `var(--color-bg)` of the website.
- **Saturation:** `saturate(0.4)`. Strip out distracting colors.
- **Tint:** Add a very subtle indigo/iris tint to the shadows to match the Avuno brand accent.
- **Vignette:** Heavy radial gradient overlay (`bg-radial from-transparent to-bg`) so the edges of the video perfectly dissolve into the background color.
- **Grain:** Overlay a static SVG noise layer (`opacity: 0.03`) over the ENTIRE site. This blends the video and the UI into one cohesive cinematic physical object and prevents color banding.

---

## PART 8 — MAKING YOUTUBE FOOTAGE LOOK PREMIUM

**The Post-Processing Pipeline:**
1. **Find a 4K Source.**
2. **Crop to Safe Zone:** Punch in 120% to remove unwanted edge details or re-frame the light shaft to the far right.
3. **Optical Flow Slowdown:** Slow the footage to 50% speed. This turns normal dust/water into dreamlike, cinematic movement.
4. **Desaturate & Crush:** Force the shadows into pure black.
5. **Export as WebM (VP9) & MP4 (H.265).** Keep file size under 3MB per loop.
6. **Frontend Blur:** Apply a constant `blur(2px)` in CSS. This hides compression artifacts, removes sharp distractions, and pushes the video into the background z-index psychologically.

---

## PART 9 — YOUTUBE SEARCH STRATEGY (40 Practical Queries)

**VIDEO 1 Searches (Dust/Light/Shadow):**
*Broad:* "dark room volumetric light", "dust motes in light beam", "cinematic dark interior", "abstract dark background loop"
*Object/Element:* "window light ray dark room", "projector beam dust", "slow dust particles real footage", "sunbeam through window dark"
*Atmosphere:* "moody dark room lighting", "dark academia room empty", "ambient dark visualizer"
*Stock-style:* "light shaft dark background 4k", "dust floating in light loop", "volumetric lighting overlay loop"
*Fallback:* "slow smoke dark background", "dark water reflections wall"

**VIDEO 2 Searches (Dark Ocean/Horizon):**
*Broad:* "ocean horizon blue hour", "dark ocean waves static camera", "twilight sea horizon"
*Object/Element:* "calm sea at night", "dark water slow motion", "ocean horizon night no moon"
*Atmosphere:* "peaceful dark ocean background", "melancholy sea horizon", "vast dark ocean"
*Stock-style:* "ocean horizon loop 4k", "dark sea twilight loop", "calm water surface night loop"
*Fallback:* "foggy lake horizon dark", "dark clouds slow moving horizon"

---

## PART 10 — SEARCH STRATEGY BY PRIORITY

**For Video 1:**
1. **First Search:** "dust motes in light beam dark background loop" (The Holy Grail)
2. **Second Search:** "volumetric window light dark room" (Requires cropping out the window)
3. **Third Search:** "slow smoke/fog black background" (We grade it to look like a room)

**For Video 2:**
1. **First Search:** "ocean horizon blue hour static camera 4k"
2. **Second Search:** "dark sea calm waves night loop"
3. **Third Search:** "twilight sky over water seamless"

---

## PART 11 — FALLBACK HIERARCHY

If perfect footage cannot be found:
- **Level 1 (Target):** Perfect single video, locked off.
- **Level 2 (Likely):** Good footage, but we must slow it down 50% and heavily vignette the edges to hide imperfections.
- **Level 3 (Acceptable):** A high-res static image of a dark room (Midjourney/Unsplash) with a CSS/Canvas particle system layered on top for dust.
- **Level 4 (Last Resort):** Pure CSS gradients and noise. (We avoid this; it loses the cinematic soul).

---

## PART 12 — VIDEO LENGTH

- **VIDEO 1:** 20 to 30 seconds. (Slowed down to 40-60 seconds via playback rate or editing).
- **VIDEO 2:** 15 to 20 seconds. (Ocean waves loop very easily).
*Reasoning:* Anything longer than 30s original time creates file sizes too large for instant loading. Anything shorter than 10s creates a recognizable, annoying loop pattern.

---

## PART 13 — AUTOPLAY VS SCROLL SCRUBBING

**DECISION: OPTION A (Continuous Autoplay) is vastly superior.**
Do NOT tie video playback progress to the scroll bar.
*Why?* Scrubbing a high-definition video via scroll requires massive memory, constant keyframe decoding, and looks incredibly janky on 80% of devices. Furthermore, stopping the scroll stops time, which breaks the illusion of a living sanctuary. 
*The Hybrid Magic:* The videos **play continuously** at normal speed. What is tied to the scroll is the **opacity, CSS blur, and parallax Y-translation** of the video container. This guarantees buttery 60fps performance while keeping the experience deeply interactive.

---

## PART 14 — MOBILE VIDEO STRATEGY

- **Cropping:** CSS `object-fit: cover` with `object-position: right center` for Video 1 (to keep the light beam on the right edge).
- **Resolution:** We must serve a separate 720p vertical crop (`<source media="(max-width: 768px)">`) to save bandwidth.
- **Fallback:** If mobile is in low-power mode, the video gracefully falls back to a high-quality poster image.

---

## PART 15 — PERFORMANCE REQUIREMENTS

- **Resolution:** 1920x1080 (Desktop), 720x1280 (Mobile). 
- **Codec:** WebM (VP9) with MP4 (H.264/H.265) fallback.
- **File Size:** Absolute maximum 4MB per video. Target 2MB.
- **Loading:** Video 1 is preloaded (`preload="auto"`). Video 2 is lazy-loaded via Intersection Observer only when the user scrolls past 30%.
- **Audio:** Stripped completely to save size.

---

## PART 16 — COPYRIGHT / LICENSE

- **Development:** YouTube downloads are fine for local prototyping.
- **Production:** Downloading from YouTube without explicit permission is illegal for commercial use. We must source from Pexels, Unsplash Video, Artgrid, or purchase a license from Shutterstock/Pond5. If using Pexels (CC0 equivalent), we are safe for commercial use without attribution.

---

## PART 17 & 18 — THE FINAL BLUEPRINT & THE PERFECT PAIR

### VIDEO 1: THE SANCTUARY
* **Description:** A locked-off shot of deep charcoal darkness. On the far right, a soft, volumetric shaft of light falls diagonally. Tiny, out-of-focus dust motes drift upward at agonizingly slow speeds. 
* **Specs:** 30s crossfade loop, WebM, 1080p, graded to deep indigo-charcoal.
* **Why it works:** It feels like the corner of a grand archive. It is 80% negative space, providing the perfect canvas for UI.

### VIDEO 2: THE HORIZON
* **Description:** A locked-off shot of a dark ocean horizon at blue hour. The sky is dark charcoal/blue. The water is barely visible, rolling in slow motion. 
* **Specs:** 20s loop, WebM, 1080p, same black-point as Video 1.
* **Why it works:** It represents vastness and permanence.

### THE PAIR CONTRAST
Video 1 is **interior, contained, warm (light beam), and intimate**.
Video 2 is **exterior, expansive, cool, and infinite**.
Moving from Video 1 to Video 2 is the psychological equivalent of stepping out of a dark, cozy study onto a balcony overlooking the sea. It releases the user's emotional tension right before they click "Begin Your Archive."

---

## PART 19 — THE FINAL DECISION

**Video 1:** Deep shadow architectural interior with a single light shaft and slow dust motes.
**Video 2:** Locked-off dark ocean horizon at twilight.
**Why this pair:** They provide maximum cinematic atmosphere with maximum negative space. They transition perfectly because both rely on deep charcoal shadows. They take the user from a feeling of intimate curation (the room) to permanent security (the vast horizon).
**Best YouTube/Stock Search:** "dust floating in light beam dark loop", followed by "dark ocean horizon blue hour static".
**Ideal Duration:** 30s (Vid 1), 20s (Vid 2).
**Transition:** Scroll-linked crossfade from 70% to 80% scroll depth.
**Editing Treatment:** Slowed down 50%, desaturated, shadows crushed to pure charcoal, subtle CSS blur applied in browser.
**Biggest Mistake to Avoid:** Choosing footage with too much detail, visible people, or camera movement that distracts from the typography.

*End of Dossier.*

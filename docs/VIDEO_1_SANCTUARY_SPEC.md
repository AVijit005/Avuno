# AVUNO — VIDEO 1 "THE SANCTUARY" MASTER SPECIFICATION

## 1. FIRST PRINCIPLE
The emotional job of Video 1 is to create **intimacy**. 
When a user lands on Avuno, they are stepping out of the noisy, algorithmic internet and into a private vault. The dominant emotion must be **safety**. Secondary emotions are solitude, reflection, and depth. It must feel like a space where time slows down, allowing the user to focus entirely on their own memories (the foreground UI).

## 2. DEFINE THE IDEAL ENVIRONMENT
**Winner: F. Dark architectural interior.**
* Avuno relevance: 10/10
* Emotional depth: 9/10
* Cinematic quality: 10/10
* Foreground compatibility: 10/10 (Provides pure black negative space)
* Text readability: 10/10
* Loopability: 10/10
* Stock footage availability: 8/10
* Mobile crop safety: 9/10
* Risk of generic/AI: 2/10

*Why not a Vintage Library or Projector Room?* A literal library feels like a Goodreads clone. A projector room is too literal and makes finding stock footage nearly impossible without looking staged or AI-generated. A dark, undefined architectural space with a single light source implies memory (like a museum or gallery) without forcing a specific aesthetic on the user.

## 3. EXACT SCENE DESCRIPTION
* **Location:** An undefined, massive architectural space. It feels like the corner of a modern art museum or an empty, concrete vault at night.
* **Architecture:** Smooth, dark walls (likely concrete or dark plaster). No visible windows, no furniture, no shelves. Pure minimalism.
* **Time of day:** Undefined timeless night.
* **Weather:** None. Completely isolated from the outside world.
* **Objects:** NOTHING. Pure empty space.

## 4. LIGHTING DESIGN
* **Key light:** A single, soft volumetric shaft of light cutting diagonally from off-screen top-right, hitting the floor off-screen bottom-right.
* **Fill light:** None. 
* **Practical light:** None.
* **Color temperature:** 4000K (Neutral/Moonlight) to 2700K (Warm Amber). We will tint it slightly indigo/charcoal via CSS later, so the source should be fairly neutral-to-warm.
* **Shadow density:** 100% crushed blacks in the shadows. Pure `#050505`.
* **Highlight behavior:** Extremely soft, diffused, atmospheric. No harsh lines.

## 5. COLOR PALETTE
**Dominant: Charcoal & Indigo.**
The raw footage should be neutral or warm-cool contrast, but our final grade will desaturate and push the shadows to deep charcoal/indigo. The light shaft itself should retain a very faint ivory/amber warmth to prevent the scene from feeling like a horror movie. 

## 6. CAMERA & LENS
* **Camera position:** Eye-level or slightly low.
* **Lens feel:** 50mm or 85mm. We want compression. Wide-angle lenses (24mm) create too much perspective distortion, which fights against our flat, 2D typographic foreground.
* **Depth of field:** Slightly soft overall. Nothing should be tack-sharp, as sharpness draws the eye away from text.
* **Focus:** Static. No rack focusing.

## 7. CAMERA MOVEMENT
**Winner: A. Completely locked-off camera.**
Because this video sits behind 800vh of scrolling content, any camera movement (pan, tilt, dolly) will clash with the vertical translation of the user's scroll, causing motion sickness and breaking the illusion of a solid background canvas.

## 8. COMPOSITION FOR WEBSITE UI
* **Hero headline safe zone:** Center and Left.
* **Supporting copy safe zone:** Center and Left.
* **Product UI safe zone:** Center.
* **Conclusion:** The light shaft MUST be isolated on the far **right** edge of the frame (or far left, but right is better for left-aligned text). The remaining 70% of the screen must be pure, undisturbed darkness.

## 9. NEGATIVE SPACE
70% to 80% of the frame must be pure negative space (shadow). When no foreground element is present, the eye should naturally rest on the slow movement of the light beam on the far edge, finding peace in the emptiness.

## 10. MOVING ELEMENTS
* **REQUIRED:** Dust motes suspended in the light beam.
* **OPTIONAL:** Extremely subtle, slow shifting of the light beam's angle (like a passing cloud outside an unseen window).
* **AVOID:** Rain, curtains, people, flickering lamps, recognizable objects.

## 11. DUST / PARTICLES
Dust is essential. It provides the only proof that the video is playing.
* **Amount:** Sparse. 
* **Speed:** Glacial. Almost suspended in anti-gravity.
* **Realism:** Must be real optical dust captured in camera, not After Effects trapcode particles. No glowing or "magical" fireflies.

## 12. PROJECTOR QUESTION
**The projector is a distraction.** 
Searching for a vintage projector introduces too much mechanical detail, limits our stock footage options to 0.1%, and makes the brand feel like a retro-hipster app rather than a modern, premium archive. We rely on the *metaphor* of cinema (the volumetric light beam in a dark room), not the literal hardware.

## 13. PEOPLE
**No people. Full stop.**
Avuno is a private sanctuary for the user. Seeing a stranger in the background completely destroys the feeling of a private, empty vault.

## 14. LOOPABILITY
* **Ideal duration:** 30 seconds.
* **Loop type:** Crossfade loop (2-second opacity crossfade). Because the camera is locked off and the only moving elements are dust motes, a crossfade loop is 100% invisible to the human eye.

## 15. VIDEO SPEED
0.5x (Slow motion). Normal dust moves too fast and feels anxious. Slowing real footage down via optical flow creates a dream-like, heavy atmosphere.

## 16. FILM / IMAGE QUALITY
Real cinema camera (ARRI Alexa or RED), shot slightly underexposed to protect highlights. We want subtle 35mm film grain, extremely soft highlight rolloff, and zero digital sharpening. No fake HDR. 

## 17. BACKGROUND VS FOREGROUND (TREATMENT PROGRESSION)
* **0–15% (Hero):** Base opacity 100%. Deepest shadow crush to ensure Hero text pops perfectly.
* **15–50% (Cascade & Thread):** Opacity 100%. A subtle `backdrop-blur(2px)` is applied to the video container to push it further backward as the UI gets complex.
* **50–70% (Product UI):** Opacity 100%. Blur increases to `4px`.
* **70–85% (Transition):** Video 1 slowly drops opacity from 100% to 0%, revealing Video 2 (The Horizon) beneath it. 

## 18. REAL-WORLD FOOTAGE REQUIREMENTS & SEARCHABILITY
The footage must be real, unbranded, people-free, and locked-off. 
**Tier 1 — Perfect Search:**
1. "dust motes light beam dark room"
2. "volumetric light dark background loop"
3. "dust particles shaft of light black"

**Tier 2 — Close Match (Requires grading/cropping):**
1. "sunbeam through window dark interior"
2. "empty dark warehouse light ray"
3. "cinematic atmospheric dust room"

**Tier 3 — Component Search (If we must build it):**
1. "black background dust slow motion" (We layer this over a static dark gradient).

## 19. VIDEO SOURCE PRIORITY & LICENSING
1. **Pexels / Pixabay:** (CC0 / Free for Commercial Use without attribution). Best for legal safety.
2. **Paid Stock (Artgrid, Pond5):** If Pexels fails, buying a $50 royalty-free clip is the only way to guarantee billion-dollar quality with zero legal risk.
3. **YouTube:** strictly **DO NOT USE** for production. YouTube downloads do not grant commercial licenses, even if marked "creative commons" by a random uploader (they often steal footage themselves).

## 20. MOBILE STRATEGY
The desktop 16:9 video will be cropped using CSS `object-fit: cover; object-position: right center;`. This keeps the light shaft visible on the right edge of the phone screen, leaving the left 70% of the screen pure dark for text and UI. 

## 21. PERFORMANCE
* **Resolution:** 1080p (Downscaled via CSS, provides perfect sharpness without 4K file sizes).
* **Codec:** WebM (VP9) / MP4 (H.265).
* **Duration:** 30 seconds.
* **Bitrate:** VBR, target max 3MB total file size. Crushed blacks compress incredibly well, so a dark video with only a tiny light beam will easily hit <2MB at 1080p.

---

## FINAL DECISION & ACTION PLAN

* **What should I search for FIRST?** "dust motes light beam dark background loop" on Pexels/Pixabay.
* **What should I search for SECOND?** "volumetric light shaft empty room" on Paid Stock.
* **What should I search for THIRD?** "slow motion dust particles black background" (to use as an overlay).
* **Should I still search for a projector?** NO.
* **Should I search for a study/library instead?** NO.
* **Should rain be present?** NO.
* **Should dust be present?** YES, it is the only proof of life.
* **Should there be people?** NO.
* **Should the camera move?** NO. Locked off.
* **Should the footage be warm or cool?** Warm light source, charcoal/cool shadows.
* **What exact visual area should remain empty for text?** The center and the entire left side (0% to 75% of X-axis).
* **What makes the footage "Avuno"?** The absolute restraint. It doesn't scream for attention. It provides a massive, luxurious canvas of dark negative space that makes the foreground typography and memories feel infinitely valuable.

*End of Specification.*

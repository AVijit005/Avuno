# Video assets (staged, NOT yet wired into the app)

Source: [Mixkit](https://mixkit.co) — Free License (free for commercial & non-commercial
use, **no attribution required**). Downloaded 360p for web weight; 1080p available by
swapping `-360` → `-1080` in the same URL.

| File               | Mixkit clip | Slug / title                                     | Source page                                  |
| ------------------ | ----------- | ------------------------------------------------ | -------------------------------------------- |
| `hero-loop.mp4`    | 487         | black-and-white-ink-underwater                   | https://mixkit.co/free-stock-video/ink/      |
| `auth-loop.mp4`    | 1960        | white-smoke-with-black-background                | https://mixkit.co/free-stock-video/smoke/    |
| `feature-loop.mp4` | 44818       | abstract-video-of-a-liquid-with-dark-ink-flowing | https://mixkit.co/free-stock-video/abstract/ |

## Wiring (do later, per instruction — not active now)

- Render with `<video autoPlay muted loop playsInline poster="…">` behind existing
  aurora blobs at low opacity / blur.
- `useReducedMotion()` → show poster still instead of the clip.
- Recolor/tint to iris `#6d5fcc` and trim/optimize when `ffmpeg` is available
  (currently absent on this machine).

## Why CC0 stock instead of bfl.ai FLUX 3

bfl.ai FLUX 3 video API returned `402 Insufficient credits` — the "free until
Aug 17" promo is playground-only, not API. The API generation script is saved at
`/tmp/opencode/generate_videos.py` and can be re-run if API credits are added.

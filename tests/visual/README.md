# Visual regression — premium interactions

Pixel-level visual regression for `PosterCard` and `PremiumButton` to catch
shadow / radius / interaction drift that token-string snapshots can miss
(e.g. transition curve changes, shadow offset shifts, hover translate
distance, ring blur, active-state scale).

## How it works

1. `src/routes/visual.tsx` renders a deterministic harness at
   `http://localhost:8080/visual?ready=1` with stable `data-vr-id` markers
   and a self-contained SVG poster (no network).
2. `tests/visual/run.py` drives headless Chromium via Playwright, captures
   each fixture in three states (`default`, `hover`, `active`) with
   transitions allowed to fully settle (800 ms ≈ 2× `--dur-large`).
3. Each capture is diffed against `baselines/<name>.png`. Mean per-channel
   delta > **1.5/255** fails the run and writes an amplified visual diff to
   `diffs/` for inspection.

## Run it

The dev server must already be running on `:8080`.

```bash
python3 tests/visual/run.py              # check — exits non-zero on drift
python3 tests/visual/run.py --update     # rewrite baselines (intentional)
```

Or via the project script:

```bash
bun run test:visual
bun run test:visual:update
```

## When a baseline changes

- **You changed a token, shadow, radius, or transition on purpose**: re-run
  with `--update`, eyeball the new baseline images, commit them.
- **You didn't touch interaction styles**: open the failing diff in `diffs/`
  — it surfaces exactly which pixels moved. Most drift is a sibling
  component bleeding global styles into the premium primitives.

## What is _not_ covered

These tests are scoped to premium interaction primitives. Page-level layout,
typography, and unrelated component visuals are out of scope — the fast
token / className snapshots in `src/__tests__/premium-interactions.test.ts`
catch structural drift much earlier.

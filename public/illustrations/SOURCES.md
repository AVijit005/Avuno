# Illustrations (staged in `public/illustrations/`)

## Sources

### Storyset (Freepik)
Source: [Storyset](https://storyset.com) — **Free with attribution** (Creative Commons
BY 3.0). Characters, scenes, and illustrations for empty states, onboarding, errors.

| File                        | Category   | Style  |
| --------------------------- | ---------- | ------ |
| `storyset-empty-1.svg`      | Empty      | Amico  |
| `storyset-empty-2.svg`      | Empty      | Bro    |
| `storyset-empty-3.svg`      | Empty      | Rafiki |
| `storyset-empty-4.svg`      | Empty      | Pana   |
| `storyset-library-1.svg`    | Library    | Amico  |
| `storyset-no-data-1.svg`    | No data    | Bro    |
| `storyset-no-data-2.svg`    | No data    | Pana   |
| `storyset-no-data-3.svg`    | No data    | Rafiki |
| `storyset-hardware-1.svg`   | Hardware   | Pana   |
| `storyset-server-1.svg`     | Server     | Bro    |
| `storyset-startup-1.svg`    | Startup    | Pana   |
| `storyset-studying-1.svg`   | Studying   | Pana   |
| `storyset-timeline-1.svg`   | Timeline   | Pana   |
| `storyset-timeline-2.svg`   | Timeline   | Amico  |
| `storyset-search-1.svg`     | Search     | Bro    |
| `storyset-search-2.svg`     | Search     | Pana   |
| `storyset-welcome-1.svg`    | Welcome    | Pana   |
| `storyset-welcome-2.svg`    | Welcome    | Amico  |
| `storyset-onboarding-1.svg` | Onboarding | Pana   |
| `storyset-onboarding-2.svg` | Onboarding | Amico  |
| `storyset-404-1.svg`        | 404 error  | Pana   |
| `storyset-404-2.svg`        | 404 error  | Bro    |
| `storyset-error-1.svg`      | Error 429  | Rafiki |
| `storyset-error-2.svg`      | Error 429  | Pana   |
| `storyset-memory-1.svg`     | Memory     | Pana   |
| `storyset-memory-2.svg`     | Memory     | Bro    |

### FreeSVG.org
Source: [FreeSVG.org](https://freesvg.org) — **CC0 Public Domain** (no attribution
required). Diary and notebook illustrations.

| File                     | Description     |
| ------------------------ | --------------- |
| `freesvg-diary-1.svg`    | Diary clip art  |
| `freesvg-diary-2.svg`    | Diary clip art  |
| `freesvg-notebook-1.svg` | Notebook and pen |

## Attribution

For Storyset illustrations (CC BY 3.0), the following attribution is required:

> Illustrations by [Storyset](https://storyset.com)

This attribution should be included in the app's footer or credits page.

## Wiring

Illustrations are used via `src/components/ui/illustrations.tsx` which exports
React components that render `<img>` tags pointing to these SVG files. Each component
applies consistent styling: `select-none`, `pointer-events-none`, `object-contain`,
`w-40 h-40`, `opacity-80`, and a subtle iris drop-shadow.

## Recoloring

The SVGs use their own color palettes. To tint them to iris `#6d5fcc`, apply
CSS `filter` or `mix-blend-mode` on the `<img>` wrapper, or modify the SVGs
directly with find-replace of hex colors.

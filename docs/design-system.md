# Chronicle Design System

Single source of truth for the visual and motion language used everywhere in
the app. All values are already implemented in `src/styles.css`, `src/lib/motion.ts`,
and `src/lib/depth.ts` — this file is reference documentation.

## Surfaces / depth

Use `depth` constants from `src/lib/depth.ts`:

| Layer    | Use for                         |
| -------- | ------------------------------- |
| surface  | Page background, base canvas    |
| card     | Default content card (glass)    |
| floating | Pinned widgets, raised cards    |
| overlay  | Backdrops behind modals/drawers |
| modal    | Dialog content                  |
| drawer   | Side panels, sheets             |
| tooltip  | Hover tips                      |
| toast    | Sonner toasts                   |
| dropdown | Menus                           |
| menu     | Light command menus             |

## Glass

- `glass-subtle` — quiet card, low elevation
- `glass` — default
- `glass-strong` — modal/hero

Always wrap with `PremiumGlass` (`src/components/ui/PremiumGlass.tsx`) so the
living pointer reflection and proximity border come along for free.

## Motion

All motion presets in `src/lib/motion.ts`:

- Durations: `dur.micro` `dur.normal` `dur.large` `dur.page`
- Easings: `ease.out` `ease.in` `ease.reveal` `ease.page`
- Variants: `fadeBlurIn`, `fadeUp`, `scaleIn`, `stagger`, `cardHover`,
  `hoverLift`, `pressScale`, `tooltipIn`, `toastIn`, `modalIn`, `drawerSpring`,
  `pagePresence`

Reduced motion: always degrade via `useReducedMotion` from `src/lib/useReducedMotion.ts`.

## Typography

- Display: `font-display`, tracking-tight, line-height 1.05
- Body: default Inter stack
- Eyebrows: `text-[10px] uppercase tracking-[0.22em] text-muted-foreground`

## Spacing

- Section gap: `mt-12 md:mt-16` (handled by `Section`)
- Card padding: `p-5` (subtle) / `p-6` (default) / `p-8 md:p-10` (hero)
- Glass radius: `rounded-3xl` (cards), `rounded-2xl` (chips), `rounded-full` (pills)

## Empty / loading / error

Always reuse:

- Empty: `src/components/common/EmptyStates.tsx`
- Loading: `src/components/common/Skeletons.tsx`
- Error: `src/components/common/ErrorStates.tsx`

## Iconography

Lucide icons, stroke width 1.5–2, sized via Tailwind (`h-4 w-4` default, `h-5 w-5` for emphasis).
Always provide `aria-label` on icon-only buttons.

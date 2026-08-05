---
kind: frontend_style
name: Tailwind CSS + Shadcn Design System with OKLCH Tokens
category: frontend_style
scope:
    - '**'
source_files:
    - src/styles.css
    - components.json
    - src/lib/motion.ts
    - docs/design-system.md
    - vite.config.ts
    - package.json
---

The Chronicle frontend uses a cohesive, dark-first design system built on Tailwind CSS v4 (via `@tailwindcss/vite`), Radix UI primitives, and shadcn/ui components. Visual consistency is enforced through a single source of truth in `src/styles.css`, which defines all design tokens as CSS custom properties using the modern OKLCH color space.

**Core stack**: Tailwind CSS v4 with CSS-based configuration (no `tailwind.config.js`), shadcn/ui configured for the "new-york" style with CSS variables enabled, Radix UI for accessible primitives, Lucide icons, and motion via `motion/react` (Framer Motion successor). The build pipeline is Vite-powered with PWA support via `vite-plugin-pwa`.

**Token architecture**: All colors, radii, z-indexes, motion durations, easings, glass opacity levels, shadows, gradients, and typography are declared as CSS variables under `:root` (dark theme default) and `.light` override blocks. The `@theme inline` block maps these to Tailwind's semantic token names (`--color-background`, `--color-primary`, etc.), enabling direct use of `bg-background`, `text-primary`, `rounded-3xl`, etc. in component classNames. Color tokens include brand (electric blue primary, purple secondary), status (destructive rose, success emerald, warning amber), aurora palette, chart scales, and sidebar-specific variants.

**Glass & elevation system**: Three glass utility classes (`glass`, `glass-strong`, `glass-subtle`) provide consistent frosted-glass surfaces with backdrop blur and saturation. An elevation hierarchy (`elev-surface`, `elev-card`, `elev-floating`, `elev-dialog`, `elev-toast`) standardizes shadow depth across layers. A dedicated `PremiumGlass` wrapper component adds living pointer reflection and proximity borders.

**Motion system**: `src/lib/motion.ts` defines shared duration constants (`dur.micro/normal/large/page`), easing curves, and prebuilt animation variants (`fadeBlurIn`, `cardHover`, `pressScale`, `pagePresence`, etc.) that mirror the CSS motion tokens in `styles.css`. Reduced motion is respected via `prefers-reduced-motion` media queries and a `useReducedMotion` hook.

**Typography & spacing**: Inter sans-serif for body text, Instrument Serif for display headings. Consistent spacing follows documented patterns (section gaps, card padding tiers, radius scale from 8px to 40px). Safe-area utilities handle iOS notch and Android gesture navigation.

**Accessibility**: Unified focus-visible styling applies a soft, brand-colored glow ring globally to all focusable elements. Icons require `aria-label` on icon-only buttons. All components use Radix primitives for accessibility compliance.

**Component library**: shadcn/ui components are installed into `components/ui/` (configured via `components.json` with aliases `@/components/ui`, `@/lib/utils`, etc.). Custom premium components live alongside feature-specific component directories under `src/components/`.
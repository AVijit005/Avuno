# AVUNO DESIGN SYSTEM 2.0 (v3 Product-Led Elevation)

> Single source of truth for all visual, motion, and component decisions.

---

## 1. Brand & Voice

- **Avuno** — "Your life in media, beautifully archived."
- **Voice** = calm, editorial, truthful, second-person.
- **Truthful content**: no fake stats, testimonials, or vapor features. Pricing/claims only reflect real product.

## 2. Color System & Tokens

- **Accent**: One accent only (`var(--primary)` = `#6d5fcc`, iris).
- **Core Semantic Tokens**: `--primary`, `--primary-foreground`, `--background`, `--foreground`, `--muted`, `--muted-foreground`, `--border`, `--card`, `--accent`.
- **Dark/light parity**: use theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`), never hardcoded hex.

## 3. Typography System

- **Display**: `clamp(2.5rem, 6vw, 4.5rem)` Fraunces
- **H2**: `clamp(1.75rem, 3vw, 2.5rem)` Fraunces
- **Body**: `1rem/1.6` Geist
- **Eyebrow**: `text-[11px] uppercase tracking-[0.22em] text-primary/80`

## 4. Spacing Rhythm

- **Section padding**: `py-28 md:py-36`
- **Max-width**: `max-w-6xl` or `max-w-7xl`

## 5. Motion System

- **Stack**: Use `motion/react` only. NEVER use `react-bits` npm package.
- **Effects**: Fade/blur-in (`filter: blur(10px)→0`), hover `scale-[1.02]`.
- **Springs**: `stiffness: 400`, `damping: 32`.
- **Easing**: `[0.22, 1, 0.36, 1]`.
- **Reduced Motion**: EVERY animation wrapped in `useReducedMotion()` → static fallback.

## 6. Illustration Language

- **Source**: Recolorable CC0 (unDraw) inline SVGs.
- **Color**: Single iris-tinted accent (`#6d5fcc`).
- **Usage**: Rendered at `opacity-70` in empty states.

## 7. Accessibility

- `focus-visible` rings on all interactive elements.
- `44px` minimum tap targets.
- `aria-hidden` on decorative elements.
- `prefers-reduced-motion` respected globally.

# AVUNO DESIGN SYSTEM 2.0

**Phase 1 — Core Engineering Specification**

This document serves as the single source of truth for the Avuno 2.0 visual language. It is a strict technical specification. Do not deviate from these tokens without explicit architectural approval.

## 1. Color System (Strict OKLCH)

Avuno uses a semantic color architecture mapped to raw OKLCH values in `src/styles.css`.

### WHAT

A constrained set of color tokens.

- **Surface**: `--color-bg`, `--color-surface-1`, `--color-surface-2`, `--color-surface-3`
- **Text**: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-disabled`
- **Borders**: `--color-border-subtle`, `--color-border-default`, `--color-border-strong`
- **Accent**: `--color-accent` (Electric Blue), `--color-accent-soft`
- **Semantic**: `--color-success`, `--color-warning`, `--color-error`, `--color-info`

### WHEN TO USE

Use surface tokens for elevating content depth. Use text tokens to establish visual hierarchy without relying heavily on font weight.

### WHEN NOT TO USE

Do not hardcode raw OKLCH values in components.
Do not use `accent` for large background areas; reserve it for interactive elements, active states, and primary actions.

### PERFORMANCE NOTES

CSS variables are inherently fast, but avoid excessive calc() operations within color-mix if they are painted during continuous animations.

---

## 2. Typography System

### WHAT

Dual-typeface system defining the editorial voice of Avuno.

- **Display**: Instrument Serif (`var(--font-display)`)
- **System/Sans**: Inter (`var(--font-sans)`)

Tokens: `@utility text-h1`, `text-h2`, `text-h3`, `text-body`, `text-metadata`.

### WHEN TO USE

- **Instrument Serif**: For editorial display, emotional headings, major story moments, quotes, and selected hero moments.
- **Inter**: For navigation, buttons, metadata, body text, forms, analytics, and data.

### WHEN NOT TO USE

Do not use Instrument Serif for UI elements (buttons, inputs) or long-form readable body copy. It is strictly a display font.

### ACCESSIBILITY

Ensure body text remains at least 16px (`1rem`) for readability. Metadata can scale to `14px` (`0.875rem`) but must maintain a contrast ratio of at least 4.5:1 (which `--color-text-muted` achieves on `--color-bg`).

---

## 3. Glass System

### WHAT

A constrained, tiered blurring system for floating surfaces.

- **Glass Subtle**: 8px blur, 110% saturation (`@utility glass-subtle`)
- **Glass Standard**: 12px blur, 120% saturation (`@utility glass`)
- **Glass Strong**: 20px blur, 140% saturation (`@utility glass-strong`)

### WHEN TO USE

Use `glass-subtle` for sticky headers. Use `glass` (Standard) for contextual floating menus. Use `glass-strong` for modals/dialogs where background context needs to be heavily obscured.

### WHEN NOT TO USE

- **NEVER** use glass for primary page content (cards, main surfaces). Use standard surface colors instead.
- **NEVER** stack glass elements on top of each other.
- **NEVER** combine glass with continuous background animations (e.g. noise, particles, ken burns).

### PERFORMANCE NOTES

`backdrop-filter` is expensive. Keep the blur radius under 24px and use it sparingly. We explicitly banned SVG fractal noise (`feTurbulence`) to preserve mobile GPU performance.

---

## 4. Shadow & Elevation System

### WHAT

Elevation implies depth. We define 4 primary shadow tokens:

- `--shadow-sm`: Interactive subtle lift.
- `--shadow-md`: Dropdowns, tooltips.
- `--shadow-lg`: Cards on hover, floating action buttons.
- `--shadow-xl`: Modals, dialogs.

### WHEN TO USE

Shadows should establish logical Z-axis positioning. The further a surface is from the background layer, the larger the shadow.

### WHEN NOT TO USE

Do not apply shadows to inset elements. Avoid heavily saturated colored shadows unless specifically implementing an active brand glow (`--shadow-glow`).

---

## 5. Motion System

### WHAT

A restrained motion language for state changes and context transitions.

- **Durations**: `--duration-fast` (140ms), `--duration-normal` (240ms), `--duration-slow` (360ms), `--duration-page` (560ms)
- **Easings**: `--ease-standard`, `--ease-emphasized`, `--ease-decelerate`, `--ease-accelerate`

### WHEN TO USE

Use motion for hover states (`hover-lift`), state changes, focus reveals, and route transitions.

### WHEN NOT TO USE

No continuous ambient animations. No drifting particles or infinite Ken Burns effects on standard surfaces.

### ACCESSIBILITY (Reduced Motion)

All continuous animations must instantly resolve or completely halt if `prefers-reduced-motion: reduce` is detected. `styles.css` handles this natively for root animations.

---

## 6. Spacing & Radius System

### WHAT

Fixed proportional scales.

- **Spacing**: 4px base (`--space-1` = 0.25rem to `--space-24` = 6rem)
- **Radius**: `--radius-sm` (8px) to `--radius-4xl` (40px)

### WHEN TO USE

Use `space-4` (16px) or `space-6` (24px) for component padding.
Use `radius-xl` (20px) or `radius-2xl` (24px) for main content cards.

### WHEN NOT TO USE

Do not use arbitrary pixel values (e.g. `17px`, `43px`) in layouts.

---

## 7. Future Guidelines (Phase 1 Validation)

Any future components (Cards, Buttons, Inputs, Data Viz, Empty States) must be constructed purely out of these foundational tokens. If a component cannot be built with these tokens, the tokens should be debated and expanded structurally, not overridden with arbitrary CSS utilities.

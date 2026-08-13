# AVUNO DESIGN SYSTEM 2.0

> Single source of truth for all visual, motion, and component decisions.

---

## 1. Color System (Strict OKLCH)

Avuno uses a semantic color architecture mapped to raw OKLCH values in `src/styles.css`.

### Tokens

| Category | Token | Usage |
|---|---|---|
| Surfaces | `--color-bg`, `--color-surface-1`, `--color-surface-2` | Page layers |
| Text | `--color-text-primary`, `--color-text-secondary`, `--color-text-muted` | Hierarchy |
| Borders | `--color-border-subtle`, `--color-border-default` | Separation |
| Accent | `--color-accent` (Electric Blue), `--color-accent-soft` | CTAs, active states |
| Semantic | `--color-success`, `--color-warning`, `--color-error` | Feedback |

### Rules

- ✅ Always use CSS variables (`var(--primary)`, `var(--foreground)`)
- ✅ Use `oklch()` opacity syntax: `oklch(0.5 0 0 / 0.15)` for glass tints
- ❌ Never hardcode raw hex or RGB values in components
- ❌ Never use `accent` for large background areas

---

## 2. Typography System

Dual-typeface editorial system.

| Font | Token | Use For |
|---|---|---|
| Instrument Serif | `font-display` | Headings, hero moments, quotes |
| Inter | `font-sans` | Body, buttons, metadata, forms |

**Rules:**
- Instrument Serif is display-only. Never use it for buttons or inputs.
- Minimum body text: `16px`. Metadata may go to `14px` (min 4.5:1 contrast).

---

## 3. Glass Material System (Phase 24C)

Tiered backdrop-blur system for elevated surfaces.

| Class | Blur | Saturation | Use For |
|---|---|---|---|
| `glass-subtle` | 8px | 110% | Sticky headers, sidebars, secondary panels |
| `glass` | 12px | 120% | Floating menus, info cards, section containers |
| `glass-floating` | 20px | 140% | Modals, auth panels, command palette |

### Interaction Classes

- `card-interactive` — adds `hover:-translate-y-[2px]` + shadow lift on hover
- `hover:bg-foreground/[0.07]` — standard hover tint on glass surfaces

### Rules

- ✅ Use `glass-subtle` for containers, `glass-floating` for modals/auth
- ❌ Never stack two glass elements directly on top of each other
- ❌ Never use glass on primary content cards (media cards are grounded)
- ❌ Keep blur under 24px for GPU performance

---

## 4. Shadow & Elevation System

| Token | Use For |
|---|---|
| `--shadow-sm` | Subtle interactive lift |
| `--shadow-button` | Primary action buttons (resting) |
| `--shadow-button-hover` | Primary action buttons (hovered) |
| `--shadow-elevated` | Cards on hover |
| `--shadow-floating` | Modals, dialogs |

Shadows establish Z-axis depth. The further from background, the larger the shadow.

---

## 5. Motion System

| Token | Duration | Use For |
|---|---|---|
| `--duration-fast` | 140ms | Micro-interactions, hover states |
| `--duration-normal` | 240ms | State changes, reveals |
| `--duration-slow` | 360ms | Route transitions |

**Spring physics (Framer Motion defaults for components):**
```
stiffness: 400–500, damping: 28–35, mass: 0.6–0.8
```

**Rules:**
- ❌ No continuous ambient animations
- ✅ All animations must respect `prefers-reduced-motion`

---

## 6. Spacing & Radius

- **Spacing**: 4px base (`space-1` → `space-24`)
- **Radius**: `rounded-xl` (12px) for buttons/inputs · `rounded-2xl` (16px) for cards · `rounded-3xl`/`rounded-[2rem]` for large panels

---

## 7. Component Library

### PremiumButton (`src/components/ui/PremiumButton.tsx`)
Main CTA button. Variants: `primary`, `secondary`, `ghost`.
Props: `loading`, `success`, `icon`, `disabled`.

### LiquidSwitch (`src/components/ui/LiquidSwitch.tsx`)
Glass toggle switch. Uses `var(--primary)` for ON state, glass-grey for OFF.
Size: `36×21px` track, `15px` thumb. Spring-animated with Framer Motion.

```tsx
<LiquidSwitch checked={value} onChange={setValue} />
```

### EmptyState (`src/components/ui/EmptyState.tsx`)
Standard empty state with icon, title, description, and optional CTA.
Uses `card-interactive` + `glass-subtle` surface.

### ShimmerSkeleton (`src/components/ui/ShimmerSkeleton.tsx`)
Loading placeholder. Uses `bg-foreground/[0.05]` with shimmer animation.

---

## 8. Input Standard

All inputs must follow this pattern:

```
h-11 w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] px-4 text-sm
transition-[border-color,box-shadow,background-color] duration-[140ms]
hover:border-foreground/20 hover:bg-foreground/[0.05]
focus:border-ring/50 focus:ring-2 focus:ring-ring/30
```

---

## 9. Rules for New Components

Any new component must:
1. Use only tokens from this document — no arbitrary pixel values
2. Support both light and dark mode via CSS variables
3. Include `focus-visible` ring for keyboard accessibility
4. Respect `prefers-reduced-motion` for any animation

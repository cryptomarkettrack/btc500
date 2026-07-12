# BTC500 UI Guidelines

## Overview

This document defines the visual design system for the BTC500 application. It covers colors, typography, spacing, components, and interaction patterns to ensure consistency across all pages and features.

---

## Design System Foundation

### Technology Stack

- **CSS Framework**: Tailwind CSS v4 with `@theme inline` custom properties
- **Color Format**: All colors use `oklch()` format for perceptual uniformity
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Font**: Inter (system font stack fallback)

---

## Color Palette

### Primary Colors (Bitcoin Orange)

```css
--primary: oklch(0.72 0.19 55) /* #f97316 - Main brand color */ --primary-foreground: oklch(1 0 0)
  /* White text on primary */ --primary-soft: oklch(0.96 0.04 60)
  /* Light orange tint for backgrounds */;
```

**Usage**:

- Primary buttons and CTAs
- Active navigation states
- Brand accents and highlights
- Icon containers for "Waiting to Buy" phase

### Semantic Colors

#### Success (Green)

```css
--success: oklch(0.65 0.15 155) /* #16a34a - Positive values */ --success-soft: oklch(0.95 0.04 155)
  /* Light green tint */;
```

**Usage**:

- Profit indicators
- "Waiting to Sell" active state
- Positive ROI/returns

#### Info (Blue)

```css
--info: oklch(0.65 0.15 240) /* #2563eb - Informational elements */;
```

**Usage**:

- Informational badges
- Secondary highlights

#### Destructive (Red)

```css
--destructive: oklch(0.577 0.245 27.325) /* #dc2626 - Negative values */
  --destructive-foreground: oklch(0.984 0.003 247.858);
```

**Usage**:

- Loss indicators
- Negative ROI/returns
- Error states

### Neutral Colors

#### Background & Foreground

```css
--background: oklch(0.985 0.005 85) /* Near-white base */ --foreground: oklch(0.18 0.02 260)
  /* Near-black text */;
```

#### Card Backgrounds

```css
--card: oklch(0.995 0.003 85) /* Slightly lighter than background */
  --card-foreground: oklch(0.18 0.02 260) --popover: oklch(1 0 0)
  /* Pure white for modals/popovers */ --popover-foreground: oklch(0.18 0.02 260);
```

#### Muted Elements

```css
--muted: oklch(0.955 0.008 85) /* Subtle background tint */ --muted-foreground: oklch(0.5 0.02 260)
  /* Secondary text */;
```

#### Borders & Inputs

```css
--border: oklch(0.92 0.01 85) /* Light border color */ --input: oklch(0.92 0.01 85)
  /* Input field borders */ --ring: oklch(0.72 0.19 55) /* Focus ring (matches primary) */;
```

### Dark Mode Colors

All colors have dark mode variants defined in the `.dark` class:

```css
.dark {
  --background: oklch(0.15 0.015 260) /* Dark navy */ --foreground: oklch(0.97 0.005 85)
    /* Off-white text */ --card: oklch(0.19 0.018 260) /* Slightly lighter than bg */
    --primary: oklch(0.75 0.19 55) /* Brighter orange for dark mode */
    --primary-soft: oklch(0.28 0.08 55) /* Dark orange tint */ --border: oklch(1 0 0 / 10%)
    /* 10% white opacity */ --muted: oklch(0.24 0.02 260) /* Dark muted bg */
    --muted-foreground: oklch(0.7 0.02 260) /* Light muted text */;
}
```

### Chart Colors

```css
--chart-1: oklch(0.646 0.222 41.116) /* Orange */ --chart-2: oklch(0.6 0.118 184.704) /* Teal */
  --chart-3: oklch(0.398 0.07 227.392) /* Blue */ --chart-4: oklch(0.828 0.189 84.429) /* Yellow */
  --chart-5: oklch(0.769 0.188 70.08) /* Gold */;
```

---

## Typography

### Font Family

```css
font-family:
  "Inter",
  system-ui,
  -apple-system,
  sans-serif;
```

### Type Scale

#### Headings

- **Hero Title**: `text-5xl sm:text-6xl` (48px / 60px)
  - Weight: `font-bold` (700)
  - Tracking: `tracking-tight`
  - Line height: `leading-[0.9]` for ultra-tight display

- **Section Title**: `text-4xl sm:text-5xl` (36px / 48px)
  - Weight: `font-bold` (700)
  - Tracking: `tracking-tight`

- **Card Title**: `text-2xl` (24px)
  - Weight: `font-bold` (700)
  - Tracking: `tracking-tight`

- **Subsection Title**: `text-lg` (18px)
  - Weight: `font-semibold` (600)

#### Body Text

- **Large Body**: `text-base sm:text-lg` (16px / 18px)
  - Weight: `text-base` (400)
  - Color: `text-muted-foreground` for descriptions

- **Body**: `text-sm` (14px)
  - Weight: `font-medium` (500) for labels
  - Weight: Default (400) for content

- **Small**: `text-xs` (12px)
  - Weight: `font-medium` or `font-semibold`
  - Used for metadata and captions

#### Display Numbers (Countdown)

- **Massive Countdown**: `text-[8rem] sm:text-[10rem]` (128px / 160px)
  - Weight: `font-bold` (700)
  - Tracking: `tracking-tighter`
  - Line height: `leading-[0.9]`
  - Color: `var(--primary)` or semantic color

- **Large Numbers**: `text-4xl sm:text-5xl` (36px / 48px)
  - Weight: `font-bold` (700)
  - Tracking: `tracking-tight`

- **Stat Values**: `text-2xl` (24px) or `text-lg` (18px)
  - Weight: `font-bold` (700)
  - Used in stat cards

### Text Styles

#### Labels & Metadata

```css
/* Section labels */
text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground

/* Stat labels */
text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground

/* Badge text */
text-xs font-semibold uppercase tracking-widest
```

#### Emphasis

- **Bold emphasis**: `font-bold` or `font-semibold` with `text-foreground`
- **Muted text**: `text-muted-foreground`
- **Subtle text**: `text-muted-foreground/70` or `text-muted-foreground/40`

---

## Spacing & Layout

### Container

```css
/* Main container */
max-w-6xl mx-auto px-6 pb-24 pt-10 sm:pt-16

/* Card padding */
p-8 sm:p-12  /* Large hero cards */
p-6 sm:px-8  /* Medium cards */
p-6          /* Standard cards */
```

### Grid Systems

#### Two Column Layout

```css
grid grid-cols-2 gap-6  /* Mobile: 2 columns */
md:grid-cols-2          /* Tablet: 2 columns */
```

#### Three Column Layout

```css
grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3  /* Stats grid */
```

#### Hero Split Layout

```css
grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14  /* Asymmetric split */
```

### Gaps

- **Section spacing**: `gap-6` to `gap-8`
- **Card spacing**: `gap-4` to `gap-6`
- **Element spacing**: `gap-2` to `gap-3`
- **Tight spacing**: `gap-1.5` to `gap-2`

---

## Border Radius

### Radius Scale

```css
--radius: 1.25rem /* Base radius = 20px */ --radius-sm: calc(var(--radius) - 4px) /* 16px */
  --radius-md: calc(var(--radius) - 2px) /* 18px */ --radius-lg: var(--radius) /* 20px */
  --radius-xl: calc(var(--radius) + 4px) /* 24px */ --radius-2xl: calc(var(--radius) + 8px)
  /* 28px */ --radius-3xl: calc(var(--radius) + 12px) /* 32px */
  --radius-4xl: calc(var(--radius) + 16px) /* 36px */;
```

### Usage Patterns

- **Buttons**: `rounded-full` (pill shape) or `rounded-2xl` (24px)
- **Cards**: `rounded-[24px]` to `rounded-[32px]`
- **Inputs**: `rounded-2xl` (24px)
- **Badges**: `rounded-full`
- **Icons**: `rounded-full`
- **Progress bars**: `rounded-full`

---

## Shadows

### Card Shadows

```css
/* Hero cards with subtle depth */
shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)]

/* Standard cards */
shadow-sm

/* Elevated elements */
shadow-md
```

### Shadow Usage

- **Primary hero cards**: Complex shadow with 2 layers
- **Secondary cards**: `shadow-sm`
- **Buttons (primary)**: `shadow-sm`
- **No shadow**: Default for flat design

---

## Components

### Cards

#### Hero Card (Primary)

```tsx
className="relative overflow-hidden rounded-[32px] border border-border/60
           bg-card p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)]
           sm:p-12"
```

**Features**:

- Large border radius (32px)
- Subtle border with 60% opacity
- Complex shadow for depth
- Watermark support (absolute positioned, low opacity)
- Responsive padding

#### Standard Card

```tsx
className = "rounded-[24px] border border-border/60 bg-card p-6";
```

#### Stat Card

```tsx
className = "rounded-2xl bg-muted/60 px-4 py-3";
```

### Buttons

#### Primary Button

```tsx
className="inline-flex items-center gap-2 rounded-full bg-primary
           px-5 py-2.5 text-sm font-semibold text-primary-foreground
           shadow-sm transition-all hover:bg-primary/90 active:scale-95"
```

**States**:

- Default: `bg-primary`
- Hover: `hover:bg-primary/90`
- Active: `active:scale-95` (subtle press effect)

#### Secondary Button

```tsx
className="inline-flex items-center gap-2 rounded-full border
           border-border/60 px-5 py-2.5 text-sm font-semibold
           transition-all active:scale-95"
```

**States**:

- Default: `border-border/60 text-muted-foreground`
- Hover: `hover:border-primary/40 hover:text-foreground`
- Active: `active:scale-95`

#### Icon Button

```tsx
className="inline-flex items-center justify-center rounded-full
           p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
```

### Navigation Links

```tsx
className="inline-flex items-center gap-2 rounded-full px-4 py-2
           text-sm font-medium transition-all"

/* Active state */
className="... bg-primary text-primary-foreground shadow-sm"

/* Inactive state */
className="... text-muted-foreground hover:bg-muted hover:text-foreground"
```

### Inputs

```tsx
className="h-14 rounded-2xl border-border/60 bg-card pl-10
           text-2xl font-bold tracking-tight"
```

**Features**:

- Large touch target (56px height)
- Rounded corners (24px)
- Icon prefix support with absolute positioning
- Bold text for emphasis

### Badges

```tsx
/* Success badge */
className="rounded-full bg-success-soft px-3 py-1
           text-xs font-semibold text-success"

/* Status badge */
className="rounded-full bg-muted px-3 py-1
           text-xs font-semibold uppercase tracking-widest
           text-muted-foreground"
```

### Progress Bars

```tsx
/* Container */
className="h-2 w-full overflow-hidden rounded-full bg-muted"

/* Fill */
className="h-full rounded-full"
style={{ background: "var(--primary)" }}
```

### Icon Containers

```tsx
<span
  className="inline-flex h-11 w-11 items-center justify-center 
                 rounded-full"
  style={{ background: "var(--primary-soft)" }}
>
  <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
</span>
```

---

## Animations

### Framer Motion Patterns

#### Entrance Animation

```tsx
initial={{ y: 12, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
```

**Easing**: Custom cubic-bezier `[0.16, 1, 0.3, 1]` (smooth deceleration)

#### Staggered Children

```tsx
transition={{ duration: 0.5, delay: 0.1 * index }}
```

#### Number Animation

```tsx
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

### CSS Transitions

```css
/* Hover transitions */
transition-all duration-200

/* Active states */
active:scale-95

/* Opacity transitions */
transition-opacity hover:opacity-80
```

---

## Responsive Design

### Breakpoints

- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (640px+)
- **Desktop**: `md:` (768px+)

### Responsive Patterns

#### Typography

```tsx
text-5xl sm:text-6xl          /* Scale up on larger screens */
text-base sm:text-lg          /* Slightly larger on tablet+ */
text-[8rem] sm:text-[10rem]   /* Massive countdown numbers */
```

#### Layout

```tsx
/* Stack on mobile, side-by-side on desktop */
className = "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between";

/* Grid adjustments */
className = "grid grid-cols-2 md:grid-cols-[1.2fr_1fr]";

/* Hide/show by breakpoint */
className = "hidden md:flex"; /* Desktop only */
className = "md:hidden"; /* Mobile only */
```

#### Spacing

```tsx
p-8 sm:p-12                   /* More padding on larger screens */
pt-10 sm:pt-16                /* Larger top padding on desktop */
```

---

## Special Effects

### Backdrop Blur

```tsx
/* Sticky navigation */
className="sticky top-0 z-50 w-full border-b border-border/60
           bg-background/80 backdrop-blur-xl"

/* Mobile menu */
className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl"
```

**Usage**:

- Navigation bars
- Overlays and modals
- Floating elements

### Watermarks

```tsx
<div className="pointer-events-none absolute -right-16 -bottom-16 opacity-[0.06]">
  <BtcLogo size={420} />
</div>
```

**Pattern**:

- Absolute positioning
- `pointer-events-none` to avoid interaction
- Very low opacity (6%)
- Large size for subtle texture

---

## Share Card Design System

### Fixed Dimensions

```css
width: 1080px
height: 1350px
```

### Colors (Static for Image Generation)

```css
/* Primary (Buy phase) */
accent: #f97316
accentSoft: #fef3e7
accentBg: #fff7ed

/* Success (Sell phase) */
accent: #16a34a
accentSoft: #e6f7ed
accentBg: #f0fdf4

/* Complete */
accent: #2563eb
accentSoft: #f1f5f9
accentBg: #eff6ff
```

### Typography (Share Card)

```css
fontFamily: 'Inter', system-ui, sans-serif

/* Header */
fontSize: 30, fontWeight: 800, letterSpacing: -0.03em

/* Countdown */
fontSize: 280, fontWeight: 800, lineHeight: 0.8, letterSpacing: -0.07em

/* Labels */
fontSize: 12, fontWeight: 700, textTransform: uppercase, letterSpacing: 0.18em

/* Body */
fontSize: 16-24, fontWeight: 600-700
```

### Layout

```css
/* Left accent stripe */
width: 16px, position: absolute, left: 0, top: 0, bottom: 0

/* Padding */
padding: 44px 48px 0 (top section)
padding: 32px 48px 36px (bottom section)

/* Grid */
gridTemplateColumns: 1fr 1fr 1fr (bottom stats)
```

---

## Component Patterns

### Icon + Text Pattern

```tsx
<div className="flex items-center gap-3">
  <span
    className="inline-flex h-11 w-11 items-center justify-center 
                   rounded-full"
    style={{ background: "var(--primary-soft)" }}
  >
    <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
  </span>
  <div>
    <div
      className="text-xs font-semibold uppercase tracking-[0.18em] 
                    text-muted-foreground"
    >
      Label
    </div>
    <div className="text-lg font-semibold">Value</div>
  </div>
</div>
```

### Stat Card Pattern

```tsx
<div className="rounded-2xl bg-muted/60 px-4 py-3">
  <div
    className="text-[10px] font-semibold uppercase tracking-[0.18em] 
                  text-muted-foreground"
  >
    {label}
  </div>
  <div className="mt-1 text-sm font-semibold">{value}</div>
</div>
```

### Section Header Pattern

```tsx
<div className="mb-6 flex items-center gap-3">
  <Icon className="h-5 w-5" />
  <div>
    <div
      className="text-xs font-semibold uppercase tracking-[0.18em] 
                    text-muted-foreground"
    >
      Section Label
    </div>
    <div className="text-lg font-semibold">Section Title</div>
  </div>
</div>
```

---

## Loading States

### Skeleton Patterns

```tsx
/* Circle skeleton */
<Skeleton className="h-14 w-14 rounded-full" />

/* Rectangle skeleton */
<Skeleton className="h-10 w-48 rounded-lg" />

/* Text skeleton */
<Skeleton className="h-4 w-28 rounded-md" />

/* Card skeleton */
<Skeleton className="h-48 rounded-[24px]" />
```

### Skeleton Usage

- Match the shape of the content being loaded
- Use same border-radius as final component
- Neutral color (inherits muted background)

---

## Accessibility

### Focus States

- Focus ring: `ring-2 ring-ring ring-offset-2`
- Ring color matches `--ring` (primary color)
- Offset uses background color

### Color Contrast

- All text meets WCAG AA standards
- Primary text: `oklch(0.18 0.02 260)` on light background
- Muted text: `oklch(0.5 0.02 260)` for secondary content
- Dark mode: Inverted contrast ratios

### Interactive Elements

- Minimum touch target: 44x44px
- Icon buttons: `p-2` (48x48px with icon)
- Clear hover states on all interactive elements
- Active states with `active:scale-95` for feedback

---

## Best Practices

### Do's ✅

- Use semantic color tokens (`--primary`, `--success`, etc.)
- Maintain consistent border radius across similar components
- Apply `tracking-tight` to headings, `tracking-[0.18em]` to labels
- Use `oklch()` format for all custom colors
- Leverage Tailwind's opacity modifiers (`/60`, `/80`, `/95`)
- Add backdrop blur to sticky navigation
- Include hover states on all interactive elements
- Use Framer Motion for entrance animations

### Don'ts ❌

- Don't hardcode hex colors in components (use CSS variables)
- Don't mix border radius values arbitrarily
- Don't use pure black (`#000`) or pure white (`#fff`) - use oklch
- Don't forget dark mode variants
- Don't skip responsive adjustments
- Don't use excessive shadows (max 2 layers)
- Don't forget `pointer-events-none` on decorative elements
- Don't hardcode colors in share cards (use static values for image generation)

---

## Quick Reference

### Common Class Combinations

#### Page Container

```tsx
<div className="min-h-screen bg-background text-foreground">
  <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
```

#### Card with Animation

```tsx
<motion.div
  initial={{ y: 12, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  className="rounded-[32px] border border-border/60 bg-card p-8 shadow-[...]"
>
```

#### Section Label

```tsx
<div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
```

#### Large Number Display

```tsx
<div className="text-[8rem] font-bold leading-[0.9] tracking-tighter sm:text-[10rem]">{value}</div>
```

#### Icon Button

```tsx
<button
  className="inline-flex items-center justify-center rounded-full 
                   p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
>
  <Icon className="h-5 w-5" />
</button>
```

---

## File References

- **Design System**: `src/styles.css`
- **Components**: `src/components/`
- **Pages**: `src/routes/`
- **Icons**: Lucide React (https://lucide.dev)

---

## Version History

- **v1.0** (2026-07-12): Initial UI guidelines based on BTC500 implementation
  - Primary orange color scheme
  - Inter font family
  - Tailwind CSS v4 with oklch colors
  - Framer Motion animations
  - Dark mode support

---

_Last updated: July 12, 2026_

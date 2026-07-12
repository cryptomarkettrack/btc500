# BTC500 Style Guide

## Quick Reference for AI Assistants

This is the visual style guide for BTC500. When creating or modifying components, follow these guidelines.

---

## Overall Vibe

- **Clean and modern** with generous spacing
- **Professional but approachable** - financial data presented clearly
- **Bitcoin-themed** with orange as the primary accent
- **Smooth animations** that feel premium, not flashy
- **Mobile-first** responsive design

---

## Colors

### Primary Palette

- **Orange** (#f97316) - Main brand color, buttons, active states
- **Green** (#16a34a) - Success, profit, "sell" phase
- **Red** (#dc2626) - Loss, negative values
- **Blue** (#2563eb) - Information, complete states

### Neutrals

- **Background**: Very light gray/off-white
- **Cards**: White or slightly lighter than background
- **Text**: Dark gray (not pure black)
- **Muted text**: Medium gray for secondary information
- **Borders**: Light gray, subtle

### Dark Mode

- Dark navy background
- Off-white text
- Brighter orange for primary elements
- Reduced contrast borders (10-15% white opacity)

---

## Typography

### Font

- **Inter** - Clean, modern sans-serif
- System fallback: system-ui, -apple-system, sans-serif

### Hierarchy

- **Hero titles**: Very large (48-60px), bold, tight spacing
- **Section titles**: Large (36-48px), bold
- **Card titles**: Medium (24px), bold
- **Body text**: 16-18px, regular weight
- **Labels**: Small (12px), uppercase, wide spacing
- **Stats**: Large and bold (18-24px)

### Special Text

- **Countdown numbers**: Massive (128-160px), bold, tight tracking
- **Uppercase labels**: Always with increased letter spacing (0.18em)
- **Muted text**: Use for descriptions and secondary info

---

## Shapes & Spacing

### Rounded Corners

- **Buttons**: Pill shape (fully rounded) or 24px
- **Cards**: 24-32px radius
- **Inputs**: 24px radius
- **Badges**: Fully rounded (pill)
- **Progress bars**: Fully rounded

### Spacing

- **Page padding**: 24px mobile, 24-40px desktop
- **Card padding**: 32-48px
- **Section gaps**: 24-32px
- **Element gaps**: 8-16px
- **Tight gaps**: 4-8px

### Container

- **Max width**: 1152px (6xl)
- **Centered** with auto margins

---

## Components

### Cards

- White/light background
- Subtle border (60% opacity)
- Soft shadow for depth
- Large border radius (24-32px)
- Generous internal padding

### Buttons

- **Primary**: Orange background, white text, pill shape, subtle shadow
- **Secondary**: Transparent with border, hover effects
- **Icon buttons**: Circular, 48px touch target
- **States**: Hover (darker), Active (slight scale down)

### Inputs

- Large and prominent (56px height)
- Rounded corners (24px)
- Bold text for entered values
- Icon support with absolute positioning

### Badges

- Pill-shaped
- Colored backgrounds (soft tints)
- Small, uppercase, bold text

### Progress Bars

- Thin (8px height)
- Fully rounded
- Filled with primary or semantic color
- Subtle background track

---

## Icons

- **Lucide React** icon library
- Consistent sizing: 16-24px for UI, 32-56px for logos
- **Icon containers**: Circular backgrounds (48px) with soft tint
- **Color**: Match the semantic meaning (orange for buy, green for sell)

---

## Animations

### Philosophy

- **Smooth and subtle** - nothing jarring
- **Purposeful** - enhance UX, not distract
- **Fast** - 300-600ms duration

### Patterns

- **Entrance**: Fade up (12px) with smooth easing
- **Numbers**: Count up/down animations
- **Hover**: Color transitions, subtle scale
- **Active**: Slight scale down (95%) for feedback

### Easing

- Custom cubic-bezier: [0.16, 1, 0.3, 1] (smooth deceleration)

---

## Visual Effects

### Shadows

- **Minimal** - subtle and soft
- **Hero cards**: Two-layer shadow for depth
- **Buttons**: Very subtle shadow
- **Avoid**: Harsh or dark shadows

### Backdrop Blur

- Use on sticky navigation (xl blur)
- Creates modern glass-morphism effect
- Combine with semi-transparent backgrounds (80-95% opacity)

### Watermarks

- Large, very low opacity (6%)
- Absolute positioning
- Decorative only (pointer-events: none)

---

## Responsive Behavior

### Breakpoints

- **Mobile**: Default (< 640px)
- **Tablet**: 640px+
- **Desktop**: 768px+

### Patterns

- **Stack vertically** on mobile
- **Side-by-side** on desktop
- **Scale typography** up on larger screens
- **Hide/show** navigation elements by breakpoint

---

## Special Cases

### Share Cards (Social Images)

- Fixed size: 1080x1350px
- Static colors (not CSS variables)
- Left accent stripe (16px)
- Large, bold typography
- Clean, print-ready design

### Loading States

- Skeleton screens matching final layout
- Same border radius as components
- Neutral, muted colors

---

## Writing Style

### Labels

- **Uppercase** for section headers
- **Title case** for titles
- **Sentence case** for descriptions
- Always add letter spacing to uppercase text

### Numbers

- **Large and bold** for important metrics
- **Currency format** for money ($X,XXX.XX)
- **Commas** for thousands separators
- **Decimals**: 2 for currency, 5 for BTC amounts

---

## Quick Patterns

### Hero Section

```
Large card (32px radius)
+ Icon + label at top
+ Massive number display
+ Progress bar
+ Supporting info on the right
```

### Stat Card

```
Rounded container (24px)
+ Small uppercase label
+ Large bold value
+ Muted background (60% opacity)
```

### Navigation

```
Sticky top bar
+ Blur background
+ Logo left, links center/right
+ Pill-shaped active states
+ Mobile: hamburger menu
```

---

## Do's and Don'ts

### ✅ Do

- Use orange for primary actions and highlights
- Add smooth animations to new elements
- Keep generous spacing
- Use semantic color names (success, destructive)
- Make buttons and inputs large (easy to tap)
- Add hover states to all interactive elements

### ❌ Don't

- Use pure black (#000) or pure white (#fff)
- Mix border radius values randomly
- Add too many shadows (max 2 layers)
- Forget dark mode variants
- Make text too small (min 12px)
- Skip responsive adjustments
- Use harsh colors or transitions

---

## File Structure

- **Design tokens**: `src/styles.css`
- **Components**: `src/components/`
- **Pages**: `src/routes/`
- **Icons**: Lucide React

---

## When in Doubt

1. **Clean over clever** - simplicity wins
2. **Space generously** - white space is good
3. **Orange for important** - draw attention with color
4. **Smooth animations** - 300-600ms, smooth easing
5. **Mobile first** - design for small screens, scale up
6. **Accessible** - 44px min touch target, good contrast

---

_For detailed technical specs, see UI-GUIDELINES.md_

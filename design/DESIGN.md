---
name: Luminous Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d5e3fd'
  on-surface: '#0d1c2f'
  on-surface-variant: '#464554'
  inverse-surface: '#233144'
  inverse-on-surface: '#ebf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#767777'
  on-tertiary-container: '#040506'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f8f9ff'
  on-background: '#0d1c2f'
  surface-variant: '#d5e3fd'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a document extraction tool where high trust, technical precision, and mental clarity are paramount. The aesthetic follows a **refined minimalism** approach, drawing heavy inspiration from high-end developer tools. It prioritizes "whitish" space and structural rigor to make complex data extraction tasks feel effortless.

The emotional response is one of **calm authority**. By utilizing an expansive palette of off-whites and cool grays, the UI recedes to let the user's documents and data become the focal point. Subtle glassmorphism and soft tactile depth prevent the interface from feeling "flat," lending it a premium, physical quality.

**Design Principles:**
- **Extreme Legibility:** Every character must be distinct; data is the hero.
- **Airy Density:** High information density achieved through generous white space rather than cramped elements.
- **Subtle Feedback:** Interactions are marked by soft shifts in light and shadow rather than aggressive color changes.

## Colors

The palette is built on a foundation of "optical whites" to create a sense of cleanliness and digital precision.

- **Primary (Electric Indigo):** Used sparingly for primary calls-to-action, active selection states, and critical success indicators.
- **Surface & Background:** The canvas uses `#F8FAFC` (Slate-50) to provide a soft contrast against `#FFFFFF` containers, creating a "layered paper" effect.
- **Typography:** `#334155` (Slate-700) is the default for body text to maintain high contrast without the harshness of pure black. Secondary text utilizes `#64748B`.
- **Accents:** Use a very subtle `#E2E8F0` for borders and dividers to maintain the "whitish" aesthetic.

## Typography

The design system utilizes **Geist** for its technical, monolinear aesthetic and exceptional legibility at small sizes. 

- **Tracking:** Headings feature tight tracking (-0.02em) for a modern, "locked-in" look. UI labels and small body text utilize increased tracking (+0.01em to +0.05em) to improve readability against light backgrounds.
- **Hierarchy:** Use font weight to differentiate data from metadata. Use `Geist Mono` for extracted data strings, confidence scores, and IDs to evoke a sense of programmatic accuracy.

## Layout & Spacing

This design system employs a **Fluid-Fixed Hybrid** grid. Sidebars and navigation panels are fixed width to maintain tool-like utility, while the main content area expands to show document previews and extraction tables.

- **Scale:** A 4px baseline grid governs all spatial relationships.
- **Rhythm:** Use `lg` (24px) for outer container padding and `md` (16px) for internal component spacing.
- **Density:** For data-heavy views (extraction results), reduce vertical padding to `sm` (12px) to maximize information visibility without sacrificing the clean aesthetic.

## Elevation & Depth

Depth is conveyed through **Light Stacking** rather than traditional heavy shadows.

- **Level 0 (Background):** `#F8FAFC`.
- **Level 1 (Cards/Panels):** `#FFFFFF` with a 1px border of `#E2E8F0`.
- **Level 2 (Dropdowns/Modals):** `#FFFFFF` with a very soft, diffused shadow (`0px 10px 15px -3px rgba(0, 0, 0, 0.05)`).
- **Glassmorphism:** Overlays and floating headers use a background blur (12px) with a semi-transparent white fill (`rgba(255, 255, 255, 0.8)`).
- **Inner Shadows:** Active input fields and "pressed" states utilize a subtle inner shadow to simulate a slight physical indentation into the surface.

## Shapes

The shape language is approachable yet disciplined. 

- **Containers:** Default cards and main containers use `rounded-lg` (1rem / 16px).
- **Interactive Elements:** Buttons and input fields use `rounded-md` (0.5rem / 8px) for a slightly more precise, "tool-like" feel.
- **Icons:** Use a consistent corner radius for custom icons that mirrors the `rounded-md` setting to ensure visual harmony.

## Components

- **Buttons:** 
  - *Primary:* Solid Electric Indigo (`#6366F1`) with white text. 
  - *Secondary:* Pure white background, 1px border (`#E2E8F0`), and Slate-700 text.
- **Input Fields:** Use a subtle `#F1F5F9` background. On focus, transition to a white background with a 1px Primary color border and a soft glow.
- **Cards:** White fill, 1px border in `#E2E8F0`. Use a 16px corner radius. No shadow unless the card is draggable.
- **Chips/Badges:** For extraction status (e.g., "Pending", "Extracted"), use low-saturation background tints (e.g., light blue for pending, light green for success) with high-saturation text.
- **Document Previewer:** A dedicated large-surface component with a `#F1F5F9` background to distinguish the "work area" from the "control area."
- **Data Tables:** Remove vertical borders. Use thin horizontal separators (`#F1F5F9`). Highlight rows on hover with a very faint indigo tint.
---
name: Siper Intelligence System
colors:
  surface: '#121315'
  surface-dim: '#121315'
  surface-bright: '#38393b'
  surface-container-lowest: '#0d0e10'
  surface-container-low: '#1b1c1e'
  surface-container: '#1f2022'
  surface-container-high: '#292a2c'
  surface-container-highest: '#343537'
  on-surface: '#e3e2e5'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e3e2e5'
  inverse-on-surface: '#303033'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c7c6ca'
  on-secondary: '#2f3033'
  secondary-container: '#46464a'
  on-secondary-container: '#b5b4b9'
  tertiary: '#c6c6cd'
  on-tertiary: '#2e3036'
  tertiary-container: '#8f9097'
  on-tertiary-container: '#282a2f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e3e2e6'
  secondary-fixed-dim: '#c7c6ca'
  on-secondary-fixed: '#1b1b1f'
  on-secondary-fixed-variant: '#46464a'
  tertiary-fixed: '#e2e2e9'
  tertiary-fixed-dim: '#c6c6cd'
  on-tertiary-fixed: '#1a1c21'
  on-tertiary-fixed-variant: '#45474c'
  background: '#121315'
  on-background: '#e3e2e5'
  surface-variant: '#343537'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.4'
  section-title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
  body-main:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  metadata-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 24px
  panel-gutter: 16px
  component-padding-x: 12px
  component-padding-y: 8px
  grid-columns: '12'
---

## Brand & Style

This design system is engineered for high-stakes intelligence and criminal network analysis. The brand personality is clinical, authoritative, and impenetrable. It utilizes a **Corporate / Modern** aesthetic with **Minimalist** leanings to ensure that the cognitive load remains focused entirely on data synthesis and pattern recognition.

The visual language communicates "Total Visibility." It avoids decorative flourishes in favor of precision-engineered UI elements that evoke a sense of military-grade security. The emotional response is one of calm control amidst complex information environments.

**Design Principles:**
- **Analytical Depth:** Layers are used to represent deeper levels of data drilling.
- **Operational Efficiency:** High information density without visual clutter.
- **Unwavering Reliability:** A dark, stable foundation that reduces eye strain during long investigation cycles.

## Colors

The palette is anchored in a "Void" black foundation to maximize the luminosity and functional signaling of the primary accent and semantic colors.

- **Foundational Neutrals:** Use `#0A0B0D` for the primary canvas. Layered surfaces (panels, cards) use `#141518` and `#191B20` to create a logical hierarchy of information.
- **The Electric Blue (#3B82F6):** Reserved strictly for primary actions, active states, and "Person" entities. It represents the "pulse" of the investigation.
- **Entity Spectrum:** Use the defined `entity_palette` for categorical color-coding in graph views and list items. These colors must maintain a high enough contrast ratio against the dark backgrounds to remain legible at small scales.

## Typography

This design system utilizes **Inter** exclusively to leverage its systematic, utilitarian nature. The type scale is optimized for data density.

- **Hierarchy:** Use `display-lg` for dashboard titles and major entity names. `section-title` should be used for panel headers.
- **Metadata:** The `metadata-caps` style is critical for technical specs, timestamps, and secondary labels. The increased tracking ensures legibility despite the small font size.
- **Body Text:** Use `body-main` for all investigative notes and descriptions. 
- **Numerical Data:** For tabular data and coordinates, ensure the use of tabular num ligatures (tnum) to maintain vertical alignment in columns.

## Layout & Spacing

The layout follows a **Fixed Grid** model for the core application shell to ensure toolbars and sidebars remain in predictable locations during high-stress operations.

- **Application Shell:** 
  - **Top Nav:** 64px fixed height.
  - **Left Sidebar:** 240px width (collapsible to 64px icon-only state).
  - **Right Contextual Panel:** 320px fixed width for entity details and quick-filters.
- **Spacing Rhythm:** Based on a 4px baseline grid. Components should generally use 8px or 12px internal padding to maintain a "dense but breathable" feel.
- **Breakpoints:**
  - Desktop (Default): 1440px+
  - Laptop: 1024px - 1439px (Sidebar auto-collapses)
  - Tablet/Mobile: Not supported for full analysis; viewing-only mode for field reports uses a single-column stacked layout.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**.

- **Z-Axis Hierarchy:**
  - **Level 0 (#0A0B0D):** The base investigative canvas (the "ground").
  - **Level 1 (#141518):** Primary layout containers, sidebars, and inactive cards.
  - **Level 2 (#191B20):** Active cards, hovered elements, and nested panels.
- **Borders:** Every container and interactive component must have a `1px` border with `white/5%` opacity. This creates sharp definition without creating visual "noise."
- **Glassmorphism:** Reserved strictly for ephemeral layers such as Modals, Command Palettes (Ctrl+K), and Hover Tooltips. Apply a `20px` backdrop blur with a `10% white` semi-transparent fill.
- **Shadows:** Avoid heavy shadows. Use a single, subtle "Ambient" shadow (0 4px 20px rgba(0,0,0,0.5)) only for floating overlays to separate them from the grid.

## Shapes

The shape language is controlled and geometric. A `0.5rem (8px)` corner radius is the standard for almost all UI components, providing a modern feel that is still disciplined.

- **Standard Elements:** Cards, input fields, and buttons use the 8px radius.
- **Large Containers:** Main content area panels use `1rem (16px)` for `rounded-lg` where they meet the outer shell.
- **Interactive States:** Toggle switches and status "pills" use the `rounded-xl` or full-pill setting to distinguish them from structural layout boxes.
- **Graph Nodes:** Entity nodes in the network analysis view are perfect circles to differentiate them from the rectangular UI components.

## Components

- **Investigation Tables:** Use `12px` vertical padding for rows. Header row should use `metadata-caps` with a `white/10%` bottom border. Alternate row striping is discouraged; use hover highlights instead.
- **Entity Cards:** Must feature a color-coded top-border (2px) using the `entity_palette`. Display primary identifiers in `headline-md` and secondary metadata in `label-sm`.
- **Buttons:**
  - **Primary:** Solid `#3B82F6` with white text.
  - **Ghost:** `1px` border of `white/20%` with transparent background.
  - **Stateful:** Use `danger` or `warning` colors for destructive actions or high-risk flags.
- **Command Palette:** A centered modal with backdrop blur. Use high-contrast search results and keyboard shortcut hints in `metadata-caps`.
- **Graph Controls:** Floating icon-button groups (Zoom, Recenter, Layout Lock) using `Level 2` surface color and subtle glassmorphism.
- **Timeline:** A vertical or horizontal axis using `white/10%` lines. Key events are marked with `entity_palette` circles.
- **Input Fields:** Dark background (`#0A0B0D`), `1px` border, and `primary_color` focus ring. Placeholder text should use `text-secondary`.
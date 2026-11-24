---
name: Obsidian Precision
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c9c4d8'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#938ea1'
  outline-variant: '#484555'
  surface-tint: '#cabeff'
  primary: '#cabeff'
  on-primary: '#32009a'
  primary-container: '#947dff'
  on-primary-container: '#2b0088'
  inverse-primary: '#613de0'
  secondary: '#45dcc8'
  on-secondary: '#003731'
  secondary-container: '#00bdaa'
  on-secondary-container: '#00463e'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4918c8'
  secondary-fixed: '#68f9e4'
  secondary-fixed-dim: '#45dcc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  kpi-value:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.03em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  mono-code:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system projects mathematical rigor, executive-tier intelligence, and frictionless speed. Designed for founders, operators, and finance analysts, the interface merges the spatial clarity of Linear and Vercel with the structural polish of the Stripe Dashboard and Notion’s systematic layout discipline.

The visual style is **Precision Dark Minimalist** layered with **Subtle Glassmorphism**:
- Deep cosmic slate canvases with tightly budgeted light reflection.
- High-contrast typography paired with razor-sharp data tables and metric clusters.
- Vivid luminescence utilized exclusively to direct cognitive focus—status triggers, AI synthesis indicators, and critical inflection points.
- Tactile, microscopic UI details: single-pixel borders, inner hairline highlights, and controlled backdrop filtration.

## Colors

The palette is engineered specifically for deep-dark analytic workflows where prolonged visual stamina and instant anomaly recognition are critical.

### Surface Hierarchy
- **Canvas Base (`#0B1020`)**: The infinite depth layer behind all navigation and modular frames.
- **Surface Level 1 / Sidebar (`#111A2E`)**: Structural scaffolding, sub-navigation panels, and contextual rails.
- **Surface Level 2 / Card Surface (`#162038`)**: Actionable cards, data sheets, and chart canvases.
- **Surface Level 3 / Popover & Dropdown (`#1E2C4A`)**: Elevated overlays, tooltips, and floating command palettes.
- **Structural Stroke (`#23314E`)**: Rigid 1px separator lines defining edges without visual clutter.

### Accents & Indicators
- **Primary AI & Action (`#7C5CFC`)**: Synthesized AI insights, primary interactive buttons, and critical active navigation states.
- **Secondary Metric & Velocity (`#23C8B5`)**: Target metrics, growth trajectories, verified data pipelines, and telemetry completion.
- **Warning (`#F59E0B`)**: Budget caps, system thresholds, and pending reconciliations.
- **Danger (`#F43F5E`)**: Churn alerts, API drops, critical metric regressions.
- **Primary Text (`#F8FAFC`)**: High-contrast, pure legibility for KPIs, titles, and table values.
- **Muted Text (`#94A3B8`)**: Secondary annotations, axis labels, metadata, and timestamps.

## Typography

The typography couples the structural geometry of **Plus Jakarta Sans** for headlines and high-impact analytics with the hyper-utilitarian readability of **Inter** for dense tabular data, narratives, and parameter controls.

- **KPI Metric Display**: Tabular numbers (`font-variant-numeric: tabular-nums`) must be enforced on all metric figures and quantitative tables to prevent jitter during live data feeds.
- **Section Headers**: Plus Jakarta Sans applies tight negative tracking (-0.02em to -0.03em) to convey modern, software-grade refinement.
- **Micro-labels**: Uppercase styling paired with `label-sm` is reserved exclusively for system tags, category identifiers, and table column titles.

## Layout & Spacing

The layout model is governed by a **12-column responsive fluid grid** bounded by an inner max-width of `1600px` for ultra-wide analytical workstations.

### Breakpoints & Layout Adaptations
- **Desktop (≥ 1280px)**: 12 columns, fixed 256px contextual sidebar, 24px gutters (`gutter`), 32px canvas margins (`margin`). Multi-card analytical modules collapse into 3 or 4 horizontal blocks.
- **Tablet (768px - 1279px)**: 8 columns, icon-only slim navigation rail (64px), 24px gutters, 24px canvas margins. Dual-column KPI arrangements.
- **Mobile (< 768px)**: 4 columns, sliding off-canvas sheet navigation, 16px gutters (`gutter-mobile`), 16px screen padding (`margin-mobile`). Single-column stacked cards.

Vertical rhythm adheres strictly to 4px/8px incremental multiples to ensure chart viewports and inline controls align horizontally across adjacent container columns.

## Elevation & Depth

Visual depth is achieved through layered translucent boundaries, ambient luminous halos, and controlled tonal stacking rather than heavy, muddy drop shadows.

### Elevation Hierarchy
1. **Level 0 (Flat Canvas)**: Hex `#0B1020`. Absolute base layer; contains subtle background radial gradient blurs (e.g., a faint `#7C5CFC10` ambient aura behind top-level summaries).
2. **Level 1 (Card & Module)**: Surface `#162038`, framed with a 1px border of `#23314E`. When hovered, the border transitions smoothly to `#7C5CFC40` with an ambient glow of `0 0 20px -5px rgba(124, 92, 252, 0.15)`.
3. **Level 2 (Overlays & Command Dialogs)**: Surface `#1E2C4A` at 90% opacity with `backdrop-filter: blur(12px)`. Outer border `#23314E` reinforced by a dual drop-shadow: `0 10px 30px -10px rgba(0, 0, 0, 0.5)` and an internal top hairline `inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`.
4. **Active/Focus Glowing Bounds**: Form inputs and selected analytic cards leverage a 1px border in `#7C5CFC` and an outer ring `box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.2)`.

## Shapes

The design system implements balanced, contemporary rounding (`roundedness: 2`):
- **Base Components (Inputs, Small Badges, Tooltips)**: `0.5rem` (8px). Maintains crispness in compact spaces.
- **Content Containers & KPI Cards (`rounded-lg`)**: `1rem` (16px). Creates smooth visual isolation against dark backgrounds.
- **Modals, Floating Panels & Drawers (`rounded-xl`)**: `1.5rem` (24px). Softens dominant interactive screens.
- **Status Pills & Micro Indicators**: Fully rounded / circular (`9999px`) for semantic status indicators and quick-filter pills.

## Components

### Buttons
- **Primary**: Background `#7C5CFC`, text `#F8FAFC`, font weight 500, height 40px, padding 0 16px, radius 8px. Hover: background `#6B4CE6` with soft glow `0 4px 14px rgba(124, 92, 252, 0.35)`. Active: micro-scale to 0.98.
- **Secondary/Outline**: Background `transparent`, border 1px solid `#23314E`, text `#F8FAFC`. Hover: background `#162038`, border-color `#94A3B840`.
- **AI Action Variant**: Gradient background `linear-gradient(135deg, #7C5CFC 0%, #23C8B5 100%)`, high-contrast white text, subtle breathing pulse animation on idle.

### KPI & Metric Cards
- Background `#162038`, 1px border `#23314E`, internal padding 24px, border-radius 16px.
- Top section: Secondary label (`label-sm`, muted text `#94A3B8`) paired with an icon or trend badge right-aligned.
- Middle section: Large metric numerical display (`kpi-value`, `#F8FAFC`).
- Bottom section: Micro sparkline SVG chart paired with contextual delta (e.g., `+18.2%` in `#23314E` surface badge with text `#23C8B5`).

### Polished Status Badges
- Height 24px, border-radius 9999px, padding 2px 10px, typography `label-sm`.
- **Success / Healthy**: Background `rgba(35, 200, 181, 0.12)`, text `#23C8B5`, border 1px solid `rgba(35, 200, 181, 0.25)`. Includes an optional 6px glowing dot indicator.
- **Warning**: Background `rgba(245, 158, 11, 0.12)`, text `#F59E0B`, border 1px solid `rgba(245, 158, 11, 0.25)`.
- **Critical**: Background `rgba(244, 63, 94, 0.12)`, text `#F43F5E`, border 1px solid `rgba(244, 63, 94, 0.25)`.

### Form Inputs & Select Fields
- Height 40px, background `#111A2E`, border 1px solid `#23314E`, text `#F8FAFC`, placeholder `#94A3B8`.
- Focus state: Border `#7C5CFC`, ring `0 0 0 2px rgba(124, 92, 252, 0.25)`.
- Integrated AI Command Bar: Height 48px, background `#162038` with 12px blur, left-aligned sparkles icon in `#7C5CFC`, trailing keyboard shortcut badge (`⌘K`).

### Data Tables & Lists
- Table headers: Background `#111A2E`, border-bottom 1px solid `#23314E`, text `label-sm` uppercase `#94A3B8`.
- Rows: Height 52px, alternating or clean state with border-bottom 1px solid `#1A253F`. Hover state: background `rgba(255, 255, 255, 0.02)`.
- Cell contents: Numerical data aligned right with monospace baseline numbers; text descriptions aligned left.

### Automated Report Blocks (AI Synthesizer)
- Surface container embedded within report builders featuring a left 2px vertical accent bar in gradient `#7C5CFC` to `#23C8B5`.
- Subtle glass backdrop (`background: rgba(22, 32, 56, 0.65)`, `backdrop-filter: blur(8px)`).
- Quick action toolbar pinned to top right: Regenerate, Export PDF, Push to Slack.
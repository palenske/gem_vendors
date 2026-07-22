---
name: Pro-Locate Unified System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#444651'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#00311f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a31'
  on-tertiary-container: '#27c38a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for utility, trust, and navigational efficiency. The brand personality is professional and dependable, designed to feel like a high-end logistics or automotive tool. 

The aesthetic follows a **Corporate / Modern** style, emphasizing high-quality typography and clear information architecture. It avoids unnecessary decoration, opting instead for a systematic approach where "form follows function." The interface utilizes subtle tonal layering to create a sense of order, ensuring that users can locate dealers quickly without cognitive overload. The emotional response is one of reliability—the user should feel that the information is accurate and the service is premium.

## Colors
The palette is anchored by deep Navy Blue to establish authority and trust. The secondary Accent Blue is used exclusively for interactive elements and primary calls-to-action to guide the user's eye. 

The neutral palette is biased toward a very light gray (`#F9FAFB`) for page backgrounds, which helps white cards and search containers stand out with crisp definition. Use the Success Green for "Open Now" statuses or verified dealer badges, and the Warning Red for "Closed" statuses or search errors. Text colors should prioritize accessibility, using a scale of grays from `#111827` (Heading) to `#4B5563` (Body).

## Typography
This design system utilizes **Inter** for its systematic, utilitarian qualities and exceptional legibility at small sizes—crucial for map labels and data-heavy dealer lists. 

Headlines use a bold weight and slightly tighter letter-spacing to create a strong visual anchor. Body text is set with generous line height to improve readability during long-form scanning. For mobile devices, large display titles should scale down to `headline-lg-mobile` to maintain visual balance without pushing content too far below the fold. Use the `label-md` role for small metadata like "DISTANCE" or "STATUS" to provide clear categorization.

## Layout & Spacing
The layout follows a 12-column fluid grid for desktop and a single-column layout for mobile. A 8px base unit drives the spacing rhythm, ensuring all margins and paddings are multiples of 8.

- **Mobile:** 16px side margins. Dealer list cards take 100% width. The map is typically fixed to the top 40% of the viewport or hidden behind a "View Map" toggle.
- **Tablet/Desktop:** 24px gutters. Use a split-view pattern where a sidebar (approx. 400px wide) contains the search and dealer list, while the map fills the remaining viewport width.
- **Safe Areas:** Elements like search bars should have a minimum of 16px internal padding for touch-target safety on mobile.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and subtle ambient shadows. 

- **Level 0 (Background):** Used for the main app background (`#F9FAFB`).
- **Level 1 (Surface):** White cards (`#FFFFFF`) with a 1px border of `#E5E7EB`. Use this for list items.
- **Level 2 (Elevated):** White cards with a soft, diffused shadow (0px 4px 6px rgba(0, 0, 0, 0.05)). Use this for active search inputs or hovered dealer cards.
- **Level 3 (Overlay):** Floating action buttons or map popovers. Use a more pronounced shadow (0px 10px 15px rgba(0, 0, 0, 0.1)).

Shadows should be tinted slightly with the primary navy color to keep them feeling integrated rather than muddy.

## Shapes
The shape language is **Soft** and professional. A standard radius of 4px (`0.25rem`) is applied to most UI elements to maintain a crisp, business-like appearance while removing the harshness of sharp corners. 

- **Inputs and Buttons:** 4px radius.
- **Cards and Modals:** 8px radius (`rounded-lg`) to provide a gentler container for larger content blocks.
- **Status Badges:** 9999px (full pill) to differentiate them from interactive buttons.

## Components

### Search Inputs
The search bar is the most critical component. It should feature a leading "search" icon and a trailing "locate me" button. On focus, the border should transition from gray to the primary navy blue with a subtle outer glow.

### Dealer Cards
Cards utilize a white surface with a 1px neutral border. The dealer's name is `headline-md`, address is `body-md`, and distance is `label-md` in the secondary accent blue. 

### Interactive Maps
The map should use a custom "Silver" or "Light" style to match the UI palette. Custom pins should use the primary navy blue, with the "Active/Selected" pin using the secondary accent blue and a larger scale factor.

### Status Badges
Used for "Open" or "Closed" indicators. They consist of a light background tint and dark text (e.g., Light Green background with Dark Green text). They are pill-shaped to stand out from the rectangular card structure.

### Buttons
Primary buttons are solid Navy Blue with white text. Secondary buttons (e.g., "Directions") use a 1px Navy border with Navy text. All buttons have a minimum height of 48px on mobile to accommodate touch interactions.
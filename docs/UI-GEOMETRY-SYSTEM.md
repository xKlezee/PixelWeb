# PixelWeb Interface Geometry System

Status: active UI contract for shared navigation, buttons and compact interactive controls.

This document defines the measurable geometry used by PixelWeb. It exists to prevent page-by-page drift and to keep future UI additions visually compatible with the existing Minecraft/RPG language.

## 1. Base rhythm

PixelWeb uses a 4 px base grid with an 8 px primary rhythm.

| Token | Size | Intended use |
|---|---:|---|
| `--ui-1` | 4 px | micro gaps, compact menu separation |
| `--ui-2` | 8 px | normal inline gaps |
| `--ui-3` | 12 px | CTA groups, compact internal spacing |
| `--ui-4` | 16 px | standard horizontal control padding |
| `--ui-5` | 20 px | desktop navigation separation |
| `--ui-6` | 24 px | section/control grouping |
| `--ui-8` | 32 px | larger structural spacing |

Arbitrary spacing should not be introduced when one of these values expresses the same hierarchy.

## 2. Canonical control heights

| Context | Height |
|---|---:|
| Desktop header action | 40 px |
| Standard body control | 44 px |
| Mobile/touch control | 48 px |
| Two-line navigation/menu row | 52 px |
| Prominent commerce CTA | 72 px desktop / 64 px touch |

The height refers to the complete border-box target, not the text line box.

### Rules

- Discord, Play and Store use a 40 px desktop header height.
- Desktop top-level navigation uses a 40 px row so its optical center matches header actions.
- Body CTAs use 44 px unless a component explicitly belongs to a documented prominence tier.
- At `<= 980 px`, primary touch actions become 48 px.
- Menu entries carrying a title plus description use at least 52 px.
- Reading/disclosure rows such as About FAQ use 52 px rather than the compact 44 px tool-control tier.
- The Store page `Open Shop` action is the deliberate prominence exception: 72 px on desktop and 64 px in touch layouts. Its size communicates the page's primary commerce action and remains aligned to the 8 px rhythm rather than using an isolated 76 px value.
- Short-height landscape may reduce top-level mobile rows to 44 px, but not descriptive submenu rows below 48 px.

## 3. Header measurements

### Desktop (`> 980 px`)

- Site navigation vertical padding: 12 px.
- Header action height: 40 px.
- Brand image: 34 x 34 px.
- Brand/title gap: 10 px.
- Main wordmark: 16 px font / 16 px line-height.
- Edition label: 8 px font / 10 px line-height.
- Wordmark line gap: 2 px.
- Navigation item horizontal padding: 11 px.
- Navigation item gap: 4 px.
- Header action gap: 8 px.
- Discord: 40 x 40 px.
- Discord glyph presentation box: 20 x 16 px.
- Play minimum width: 70 px.
- Store minimum width: 82 px.
- Header control radius: 4 px for Minecraft-style primary header actions.

### Mobile (`<= 980 px`)

- Site navigation vertical padding: 8 px.
- Header row minimum height: 48 px.
- Brand image: 32 x 32 px, reducing to 30 x 30 px at `<= 390 px`.
- Discord, Play and menu toggle: 44 px tall.
- Discord and menu toggle remain true 44 x 44 px squares through 390 px; they are not narrowed because the measured header still fits with margin.
- Play minimum width: 64 px; 58 px at `<= 430 px`; 54 px at `<= 390 px`.
- Mobile menu horizontal edge: 16 px; 12 px at `<= 430 px`.
- Mobile top-level rows: 48 px.
- Mobile descriptive dropdown rows: 52 px.

The Store is intentionally removed from the compact top header and remains available as a full-width mobile navigation action. Play remains immediately available in the header.

## 4. Mobile action hierarchy

The mobile menu uses semantic action hierarchy rather than making all rows visually identical:

1. Navigation destinations: neutral surface.
2. Discord: semantic Discord action; Light uses the bright Discord treatment, Dark keeps the authored dark treatment.
3. Store: gold purchase CTA, matching the desktop Store hierarchy.
4. Play: kept in the top header for immediate access.

Discord and Store mobile actions are 48 px high and occupy the full menu width. The separate Store-page `Open Shop` hero action remains 64 px high on touch layouts because it belongs to the prominent-commerce tier rather than the mobile-navigation tier.

## 5. Dropdown geometry

### Desktop

- Width: 288 px.
- Offset below trigger: 8 px.
- Panel padding: 8 px.
- Panel radius: 16 px.
- Item minimum height: 52 px.
- Item horizontal padding: 12 px.
- Item radius: 9 px.
- Title line: 12/15 px.
- Description line: 10/14 px.

### Mobile

Dropdowns become part of document flow inside the open navigation group:

- Width: 100%.
- Left nesting: 12 px.
- Inner top/bottom spacing: 4/8 px.
- Descriptive row minimum height: 52 px.
- No floating shadow.
- Nested rail is expressed through the left border instead of another floating panel.

This prevents stacked floating boxes, clipping and inconsistent touch targets.

## 6. Contextual rails

Explore/Guide/Community contextual rails use a 48 px structural height.

- Desktop link minimum height: 36 px.
- Mobile link minimum height: 40 px.
- Mobile rails scroll horizontally rather than compressing labels until they become unreadable.
- Scrollbars are visually hidden while native horizontal touch scrolling remains available.

## 7. Body and page controls

The shared geometry layers normalize the following current controls:

- `.button`
- `.copy-ip`
- `.store-shop-primary` — prominent-commerce tier, not generic 44/48 px control
- `.store-rank-info-trigger`
- `.store-rank-dialog-close`
- `.leaderboard-category`
- `.leaderboard-metric-button`
- `.leaderboard-full-toggle`
- `.world-tab`
- `.marketplace-item-card` interactive targets
- Appearance trigger/options/close control
- Pixel Navigator trigger, close, search input, submit action, example chips and result rows
- Play dialog close, IP-copy control and footer action buttons
- Wiki browse summaries and Wiki/Guide search controls
- About FAQ summaries
- Worlds and Nexus rail nodes and detail-dialog close controls
- Worlds investigation action target

New primary or secondary controls should reuse an existing class or match this contract instead of introducing a new arbitrary height.

### Pixel Navigator measurements

- Floating trigger: 52 x 52 px desktop, 48 x 48 px at `<= 600 px`.
- Close control: 40 x 40 px desktop, 44 x 44 px touch layout.
- Search row/input: 48 px.
- Submit action: 40 px desktop with a 4 px inset; 44 px touch with a 2 px inset, both fitting the 48 px search row.
- Example chips: 36 px desktop, 44 px touch layout.
- Result rows: minimum 64 px.

### Play dialog measurements

- Close control: 44 x 44 px.
- IP-copy control: minimum 48 px.
- Footer action gap: 8 px.
- Footer CTA height: 44 px desktop, 48 px mobile.

### Disclosure/search measurements

- Wiki browse summary: minimum 44 px desktop / 48 px touch layout.
- About FAQ summary: minimum 52 px in both desktop and touch layouts.
- Wiki/Guide search controls: minimum 44 px desktop / 48 px touch layout.

### Prominent commerce measurement

- Store page `Open Shop`: 72 px minimum desktop height, 64 px minimum touch height.
- Desktop horizontal padding: 32 px.
- Touch horizontal padding: 24 px.
- The prominent size is reserved for a single page-defining commerce action. It must not be copied to ordinary CTAs simply to attract attention.

## 8. Focus and accessibility geometry

Interactive controls must preserve a visible keyboard focus treatment.

Shared focus geometry:

- 2 px visible focus outline.
- 3 px outline offset where the component allows it.
- Focus treatment must not change the element's layout dimensions.
- Immersive Worlds/Nexus nodes retain their authored large hit areas (68 px minimum) while receiving the same visible focus contract.

At high zoom, controls may wrap or stack; they must not clip text or reduce below the applicable touch target.

## 9. Responsive checkpoints

Source-level geometry is designed around these checkpoints:

- 1440 px: full desktop navigation.
- 1024 px: compact desktop/tablet transition.
- 980 px: canonical navigation mode switch.
- 768 px: tablet/mobile content behavior.
- 600 px: compact phone spacing.
- 430 px: narrow phone header tightening.
- 390 px: minimum primary phone QA width.
- 360 px: zoom/extreme-width safety fallback.
- Short landscape: `max-height: 520 px`.

These are implementation checkpoints, not substitutes for browser QA.

## 10. Visual harmony rules for future pages

Every new page must preserve the same interaction hierarchy even when the content layout is unique.

- Primary CTA and secondary CTA in the same row must share height and baseline unless one is the documented single prominent-commerce action.
- Semantic importance is expressed through controlled color/surface and documented size tiers, not arbitrary size inflation.
- Store remains the strongest gold commerce CTA.
- Discord may retain Discord semantic presentation without changing the official Symbol geometry.
- Destructive/critical colors must not be introduced merely to attract attention.
- Cards can have page-specific proportions, but embedded buttons follow shared control geometry.
- Do not use a unique button radius, target height or padding for a page unless the interaction model genuinely requires it and the exception is documented.
- Authored media proportions are independent from control geometry and must not be resized or recompressed by this system.
- Component-local CSS may define visual identity, but measurable interaction geometry belongs to the shared geometry layers.

## 11. Source-of-truth files and verification boundary

`pixel-interface-geometry.css` owns the core grid, header, navigation, shared CTA and responsive measurements.

`pixel-interface-components.css` owns the measurable geometry of specialized controls and documented prominence tiers such as Pixel Navigator, Play modal, Store `Open Shop`, Wiki/FAQ disclosures and immersive page selectors.

`pixel-responsive-harmony.css` owns cross-page composition changes at the 1024 / 980 / 768 / 600 / 430 / 390 / 360 and short-height landscape checkpoints. It may adjust page density, column collapse and viewport math, but does not mutate authored media.

These layers are loaded through the shared theme stack from `pixel-theme-page-fixes.css`, after the runtime fixes and before the final Light-specific corrections.

Source/static review can verify dimensions, selectors, breakpoint rules and cascade ordering. Actual visual claims such as pixel-perfect alignment at every viewport still require browser execution at the responsive QA matrix. Do not mark browser/render QA PASS solely from this document or source inspection.

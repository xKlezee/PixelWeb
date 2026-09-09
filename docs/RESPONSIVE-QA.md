# Responsive QA — PixelWeb

This document separates **static/code verification** from **browser-render verification**. A viewport is not marked visually PASS merely because its CSS appears correct.

## Required viewport matrix

The release matrix is:

| Width | Primary purpose | Static review | Browser render |
|---:|---|---|---|
| 1440 px | desktop composition | reviewed | pending |
| 1024 px | compact desktop / tablet landscape | reviewed | pending |
| 768 px | tablet portrait | reviewed | pending |
| 430 px | large mobile | reviewed | pending |
| 390 px | compact mobile | reviewed | pending |

Browser-render status remains pending until the hardening branch can be opened in a real browser with DevTools console/network inspection. Static review must not be presented as visual PASS.

## Static invariants reviewed

### Global public navigation

- desktop navigation remains active above 980 px;
- mobile navigation takes over at 980 px and below;
- mobile menu uses viewport-bounded height with its own vertical scrolling;
- the brand and action area have explicit compact rules at 560 px and below;
- a single canonical runtime navigation model now owns Explore, Development, Community and About destinations;
- Store and Discord are available in the mobile menu while Play remains directly accessible in the header;
- keyboard Escape closes open navigation groups/mobile navigation;
- dropdown controls expose `aria-expanded` and `aria-controls`.

### Shared content layouts

- page hero grids collapse before their fixed minimum columns can overflow;
- content/detail/metric grids collapse to one column on mobile;
- CTA blocks stack on mobile;
- long text containers use `minmax(0, 1fr)` where grid shrinkage is required;
- body-level horizontal overflow is not relied on as a substitute for intentional horizontal scrollers.

### Home

- hero collapses to one column below 980 px;
- immersive story has reduced mobile height and hides the desktop scroll hint;
- world gallery becomes a two-column compact gallery below 980 px;
- closing/status/store sections collapse below 980 px;
- Story progress is now a native `<progress>` element instead of transform-based inline styling.

### Worlds

- four world cards are intentionally horizontally scrollable below the full four-column breakpoint;
- the route is four Worlds only; `worlds-stage8-media.css` overrides the older five-column base rule with four columns/four colors;
- the mobile progress route becomes vertical below 700 px;
- five boss encounters become a one-column editorial strip below 980 px instead of an uneven 2+2+1 grid;
- individual card content uses shrink-safe grid columns.

**Consolidation note:** `worlds-stage8.css` still contains an older five-stage progress definition that is overridden by `worlds-stage8-media.css`. It is not currently the effective rule, but should be merged out when the Stage 8 stylesheets are consolidated.

### Nexus

- hero, access block and instance grid collapse below 980 px;
- difficulty ladder changes 4 → 2 → 1 columns;
- long instance copy no longer relies on desktop minimum heights after collapse;
- **fixed in this hardening branch:** Abyss + Astral no longer inherit a 4:3 *combined* container on tablet/mobile. Each unchanged 1448×1086 PNG keeps its own 4:3 panel side by side with `object-fit: contain`, preventing responsive cropping.

### Systems

- progression spine changes from horizontal to vertical below 980 px;
- route links and quest panel collapse to one column below 700 px;
- supporting rows collapse from three-column editorial rows to one column below 700 px;
- full-width mobile route controls are applied below 430 px.

### About / Owners

- the owner intro collapses below 900 px;
- both owner profiles use the same single-column relationship below 900 px;
- PxlMads remains mirrored inward while preserving equal profile structure;
- portrait heights and copy padding reduce below 560 px.

### Global Play modal

- dialog width is bounded to the viewport;
- dialog height is bounded with internal scrolling;
- below 620 px it becomes bottom-aligned, uses reduced padding and stacks footer actions;
- focus trapping, Escape close and focus restoration remain implemented in JavaScript;
- no runtime inline styles are required.

### Forum

- sidebar collapses below 860 px;
- dense top navigation is reduced below 640 px;
- post/modal spacing is reduced below 640 px;
- **fixed in this hardening branch:** auth and post overlays now have their own vertical scrolling and switch to top alignment on short (`max-height: 700px`) viewports, preventing a centered modal from becoming unreachable in landscape/short windows;
- reduced-motion disables meaningful animation/transition duration.

## Browser verification checklist

When a browser preview of this exact branch is available, every required viewport must be checked for:

1. no unexpected horizontal page scroll;
2. navigation opens, closes and restores state correctly;
3. dropdowns do not render outside the viewport;
4. Play modal is fully reachable with mouse, touch and keyboard;
5. Forum entry and post modal remain fully reachable at short heights;
6. focus indicators are visible and not clipped;
7. Escape closes modal/menu layers in the expected order;
8. no image is stretched or unintentionally cropped;
9. Abyss + Astral display both complete source images side by side;
10. Worlds rail scroll-snap does not trap page scrolling;
11. 4-world progress geometry is aligned with four rendered steps;
12. owner portraits keep equal visual footprint and PxlMads faces inward;
13. Home immersive video does not cause layout shifts;
14. reduced-motion produces a stable, usable page;
15. browser console has zero uncaught errors and zero CSP violations caused by first-party code;
16. Network panel shows no insecure HTTP subresources;
17. images marked lazy are not fetched eagerly without reason;
18. page remains usable at 200% browser zoom.

## Release rule

Do not merge the hardening branch solely because the static responsive review is clean. The final visual/browser matrix is a separate release gate. Static review can prove contradictory CSS, unsafe fixed geometry and missing breakpoints; it cannot prove the rendered result across browsers.

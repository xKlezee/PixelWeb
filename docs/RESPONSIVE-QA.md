# Responsive QA — PixelWeb

This document separates **static/code review** from **browser-render verification**. A viewport is never marked visually PASS only because its source appears correct.

## Required viewport matrix

| Width | Primary purpose | Static review | Browser render |
|---:|---|---|---|
| 1440 px | desktop composition | reviewed | pending |
| 1024 px | compact desktop / tablet landscape | reviewed | pending |
| 768 px | tablet portrait | reviewed | pending |
| 430 px | large mobile | reviewed | pending |
| 390 px | compact mobile | reviewed | pending |

Also required: one short-height landscape window and 200% browser zoom.

## Global navigation

- Desktop navigation remains active above 980 px; mobile navigation takes over at 980 px and below.
- Explore / Development / Community keep the fine-pointer hover contract on desktop and explicit click/touch behavior on mobile.
- Keyboard focus, ArrowDown and Escape remain independent supported paths.
- Store and Discord remain reachable from the mobile menu while Play remains directly available in the header.
- Detailed `guide-*.html` pages keep Guides selected in the canonical navigation.
- A first-focus Skip to content route is generated for standard pages.
- Category pages now expose a contextual sibling-navigation rail directly below the global navigation:
  - Explore → Gameplay / Systems / Worlds / Skyblock / Nexus;
  - Development → Development / Changelog;
  - Community → Community / Guides.
- The current sibling and its owning top-level group use the Pixel Blue active treatment. Active state must remain understandable through text/shape/contrast and not rely on color alone.
- The contextual rail is horizontally scrollable rather than wrapping into a tall second navigation on narrow screens.
- Home, Store and About do not create an empty contextual rail because they are not sibling members of those category groups.

## Typography

The current source uses a locally resolved compact grotesk stack rather than downloading a third-party webfont. Browser QA must confirm:

- heavy headings retain readable counters and do not clip at large sizes;
- negative heading tracking does not cause collisions;
- uppercase utility labels remain legible at 390 px and 200% zoom;
- fallback rendering remains acceptable when Inter Tight / Inter are not installed;
- navigation dimensions do not shift significantly between platform font fallbacks.

## Shared content layouts

- Hero grids collapse before minimum columns can overflow.
- Content/detail/metric grids collapse to one column on mobile where intended.
- CTA blocks stack on mobile.
- Long text containers remain shrink-safe.
- Page-level horizontal overflow must never be used to hide layout failure; only intentional rails/tables may scroll horizontally.

## Home

- Hero collapses to one column below 980 px.
- Immersive story has reduced mobile height and hides the desktop scroll hint.
- World gallery becomes a compact mobile grid below 980 px.
- Closing/status/store sections collapse below 980 px.
- The immersive MP4 remains deferred (`preload="none"`) and should not be requested before the story approaches its hydration margin.
- Reduced-motion mode must not hydrate/download the immersive MP4 during normal page use.
- Home no longer presents or links the retired Forum surface.

## Worlds

- The four-world route remains four Worlds only.
- World cards may use intentional horizontal scrolling at compact widths.
- The mobile progress route becomes vertical below 700 px.
- Boss presentation collapses cleanly below 980 px.
- Individual card content remains shrink-safe.

## Nexus

- Hero, access block and instance grid collapse below 980 px.
- Difficulty ladder changes 4 → 2 → 1 columns.
- Raphael, Azazel, Abyss and Astral remain the approved original 1448×1086 PNGs without recompression/conversion.
- Abyss + Astral must display as two complete independent 4:3 images without crop or stretch.

## Systems

- Progression spine changes from horizontal to vertical below 980 px.
- Route links and quest panels collapse appropriately below 700 px.
- Supporting rows collapse from editorial multi-column layouts to one column at narrow widths.

## Guides

- Desktop Guides retains the documentation-specific sticky-sidebar layout.
- At tablet widths the sidebar becomes a horizontal navigation rail above the document.
- Guide tables remain intentionally horizontally scrollable rather than forcing unreadable wrapping.
- Guide search remains usable at 390/430 px and 200% zoom.
- Evidence/state labels remain readable and are not communicated only by color.
- Dynamically rendered canonical facts must appear without leaving empty structural gaps after scripts load.

## About / Owners

About now uses username-synchronized interactive Minecraft models rather than repository-pinned founder portraits.

Static expectations:

- both owner profiles keep equal structural weight;
- owner layouts collapse to one column below 900 px;
- the viewer frame reduces height below 560 px without clipping the model;
- each viewer is keyboard focusable and exposes an accessible instruction label;
- ArrowLeft/ArrowRight rotate yaw, ArrowUp/ArrowDown adjust pitch, and Home restores that owner's own initial orientation;
- pointer dragging rotates the model without causing page scroll while the drag is active;
- the canvas uses nearest-neighbor style rendering for Minecraft texture fidelity;
- live texture lookup is keyed by `Klezee` and `PxlMads` usernames, so a future skin change is not tied to a repository image update;
- the no-JavaScript fallback also uses username-based remote renders rather than the old pinned WebP portraits;
- provider failure must leave a readable status rather than a broken empty frame.

Browser/network QA must additionally verify that the skin provider returns CORS-compatible textures, the canvas is not tainted before drawing, both users resolve correctly, and the provider cache behavior does not imply instant refresh in product copy.

## Community

- Community presents Discord and Guides as the active community destinations.
- No visible Forum navigation, preview card, account/post UI or Forum copy should remain.
- `forum.html` is retained only as a `noindex` compatibility redirect to Community for old bookmarks/links; it is not a product destination and remains excluded from the sitemap.

## Play modal

- Dialog width and height remain viewport-bounded.
- Narrow layouts stack footer actions.
- Focus trapping, Escape close and focus restoration remain implemented without runtime inline styles.

## Crawl / error surfaces

- The deployment remains a GitHub Pages project site under `/PixelWeb/`.
- `sitemap.xml` contains only indexable product/Guide pages.
- `forum.html` and `404.html` remain excluded from the sitemap and declare `noindex`.
- The legacy Forum redirect must resolve to Community without creating a redirect loop.
- `404.html` must keep the maintained CSP/referrer policy and usable site exits.

## Automated structural guards

The Quality Gate keeps separate responsibilities:

- `security_scan.py` — committed-secret patterns;
- `validate_media_integrity.py` — exact Nexus boss PNG integrity;
- `node --check` — JavaScript syntax;
- `validate_public_data.js` — canonical public-data relationships and approved destinations/media;
- `validate_site.py` — CSP, HTML/JS safety patterns, local references, HTTPS policy and sitemap/index consistency;
- `validate_social_metadata.py` — indexed-page title/description/social metadata consistency;
- `validate_runtime_contracts.py` — deferred media, navigation, fragment targets and Guide-library contracts;
- `validate_accessibility.py` — structural accessibility checks;
- `build_public_site.py` — explicit `_site/` construction;
- `validate_public_bundle.py` — staged artifact boundary validation.

These checks are configured but must not be reported as PASS unless they actually execute. The known account-level Actions startup issue is separate from code quality.

## Browser verification checklist

1. No unexpected page-level horizontal scrolling at 1440 / 1024 / 768 / 430 / 390 px.
2. Explore / Development / Community desktop hover behavior opens/closes without sticky pointer-click state.
3. Mobile/touch navigation still opens explicitly at 980 px and below.
4. Keyboard focus, ArrowDown and Escape remain usable in global navigation.
5. Contextual sibling navigation appears only for the correct category and marks the current page in Pixel Blue.
6. Contextual rail remains reachable by touch/trackpad horizontal scrolling on compact screens.
7. Skip to content moves both scroll position and focus to `<main>`.
8. Play modal is fully reachable and escapable with mouse, touch and keyboard.
9. Focus indicators are visible and unclipped.
10. Typography remains readable without clipping/collision, including at 200% zoom.
11. Images are not stretched or unintentionally cropped.
12. Abyss + Astral both display complete source images side by side.
13. Worlds route remains visually aligned to exactly four Worlds.
14. About shows equal owner-card visual weight.
15. Klezee and PxlMads skin textures both resolve by username.
16. Dragging each skin viewer rotates smoothly without text selection/page-drag artifacts.
17. Arrow-key rotation and Home reset work for both viewers; PxlMads resets to its own mirrored initial angle.
18. Skin-provider failure degrades to a readable viewer state.
19. The retired Forum is absent from visible navigation/content, and direct `forum.html` access redirects to Community.
20. Home immersive media causes no initial layout shift and remains deferred.
21. Reduced-motion mode remains stable and avoids unnecessary immersive-video loading.
22. Guide sidebar/rail, search and tables remain usable on compact screens.
23. Browser console shows zero uncaught first-party errors and zero first-party CSP violations.
24. Network panel shows no insecure HTTP subresources.
25. Unknown routes render the branded 404 without broken local resources.
26. Short-height landscape remains usable for navigation, Play modal, Guide rails and owner viewers.

## Release rule

Static/source review is not browser proof. Do not merge a substantial visual/interaction branch only because the source diff looks coherent; the final browser matrix remains a separate gate.

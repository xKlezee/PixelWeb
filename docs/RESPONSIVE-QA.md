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
- Explore / Guide / Community keep the fine-pointer hover contract on desktop and explicit click/touch behavior on mobile.
- Keyboard focus, ArrowDown and Escape remain independent supported paths.
- Store and Discord remain reachable from the mobile menu while Play remains directly available in the header.
- Detailed `guide-*.html` pages keep Guide selected in the canonical navigation.
- A first-focus Skip to content route is generated for standard pages.
- Category pages expose a contextual sibling-navigation rail directly below the global navigation:
  - Explore → Gameplay / Systems / Worlds / Skyblock / Nexus;
  - Guide → Progression / Mechanics / Tools / Armor / Specials / Boosts;
  - Community → Leaderboards / Changelog / Rules / Staff Team.
- Progression is the first Guide destination in the actual canonical model and the default state for `guides.html` without a hash.
- The current sibling and its owning top-level group use an active treatment. Active state must remain understandable through text/shape/contrast and not rely on color alone.
- The contextual rail is horizontally scrollable rather than wrapping into a tall second navigation on narrow screens.
- Home, Marketplace, Store and About do not create an empty contextual rail because they are not sibling members of those category groups.
- Worlds/Nexus preserve the rail height required by their immersive viewport math even when their colors differ from standard pages.

## Typography

The current source uses a locally resolved compact grotesk stack rather than downloading a third-party webfont. Browser QA must confirm:

- heavy headings retain readable counters and do not clip at large sizes;
- negative heading tracking does not cause collisions;
- uppercase utility labels remain legible at 390 px and 200% zoom;
- fallback rendering remains acceptable when preferred system fonts are unavailable;
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
- Home no longer presents or links retired Forum/Development surfaces.

## Worlds

- Worlds retains its one-scene-at-a-time immersive interaction rather than being flattened into ordinary cards.
- The four-world route remains exactly Overworld → Pirate Kingdom → Nether → Winter.
- The rail remains reachable on compact screens without changing the interaction model.
- Detail content collapses cleanly and remains shrink-safe.
- Nexus remains outside the World route.

## Nexus

- Nexus retains the one-encounter-at-a-time immersive interaction grammar shared with Worlds.
- Detail layout collapses without hiding encounter-critical information.
- Raphael, Azazel, Abyss and Astral remain the approved original 1448×1086 PNGs without recompression/conversion.
- Abyss + Astral must display as two complete independent 4:3 images without crop or stretch.

## Systems

- Progression spine changes from horizontal to vertical below 980 px.
- Route links and quest panels collapse appropriately below 700 px.
- Supporting rows collapse from editorial multi-column layouts to one column at narrow widths.

## Guide

- Desktop Guide retains the documentation-specific sticky-sidebar layout.
- At tablet widths the sidebar becomes a horizontal navigation rail above the document.
- Guide tables remain intentionally horizontally scrollable rather than forcing unreadable wrapping.
- Guide search remains usable at 390/430 px and 200% zoom.
- Evidence/state labels remain readable and are not communicated only by color.
- Dynamically rendered canonical facts must appear without leaving empty structural gaps after scripts load.
- Progression appears first in the Guide index, category sidebar and contextual rail without relying on CSS to reorder a different canonical data model.

## Staff Team / Owners

Staff Team owns the username-synchronized interactive Minecraft owner models.

Static expectations:

- both owner profiles keep equal structural weight;
- owner layouts collapse to one column below 980 px through the current Minecraft RPG card grid;
- the viewer frame reduces height on compact layouts without clipping the model;
- each viewer is keyboard focusable and exposes an accessible instruction label;
- ArrowLeft/ArrowRight rotate yaw, ArrowUp/ArrowDown adjust pitch, and Home restores that owner's own initial orientation;
- pointer dragging rotates the model without causing page scroll while the drag is active;
- the canvas uses nearest-neighbor style rendering for Minecraft texture fidelity;
- live texture lookup is keyed by `Klezee` and `PxlMads` usernames, so a future skin change is not tied to a repository image update;
- the no-JavaScript fallback also uses username-based remote renders;
- provider failure must leave a readable status rather than a broken empty frame;
- the public-roster boundary remains visible without making one owner visually dominant.

Browser/network QA must additionally verify that the skin provider returns CORS-compatible textures, the canvas is not tainted before drawing, both users resolve correctly, and the provider cache behavior does not imply instant refresh in product copy.

## About

About is an information/policy surface rather than an owner gallery.

- The four overview routes collapse 4 → 2 → 1 columns without oversized empty cards.
- FAQ `<details>` remain keyboard operable and their summaries do not clip at 390 px or 200% zoom.
- Sticky section headings become static below 980 px.
- Tebex actions wrap/stack without overflow.
- The Minecraft disclaimer remains prominent and readable at every width.
- Copyright/attribution and external-service notes retain readable line length.
- About does not reintroduce the owner viewers or duplicate Staff Team content.

## Community

- Community routes to Leaderboards, Changelog, Rules and Staff Team plus Discord.
- No visible Forum navigation, preview card, account/post UI or Forum copy should remain.
- `forum.html` is retained only as a `noindex` compatibility redirect to Community for old bookmarks/links; it is not a product destination and remains excluded from the sitemap.

## Shared footer

- The rich runtime footer uses a two-column identity/navigation layout on desktop and one column below 980 px.
- Footer links remain reachable and wrap naturally.
- The Minecraft disclaimer and rights boundary remain readable without dominating the page.
- Guide/Worlds/Nexus may keep their own footer background treatment; shared footer structure must still align correctly.
- The legal block never creates page-level horizontal overflow.

## Play modal

- Dialog width and height remain viewport-bounded.
- Narrow layouts stack footer actions.
- Focus trapping, Escape close and focus restoration remain implemented without runtime inline styles.

## Crawl / error surfaces

- The deployment remains a GitHub Pages project site under `/PixelWeb/`.
- `sitemap.xml` contains only indexable product/Guide pages.
- `forum.html` and `404.html` remain excluded from the sitemap and declare `noindex`.
- The legacy Forum redirect must resolve to Community without creating a redirect loop.
- `development.html` remains only a legacy redirect to Guide.
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
- `validate_player_facing_copy.py` — player-facing implementation-detail boundary;
- `build_public_site.py` — explicit `_site/` construction;
- `validate_public_bundle.py` — staged artifact boundary validation.

These checks are configured but must not be reported as PASS unless they actually execute.

## Browser verification checklist

1. No unexpected page-level horizontal scrolling at 1440 / 1024 / 768 / 430 / 390 px.
2. Explore / Guide / Community desktop hover behavior opens/closes without sticky pointer-click state.
3. Mobile/touch navigation still opens explicitly at 980 px and below.
4. Keyboard focus, ArrowDown and Escape remain usable in global navigation.
5. Contextual sibling navigation appears only for the correct category and marks the current page consistently.
6. Guide shows Progression first and `guides.html` without a hash activates Progression.
7. Contextual rail remains reachable by touch/trackpad horizontal scrolling on compact screens.
8. Skip to content moves both scroll position and focus to `<main>`.
9. Play modal is fully reachable and escapable with mouse, touch and keyboard.
10. Focus indicators are visible and unclipped.
11. Typography remains readable without clipping/collision, including at 200% zoom.
12. Images are not stretched or unintentionally cropped.
13. Abyss + Astral both display complete source images side by side.
14. Worlds route remains visually aligned to exactly four Worlds.
15. Staff Team shows equal owner-card visual weight.
16. Klezee and PxlMads skin textures both resolve by username on Staff Team.
17. Dragging each skin viewer rotates smoothly without text selection/page-drag artifacts.
18. Arrow-key rotation and Home reset work for both viewers; PxlMads resets to its own mirrored initial angle.
19. Skin-provider failure degrades to a readable viewer state.
20. About FAQ/details are usable by keyboard and touch.
21. About Tebex CTA opens the approved external destination with `noopener`.
22. About Minecraft disclaimer and attribution copy remain readable at all target widths.
23. Shared footer links, disclaimer and rights copy render correctly across standard, Guide and immersive pages.
24. The retired Forum is absent from visible navigation/content, and direct `forum.html` access redirects to Community.
25. The retired Development family is absent from visible navigation/content, and direct `development.html` access redirects to Guide.
26. Home immersive media causes no initial layout shift and remains deferred.
27. Reduced-motion mode remains stable and avoids unnecessary immersive-video loading.
28. Guide sidebar/rail, search and tables remain usable on compact screens.
29. Browser console shows zero uncaught first-party errors and zero first-party CSP violations.
30. Network panel shows no insecure HTTP subresources.
31. Unknown routes render the branded 404 without broken local resources.
32. Short-height landscape remains usable for navigation, Play modal, Guide rails, Staff viewers and About policy sections.

## Release rule

Static/source review is not browser proof. Do not merge a substantial visual/interaction branch only because the source diff looks coherent; the final browser matrix remains a separate gate.

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
- Desktop Discord uses the official Discord Symbol inside its neutral Pixel control; the symbol must remain undistorted and un-recolored.
- Detailed `guide-*.html` pages keep Guide selected in the canonical navigation.
- A first-focus Skip to content route is generated for standard pages.
- Category pages expose a contextual sibling-navigation rail directly below the global navigation:
  - Explore → Gameplay / Systems / Worlds / Skyblock / Nexus;
  - Guide → Getting Started / Currencies / Basic Commands / Progression / Mechanics / Tools / Armor / Specials / Boosts;
  - Community → Leaderboards / Changelog / Rules / Staff Team.
- Getting Started is the first Guide destination in the canonical model and the default state for `guides.html` without a hash.
- The current sibling and its owning top-level group use an active treatment that remains understandable through text/shape/contrast and not color alone.
- The contextual rail is horizontally scrollable rather than wrapping into a tall second navigation on narrow screens.
- Home, Marketplace, Store, About and License do not create an empty contextual rail.
- Worlds/Nexus preserve the established 50px Explore rail geometry required by immersive viewport math.
- Shared active/selection accents are warm gold/amber/orange; approved world and boss media retains its authored colors.

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
- Home Guide entry points to Getting Started rather than assuming Progression is the first documentation destination.

## Worlds / Nexus

- Worlds retains one-scene-at-a-time immersive interaction rather than flattening into ordinary cards.
- The four-world route remains exactly Overworld → Pirate Kingdom → Nether → Winter.
- Nexus remains outside the World route.
- Nexus detail layout collapses without hiding encounter-critical information.
- Raphael, Azazel, Abyss and Astral remain the approved original 1448×1086 PNGs without recompression/conversion.
- Abyss + Astral display as two complete independent 4:3 images without crop or stretch.

## Systems / Skyblock

- Systems progression spine changes from horizontal to vertical below 980 px.
- Supporting rows collapse from editorial multi-column layouts to one column at narrow widths.
- Skyblock keeps the current/partial/planned feature boundary readable at all widths.

## Guide

- Desktop Guide retains the documentation-specific sticky-sidebar layout.
- At tablet widths the Browse sidebar becomes a compact multi-column/horizontal-friendly navigation surface above content.
- At small mobile widths Browse groups resolve to one column.
- Guide tables remain intentionally horizontally scrollable rather than forcing unreadable wrapping.
- Guide search remains usable at 390/430 px and 200% zoom.
- Evidence/state labels remain readable and are not communicated only by color.
- Dynamically rendered canonical facts must appear without leaving empty structural gaps after scripts load.
- The Guide landing has nine first-class categories in canonical order: Getting Started, Currencies, Basic Commands, Progression, Mechanics, Tools, Armor, Specials, Boosts.
- The Browse list shows no article-count badges, hidden organizational labels or fake category-overview rows.
- Every visible Browse child is a real destination; Coins/Pixels/Nexus Points and command entries resolve to their exact section anchors.
- Getting Started owns server basics statically: join flow, Currencies, Basic Commands and progression orientation must remain usable even before its data-hydration script runs.

## Staff Team / Owners

Staff Team owns the username-synchronized interactive Minecraft owner models.

Static expectations:

- both owner profiles keep equal structural weight;
- owner layouts collapse to one column below 980 px;
- the viewer frame reduces height on compact layouts without clipping the model;
- each viewer remains keyboard focusable;
- ArrowLeft/ArrowRight rotate yaw, ArrowUp/ArrowDown adjust pitch, and Home restores that owner's own initial orientation;
- pointer dragging rotates the model without causing page scroll while drag is active;
- canvas rendering uses nearest-neighbor pixel fidelity;
- both classic/Steve and slim/Alex skins render with correct geometry/UVs;
- Klezee's head outer-layer side textures remain correctly oriented;
- live texture lookup remains keyed by `Klezee` and `PxlMads`;
- provider failure degrades to a readable username-based image fallback;
- no visible `Drag to rotate` helper label returns.

Browser/network QA must additionally verify CORS/canvas behavior and both usernames resolving correctly.

## About / License

- About overview routes collapse 4 → 2 → 1 columns without oversized empty cards.
- The About “Start here” route points to Getting Started.
- FAQ `<details>` remain keyboard operable and summaries do not clip at 390 px or 200% zoom.
- Tebex actions wrap/stack without overflow.
- Minecraft disclaimer, licensing/attribution and external-service notes remain prominent and readable.
- `license.html` retains readable line length, keyboard navigation and a clear path back to About.

## Community / Leaderboards

- Community routes to Leaderboards, Changelog, Rules and Staff Team plus Discord.
- No visible Forum navigation or Forum product UI remains.
- Leaderboards frontend states remain usable even while the authoritative server-backed source is pending; empty/source-pending state must not be mistaken for rankings.

## Shared footer

- Footer links remain reachable and wrap naturally.
- Minecraft disclaimer and rights boundary remain readable without dominating the page.
- Guide/Worlds/Nexus may keep visual-family background treatment while sharing the normalized footer structure.
- The legal block never creates page-level horizontal overflow.

## Play modal

- Dialog width and height remain viewport-bounded.
- Narrow layouts stack footer actions.
- Focus trapping, Escape close and focus restoration remain implemented without runtime inline styles.

## Crawl / compatibility surfaces

- Deployment remains a GitHub Pages project site under `/PixelWeb/`.
- `sitemap.xml` contains indexable product/Guide/About/License pages, including Currencies and Basic Commands.
- `forum.html` and `404.html` remain excluded from the sitemap and declare `noindex` where appropriate.
- `forum.html` remains a compatibility redirect to Community.
- `development.html` remains only a legacy redirect to Guide.

## Automated structural guards

Repository validators remain useful when they actually execute, but the owner has temporarily disabled Quality Gate usage because of account/payment runner problems. A configured workflow must not be reported as PASS without execution.

## Browser verification checklist

1. No unexpected page-level horizontal scrolling at 1440 / 1024 / 768 / 430 / 390 px.
2. Explore / Guide / Community desktop hover behavior opens/closes without sticky pointer-click state.
3. Mobile/touch navigation still opens explicitly at 980 px and below.
4. Keyboard focus, ArrowDown and Escape remain usable in global navigation.
5. Guide rail order starts with Getting Started, then Currencies and Basic Commands, and all nine Guide categories remain reachable on narrow screens.
6. `guides.html` without a hash activates Getting Started.
7. Guide Browse dropdowns, search, direct child links and anchor targets work on desktop/mobile.
8. Getting Started shows server basics without depending on DOM injection.
9. Skip to content moves both scroll position and focus to `<main>`.
10. Play modal is fully reachable and escapable with mouse, touch and keyboard.
11. Focus indicators are visible and unclipped.
12. Typography remains readable at 200% zoom.
13. Images are not stretched or unintentionally cropped; Abyss + Astral remain complete.
14. Staff Team shows equal owner-card visual weight and both skins resolve/render correctly.
15. Pointer/keyboard skin interactions and Home reset work for both owners.
16. About FAQ, Tebex CTA and license route remain usable.
17. Shared footer remains readable across visual families.
18. Direct Forum/Development legacy URLs redirect correctly without retired UI returning.
19. Home immersive media remains deferred and reduced-motion stable.
20. Browser console shows zero uncaught first-party errors and first-party CSP violations.
21. Network panel shows no insecure HTTP subresources.
22. Short-height landscape remains usable for navigation, Guide, Play modal, Staff, About and License.

## Release rule

Static/source review is not browser proof. Do not mark browser-specific behavior PASS until the real browser matrix has been executed.

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

The viewport matrix must be executed in both effective `Light` and `Dark`. `System` is additionally verified at representative desktop and mobile widths by changing the browser/OS color-scheme preference while the page is open. A source-level theme audit does not mark any browser-render cell PASS.

## Source-level responsive harmony pass

`pixel-responsive-harmony.css` is the final source-level composition layer for the current responsive pass. It is loaded after shared geometry/component rules and before the final Light-specific corrections.

The source pass normalizes the major composition checkpoints at 1024 / 980 / 768 / 600 / 430 / 390 / 360 px plus short-height landscape. It also provides shrink-safe grid children, consistent section density, narrow-phone CTA stacking, Guide rail scrolling, Marketplace viewer scaling, Leaderboard density, owner-card scaling and intentional table scrolling at high zoom.

Important measured viewport math:

- mobile global header: 65 px actual occupied height (48 px row + 8 px top + 8 px bottom + 1 px border);
- normal contextual rail: 48 px;
- Worlds/Nexus mobile immersive chrome: 113 px total;
- short-height landscape header: 53 px actual occupied height (44 px row + 4 px top + 4 px bottom + 1 px border);
- short-height contextual rail: 44 px;
- Worlds/Nexus short-height immersive chrome: 97 px total.

These are source-level calculations, not visual PASS results. Browser-render verification remains pending for every matrix cell.

## Appearance / theme execution

- `System`, `Light` and `Dark` remain reachable by pointer/touch and keyboard wherever the Appearance control is available.
- `System` resolves to the current browser/OS light or dark preference; it is not a third visual palette.
- While `System` is selected, changing the system/browser color-scheme preference updates `html[data-theme-effective]` and the rendered page without a reload.
- Explicit `Light` and `Dark` choices persist across reloads and same-origin navigation and are not replaced by later system-preference changes.
- The browser `theme-color` follows the effective theme where supported.
- A persisted preference must not produce a visible opposite-theme flash during first paint.
- Default, hover, focus, active, selected, loading, failure, empty, modal/backdrop and shared-feedback states remain legible in both effective themes.
- Marketplace loading/error states remain visible rather than appearing as unexplained empty canvases.
- Toast, skip-link, Pixel Navigator, Play dialog and mobile navigation maintain readable foreground/background/border contrast.
- Generic interaction accents remain warm gold/amber/orange/copper. Semantic/authored colors such as Discord identity, World/biome identity and boss artwork may remain distinct.
- Theme changes must not replace, recompress, downscale or otherwise mutate approved World/Nexus imagery, Nexus boss PNGs, Minecraft skins, Marketplace model textures or authored logo source files. The official Discord Symbol source and geometry remain unchanged, while its rendered CSS tint may follow the effective theme as an explicit presentation exception.
- Reduced-motion behavior must remain correct in both effective themes and must not be defeated by theme-specific status or feedback animation.

## Global navigation

- Desktop navigation remains active above 980 px; mobile navigation takes over at 980 px and below.
- Explore / Guide / Community keep the fine-pointer hover contract on desktop and explicit click/touch behavior on mobile.
- Keyboard focus, ArrowDown and Escape remain independent supported paths.
- Store and Discord remain reachable from the mobile menu while Play remains directly available in the header.
- Desktop Discord uses the official Discord Symbol source and preserves its proportions. Its CSS presentation tint/surface may change with the effective appearance mode; the SVG itself is not replaced or redrawn.
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
- Worlds/Nexus preserve the shared 48 px contextual rail geometry in the normal mobile composition; the immersive stage math uses the measured 113 px combined mobile chrome.
- Shared active/selection accents are warm gold/amber/orange; approved world and boss media retains its authored colors.

## Shared content layouts

- Hero grids collapse before minimum columns can overflow.
- Content/detail/metric grids collapse to one column on mobile where intended.
- CTA blocks stack on mobile.
- Long text containers remain shrink-safe.
- Page-level horizontal overflow must never be used to hide layout failure; only intentional rails/tables may scroll horizontally.
- The complete `Pixel Network / Java Edition` brand identity remains present at 600 / 430 / 390 px; narrow layouts must not use the legacy 88 px text truncation.

## Home

- Hero collapses to one column below 980 px.
- At 430 px the primary hero actions become one full-width column with matching geometry.
- Immersive story has reduced mobile height and hides the desktop scroll hint where required.
- World gallery becomes a compact mobile grid below 980 px.
- Closing/status/store sections collapse below 980 px.
- The immersive MP4 remains deferred (`preload="none"`) and should not be requested before the story approaches its hydration margin.
- Reduced-motion mode must not hydrate/download the immersive MP4 during normal page use.
- Home no longer presents or links retired Forum/Development surfaces.
- Home Guide entry points to Getting Started rather than assuming Progression is the first documentation destination.
- Light mode adapts image stages/overlays and surrounding cards without replacing or recoloring the original media.

## Worlds / Nexus

- Worlds retains one-scene-at-a-time immersive interaction rather than flattening into ordinary cards.
- The four-world route remains exactly Overworld → Pirate Kingdom → Nether → Winter.
- Nexus remains outside the World route.
- Nexus detail layout collapses without hiding encounter-critical information.
- Raphael, Azazel, Abyss and Astral remain the approved original 1448×1086 PNGs without recompression/conversion.
- Abyss + Astral display as two complete independent 4:3 images without crop or stretch.
- In Light mode, full-screen media remains the same source file while stage brightness/contrast, overlays, rail, metadata, counter, investigation control and dialog surfaces adapt independently.
- Theme switching must not introduce a dark-only overlay over Light mode imagery or wash out encounter/world artwork.
- At normal mobile height, the stage subtracts the measured 113 px combined chrome rather than relying on a stale 111/112 px approximation.
- In short-height landscape, the stage may drop its legacy 520 px minimum and uses the measured 97 px compact chrome so the immersive viewport does not create avoidable vertical overflow.

## Systems / Skyblock

- Systems progression spine changes from horizontal to vertical below 980 px.
- Supporting rows collapse from editorial multi-column layouts to one column at narrow widths.
- Skyblock keeps the current/partial/planned feature boundary readable at all widths.
- Skyblock Objectives and other generic interaction surfaces retain the warm shared accent in Light mode rather than falling back to unrelated cool-blue styling.

## Guide

- Desktop Guide retains the documentation-specific sticky-sidebar layout.
- At tablet widths the Browse sidebar becomes a compact horizontal-friendly navigation surface above content.
- Tablet/mobile Guide rails use native horizontal scrolling with hidden visual scrollbars and proximity snap rather than squeezing labels.
- At small mobile widths Browse groups resolve to one column where content density requires it.
- Guide facts resolve to one readable column at 430 px instead of forcing two narrow fact cells.
- Guide tables remain intentionally horizontally scrollable rather than forcing unreadable wrapping.
- Guide search remains usable at 390/430 px and 200% zoom.
- Evidence/state labels remain readable and are not communicated only by color.
- Dynamically rendered canonical facts must appear without leaving empty structural gaps after scripts load.
- The Guide landing has nine first-class categories in canonical order: Getting Started, Currencies, Basic Commands, Progression, Mechanics, Tools, Armor, Specials, Boosts.
- The Browse list shows no article-count badges, hidden organizational labels or fake category-overview rows.
- Every visible Browse child is a real destination; Coins/Pixels/Nexus Points and command entries resolve to their exact section anchors.
- Getting Started owns server basics statically: join flow, Currencies, Basic Commands and progression orientation must remain usable even before its data-hydration script runs.
- Specialized Progression, Skyblock, Enchantments, Stats/Equipment and Talisman components must be checked in both Light and Dark, including late priority styles that could otherwise reintroduce dark-only or cool-blue accents.

## Marketplace

- The large model stage remains transparent at canvas level; the themed stage/frame owns its environment.
- Model texture/source data is not recolored by the appearance system.
- Loading and failure states remain visible and centered at desktop, tablet and mobile widths.
- Item previews preserve their own loading/failure feedback, active state, hover/focus treatment and readable detail relationship.
- Theme switching must not change model scale, yaw/pitch behavior, texture sampling or the original source texture bytes.
- The model stage scales down progressively instead of retaining the desktop 620/510 px height on narrow devices.
- Collection items use two columns on tablet and one column from compact phone widths so cards are not squeezed below readable proportions.
- The Store bridge stacks and its CTA becomes full width on narrow phones.

## Leaderboards

- Top 3 podium/player renders remain legible and structurally balanced in both effective themes.
- Top 10, Full Leaderboard, metric selector, badges and empty/source-pending states remain readable at every required width.
- Empty/source-pending state must not visually resemble a populated zero-score leaderboard.
- Player heads/renders and their fallbacks retain intended image treatment; the theme adapts their surrounding stage/podium rather than recoloring player imagery.
- Category navigation resolves to one column by 430 px to preserve full labels and touch geometry.
- The data table remains an intentional horizontal-scroll surface at narrow widths/200% zoom rather than widening the document.

## Staff Team / Owners

Staff Team owns the username-synchronized interactive Minecraft owner models.

Static expectations:

- both owner profiles keep equal structural weight;
- owner layouts collapse to one column below 980 px;
- the viewer frame reduces progressively through tablet/phone breakpoints without clipping the model;
- each viewer remains keyboard focusable;
- ArrowLeft/ArrowRight rotate yaw, ArrowUp/ArrowDown adjust pitch, and Home restores that owner's own initial orientation;
- pointer dragging rotates the model without causing page scroll while drag is active;
- canvas rendering uses nearest-neighbor pixel fidelity;
- both classic/Steve and slim/Alex skins render with correct geometry/UVs;
- Klezee's head outer-layer side textures remain correctly oriented;
- live texture lookup remains keyed by `Klezee` and `PxlMads`;
- provider failure degrades to a readable username-based image fallback;
- no visible `Drag to rotate` helper label returns;
- Light/Dark changes affect the viewer stage, floor/shadow and card only; skin texture pixels remain unchanged.

Browser/network QA must additionally verify CORS/canvas behavior and both usernames resolving correctly.

## About / License

- About overview routes collapse 4 → 2 → 1 columns without oversized empty cards.
- The About “Start here” route points to Getting Started.
- FAQ `<details>` remain keyboard operable and summaries do not clip at 390 px or 200% zoom.
- Tebex actions wrap/stack without overflow.
- Minecraft disclaimer, licensing/attribution and external-service notes remain prominent and readable.
- `license.html` retains readable line length, keyboard navigation and a clear path back to About.
- Policy/disclaimer/legal panels remain readable in Light mode and use the warm Pixel palette rather than residual generic blue glows.

## Store

- Store panels, category surfaces, Shop CTA and rank-information dialog remain usable at every required width.
- The Store-page `Open Shop` action is a deliberate prominent-commerce tier: 72 px desktop / 64 px touch, while ordinary body controls remain 44/48 px. This is intentional hierarchy, not arbitrary scale drift.
- The rank dialog collapses from five columns to two and then one column before tier content becomes cramped.
- Light mode must retain clear hierarchy between neutral informational surfaces and the strongest gold purchase CTA.
- Modal/backdrop focus and contrast remain readable in both effective themes.

## Community / Leaderboards

- Community routes to Leaderboards, Changelog, Rules and Staff Team plus Discord.
- No visible Forum navigation or Forum product UI remains.
- Leaderboards frontend states remain usable even while the authoritative server-backed source is pending; empty/source-pending state must not be mistaken for rankings.

## Shared footer

- Footer links remain reachable and wrap naturally.
- Minecraft disclaimer and rights boundary remain readable without dominating the page.
- Guide/Worlds/Nexus may keep visual-family background treatment while sharing the normalized footer structure.
- The legal block never creates page-level horizontal overflow.
- Footer surfaces and link/focus states remain legible in both effective themes.

## Play modal

- Dialog width and height remain viewport-bounded.
- Narrow layouts stack footer actions.
- Focus trapping, Escape close and focus restoration remain implemented without runtime inline styles.
- Backdrop, steps, IP control and footer actions remain readable in both effective themes.
- Short-height landscape bounds the dialog against `100dvh` rather than allowing the authored desktop height to escape the viewport.

## Crawl / compatibility surfaces

- Deployment remains a GitHub Pages project site under `/PixelWeb/`.
- `sitemap.xml` contains indexable product/Guide/About/License pages, including Currencies and Basic Commands.
- `forum.html` and `404.html` remain excluded from the sitemap and declare `noindex` where appropriate.
- `forum.html` remains a compatibility redirect to Community.
- `development.html` remains only a legacy redirect to Guide.

## Automated structural guards

Repository validators remain useful when they actually execute, but the owner has temporarily disabled Quality Gate usage because of account/payment runner problems. A configured workflow must not be reported as PASS without execution.

## Browser verification checklist

1. No unexpected page-level horizontal scrolling at 1440 / 1024 / 768 / 430 / 390 px in either effective Light or Dark.
2. Appearance control selects System / Light / Dark by pointer/touch and keyboard.
3. Explicit Light/Dark persists across reloads and same-origin navigation.
4. System follows the current browser/OS preference and updates live when that preference changes.
5. Browser `theme-color` follows the effective theme where supported and persisted mode does not produce an obvious opposite-theme first-paint flash.
6. Default, hover, focus, active, selected, loading, failure, empty, modal/backdrop and feedback states remain readable in both themes.
7. Marketplace large/small canvases expose visible loading/failure feedback and preserve original model textures/interaction.
8. Worlds/Nexus imagery remains source-identical and uncropped while Light/Dark overlays, rails, metadata and dialogs adapt correctly.
9. Leaderboards Top 3 / Top 10 / Full / empty-source states remain readable and structurally correct in both themes.
10. Explore / Guide / Community desktop hover behavior opens/closes without sticky pointer-click state.
11. Mobile/touch navigation still opens explicitly at 980 px and below.
12. Keyboard focus, ArrowDown and Escape remain usable in global navigation.
13. Guide rail order starts with Getting Started, then Currencies and Basic Commands, and all nine Guide categories remain reachable on narrow screens.
14. `guides.html` without a hash activates Getting Started.
15. Guide Browse dropdowns, search, direct child links and anchor targets work on desktop/mobile.
16. Getting Started shows server basics without depending on DOM injection.
17. Specialized Guide pages retain correct Light/Dark styling without late dark-only or cool-blue regressions.
18. Skip to content moves both scroll position and focus to `<main>` and remains visually readable in both themes.
19. Play modal is fully reachable and escapable with mouse, touch and keyboard in both themes.
20. Focus indicators are visible and unclipped.
21. Typography remains readable at 200% zoom.
22. Images are not stretched or unintentionally cropped; Abyss + Astral remain complete and original media is not replaced/recompressed by theme switching.
23. Staff Team shows equal owner-card visual weight and both skins resolve/render correctly without theme-driven recoloring.
24. Pointer/keyboard skin interactions and Home reset work for both owners.
25. About FAQ, Tebex CTA and license route remain usable and readable in Light/Dark.
26. Store CTA/modal hierarchy remains clear in Light/Dark.
27. Shared footer remains readable across visual families and themes.
28. Direct Forum/Development legacy URLs redirect correctly without retired UI returning.
29. Home immersive media remains deferred and reduced-motion stable in both themes.
30. Browser console shows zero uncaught first-party errors and first-party CSP violations during theme changes and normal interaction.
31. Network panel shows no insecure HTTP subresources and no theme switch unexpectedly replaces/re-downloads authored source imagery as alternate theme assets.
32. Short-height landscape remains usable for navigation, Guide, Play modal, Staff, About and License in both effective themes.

## Release rule

Static/source review is not browser proof. Do not mark browser-specific behavior PASS until the real browser matrix has been executed in both effective themes and representative System-mode switching has been verified.

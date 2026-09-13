# Security & Release Regression QA Checklist

This checklist records the current PixelWeb contracts. A configured control is not a passed control; browser or workflow claims require actual execution evidence.

## Current release posture

- Record the exact candidate/main SHA before declaring a deployment live.
- Confirm GitHub Pages ran against that exact SHA and finished successfully.
- The owner has temporarily disabled Quality Gate execution because of account/payment runner issues. Do not block ordinary frontend fixes on that workflow or claim it passed until this override is reversed and a real run executes.

## Navigation and page integrity

- All local navigation links resolve.
- Every local same-page/cross-page fragment resolves to an existing destination `id`.
- Local images/scripts/styles/deferred media resolve inside intended public roots.
- External `_blank` links include `rel="noopener"`.
- No duplicate IDs exist.
- Above 980 px with a fine pointer, Explore / Guide / Community retain desktop hover behavior; at 980 px and below explicit mobile click/touch behavior remains available.
- Keyboard opening/focus/Escape remain independent paths.
- Guide remains selected for detailed `guide-*.html` pages.
- Skip to content moves focus to `<main>`.
- Contextual sibling navigation uses these canonical groups:
  - Explore → Gameplay / Systems / Worlds / Skyblock / Nexus;
  - Guide → Getting Started / Currencies / Basic Commands / Progression / Mechanics / Tools / Armor / Specials / Boosts;
  - Community → Leaderboards / Changelog / Rules / Staff Team.
- Getting Started is the first Guide item and the default for `guides.html` without a hash.
- Current destination and parent global group use an active treatment without relying on color alone.
- Context rails remain horizontally usable at narrow widths without page-level overflow.
- Contextual rails use the current 48px structural geometry; mobile Worlds/Nexus immersive viewport math accounts for the measured 65px header + 48px rail (113px total), with the documented compact landscape variant.
- Warm gold/amber/orange/copper is the shared interaction-accent language; approved artwork is not recolored.
- No visible Forum or Development navigation returns.

## Appearance / theme regression

Verify the appearance system as a real browser/runtime feature, not only as a source-level selector audit.

- `System`, `Light` and `Dark` are all selectable and keyboard reachable.
- `System` resolves to the browser/OS preference; it is not treated as a third color palette.
- Changing the browser/OS color-scheme preference while `System` is selected updates the effective theme without requiring a reload.
- An explicit `Light` or `Dark` choice persists across same-origin navigation and reloads and is not overwritten by later OS preference changes.
- The browser `theme-color` follows the effective theme where supported.
- No first paint visibly flashes the opposite theme after a persisted preference is already available.
- Default, hover, focus, active, selected, loading, failure, empty, modal/backdrop and feedback states remain legible in both effective themes.
- Shared toast, skip-link, Pixel Navigator, Play dialog and mobile navigation retain adequate foreground/background/border contrast.
- Marketplace 3D stage and item previews show intentional loading and failure feedback rather than collapsing into a blank canvas.
- Leaderboards Top 3, Top 10, full table, empty/source state, metric controls and player-image fallbacks remain readable in both themes.
- Worlds and Nexus preserve their immersive media while their overlays, rails, metadata, counters, investigation controls and dialogs adapt correctly.
- Staff skin viewers preserve the original skin texture; only stage/card/shadow treatment changes.
- Store, About, License and specialized Guide pages do not regress to dark-only nested panels or cool-blue generic accents in Light mode.
- Generic interaction accents remain warm gold/amber/orange/copper; semantic/authored colors such as Discord identity, biome/world identity and boss artwork may remain distinct.
- Approved World/Nexus images, Nexus boss PNGs, Minecraft skins, Marketplace model textures and authored logos are not replaced, recompressed or downscaled by theme switching. The Discord header Symbol is a documented presentation exception: its official source SVG and geometry stay unchanged while CSS may tint the rendered glyph for effective-theme contrast.
- Reduced-motion mode must not be broken by theme-specific animation/status feedback.

## Guide content and Browse integrity

- `guides.html` statically owns the canonical nine-category Guide IA; JavaScript must not be required to create foundation categories.
- Categories remain ordered: Getting Started, Currencies, Basic Commands, Progression, Mechanics, Tools, Armor, Specials, Boosts.
- Browse category counts are not displayed.
- Internal organizational labels such as Start here / Account / Journey are not displayed.
- Fake `Category overview` rows are absent.
- Every visible Browse child is a real destination.
- Currencies exposes direct destinations for Coins, Pixels and Nexus Points.
- Basic Commands exposes direct destinations for the currently documented player commands.
- Guide search filters the content cards and corresponding Browse destinations coherently.
- Getting Started contains its server-basics section statically and links to Currencies, Basic Commands and Progression.
- `guide-getting-started.js` hydrates shared public facts only; it must not reconstruct the document IA.
- Nexus is never presented as World 5.
- Shared numeric facts read from canonical owners where one exists.
- Secret Talisman discovery inputs remain concealed.
- Unverified live-client behavior remains explicitly bounded rather than being upgraded from source evidence alone.

## Header actions

- Desktop Discord uses Discord's official Symbol asset and does not display competing text copy.
- The Discord source Symbol is not redrawn, replaced or stretched. Its rendered CSS tint is allowed to follow the effective theme for contrast without modifying the source asset.
- Discord and Play are theme-aware secondary controls: Dark retains the compact charcoal treatment; Light uses the approved light/semantic treatments. Store remains the strongest gold purchase CTA.
- All three header controls preserve their compact 40px shell/alignment contract.
- Discord remains keyboard focusable with an accessible label.
- Mobile navigation retains readable Discord and Store destinations and Play remains directly available in the compact header.

## Canonical public data

- `data/network.js` remains the shared owner for network facts.
- Current World route remains exactly Overworld → Pirate Kingdom → Nether → Winter; Nexus remains outside the World array.
- Per-World mine counts sum to the canonical total.
- World/Nexus encounter counts remain internally consistent.
- Skyblock remains source-verified / partial and does not advertise incomplete collaboration as finished.
- Public external destinations use approved HTTPS URLs.
- Store monetary thresholds remain unpublished while unverified.
- Coins, Pixels and Nexus Points are treated as distinct currency concepts; no invented conversion is published.

## Staff Team / owner skin viewers

- Klezee and PxlMads retain equal Owner status and equal structural weight.
- About does not duplicate owner cards.
- `team-models.js` resolves textures by username.
- Classic/Steve and slim/Alex arm geometry/UVs both remain supported.
- Base and outer skin layers render without smoothing-related blur.
- Klezee head outer-layer side orientation remains corrected without changing the other head faces.
- Pointer drag rotates and releases pointer capture correctly.
- ArrowLeft/ArrowRight rotate yaw; ArrowUp/ArrowDown adjust pitch; Home resets each owner to that viewer's own initial angle.
- No visible `Drag to rotate` helper label returns.
- Provider failure produces the username-based fallback instead of an empty frame.
- Browser/network QA must confirm provider CORS/canvas behavior before calling remote skin rendering browser-verified.

## About / legal information

- `team.html` remains canonical About route.
- About contains FAQ, Store/Tebex boundaries, Minecraft independence disclaimer, external-service notes, licensing and attribution.
- About Start here points to Getting Started.
- About does not invent prices, thresholds, refund promises or unpublished support terms.
- Official Store CTA resolves to approved Tebex HTTPS destination.
- `LICENSE` remains canonical repository license and `license.html` public-readable copy.
- Pixel-owned and third-party materials retain separate rights boundaries.

## Leaderboards

- Leaderboards frontend may expose structure, tabs, empty/source-pending states and verified timestamps.
- Do not publish player positions, scores or inferred rankings until an authoritative server-backed source is connected.
- Empty state must not look like a zero-score ranking table.

## Media integrity

- `assets/nexus/raphael.png`, `azazel.png`, `abyss.png`, `astral.png` remain the approved original 1448×1086 PNGs.
- No AVIF/WebP conversion, recompression or downscale is introduced.
- Abyss + Astral remain independent complete 4:3 images.
- The retired immersive story/video runtime remains absent from the public bundle unless it is intentionally reintroduced as a reviewed feature.

## Crawl / publication behavior

- `sitemap.xml` includes all indexable current product/Guide/About/License pages, including Currencies and Basic Commands.
- Every indexed page keeps one absolute HTTPS canonical matching its intended URL.
- Indexed pages retain coherent source Open Graph/Twitter metadata.
- `forum.html`, `development.html` and `404.html` remain outside the sitemap and explicitly noindex where applicable.
- `forum.html` remains a legacy redirect to Community; `development.html` remains a legacy redirect to Guide. Neither returns as a current navigation family.
- Public bundle must exclude docs/scripts/internal repo artifacts if/when the `_site/` publication model is used.

## Browser behavior

Verify Home, Gameplay, Worlds, Nexus, Systems, Skyblock, Store, Marketplace, Community, Leaderboards, Changelog, Rules, Staff Team, About, License, Guide and every detailed Guide. Forum/Development are tested only as compatibility redirects.

At minimum confirm:

- no uncaught first-party console errors;
- no first-party CSP violations;
- global nav hover/touch/keyboard behavior works at the 980 px boundary;
- Guide contextual rail contains all nine current categories and starts with Getting Started;
- Guide Browse/search/direct anchors work on desktop and mobile;
- Play modal focus trap/Escape/restore behavior works;
- appearance selection and effective-theme behavior match the Appearance / theme regression section;
- skin textures resolve and interaction/fallback behavior works;
- About FAQ/details, Tebex and license links remain accessible;
- shared footer remains present/readable;
- no unexpected HTTP subresources;
- no image stretch/crop regressions.

## Responsive matrix

Verify at minimum **1440, 1024, 768, 430 and 390 CSS px**, plus short-height landscape and 200% browser zoom.

Run the matrix in both effective `Light` and `Dark`; additionally verify `System` resolution/switching at representative desktop and mobile widths. Check no unexpected horizontal overflow, clipped controls/text, overlapping content/media, inaccessible navigation or unintended image crop/stretch. Intentional rails/tables may scroll independently.

## Final rule

Source review, successful Pages deployment and browser verification are separate claims. Report each only when its actual evidence exists.

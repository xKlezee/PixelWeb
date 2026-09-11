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
- Worlds/Nexus retain their 50px contextual-rail geometry.
- Warm gold/amber/orange/copper is the shared interaction-accent language; approved artwork is not recolored.
- No visible Forum or Development navigation returns.

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
- Discord symbol is not redrawn, stretched or recolored.
- Discord and Play remain neutral gray; Store remains the strongest gold purchase CTA.
- All three header controls preserve their compact 40px shell/alignment contract.
- Discord remains keyboard focusable with an accessible label.
- Mobile navigation retains readable Discord and Store destinations.

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
- Home immersive video remains deferred and reduced motion avoids unnecessary loading.

## Crawl / publication behavior

- `sitemap.xml` includes all indexable current product/Guide/About/License pages, including Currencies and Basic Commands.
- Every indexed page keeps one absolute HTTPS canonical matching its intended URL.
- Indexed pages retain coherent source Open Graph/Twitter metadata.
- `forum.html` and `404.html` remain outside the sitemap and noindex where applicable.
- `development.html` remains a legacy redirect to Guide, not a current navigation family.
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
- skin textures resolve and interaction/fallback behavior works;
- About FAQ/details, Tebex and license links remain accessible;
- shared footer remains present/readable;
- no unexpected HTTP subresources;
- no image stretch/crop regressions.

## Responsive matrix

Verify at minimum **1440, 1024, 768, 430 and 390 CSS px**, plus short-height landscape and 200% browser zoom.

Check no unexpected horizontal overflow, clipped controls/text, overlapping content/media, inaccessible navigation or unintended image crop/stretch. Intentional rails/tables may scroll independently.

## Final rule

Source review, successful Pages deployment and browser verification are separate claims. Report each only when its actual evidence exists.

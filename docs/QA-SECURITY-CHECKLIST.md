# Security & Release Regression QA Checklist

Run this checklist against the exact candidate HEAD before promoting substantial PixelWeb frontend changes to `main`.

A configured control is not a passed control. Record the actual result for the exact candidate commit.

## Repository / automated gate

- Record the exact candidate HEAD before validation.
- `PixelWeb Quality Gate` must start a real runner and expose repository steps before its result is interpreted as validator PASS/FAIL.
- Python syntax compilation completes for committed Python validators/builders.
- `python3 scripts/security_scan.py` completes successfully.
- `python3 scripts/validate_media_integrity.py` completes successfully.
- `node --check` completes successfully for repository JavaScript.
- `node scripts/validate_public_data.js` completes successfully.
- `python3 scripts/validate_site.py` completes successfully.
- `python3 scripts/validate_social_metadata.py` completes successfully.
- `python3 scripts/validate_runtime_contracts.py` completes successfully.
- `python3 scripts/validate_accessibility.py` completes successfully.
- `python3 scripts/validate_player_facing_copy.py` completes successfully.
- `python3 scripts/build_public_site.py` stages `_site/` successfully.
- `python3 scripts/validate_public_bundle.py` validates the staged publication boundary successfully.
- A workflow startup failure with no runner/steps is classified as infrastructure/account state, not code PASS/FAIL.

## Navigation and page integrity

- All local navigation links resolve.
- Every local same-page/cross-page fragment resolves to an existing destination `id`.
- Local images/scripts/styles/deferred media resolve inside the intended repository/public roots.
- External `_blank` links include `rel="noopener"`.
- No duplicate IDs exist.
- Above 980 px with a fine pointer, Explore / Development / Community retain hover-only pointer behavior without click-pinning.
- At 980 px and below, explicit mobile click/touch group behavior remains available.
- Keyboard opening/focus/Escape remain independent supported paths.
- Guides remains selected for detailed `guide-*.html` pages.
- Skip to content is the first useful keyboard route on standard pages and moves focus to `<main>`.
- Contextual sibling navigation appears only for the current category:
  - Explore → Gameplay / Systems / Worlds / Skyblock / Nexus;
  - Development → Development / Changelog;
  - Community → Community / Guides.
- The current contextual destination and its parent global group use the Pixel Blue active treatment without relying on color alone for meaning.
- The contextual rail remains horizontally usable at narrow widths and does not create page-level overflow.
- No visible Forum destination/copy reappears in global or contextual navigation, including before runtime navigation replacement.

## Forum retirement

- Forum is not exposed as an active product surface.
- Community contains no Forum preview card, post UI, account UI or Forum CTA.
- Home does not describe Forum as a destination.
- `data/network.js` contains no active Forum landing/state model.
- `validate_public_data.js` does not require a Forum preview contract.
- Former Forum-only JavaScript/CSS files remain removed.
- `forum.html` contains only the compatibility redirect surface, declares `noindex,nofollow,noarchive`, and redirects to `community.html` without loops.
- `forum.html` remains excluded from `sitemap.xml`.

## Canonical public data

- `data/network.js` remains the single owner for shared public network facts.
- Current World route remains exactly Overworld → Pirate Kingdom → Nether → Winter; Nexus remains outside the World array.
- Per-World mine counts sum to the canonical total.
- World/Nexus encounter counts remain internally consistent.
- Nexus access remains permanent at its canonical unlock without silently acquiring a Viking/boss requirement.
- Skyblock remains `source-verified / partial`; incomplete collaboration remains outside the current feature list.
- Public external destinations use approved canonical HTTPS URLs.
- Store thresholds remain unpublished while `thresholdsVerified` is false.

## About / owner skin viewers

- About keeps Klezee and PxlMads equal in owner status/visual weight.
- `team-models.js` resolves skin textures by the configured usernames rather than repository-pinned owner renders.
- Both viewers render readable Minecraft geometry without smoothing-related blur.
- Pointer drag rotates the model and releases pointer capture correctly.
- ArrowLeft/ArrowRight rotate yaw; ArrowUp/ArrowDown adjust pitch.
- Home resets each owner to that viewer's own initial angle.
- Keyboard focus indicator remains visible around each viewer.
- Provider failure leaves a readable status rather than an empty/broken owner panel.
- Product copy describes the skin as username-synchronized rather than implying instant update guarantees.
- The no-JavaScript fallback also uses username-based remote renders.
- Browser/network QA confirms the selected skin provider permits the CORS behavior required for canvas rendering.

## Dynamic rendering / CSP

- Future/API-controlled text is rendered through safe DOM construction / `textContent` where appropriate.
- No user-controlled value is interpolated into inline JavaScript.
- No string-to-DOM parsing sink is introduced.
- No direct runtime inline-style mutation is introduced.
- Dynamic URLs are constrained to expected scheme/origin where appropriate.
- Contextual navigation is constructed from the same canonical runtime navigation model rather than duplicated independent data.
- About's remote skin requests remain governed by the page's existing `img-src` policy and do not require weakening script/style CSP.

## Guide content integrity

- Guide evidence remains separate from feature state.
- Shared numeric facts read from canonical owners where one exists.
- `guides.html` retains one primary entry for each detailed `guide-*.html` page.
- Browser-public Guide copy avoids repository/deployment/database implementation detail guarded by `validate_player_facing_copy.py`.
- Nexus is never presented as World 5.
- Progression reset/reward/XP/persistence semantics remain unpublished until independently re-verified.
- Secret Talisman discovery inputs remain concealed.
- Existing Talisman and Enchantment evidence/scopes remain unchanged by this frontend iteration.

## Media integrity

- `assets/nexus/raphael.png`, `azazel.png`, `abyss.png`, `astral.png` remain byte-identical approved 1448×1086 PNGs.
- No automatic AVIF/WebP conversion, recompression or downscale is introduced.
- Abyss + Astral remain two independent complete 4:3 source images.
- Home immersive video remains deferred and reduced-motion avoids unnecessary loading.

## Crawl / publication behavior

- `sitemap.xml` contains all indexable product/Guide pages and excludes non-indexed compatibility/error pages.
- Every sitemap-indexed page keeps one absolute HTTPS canonical matching its sitemap URL.
- Indexed pages retain coherent source Open Graph/Twitter metadata.
- `forum.html` and `404.html` remain outside the sitemap and `noindex`.
- Canonical/social metadata remains source HTML, not runtime-injected.
- `_site/` remains derived from explicit publication roots/dependencies rather than arbitrary repository files.
- `docs/`, `scripts/`, `.github/`, env files, private keys, logs/databases and internal repository artifacts remain absent from the intended public bundle.
- The prepared `_site/` artifact is not called the live deployment source unless Pages is actually migrated to it.

## Browser behavior

Verify Home, Gameplay, Worlds, Nexus, Systems, Skyblock, Store, Community, Development, Changelog, About and every detailed Guide. Direct `forum.html` is tested only as a legacy redirect.

At minimum confirm:

- no uncaught first-party console errors;
- no first-party CSP violations;
- global nav hover/touch/keyboard behavior works at the 980 px boundary;
- contextual sibling rail is correct and active state follows the current page;
- Play modal focus trap/Escape/restore behavior works;
- Guide sidebars/rails/search/tables remain usable;
- owner skin textures resolve and both canvases can be rotated with pointer and keyboard;
- owner viewer failure state remains usable;
- direct `forum.html` redirects to Community and no Forum UI flashes first;
- reduced-motion mode remains usable;
- no unexpected HTTP subresources are requested.

## Responsive matrix

Verify at minimum **1440, 1024, 768, 430 and 390 CSS px**, plus short-height landscape and 200% browser zoom.

At every width check:

- no unexpected page-level horizontal overflow;
- no clipped controls/text;
- no overlapping content/media;
- no inaccessible navigation;
- no unintended image crop/stretch;
- contextual rails/tables remain independently scrollable where intentional;
- owner viewer dimensions remain balanced with the owner copy.

Do not mark a viewport PASS from CSS/source inspection alone.

## Final merge gate

The branch is ready to promote only when both are true:

1. the automated quality gate has actually executed and passed on the exact final candidate HEAD; and
2. the browser/render matrix has been completed with findings remediated and rechecked.

Until then, keep the work isolated from stable `main` and do not describe it as browser-verified.

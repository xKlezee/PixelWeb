# Security & Release Regression QA Checklist

Run this checklist after security/documentation refactors and before moving the hardening pull request out of draft or merging to `main`.

A configured control is not a passed control. Record the actual result for the exact candidate HEAD.

## Repository / automated gate

- The exact candidate HEAD is recorded before validation.
- Manual dispatch is started with the exact candidate branch/tag/SHA in `target_ref`.
- `PixelWeb Quality Gate` starts a real runner and exposes repository steps.
- Python syntax compilation completes for every committed Python validator/builder.
- `python3 scripts/security_scan.py` completes successfully.
- `python3 scripts/validate_media_integrity.py` completes successfully.
- `node --check` completes successfully for every repository JavaScript file in scope.
- `node scripts/validate_public_data.js` completes successfully.
- `python3 scripts/validate_site.py` completes successfully.
- `python3 scripts/validate_runtime_contracts.py` completes successfully.
- `python3 scripts/validate_accessibility.py` completes successfully.
- `python3 scripts/validate_player_facing_copy.py` completes successfully.
- `python3 scripts/build_public_site.py` successfully stages the reference-driven `_site/` artifact.
- `python3 scripts/validate_public_bundle.py` successfully validates the staged publication boundary and all local HTML/deferred-media/CSS dependencies.
- A workflow startup failure with no runner/steps is classified as infrastructure/account startup failure, not as a passing or failing validator result.
- The current account-level billing lock is resolved separately; no check is weakened, skipped or removed merely to obtain green status.

## Navigation and page integrity

- All local navigation links resolve.
- All local images/scripts/styles referenced by top-level HTML exist.
- Deferred local media referenced through `data-src`, `data-poster` or `data-srcset` resolves and stays inside the repository root.
- Local CSS `url(...)` and quoted `@import` dependencies resolve inside declared public roots and remain present in `_site/`.
- External `_blank` links include `rel="noopener"`.
- No duplicate IDs exist within a page.
- Keyboard navigation remains usable after removal of inline handlers.
- Canonical runtime navigation remains consistent across overview pages and detailed `guide-*.html` pages.
- Above 980 px with a fine pointer, Explore / Development / Community are hover-only pointer targets: entering a group opens it, moving into its dropdown keeps it open, leaving the group closes it, and a mouse/trackpad click does not pin it open.
- At 980 px and below, navigation uses explicit click/touch `.is-open` state even when a fine pointer is attached; the desktop hover-only rule must not disable the mobile-layout buttons.
- Keyboard opening, focus movement and Escape remain available independently from the pointer-only desktop rule.
- Every detailed `guide-*.html` fallback navbar marks exactly `guides.html` as `aria-current="page"`; no product-overview link simultaneously claims to be the current global destination.
- Every same-page Guide link such as `#overview`, `#verification` or a sidebar section points to an ID that actually exists on that page.
- Guides remains reachable from global Community navigation.
- First keyboard focus exposes the global Skip to content link on standard pages.
- Activating Skip to content moves both viewport and keyboard focus to the actual `<main>` region.

## Canonical public data

- `data/network.js` remains the single owner for shared public network facts.
- `content.currentWorlds` equals the actual World array length.
- The current route remains exactly Overworld → Pirate Kingdom → Nether → Winter; Nexus remains outside the World array.
- Summed per-World mine counts equal the canonical total mine count.
- Declared World Boss encounters equal the encounters represented by each World plus optional encounters.
- Nexus encounter, individual-boss and difficulty-tier counts remain internally consistent.
- Nexus access remains permanent at its canonical unlock and does not silently acquire a Viking/boss requirement.
- Forum remains `preview`, non-persistent and without a claimed account system until the backend architecture exists.
- Skyblock remains `source-verified / partial`; incomplete collaboration controls stay outside the current feature list and use player-facing `Partial` / `Planned` descriptions rather than implementation details.
- Public external URLs in the canonical model use HTTPS and match approved project destinations; local landing destinations resolve to top-level public HTML files.
- Store thresholds remain unpublished while `thresholdsVerified` is false.

## Dynamic rendering

- User-controlled or future API-controlled text is rendered with `textContent` or equivalent context-safe encoding.
- No user-controlled value is interpolated into inline JavaScript.
- Dynamic `href` / `src` values are validated against expected schemes/origins where appropriate.
- Forum preview content renders HTML-like payloads as inert text.
- Forum preview display names, post titles and post bodies stay within the JavaScript-enforced preview limits even if mutable HTML `maxlength` attributes are removed or changed in DevTools.
- Guide renderers use safe DOM construction (`createElement`, `textContent`, `append`, `replaceChildren`) rather than HTML parsing sinks.
- No runtime inline-style mutation is introduced, including direct `element.style = ...` assignment.

## Guide content integrity

- Every detailed Guide either states a defined evidence level (`source-verified`, `server-verified`, `live-client-verified`, `reconciled-reference`) or is explicitly labeled as a non-evidence reference role such as orientation/current public reference; generic `Verified guide` badges are not used as a substitute for provenance.
- Evidence is kept separate from factual feature state (`current`, `partial`, `staged`, `planned`, `unknown`, `deprecated/retired`).
- A source-verified but partial system is not presented as fully player-available.
- Shared numeric facts are read from their canonical owner rather than copied into multiple guide files.
- The primary library in `guides.html` contains exactly one `data-guide-entry` for every current `guide-*.html` detail page and contains no duplicate/orphan primary entries.
- Player-facing HTML/data/renderer copy does not expose repository-test, database-path, command/menu-wiring, deployment-state or equivalent implementation terminology covered by `validate_player_facing_copy.py`.
- Nexus is never presented as World 5.
- The current World route remains exactly four Worlds: Overworld, Pirate Kingdom, Nether, Winter.
- Skyblock collaboration controls remain partial/planned until the complete player-facing feature is independently re-verified.
- Progression reset/reward/XP/persistence semantics remain unpublished until independently re-verified.
- Mining-specific stat coverage remains outside the current Stats guide until it receives its own evidence pass.
- Secret Talisman discovery trees, protected combinations and anti-abuse-sensitive inputs are not exposed in public Guide data.
- Talisman player-facing facts remain intact where documented: `/codex`, `/bag`, seven equipped slots, World Affinity `+3%`, world-neutral Synergy and strongest-only qualifying Meta behavior.
- Enchantments keeps evidence scope separate from any unperformed live-client claim and does not publish repository/CI test-harness internals.
- Legacy GitBook claims never override current evidence.
- Guides search result-count changes are announced without moving focus, and Escape clears the current query.
- Sidebar in-page links land below sticky navigation rather than hiding the anchored heading.

## Media integrity

- `assets/nexus/raphael.png`, `azazel.png`, `abyss.png` and `astral.png` remain original PNG assets unless the owner explicitly requests a source-asset change.
- `validate_media_integrity.py` confirms each approved file's expected byte size, 1448×1086 dimensions and exact Git blob SHA.
- No automatic AVIF/WebP conversion, recompression or resolution reduction is introduced for those approved boss images.
- Performance improvements use loading, decoding, priority and layout behavior instead of silently changing the originals.
- Abyss + Astral render as two independent source images in the dual encounter.
- The deliberate logical Abyss/Astral filename inversion documented in `data/nexus-media.js` is not "corrected" without visual/source verification.

## Home loading behavior

- `Video_Perfecto_Con_Fondo_Negro.mp4` has no eager `src` in the initial Home HTML.
- The video retains `preload="none"` and a local `data-src` hydration source.
- The deferred local video path is covered by `validate_runtime_contracts.py`.
- Normal-motion browsing does not request the MP4 until the immersive section approaches its configured hydration margin or the user directly activates a story chapter.
- Scroll scrubbing never seeks before valid metadata/duration is available.
- `prefers-reduced-motion: reduce` does not hydrate/request the MP4 during normal use.
- Deferring the MP4 does not collapse the story layout or hide textual content.

## Crawl / publication behavior

- `sitemap.xml` contains all indexable top-level public product/Guide pages and excludes `noindex` pages.
- Every sitemap-indexed page declares exactly one static absolute HTTPS `rel="canonical"`.
- Each canonical URL matches that page's exact public URL in `sitemap.xml`; `index.html` maps to `https://xklezee.github.io/PixelWeb/` rather than `/index.html`.
- Missing, duplicate, relative, non-HTTPS, mismatched or non-sitemap canonicals are rejected by `validate_site.py`.
- Forum preview and `404.html` retain page-level `noindex` and remain outside the sitemap-indexed canonical requirement.
- Canonical metadata is present in source HTML and is not injected by JavaScript or the `_site/` builder.
- `robots.txt` does not contain a blanket `Disallow: /`.
- On the current `https://xklezee.github.io/PixelWeb/` project-site deployment, repository-level `PixelWeb/robots.txt` is **not** treated as the authoritative host robots policy; crawlers request `/robots.txt` at the host root.
- No privacy/security claim relies on crawler exclusion. Files deployed through GitHub Pages are treated as public.
- `_site/` is derived from explicit publication roots rather than arbitrary root file extensions.
- Sitemap pages plus explicitly `noindex` Forum/404 are the only top-level HTML allowed into `_site/`.
- Root resources are included only through the public HTML/CSS dependency graph or the explicitly declared runtime-loaded Play-modal stylesheet.
- `docs/`, `scripts/`, `.github/`, `.env*`, repository README/security-operation files, key/certificate material, logs and databases are absent from `_site/`.
- Files inside browser-public `assets/` and `data/` remain restricted to expected static/browser data types.
- Root-relative URLs that would escape the `/PixelWeb/` project-site base are rejected.
- Home canonical/Open Graph/Twitter URLs resolve to the intended current public base.
- Unknown routes render the branded 404 without broken local resources.
- The prepared `_site/` model is not called the live deployment boundary until Pages has actually migrated to an Actions-built artifact.

## Browser behavior

- Home, Gameplay, Worlds, Nexus, Systems, Skyblock, Store, Community, Forum, Development, Changelog, About/Team and every detailed Guide load without uncaught console errors.
- Reduced-motion behavior still works.
- Play modal focus trap, Escape close and focus restoration work.
- Forum entry dialog receives initial focus, traps Tab/Shift+Tab while active and remains scroll-reachable on short viewports.
- Forum post modal focus and Escape behavior work and restore focus to the source card.
- Desktop fine-pointer dropdowns follow hover-only behavior without overlap, click-pinning or flicker while crossing from the group label into its dropdown.
- Mobile navigation opens/closes and returns focus correctly, including a desktop browser narrowed to 980 px or below.
- Guide sidebars/section rails remain navigable by keyboard and touch.
- Guide search works at mobile widths and 200% zoom and announces changing result counts appropriately.

## Responsive widths

Verify at minimum **1440, 1024, 768, 430 and 390 CSS px** plus at least one short-height landscape window.

At every width check:

- no unexpected page-level horizontal overflow;
- no clipped controls;
- no overlapping text/media;
- no inaccessible navigation;
- no unintended image crop or stretch;
- no layout shift that hides primary actions;
- intentional table/carousel scrollers remain independently usable.

Do not mark a viewport PASS from CSS inspection alone. Browser-render verification is a separate release gate.

## Accessibility / interaction

- Focus indicators are visible and not clipped.
- Interactive controls have usable pointer/touch target size.
- Status/evidence meaning is not communicated by color alone.
- Every static `<img>` exposes an explicit `alt`, including `alt=""` when truly decorative.
- Every visible text/search input and textarea has an accessible name through a real label or ARIA association.
- Each top-level page has exactly one `<main>` landmark.
- Page remains usable at 200% browser zoom.
- Reduced-motion mode removes nonessential animation without hiding content.
- Keyboard users can reach and dismiss menus/modals without a pointer.

## Security controls

- No real secret appears in the branch diff or committed snapshot.
- No `.env`, private key, credential file, local database, runtime log or private operational report is tracked.
- Public data files contain only intentionally PUBLIC information.
- Guide pages keep `connect-src 'self'` unless a documented feature-level exception is approved.
- Browser-public player documentation contains gameplay/reference content and evidence boundaries, not repository-test/deployment/database internals.
- No security claim relies on DevTools blocking, minification, obfuscation, `robots.txt` or repository privacy.
- No future authentication UI is treated as secure without server-side authorization/session controls.

## Final merge gate

The branch is not ready to merge until both conditions are true:

1. the automated quality gate has **actually executed and passed** on the final candidate HEAD, including player-facing copy, canonical public-data/crawl metadata and `_site/` artifact validation; and
2. the browser/render matrix has been completed with any findings remediated and rechecked.

Keep the pull request in draft while either gate is unresolved.

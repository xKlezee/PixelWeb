# Security & Release Regression QA Checklist

Run this checklist after security/documentation refactors and before moving the hardening pull request out of draft or merging to `main`.

A configured control is not a passed control. Record the actual result for the exact candidate HEAD.

## Repository / automated gate

- The exact candidate HEAD is recorded before validation.
- Manual dispatch is started with the exact candidate branch/tag/SHA in `target_ref`.
- `PixelWeb Quality Gate` starts a real runner and exposes repository steps.
- Python syntax compilation completes for every committed validator.
- `python3 scripts/security_scan.py` completes successfully.
- `python3 scripts/validate_media_integrity.py` completes successfully.
- `node --check` completes successfully for every repository JavaScript file in scope.
- `python3 scripts/validate_site.py` completes successfully.
- `python3 scripts/validate_runtime_contracts.py` completes successfully.
- `python3 scripts/validate_accessibility.py` completes successfully.
- A workflow startup failure with no runner/steps is classified as infrastructure/account startup failure, not as a passing or failing validator result.
- The current account-level billing lock is resolved separately; no check is weakened, skipped or removed merely to obtain green status.

## Navigation and page integrity

- All local navigation links resolve.
- All local images/scripts/styles referenced by top-level HTML exist.
- Deferred local media referenced through `data-src`, `data-poster` or `data-srcset` also resolves and stays inside the repository root.
- External `_blank` links include `rel="noopener"`.
- No duplicate IDs exist within a page.
- Keyboard navigation remains usable after removal of inline handlers.
- Canonical runtime navigation remains consistent across overview pages and detailed `guide-*.html` pages.
- Guides remains reachable from global Community navigation.
- First keyboard focus exposes the global Skip to content link on standard pages.
- Activating Skip to content moves both viewport and keyboard focus to the actual `<main>` region.

## Dynamic rendering

- User-controlled or future API-controlled text is rendered with `textContent` or equivalent context-safe encoding.
- No user-controlled value is interpolated into inline JavaScript.
- Dynamic `href` / `src` values are validated against expected schemes/origins where appropriate.
- Forum preview content renders HTML-like payloads as inert text.
- Guide renderers use safe DOM construction (`createElement`, `textContent`, `append`, `replaceChildren`) rather than HTML parsing sinks.
- No runtime inline-style mutation is introduced, including direct `element.style = ...` assignment.

## Guide content integrity

- Every detailed Guide states or inherits an explicit evidence level.
- Evidence (`source-verified`, `server-verified`, `live-client-verified`, `reconciled-reference`) is kept separate from factual feature state (`current`, `partial`, `staged`, `planned`, `unknown`, `deprecated/retired`).
- A source-verified but partial system is not presented as fully player-available.
- Shared numeric facts are read from their canonical owner rather than copied into multiple guide files.
- Nexus is never presented as World 5.
- The current World route remains exactly four Worlds: Overworld, Pirate Kingdom, Nether, Winter.
- Skyblock collaboration controls remain outside the current feature set until their player-facing wiring is complete and re-verified.
- Progression reset/reward/XP/persistence semantics remain unpublished until independently re-verified.
- Mining-specific stat coverage remains outside the current Stats guide until its producer-to-consumer audit is complete.
- Secret Talisman discovery trees, protected combinations and anti-abuse-sensitive inputs are not exposed in public Guide data.
- Legacy GitBook claims never override current evidence.

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
- Forum preview and `404.html` retain page-level `noindex`.
- `robots.txt` does not contain a blanket `Disallow: /`.
- On the current `https://xklezee.github.io/PixelWeb/` project-site deployment, repository-level `PixelWeb/robots.txt` is **not** treated as the authoritative host robots policy; crawlers request `/robots.txt` at the host root.
- No privacy/security claim relies on crawler exclusion. Files deployed through GitHub Pages are treated as public.
- Home canonical/Open Graph/Twitter URLs resolve to the intended current public base.
- Unknown routes render the branded 404 without broken local resources.

## Browser behavior

- Home, Gameplay, Worlds, Nexus, Systems, Skyblock, Store, Community, Forum, Development, Changelog, About/Team and every detailed Guide load without uncaught console errors.
- Reduced-motion behavior still works.
- Play modal focus trap, Escape close and focus restoration work.
- Forum entry dialog receives initial focus, traps Tab/Shift+Tab while active and remains scroll-reachable on short viewports.
- Forum post modal focus and Escape behavior work and restore focus to the source card.
- Mobile navigation opens/closes and returns focus correctly.
- Guide sidebars/section rails remain navigable by keyboard and touch.
- Guide search works at mobile widths and 200% zoom.

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
- Each top-level page has exactly one `<main>` landmark.
- Page remains usable at 200% browser zoom.
- Reduced-motion mode removes nonessential animation without hiding content.
- Keyboard users can reach and dismiss menus/modals without a pointer.

## Security controls

- No real secret appears in the branch diff or committed snapshot.
- No `.env`, private key, credential file, local database, runtime log or private operational report is tracked.
- Public data files contain only intentionally PUBLIC information.
- Guide pages keep `connect-src 'self'` unless a documented feature-level exception is approved.
- No security claim relies on DevTools blocking, minification, obfuscation, `robots.txt` or repository privacy.
- No future authentication UI is treated as secure without server-side authorization/session controls.

## Final merge gate

The branch is not ready to merge until both conditions are true:

1. the automated quality gate has **actually executed and passed** on the final candidate HEAD; and
2. the browser/render matrix has been completed with any findings remediated and rechecked.

Keep the pull request in draft while either gate is unresolved.

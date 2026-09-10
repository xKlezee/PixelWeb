# Security & Release Regression QA Checklist

Run this checklist after security/documentation refactors and before moving the hardening pull request out of draft or merging to `main`.

A configured control is not a passed control. Record the actual result for the exact candidate HEAD.

## Repository / automated gate

- The exact candidate HEAD is recorded before validation.
- `PixelWeb Quality Gate` starts a real runner and executes its steps.
- `python3 scripts/security_scan.py` completes successfully.
- `node --check` completes successfully for every repository JavaScript file in scope.
- `python3 scripts/validate_site.py` completes successfully.
- A workflow startup failure with no runner/steps is classified as infrastructure/startup failure, not as a passing or failing validator result.
- No check is weakened, skipped or removed merely to obtain green status.

## Navigation and page integrity

- All local navigation links resolve.
- All local images/scripts/styles referenced by top-level HTML exist.
- External `_blank` links include `rel="noopener"`.
- No duplicate IDs exist within a page.
- Keyboard navigation remains usable after removal of inline handlers.
- Canonical navigation remains consistent across overview pages and detailed `guide-*.html` pages.
- Guides remains reachable from global Community navigation.

## Dynamic rendering

- User-controlled or future API-controlled text is rendered with `textContent` or equivalent context-safe encoding.
- No user-controlled value is interpolated into inline JavaScript.
- Dynamic `href` / `src` values are validated against expected schemes/origins where appropriate.
- Forum preview content renders HTML-like payloads as inert text.
- Guide renderers use safe DOM construction (`createElement`, `textContent`, `append`, `replaceChildren`) rather than HTML parsing sinks.
- No runtime inline-style mutation is introduced.

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
- No automatic AVIF/WebP conversion, recompression or resolution reduction is introduced for those approved boss images.
- Performance improvements use loading, decoding, priority and layout behavior instead of silently changing the originals.
- Abyss + Astral render as two independent source images in the dual encounter.

## Browser behavior

- Home, Gameplay, Worlds, Nexus, Systems, Skyblock, Store, Community, Forum, Development, Changelog, About/Team and every detailed Guide load without uncaught console errors.
- Reduced-motion behavior still works.
- Modal/dialog focus and Escape behavior still work.
- Mobile navigation opens/closes and returns focus correctly.
- Guide sidebars/section rails remain navigable by keyboard and touch.
- Guide search works at mobile widths and 200% zoom.

## Responsive widths

Verify at minimum **1440, 1024, 768, 430 and 390 CSS px**.

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
- Page remains usable at 200% browser zoom.
- Reduced-motion mode removes nonessential animation without hiding content.
- Keyboard users can reach and dismiss menus/modals without a pointer.

## Security controls

- No real secret appears in the branch diff or committed snapshot.
- No `.env`, private key, credential file, local database, runtime log or private operational report is tracked.
- Public data files contain only intentionally PUBLIC information.
- Guide pages keep `connect-src 'self'` unless a documented feature-level exception is approved.
- No security claim relies on DevTools blocking, minification, obfuscation or repository privacy.
- No future authentication UI is treated as secure without server-side authorization/session controls.

## Final merge gate

The branch is not ready to merge until both conditions are true:

1. the automated quality gate has **actually executed and passed** on the final candidate HEAD; and
2. the browser/render matrix has been completed with any findings remediated and rechecked.

Keep the pull request in draft while either gate is unresolved.

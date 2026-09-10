# PixelWeb Hardening & Documentation — Implementation Status

This file records the branch state without upgrading controls or gameplay claims beyond evidence actually obtained. It intentionally avoids embedding a "current HEAD" SHA because every documentation update would immediately make that value stale; GitHub branch/PR comparison is the authority for live ref state.

## Implemented on this branch

### Repository and security foundation

- Defensive `.gitignore` for environment files, credentials, keys, generated output, logs, IDE files and local reports.
- `SECURITY.md` with public/private disclosure boundaries and credential-incident handling.
- Dependency-free committed-secret scanner.
- Dependency-free static HTML/JavaScript/CSS integrity and browser-safety validator.
- Dependency-free runtime-contract validator for deferred media references and direct `element.style = ...` assignment.
- Separate dependency-free structural accessibility validator.
- Dedicated byte-level media-integrity validator for the four approved Nexus PNGs.
- Dedicated canonical public-data contract validator (`scripts/validate_public_data.js`) that executes browser-public data files in isolated Node VMs and checks relationships/policy without becoming a second gameplay rendering-data source.
- Reference-driven public artifact builder (`scripts/build_public_site.py`) that stages `_site/` from explicit public HTML roots, declared runtime resources and recursively resolved local CSS dependencies.
- Independent public artifact validator (`scripts/validate_public_bundle.py`) that re-checks the staged publication boundary, local references, file types and project-site URL constraints.
- GitHub Actions Quality Gate with read-only repository permissions and commit-pinned official `actions/checkout`.

### Browser/runtime hardening

- Strict CSP-ready frontend rules: no inline scripts, inline event handlers, inline styles, `javascript:` URLs, string-to-DOM parsing sinks or runtime inline-style mutation are accepted by the validation layers.
- First-party renderers use DOM construction / `textContent` instead of interpolated `innerHTML`.
- Dynamic-code execution patterns are rejected.
- Deferred media URLs in `data-src`, `data-poster` and `data-srcset` are validated as HTTPS external URLs or existing repository-local paths.
- Absolute external HTTP resources are rejected.
- Protocol-relative HTML/CSS resource URLs (`//host/path`) are rejected at source validation, rejected by the public artifact builder before staging, and rejected again by the staged-bundle validator.
- `connect-src` follows per-page least privilege: pages without a live status surface are self-only; pages that expose live Minecraft status may additionally connect only to `https://api.mcsrvstat.us`.
- DevTools/right-click blocking is not used as a security boundary.

### Public destination and media-origin contract

`data/network.js` remains the canonical owner for shared public network facts. `scripts/validate_public_data.js` now also enforces the publication destinations around that data model:

- Discord must remain the approved `discord.gg` invite currently owned by the project;
- Store must remain the approved PixelBoxx Tebex destination;
- legacy documentation and external changelog must remain the approved Pixel Network GitBook routes;
- changing one of those destinations requires an intentional validator/policy update rather than silently accepting any arbitrary HTTPS URL.

World media is validated against the canonical World model:

- media keys must match the four canonical World ids exactly;
- landscape images must use the approved Pixel GitBook image proxy and expected GitBook storage origin;
- boss/optional-boss artwork must remain existing repository-local files under `assets/worlds/`;
- optional boss media may exist only where the canonical World model declares an optional encounter.

This is a publication/security contract, not a second source for gameplay values.

### Public artifact boundary

The prepared `_site/` model separates repository content from future hosted content.

- Sitemap-declared public pages plus Forum/404 seed the artifact.
- Root resources are included only when statically referenced or explicitly declared as runtime-loaded.
- Local CSS `url(...)` and quoted `@import` dependencies are traversed recursively only inside declared public roots.
- `assets/` and `data/` remain intentionally browser-public trees.
- Arbitrary `docs/`, `scripts/`, `.github/`, environment files, logs, databases, keys/certificates and unrelated root files are not part of the artifact.
- Root-relative URLs incompatible with the `/PixelWeb/` project-site base are rejected by the staged-bundle validator.
- Symlinks are fail-closed: the builder rejects symlinked inputs rather than dereferencing them, and the staged-bundle validator rejects symlinks without reading through them.
- Protocol-relative resources are fail-closed across source validation, build and staged validation.

The `_site/` model is prepared but is **not yet the live GitHub Pages source**.

### Crawl, error and metadata layer

- `sitemap.xml` lists indexable public product and Guide pages under the current project-site base URL.
- Forum preview and the branded 404 remain `noindex` and are excluded from the sitemap.
- `404.html` uses maintained Pixel Network destinations, strict CSP/referrer posture and no external runtime dependency.
- Home has canonical/Open Graph/Twitter metadata using the existing official Pixel Network logo.
- The repository-level `robots.txt` is not treated as a privacy or security boundary. On the current `https://xklezee.github.io/PixelWeb/` project-site URL, crawlers request the host-root `/robots.txt`, not a repository-subpath robots file.

### Accessibility and interaction foundation

- Standard public pages expose one canonical runtime navigation model.
- `polish.js` owns canonical mobile-menu state when present, while the basic `site.js` listener remains only as a fallback. The canonical controller captures the toggle event so menu state no longer depends on listener registration order.
- Keyboard users receive a first-focus `Skip to content` route generated by `polish.js`; the real `<main>` is made programmatically focusable when required.
- Navigation dropdowns expose `aria-expanded` / `aria-controls` and support keyboard opening, Escape and focus behavior.
- Play modal retains focus trapping, Escape close and focus restoration without inline styles.
- Forum entry/post dialogs use labelled modal semantics, focus containment and trigger-focus restoration.
- Short-height Forum overlays remain independently scrollable.
- `validate_accessibility.py` checks language, viewport, title, exactly one `<main>`, descriptions on indexable pages and explicit static-image `alt` text.

### Performance and media integrity

- Approved Raphael, Azazel, Abyss and Astral PNGs remain the original repository blobs; they are not recompressed, resized, converted, sprited or replaced.
- `validate_media_integrity.py` enforces exact byte size, 1448×1086 dimensions and Git blob SHA for those four files.
- Abyss + Astral preserve two complete 4:3 source images on responsive layouts.
- Home immersive MP4 has no initial `src`, uses `preload="none"` and is hydrated near the viewport via `IntersectionObserver`.
- Deferred MP4 references are covered by the runtime-contract validator.
- Scroll scrubbing waits for valid metadata/duration before seeking.
- `prefers-reduced-motion: reduce` prevents MP4 hydration/download while retaining the textual story.
- `docs/PERFORMANCE-BUDGET.md` records network-priority, layout-stability and media-integrity release rules.

### Canonical gameplay/public-data invariants

`validate_public_data.js` currently guards, among other relationships:

- exactly four Worlds in order: Overworld → Pirate Kingdom → Nether → Winter;
- Nexus remains separate from Worlds;
- per-World mines sum to the canonical mine total;
- World Boss encounter count matches declared World encounters;
- Nexus encounter/boss/difficulty counts match the instance model;
- Nexus access remains permanent at Prestige IV with no Viking/boss requirement until intentionally changed with evidence;
- Forum remains preview, non-persistent and without an account-system claim;
- Skyblock remains `source-verified / partial`, with incomplete collaboration/team-management/promotion controls outside the current feature list;
- Store thresholds remain unpublished while `thresholdsVerified` is false.

### Detailed Guides currently present

| Guide | Evidence / state | Publication boundary |
|---|---|---|
| Getting Started | Orientation reference | Orientation only; delegates exact mechanics to owning Guides |
| Worlds & Gates | Current public reference | Four Worlds only; Nexus remains separate |
| Nexus & Instances | Reconciled reference | Staged/deployment-sensitive work stays qualified |
| Talisman Codex | Server verified | Secret requirement trees and protected discovery inputs are not published |
| Enchantments | Source verified | No live-client claim |
| Stats & Equipment | Source verified | Mining-specific stat coverage remains outside this release |
| Levels, Prestige & Legacy | Reconciled reference | Reset, reward, XP-curve and persistence semantics remain unpublished until re-verified |
| Skyblock | Source verified / partial | Team-management and promotion remain explicitly incomplete |

Evidence and feature state remain separate. Source presence or a visible menu item is not treated as proof of complete player-facing availability.

## Branch state

The hardening branch is periodically reconciled with `main` when Quality-Gate-only commits are installed on the default branch for manual-dispatch visibility. Reconciliation uses a merge commit whose resulting tree remains the hardening candidate tree, so frontend content from `main` does not replace branch work.

Do not rely on a SHA written into this document for merge decisions. Before any merge/reconciliation operation, query the live `main` and hardening refs and compare them directly. The PR remains the release candidate; `main` remains untouched by frontend hardening until release gates are satisfied.

## Verification state

### Static/code review

Current Guide/overview renderers and the validation/build pipeline have been reviewed at source level for DOM-safety, CSP structure, canonical data relationships, approved external destinations, publication invariants, local/CSS dependency handling, transport policy, symlink/protocol-relative boundaries, sitemap/index behavior, media loading and structural accessibility.

This source review does **not** substitute for successful execution of the repository validators or browser-render validation.

### GitHub Actions Quality Gate

**Account-level/pre-runner startup block — validator result not obtained.**

Observed failed Quality Gate jobs have completed before a GitHub-hosted runner was assigned (`runner_id: 0`, empty runner name, `steps: []`). Therefore those red runs are not evidence that `security_scan.py`, Python syntax compilation, `validate_media_integrity.py`, `node --check`, `validate_public_data.js`, `validate_site.py`, `validate_runtime_contracts.py`, `validate_accessibility.py`, `build_public_site.py` or `validate_public_bundle.py` failed; repository steps were not observed executing.

The workflow definition is intentionally present on `main` and the hardening branch. Manual dispatch requires an explicit `target_ref`, allowing the default-branch workflow to validate the actual candidate branch/tag/SHA without moving the frontend candidate to `main`.

### Local execution / browser-render QA

**Pending in the currently available runtime.**

The available container/runtime has not been able to resolve/fetch `github.com`, so a local full-repository validator execution and browser automation result cannot be claimed as a substitute for Actions.

Required browser QA remains 1440 / 1024 / 768 / 430 / 390 px, plus short-height windows, 200% zoom, keyboard navigation, reduced motion, lazy media, CSP/runtime console state and network waterfall behavior.

## Remaining release gates

- Resolve the GitHub Actions startup/billing condition and obtain a real execution of every Quality Gate step on the exact final candidate HEAD.
- Complete browser/render QA and remediate any visual, responsive, accessibility, loading or runtime issue found there.
- Re-run the full automated gate after final browser-QA changes.
- Keep PR #1 in draft until those gates are satisfied.
- Do not merge to `main` solely from static inspection.
- Do not migrate Pages to `_site/` until the artifact pipeline has executed successfully.

## Deferred by product architecture

The following controls cannot be meaningfully completed until an authenticated backend exists: server-side authorization, session management, CSRF enforcement, API rate limiting, database access policies, moderation audit logs, private profile access and account-recovery flows.

Persistent Login/Profile/Forum work must not start by placing privileged credentials or trust decisions in the static GitHub Pages frontend. A header-capable/backend hosting boundary described in `docs/CSP-PLAN.md` and `docs/AUTH-SECURITY-REQUIREMENTS.md` remains a prerequisite.

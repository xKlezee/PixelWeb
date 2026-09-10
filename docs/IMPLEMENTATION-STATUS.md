# PixelWeb Hardening & Documentation — Implementation Status

This document records the current release-candidate architecture and gates without turning source inspection into runtime proof. It intentionally does not embed a HEAD SHA; GitHub branch/PR comparison is the authority for live ref state.

## Release posture

- `hardening/security-foundation-2026-09` remains the deliberate release candidate.
- PR #1 remains draft.
- `main` remains the stable/published frontend branch; frontend hardening is not promoted merely to work around the GitHub Actions billing/startup issue.
- Intended promotion is a squash merge only after the exact final candidate clears automated and browser/render gates.

## Implemented security and repository foundation

- Defensive `.gitignore` for environment files, credentials, keys, generated output, logs, editor files and local reports.
- `SECURITY.md` documents public/private boundaries, credential incident handling and the future authenticated-backend boundary.
- `scripts/security_scan.py` scans committed text for common secret material.
- `scripts/validate_site.py` validates top-level HTML integrity, CSP/transport rules, local references and sitemap/publication contracts. Indexable pages must expose exactly one absolute HTTPS canonical URL matching the page URL declared by `sitemap.xml`; missing, duplicate, mismatched and non-sitemap canonicals fail validation.
- `scripts/validate_social_metadata.py` validates sitemap-indexed Open Graph/Twitter metadata, including unique required fields, canonical `og:url`, document-title alignment, Twitter/Open Graph consistency and the official shared Pixel Network social image.
- `scripts/validate_runtime_contracts.py` validates deferred media, direct style-assignment policy, navigation invariants, local same-page/cross-page fragment targets and Guide-library coverage.
- `scripts/validate_accessibility.py` checks document structure, image alternatives and accessible naming of visible form controls.
- `scripts/validate_player_facing_copy.py` keeps known repository-test/database/wiring/deployment implementation terminology out of browser-public player documentation while allowing legitimate evidence labels, formulas, stat keys and player commands.
- `scripts/validate_media_integrity.py` protects the four approved Nexus boss PNGs by byte size, dimensions and exact Git blob SHA.
- `scripts/validate_public_data.js` validates canonical public-data relationships, approved destinations/media origins, Forum preview state, Skyblock partial-state publication rules and Store threshold boundaries.
- `scripts/build_public_site.py` stages a reference-driven `_site/` artifact instead of copying the repository wholesale.
- `scripts/validate_public_bundle.py` independently verifies that staged artifact boundary and its local dependencies.
- `.github/workflows/quality-gate.yml` executes the full guard chain with read-only repository permissions, commit-pinned official `actions/checkout`, no persisted checkout credentials and an explicit manual `target_ref`.

## Browser/runtime hardening

- No inline scripts, inline event handlers or inline style attributes are accepted by the static validation layer.
- First-party renderers use DOM construction / `textContent` rather than string-to-DOM HTML parsing.
- Dynamic code execution patterns are rejected.
- Ordinary runtime inline-style mutation and direct `element.style = ...` assignment are rejected.
- Absolute external HTTP and protocol-relative resource URLs are rejected.
- Dynamic public destinations/media are restricted to approved schemes/origins where applicable.
- `connect-src` follows page-level least privilege; only pages with the live Minecraft status surface may connect to `https://api.mcsrvstat.us`.
- DevTools/right-click blocking is not used as a security boundary.

## Navigation and interaction contract

- `polish.js` owns the canonical runtime navigation model while static HTML remains the no-JavaScript fallback.
- Above 980 px with `hover:hover` and `pointer:fine`, Explore / Development / Community are pointer-hover groups: entering opens, travelling into the dropdown keeps the group open, leaving closes it, and mouse/trackpad click cannot pin it open.
- At 980 px and below, navigation returns to explicit click/touch `.is-open` behavior even when a fine pointer is attached.
- Keyboard opening, focus handling and Escape remain separate supported paths.
- `security-hardening.css` carries the 981 px fine-pointer hover-only rule and is required on canonical public pages.
- Detailed `guide-*.html` fallbacks mark exactly `guides.html` as `aria-current="page"` in the global navbar.
- Every local fragment anchor must resolve to an existing `id` in its same-page or cross-page top-level HTML target; Guide anchors are included in this global contract rather than handled as a special case.
- The primary `guides.html` library must contain exactly one `data-guide-entry` for every current `guide-*.html` detail page, with no duplicate or orphan primary entries.
- First keyboard focus exposes a Skip to content path on standard pages.
- Play and Forum dialogs retain focus containment, Escape close and trigger-focus restoration.
- Forum overlays remain scroll-reachable on short-height windows.

## Forum preview boundary

Forum remains deliberately non-persistent and `noindex`.

- Visible copy identifies the surface as a local preview.
- No real account, credential, linking or persistent publishing service is implied.
- Preview display name, title and body limits are enforced in JavaScript as well as HTML attributes.
- Preview user text is rendered as inert text through DOM APIs.
- Persistent Login/Profile/Forum work remains deferred until real server-side identity, authorization, session, CSRF/rate-limit and header-capable hosting prerequisites exist.

## Canonical public data

`data/network.js` remains the canonical owner for shared public network facts under the one-fact/one-owner rule.

Current guarded invariants include:

- exactly four Worlds in order: Overworld → Pirate Kingdom → Nether → Winter;
- Nexus remains separate from the World array;
- per-World mines sum to the canonical mine total;
- World encounter count matches declared required/optional encounters;
- Nexus encounter, boss and difficulty counts match the instance model;
- Nexus access remains permanent at Prestige IV without a Viking/boss requirement unless intentionally changed with evidence;
- Forum remains preview/non-persistent without an account-system claim;
- Skyblock remains `source-verified / partial`; incomplete collaboration features stay outside the current feature list and use player-facing `Partial` / `Planned` descriptions rather than internal implementation copy;
- Store monetary thresholds remain unpublished while `thresholdsVerified` is false;
- Discord, Store and legacy GitBook destinations must remain the approved canonical HTTPS URLs;
- Worlds landscape media remains constrained to the approved Pixel GitBook proxy/storage space and local World boss art remains under `assets/worlds/`.

## Canonical crawl metadata

- Every sitemap-indexed page carries a static absolute HTTPS `rel="canonical"` in its HTML `<head>`.
- `index.html` canonically maps to `https://xklezee.github.io/PixelWeb/`; the remaining indexable pages map one-for-one to the exact URLs declared in `sitemap.xml`.
- `forum.html` and `404.html` remain intentionally `noindex` and outside the sitemap-indexed canonical requirement.
- Canonicals are not injected by JavaScript or by the public-site builder; source HTML remains the authority and the validator cross-checks it against the sitemap.

## Social sharing metadata

- All sitemap-indexed pages carry static Open Graph and Twitter metadata in source HTML; social crawlers do not depend on JavaScript hydration.
- Page-specific `og:title` matches the document title and `og:url` matches the canonical public URL.
- Each page has a non-empty Open Graph description, and Twitter title/description mirror the corresponding Open Graph fields.
- `og:type` remains `website` and `og:site_name` remains `Pixel Network` across the indexable surface.
- The shared Open Graph/Twitter image remains the official absolute Pixel Network logo URL, with the expected Open Graph image alt text.
- `forum.html` and `404.html` remain outside this requirement because they are intentionally `noindex` and not sitemap-indexed.
- `scripts/validate_social_metadata.py` is wired into the Quality Gate to reject missing, duplicate, empty or inconsistent social-sharing metadata once the automated runner can execute.

## Guides architecture

Pixel Guides is intentionally a documentation surface, not another marketing page. It preserves the visual language of PixelWeb while using a denser reference layout, sidebar navigation, evidence/state labels, tables, formulas and cross-links.

Evidence and factual state are separate concepts:

- evidence examples: `source-verified`, `server-verified`, `live-client-verified`, `reconciled-reference`;
- state examples: `current`, `partial`, `staged`, `planned`, `unknown`, `deprecated/retired`;
- non-evidence reference roles such as Orientation reference and Current public reference do not pretend to be stronger verification classes.

The generic `Verified guide` badge has been retired.

### Current detailed Guides

| Guide | Evidence / role | Public scope |
|---|---|---|
| Getting Started | Orientation reference | Joining, route orientation and links to owning references |
| Worlds & Gates | Current public reference | Four-World route, mine counts, bosses/gates and explicit Nexus boundary |
| Levels, Prestige & Legacy | Reconciled reference | Current caps/access milestones; reset, reward, XP and persistence semantics remain unpublished until independently re-verified |
| Nexus & Instances | Reconciled reference | Current access, encounter catalogue and difficulty milestones; deeper encounter-runtime behavior is not expanded beyond established public facts |
| Skyblock | Source verified / partial | Persistent island progression, upgrades, bank and quests; incomplete collaboration remains partial/planned |
| Stats & Equipment | Source verified | Core combat/equipment stats plus exact mitigation formula/cap; mining-specific coverage remains outside this release |
| Talisman Codex | Server verified | `/codex`, `/bag`, seven equipped slots, acquisition/state model and public advanced-effect semantics; Secret identities/requirements remain concealed |
| Enchantments | Source verified | Family compatibility, current effect semantics and retired identities; no unperformed live-client claim and no repository-test internals |

### Player-facing publication boundary

- Public Guides explain gameplay behavior and the confidence/scope of a claim, not the internal engineering process used to obtain that confidence.
- Repository-test details, database paths, command/menu wiring, deployment state, implementation-layer terminology and similar maintenance-only phrases are guarded out of browser-public Guide/data/renderer content.
- `source verified` remains a legitimate evidence label; the copy guard is deliberately phrase-specific rather than banning technical vocabulary indiscriminately.
- Shared numbers/rules come from canonical owners instead of duplicated manual copies where a canonical data source exists.
- Nexus is never World 5.
- Secret Talisman discovery trees, protected combinations and anti-abuse-sensitive inputs are not published.
- Mining-specific Stats remain outside the active reference until a dedicated evidence pass is complete.
- Legacy GitBook material remains migration/discovery context only and never overrides current evidence.

## Guide discoverability and cross-linking

- The eight detailed Guides are represented one-for-one in the main Guide library.
- Systems links directly to Progression, Worlds, Nexus, Stats & Equipment, Talisman Codex and Enchantments from the conceptual surfaces where those topics appear.
- Skyblock and Nexus overview pages provide direct routes into their detailed references.
- Guide search exposes its controlled library, announces result-count changes through a polite live region and supports Escape to clear the query.
- Guide section anchors, including each `#overview`, reserve sticky-navigation scroll offset.

## Media and performance integrity

- Raphael, Azazel, Abyss and Astral remain the approved original 1448×1086 PNG blobs. No AVIF/WebP conversion, recompression, downscale, sprite or replacement is used.
- The deliberate Abyss/Astral filename inversion documented in `data/nexus-media.js` remains intact because it reflects the approved visual mapping.
- Nexus boss renders use lazy loading, async decoding, low fetch priority and intrinsic dimensions.
- Abyss + Astral remain two independent complete 4:3 images in the dual encounter.
- Home immersive MP4 has no eager `src`, uses `preload="none"`, hydrates near the viewport and does not hydrate in reduced-motion mode.
- Worlds loads the first landscape eagerly and later landscapes through deferred responsive hydration; local boss artwork remains lightweight/lazy.
- The official root logo remains unchanged. A smaller derivative is only a future visual/performance investigation item, not permission to silently replace or recompress the original.
- `docs/PERFORMANCE-BUDGET.md` records the current loading/integrity expectations.

## CSP and hosting boundary

The current meta-delivered CSP remains the static compatibility baseline. Meta CSP cannot enforce `frame-ancestors`; therefore authenticated production features require a hosting/proxy/backend boundary capable of real HTTP response headers.

Repository privacy, obfuscation, minification, JavaScript checks or crawler directives are not authorization controls.

## Public artifact boundary

The prepared `_site/` model separates repository content from future hosted content.

- Sitemap-declared public pages plus Forum/404 seed the artifact.
- Root resources are included only when referenced or explicitly declared as runtime-loaded.
- Local CSS `url(...)` and quoted `@import` dependencies are traversed recursively inside declared public roots.
- `assets/` and `data/` are intentionally browser-public trees and are restricted to expected browser/static data types.
- `docs/`, `scripts/`, `.github/`, environment files, logs, databases, keys/certificates and unrelated root files are excluded from the intended artifact.
- Root-relative project-site escape, protocol-relative resources and symlink traversal are fail-closed.

The `_site/` pipeline is prepared but is **not yet the live GitHub Pages source**.

## Current validation state

### Source/static review

The current candidate has been reviewed at source level for DOM safety, CSP structure, canonical crawl metadata, social-sharing metadata structure, canonical data relationships, external destinations, Guide/publication boundaries, local dependencies, local fragment-link integrity, media loading, navigation contracts and structural accessibility.

This review is not a substitute for successful validator execution or browser rendering.

### GitHub Actions

**Blocked before runner assignment by the account-level billing/startup condition.**

Observed failed Quality Gate jobs complete before a GitHub-hosted runner is assigned (`runner_id: 0`, empty runner name, `steps: []`). Those runs therefore do not establish PASS or FAIL for the repository validators, including the social metadata guard.

### Local execution / browser QA

The available execution runtime has also failed to resolve/fetch `github.com`, so no local full-repository run is claimed as a substitute.

Required browser QA remains:

- 1440 / 1024 / 768 / 430 / 390 CSS px;
- at least one short-height landscape window;
- 200% browser zoom;
- keyboard navigation and focus behavior;
- reduced motion;
- desktop hover-only dropdown behavior and 980 px mobile/touch boundary;
- Guide anchors/search/tables;
- Forum dialogs and preview behavior;
- Play modal;
- console/CSP state and network waterfall;
- media crop/stretch/loading behavior, especially Abyss + Astral.

## Remaining release gates

1. Resolve the GitHub Actions billing/startup condition.
2. Execute the complete Quality Gate against the exact final release-candidate HEAD and obtain a real green result.
3. Complete browser/render QA and remediate every finding.
4. Re-run the full automated gate after final browser-QA changes.
5. Keep PR #1 draft until both gates pass.
6. Only then squash-merge the candidate to `main`.
7. Migrate Pages to the validated `_site/` artifact only after that artifact pipeline has actually executed successfully.

## Deferred by product architecture

Persistent Login/Profile/Forum, moderation and private APIs remain behind the authenticated-backend boundary. They require server-side authorization, session management, CSRF enforcement where applicable, API rate limiting, database access policy, moderation auditability, private-profile access control, account recovery and response-header-capable hosting before being treated as production features.

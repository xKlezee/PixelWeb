# PixelWeb Documentation Index

This directory is the reviewable technical contract for PixelWeb's security, publication and release boundaries. It intentionally avoids private Pixel Network infrastructure, credentials and operational secrets.

## Security architecture

- `SECURITY-HARDENING.md` — static-site security baseline, threat boundaries and hardening status.
- `AUTH-SECURITY-REQUIREMENTS.md` — mandatory invariants before Login, profiles, persistent Forum, moderation or private APIs can be considered production-ready.
- `DATA-CLASSIFICATION.md` — PUBLIC / INTERNAL / CONFIDENTIAL / SECRET rules for browser-delivered content.
- `PUBLIC-PRIVATE-BOUNDARY.md` — what may exist in the browser-delivered frontend, how `_site/` separates hosted output from repository content, and what must remain server-side/private.
- `CSP-PLAN.md` — strict Content Security Policy design and hosting limitations.
- `INCIDENT-RESPONSE-SECRETS.md` — response sequence if credential material is ever committed or otherwise exposed.

## Documentation architecture

- `GUIDES-CONTENT-MODEL.md` — canonical-data rule, legacy migration policy, evidence levels, factual feature states and public-disclosure rules for Pixel Guides.
- `LEADERBOARDS-DATA-CONTRACT.md` — public `pending`/authoritative `ready` snapshot rules, canonical metric catalogue and producer boundary; browser-public fictional standings are forbidden.
- `IMPLEMENTATION-STATUS.md` — current public-site architecture, Guide/publication boundaries, theme/runtime state and remaining verification work.
- `THEME-COVERAGE-AUDIT-2026-09.md` — source-level Light / Dark / System coverage matrix, media-preservation rules, cascade order and runtime-state corrections. It is an audit of code/selectors/states, not a substitute for browser/render QA.
- `UI-GEOMETRY-SYSTEM.md` — measurable 4/8 px rhythm, 40/44/48/52 px control scale, desktop/mobile navigation geometry, page-control harmonization and future UI invariants.

## Quality, performance and deployment

- `QA-SECURITY-CHECKLIST.md` — security, rendering, navigation, theme-state, Guide integrity, media-integrity and publication regression checklist before release claims.
- `RESPONSIVE-QA.md` — required 1440 / 1024 / 768 / 430 / 390 px matrix and the strict separation between static review and real browser-render verification.
- `PERFORMANCE-BUDGET.md` — asset/loading budget and performance constraints, including the rule that approved original Nexus PNGs are not recompressed merely to improve scores.
- `PAGES-DEPLOYMENT-MIGRATION.md` — controlled migration from branch-root Pages publishing to a validated `_site/` artifact after GitHub Actions is healthy.

## Automation

Repository-level automated controls live outside this directory:

- `.github/workflows/quality-gate.yml` — candidate-aware quality gate with read-only validation and public-artifact build checks;
- `scripts/security_scan.py` — dependency-free committed-file secret guard;
- `scripts/validate_media_integrity.py` — exact source-integrity guard for the four approved Nexus PNGs;
- `scripts/validate_public_data.js` — canonical public-data relationship, approved-destination, Worlds-media and product-publication validator;
- `scripts/validate_leaderboards_data.py` — leaderboard publication-state, no-fixture, canonical-taxonomy and row-validity guard;
- `scripts/validate_site.py` — structural, CSP, transport, local-reference and sitemap/index/canonical-URL validator;
- `scripts/validate_document_metadata.py` — exact referrer-policy, canonical favicon, noindex error/compatibility surface and Forum/Development redirect contract validator;
- `scripts/validate_social_metadata.py` — sitemap-indexed Open Graph/Twitter consistency guard, including canonical social URLs, document titles and the official shared logo; intentionally `noindex` Forum/Development/404 pages are outside this indexed-page contract;
- `scripts/validate_runtime_contracts.py` — deferred-media, navigation, local-fragment-target, Guide-library coverage and direct-style-assignment guard;
- `scripts/validate_static_navigation.py` — exact no-JavaScript `canonical-v1` navigation-destination/order guard across public HTML, excluding only the Forum/Development compatibility redirects;
- `scripts/validate_accessibility.py` — document-structure, viewport, image-alternative and visible-form-control naming guard;
- `scripts/validate_player_facing_copy.py` — browser-public documentation boundary that rejects known repository-test/database/wiring/deployment implementation phrases while preserving legitimate player/evidence terminology;
- `scripts/build_public_site.py` — reference-driven builder for the `_site/` Pages artifact, including explicitly runtime-loaded Play/theme/Pixel Navigator root assets that static HTML discovery cannot see;
- `scripts/validate_public_bundle.py` — publication-boundary and local-reference validator for `_site/`, including required presence of explicitly runtime-loaded root assets.

A configured check is not considered verified merely because the workflow or script exists. `IMPLEMENTATION-STATUS.md` records whether the current public state has actually executed the gate and browser-render matrix.

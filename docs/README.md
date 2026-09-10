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
- `IMPLEMENTATION-STATUS.md` — current branch implementation state, evidence boundaries, outstanding release gates and known infrastructure limitations.

## Quality, performance and deployment

- `QA-SECURITY-CHECKLIST.md` — security, rendering, navigation, media-integrity and publication regression checklist before merge.
- `RESPONSIVE-QA.md` — required 1440 / 1024 / 768 / 430 / 390 px matrix and the strict separation between static review and real browser-render verification.
- `PERFORMANCE-BUDGET.md` — asset/loading budget and performance constraints, including the rule that approved original Nexus PNGs are not recompressed merely to improve scores.
- `PAGES-DEPLOYMENT-MIGRATION.md` — controlled migration from branch-root Pages publishing to a validated `_site/` artifact after GitHub Actions is healthy.

## Automation

Repository-level automated controls live outside this directory:

- `.github/workflows/quality-gate.yml` — candidate-aware quality gate with read-only validation and public-artifact build checks;
- `scripts/security_scan.py` — dependency-free committed-file secret guard;
- `scripts/validate_media_integrity.py` — exact source-integrity guard for the four approved Nexus PNGs;
- `scripts/validate_site.py` — structural, CSP, transport, canonical-data and sitemap/index validator;
- `scripts/validate_runtime_contracts.py` — deferred-media and runtime inline-style guard;
- `scripts/validate_accessibility.py` — baseline document-structure/accessibility guard;
- `scripts/build_public_site.py` — reference-driven builder for the `_site/` Pages artifact;
- `scripts/validate_public_bundle.py` — publication-boundary and local-reference validator for `_site/`.

A configured check is not considered verified merely because the workflow or script exists. `IMPLEMENTATION-STATUS.md` records whether the current candidate HEAD actually executed the gate.

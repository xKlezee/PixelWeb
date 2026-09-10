# PixelWeb Hardening & Documentation — Implementation Status

This file records the branch state without upgrading controls or gameplay claims beyond the evidence actually obtained.

## Implemented on this branch

### Repository and security foundation

- Defensive `.gitignore` for environment files, credentials, keys, generated output, logs, IDE files and local reports.
- `SECURITY.md` with public/private disclosure boundaries and credential-incident handling.
- Dependency-free committed-secret scanner.
- Dependency-free static HTML/JavaScript integrity validator.
- GitHub Actions quality gate with read-only repository permissions and a commit-pinned official checkout action.
- Strict CSP-ready frontend rules: no inline scripts, inline handlers, inline styles, `javascript:` URLs, HTML parsing sinks or runtime inline-style mutation accepted by the validator.
- Explicit pre-auth security requirements for Login, profiles, persistent Forum, moderation and private APIs.
- Explicit classification of browser-delivered public data versus future private/backend data.
- Forum remains preview-only; no persistent account/session/backend behavior is implied.

### Public data and documentation architecture

- `data/network.js` remains the canonical owner for shared public network facts.
- Detailed guide-domain files hold only system-specific material and do not duplicate shared numeric gates when a canonical value already exists.
- Guides render dynamic content with `textContent`, `createElement`, `append` and `replaceChildren` rather than string-to-DOM parsing.
- Evidence level and factual feature state are modeled separately.
- Evidence taxonomy: `source-verified`, `server-verified`, `live-client-verified`, `reconciled-reference`.
- Factual states include `current`, `partial`, `staged`, `planned`, `unknown` and `deprecated/retired`.
- Feature completeness requires a reachable player path; source presence or a visible menu item alone does not qualify as availability.
- Legacy GitBook material is migration/discovery input only, never current authority.

### Detailed Guides currently present

| Guide | Evidence / state | Publication boundary |
|---|---|---|
| Getting Started | Verified guide | Orientation only |
| Worlds & Gates | Verified guide | Four Worlds only; Nexus remains separate |
| Nexus & Instances | Reconciled reference | Staged/deployment-sensitive work stays qualified |
| Talisman Codex | Server verified | Secret requirement trees and protected discovery inputs are not published |
| Enchantments | Source verified | No live-client claim |
| Stats & Equipment | Source verified | Mining-specific stat coverage remains outside this release |
| Levels, Prestige & Legacy | Reconciled reference | Reset, reward, XP-curve and persistence semantics remain unpublished until re-verified |
| Skyblock | Source verified / partial | Team-management and promotion remain explicitly incomplete |

### Skyblock correction

The public Skyblock model and landing page no longer advertise collaboration controls as fully available. Source-backed island lifecycle, persistence, upgrades, banking and Skyblock quests remain in the current capability set; invite/member-management and promotion are represented separately as partial/incomplete.

### Media integrity

The approved Nexus boss PNGs are preserved as their original repository blobs. The hardening branch does not recompress, resize or convert Raphael, Azazel, Abyss or Astral. Performance work around those assets is limited to loading/rendering behavior.

## Verification state

### Static/code review

The new Progression and Skyblock guide renderers follow the same DOM-safe construction pattern as the other hardened Guides. Their local references, CSP model and responsive breakpoints have been statically reviewed and are included automatically by `scripts/validate_site.py` because it scans every top-level HTML file plus root/data JavaScript.

### GitHub Actions quality gate

**Infrastructure/startup failure — validator result not obtained.**

The quality workflow is triggering on both branch pushes and the pull request, but the observed jobs fail before any step executes: GitHub reports an empty step list and no assigned runner. Therefore the failed check must **not** be interpreted as a failure from `security_scan.py`, `node --check` or `validate_site.py`; none of those stages ran in the observed job.

The checkout action reference itself has been independently verified as the official commit-pinned `actions/checkout` v7.0.1 release. Do not weaken the workflow or remove checks merely to obtain a green badge. The Actions startup condition must be resolved separately, then the exact branch HEAD must be rerun.

### Browser/render QA

**Pending.**

The required 1440 / 1024 / 768 / 430 / 390 px matrix is statically specified in `docs/RESPONSIVE-QA.md`, but no viewport is marked visually PASS until this exact branch is exercised in a real browser with console/network inspection. Browser QA also remains the gate for image composition, 200% zoom, keyboard navigation, reduced motion and CSP/runtime-error observation.

## Remaining release gates

- Resolve the GitHub Actions job-start condition and obtain a real execution of the secret scan, JavaScript syntax check and static-site validator on the exact candidate HEAD.
- Perform the browser/render QA matrix and fix any visual, responsive, accessibility or runtime issues found there.
- Re-run the quality gate after the final browser-QA changes.
- Keep the pull request in draft until those gates are satisfied.
- Do not merge to `main` solely from static inspection.

## Deferred by product architecture

The following controls cannot be meaningfully completed until an authenticated backend exists: server-side authorization, session management, CSRF enforcement, API rate limiting, database access policies, moderation audit logs, private profile access and account-recovery flows.

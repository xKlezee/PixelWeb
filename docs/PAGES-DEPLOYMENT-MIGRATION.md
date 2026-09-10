# GitHub Pages Artifact Migration

PixelWeb currently keeps GitHub Pages on the existing source configuration so the public site is not disrupted while GitHub Actions is blocked at account level by the billing/startup condition.

The target deployment architecture is **validated artifact deployment**, not publishing the repository root.

## Preconditions

Do not switch the Pages source until all of the following are true:

1. The GitHub account billing/startup block is resolved.
2. `PixelWeb Quality Gate` can start a real GitHub-hosted runner.
3. A manual dispatch against the exact hardening candidate ref completes successfully.
4. `scripts/validate_public_data.js` passes against the exact candidate data model and approved external-origin contract.
5. `scripts/build_public_site.py` builds `_site/` successfully.
6. `scripts/validate_public_bundle.py` passes against that exact `_site/` output.
7. Browser/render QA is complete for the candidate being deployed.

## Target deployment boundary

The deployment artifact must be `_site/`, produced by `scripts/build_public_site.py`.

The artifact intentionally contains:

- sitemap-declared public HTML pages;
- the explicitly `noindex` Forum and 404 surfaces;
- root CSS/JavaScript/media referenced by those pages;
- local dependencies recursively reachable from included CSS through `url(...)` or quoted `@import`, provided those dependencies remain inside declared public roots;
- the explicitly declared runtime-loaded `play-modal.css`;
- browser-public `assets/`;
- browser-public `data/`;
- `.nojekyll`, `robots.txt` and `sitemap.xml`.

The CSS dependency rule is deliberately fail-closed: root-relative CSS URLs are invalid for the current `/PixelWeb/` project-site base, dependencies may not escape the repository, and CSS may not pull arbitrary undeclared repository directories into the public artifact.

Protocol-relative resource URLs are also fail-closed. `//host/path` is not treated as a harmless HTTPS shortcut: the source validator rejects protocol-relative HTML/CSS resources, the builder refuses them before artifact construction, and the staged-bundle validator rejects them again after build.

Symlinks are fail-closed as well. The builder rejects a symlinked `_site/`, sitemap, public page, root resource, CSS dependency, public directory, or descendant of `assets/` / `data/` rather than dereferencing it. `validate_public_bundle.py` independently rejects symlinks in a staged artifact and excludes them from content parsing, so validation itself does not follow an unexpected link outside the artifact tree.

`validate_public_data.js` separately constrains browser-controlled public destinations. The current Discord invite, Tebex Store URL and legacy GitBook documentation/changelog URLs must remain their approved canonical HTTPS destinations; changing one requires an intentional contract update. Worlds media must stay aligned 1:1 with the four canonical World ids. External landscape imagery is limited to the approved Pixel GitBook image proxy backed by the expected GitBook storage origin, while boss artwork remains repository-local under `assets/worlds/`.

It must not publish repository/security/engineering material such as:

- `docs/`;
- `scripts/`;
- `.github/`;
- `.env*`;
- `.gitignore`;
- repository README/security-operation files;
- local logs, databases, key/certificate material or other operational artifacts.

`validate_public_bundle.py` independently re-checks this boundary after the build. It also rejects missing local HTML/deferred-media/CSS targets, undeclared top-level HTML, unreferenced/unapproved root files, unexpected file types in `assets/` or `data/`, sensitive operational suffixes, protocol-relative references and root-relative project-site URLs. Do not bypass it to make a deployment succeed.

## Migration sequence after Actions is healthy

1. Run the Quality Gate manually against the exact candidate SHA and confirm every repository validation step passes, including canonical-data/origin validation.
2. Build and validate `_site/` in the same deployment workflow before any Pages upload step.
3. Use GitHub's official Pages artifact/upload/deploy actions, pinned to approved full commit SHAs under the repository's action policy.
4. Give the deployment job only the permissions required by GitHub Pages (`pages: write` and `id-token: write`) while keeping the validation/build job read-only.
5. Configure the `github-pages` environment and use GitHub's Pages deployment protection model rather than granting broad repository write access.
6. Change the repository Pages source to **GitHub Actions** only after the artifact workflow exists on `main` and has been reviewed.
7. Deploy once, then verify the live URL, all navigation, 404 handling, Guide routes, Nexus media, Home deferred media, CSS/font/media dependencies, CSP console state and network waterfall.
8. Confirm operational repository paths such as `/PixelWeb/docs/` and `/PixelWeb/scripts/` are no longer part of the deployed artifact.
9. Keep the previous deployment configuration documented until the first artifact deployment is confirmed healthy, but do not run two competing Pages deployment methods indefinitely.

## Rollback principle

If the first artifact deployment is unhealthy, fix the artifact/workflow and redeploy. Do not solve deployment failures by adding `docs/`, `scripts/`, environment files or unrestricted repository content back into the public bundle.

## Authentication boundary

This migration improves **publication hygiene** only. It does not make the static site an authentication/security backend. Login, persistent profiles, persistent Forum, moderation APIs and secrets still require the server-side/header-capable architecture defined in `AUTH-SECURITY-REQUIREMENTS.md` and `CSP-PLAN.md`.

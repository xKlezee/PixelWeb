# Public / Private Boundary

PixelWeb's source repository may become private, but browser-delivered assets remain public to visitors. This boundary is architectural, not optional.

## Browser-delivered code may contain

- public navigation and presentation logic;
- public server/community/store/documentation URLs;
- intentionally published game/product data;
- public media manifests;
- non-sensitive feature flags whose disclosure is acceptable.

## Browser-delivered code must not contain

- passwords or database credentials;
- Discord bot tokens/private webhooks;
- service-role or administrator API keys;
- signing/private keys;
- private host/IP/topology data not intended for players;
- hidden staff permissions that are enforced only in JavaScript;
- confidential player/staff records;
- secrets obfuscated, encoded, minified, or split across files.

## Repository-private but browser-public trap

A value is not protected merely because it is stored in a private repository. If a build step embeds it into JavaScript, HTML, CSS, source maps, JSON, or another downloaded asset, it must be treated as disclosed.

## Public artifact boundary

The repository and the hosted website are intentionally separate surfaces.

`build_public_site.py` stages a `_site/` artifact from explicit publication roots rather than copying the repository wholesale. Public HTML comes from the canonical sitemap plus the explicitly `noindex` legacy `forum.html` compatibility redirect and `404.html` error surface. Root CSS/JavaScript/media is included only when referenced by those public pages, with `play-modal.css` declared explicitly because it is loaded at runtime. The `assets/` and `data/` trees are treated as intentionally browser-public directories.

`validate_public_bundle.py` rejects repository/internal paths, environment files, key/certificate material, logs/databases, unsupported files inside browser-public `assets/` or `data/`, undeclared root HTML, unapproved/unreferenced root files, missing local references and root-relative URLs that would escape the `/PixelWeb/` GitHub Pages project path.

This artifact model is **prepared but not the active deployment source yet**. Switching GitHub Pages to an Actions-built artifact must wait until the account-level Actions startup/billing condition is resolved and the artifact build/validation steps can actually run. Until then, do not claim that operational repository files are excluded from the currently configured branch-root Pages deployment.

## Server-side boundary for future features

When Login, profiles, persistent community features, private APIs, or staff tools are implemented, their privileged logic and secrets must execute on a trusted backend. The browser may request an operation; the server must decide whether it is authorized.

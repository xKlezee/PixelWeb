# Content Security Policy and Hosting Boundary

PixelWeb now enforces a restrictive CSP in every current HTML document. This file records what is actually protected today, which source lists are intentionally still compatibility-oriented, and what still requires an HTTP response-header capable hosting layer.

## Current static-site policy

The default public-page policy currently uses:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' https: data:;
media-src 'self' https:;
font-src 'self' https: data:;
connect-src 'self';
frame-src 'none';
worker-src 'none';
form-action 'self';
manifest-src 'self';
upgrade-insecure-requests;
```

`script-src`, `style-src`, `connect-src`, `frame-src`, `worker-src`, `object-src`, `base-uri` and `form-action` are already treated as security boundaries. The broader `https:` allowances currently present in `img-src`, `media-src` and `font-src` are a **temporary compatibility baseline**, not the desired final least-privilege source list.

A page may widen `connect-src` only when its current runtime surface actually requires an external connection. At present, Home and Community expose the live Minecraft status surface and therefore use exactly:

```text
connect-src 'self' https://api.mcsrvstat.us;
```

All other current HTML pages, including Pixel Guides and the Forum preview, use exactly `connect-src 'self'`.

This is enforced by `scripts/validate_site.py`. The validator detects the current live-status DOM surface, requires `site.js` when it is present, permits the Minecraft status API only for such a page, and rejects an unnecessary external `connect-src` allowance everywhere else. A future API origin therefore requires a deliberate code-and-policy revision rather than inheriting a site-wide whitelist.

The policy is delivered with `<meta http-equiv="Content-Security-Policy">` because the current deployment target is a static GitHub Pages site.

## Source-list narrowing status

Static inspection of the hardening candidate has not identified a frontend `@font-face` declaration, a Google Fonts / `fonts.gstatic.com` dependency, a referenced WOFF/WOFF2 font, or an external video/audio source. The known immersive MP4 is repository-local. The known external image dependency is the Worlds landscape imagery served through the Pixel Network GitBook image proxy.

That evidence is enough to identify likely tighter source lists, but **not enough to change the live candidate safely without browser/network verification**. Hidden redirect behavior, CSS/image loading not obvious from source inspection, or browser-specific fetch behavior must be observed before removing allowances.

After the required browser QA matrix is available, the release candidate should test progressively tighter policy such as:

```text
img-src 'self' https://pixel-network-1.gitbook.io data:;
media-src 'self';
font-src 'self';
```

This block is a **candidate tightening target, not the currently enforced policy**. `data:` should be removed from `img-src` as well if the browser waterfall and rendered surfaces confirm that no current image requires it. If GitBook image requests redirect the browser to an additional origin rather than being served by the approved proxy, that observed origin must be assessed explicitly instead of restoring a generic `https:` wildcard.

The release procedure for source-list narrowing is:

1. render every required viewport and current public surface;
2. inspect console for CSP violations caused by first-party behavior;
3. inspect the Network panel for actual image/media/font origins and redirects;
4. tighten one source class at a time;
5. repeat the render/network checks, including reduced-motion behavior and deferred media;
6. encode the resulting exact policy in `validate_site.py` so broad `https:` cannot silently return.

Until that browser evidence exists, keeping the broader image/media/font compatibility baseline is intentional. It must not be represented as final least privilege.

## Frontend prerequisites: completed

The hardening branch now enforces the prerequisites that previously blocked a strict policy:

- no inline event-handler attributes;
- no inline `<script>` content;
- no inline `style` attributes;
- no `javascript:` URLs;
- no `unsafe-inline`, `unsafe-eval` or `wasm-unsafe-eval` CSP tokens;
- no runtime `element.style` / `setAttribute('style', ...)` mutations;
- no `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `document.write` parsing sinks in runtime JavaScript;
- external/dynamic URLs are protocol-validated before assignment;
- absolute external HTTP resources are rejected;
- protocol-relative HTML/CSS resource URLs are rejected by source validation, artifact construction and staged-bundle validation;
- canonical Discord, Store and legacy GitBook destinations require intentional contract changes rather than accepting arbitrary HTTPS replacements;
- Worlds landscape media is constrained to the approved Pixel GitBook proxy, storage host and Pixel Network upload space, while boss art remains repository-local;
- public artifact construction and staged validation fail closed on symlinks rather than dereferencing them;
- local references and CSP invariants are checked by `scripts/validate_site.py`;
- canonical gameplay/public-data relationships and retired public claims are guarded against drift/reintroduction.

These are security invariants, not conventions. Reintroducing them is intended to fail the quality gate once the gate can execute.

## Important meta-delivery limitation

A CSP delivered in a `<meta>` element is not equivalent to an HTTP `Content-Security-Policy` response header.

Most fetch/script/style restrictions used by the current static site can be enforced from meta delivery, but `frame-ancestors` is **not supported in a CSP meta element**. Therefore the current GitHub Pages deployment cannot honestly claim CSP-based anti-clickjacking protection through `frame-ancestors`.

`frame-src 'none'` is still useful, but it solves the opposite direction: it prevents PixelWeb from loading child frames. It does not control who may frame PixelWeb.

## Mandatory boundary before authenticated features

Login, persistent profiles, account linking, staff/admin surfaces, private APIs and persistent Forum data must not be treated as production-ready while the application relies solely on GitHub Pages meta-delivered security controls.

Before authenticated production features go live, the serving layer must support real HTTP response headers. The production header set should include, at minimum:

```text
Content-Security-Policy: ...; frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: <minimum required capabilities only>
```

HSTS should be enabled at the HTTPS-serving domain/proxy only after HTTPS and subdomain implications have been reviewed. It must not be copied blindly into development environments.

The response-header CSP should replace—not weaken—the current meta baseline and should explicitly enumerate every production API origin. Any future backend, auth provider or storage origin must be added only when it is actually required by the page or application surface that consumes it.

## GitHub Pages role

GitHub Pages remains suitable for the current public static presentation layer. HTTPS enforcement should remain enabled.

It is not the intended trust boundary for passwords, privileged administration, authorization decisions, service-role credentials or other server-side secrets. Those belong behind a backend/hosting layer that can enforce authorization and response headers server-side.

## Future optional defense: Trusted Types

The current codebase already removes the DOM parsing sinks that Trusted Types is designed to constrain. When browser compatibility and the future frontend stack are known, `require-trusted-types-for 'script'` can be evaluated as an additional defense-in-depth control. It should be introduced deliberately rather than enabled before the eventual framework/auth stack is known.

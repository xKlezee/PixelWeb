# Content Security Policy and Hosting Boundary

PixelWeb now enforces a restrictive CSP in every current HTML document. This file records what is actually protected today and what still requires an HTTP response-header capable hosting layer.

## Current static-site policy

The public-site pages converge on this effective shape:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' https: data:;
media-src 'self' https:;
font-src 'self' https: data:;
connect-src 'self' https://api.mcsrvstat.us;
frame-src 'none';
worker-src 'none';
form-action 'self';
manifest-src 'self';
upgrade-insecure-requests;
```

The Forum preview is stricter and currently uses `connect-src 'self'` because it does not need the external Minecraft status API.

The policy is delivered with `<meta http-equiv="Content-Security-Policy">` because the current deployment target is a static GitHub Pages site.

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
- local references and CSP invariants are checked by `scripts/validate_site.py`.

These are security invariants, not conventions. Reintroducing them is intended to fail the quality gate.

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

The response-header CSP should replace—not weaken—the current meta baseline and should explicitly enumerate every production API origin. Any future backend, auth provider or storage origin must be added only when it is actually required.

## GitHub Pages role

GitHub Pages remains suitable for the current public static presentation layer. HTTPS enforcement should remain enabled.

It is not the intended trust boundary for passwords, privileged administration, authorization decisions, service-role credentials or other server-side secrets. Those belong behind a backend/hosting layer that can enforce authorization and response headers server-side.

## Future optional defense: Trusted Types

The current codebase already removes the DOM parsing sinks that Trusted Types is designed to constrain. When browser compatibility and the future frontend stack are known, `require-trusted-types-for 'script'` can be evaluated as an additional defense-in-depth control. It should be introduced deliberately rather than enabled before the eventual framework/auth stack is known.

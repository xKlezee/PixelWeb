# Content Security Policy Plan

PixelWeb should not claim CSP enforcement until the current frontend is compatible with it.

## Target policy shape

A future enforced policy should converge toward a restrictive baseline such as:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' https: data:;
font-src 'self' https: data:;
connect-src 'self' <explicit API origins>;
form-action 'self';
```

The final policy must be generated from the actual production dependency set rather than copied blindly.

## Required prerequisites

- remove inline event-handler attributes;
- avoid `javascript:` URLs;
- remove or migrate inline scripts;
- reduce inline styles where practical or use hashes/nonces when the hosting architecture supports them;
- inventory every required external image/font/API origin;
- validate dynamic URL assignments before widening `img-src` or `connect-src`;
- test report-only violations before enforcement.

## GitHub Pages limitation

Repository files cannot configure arbitrary HTTP response headers on GitHub Pages. A `<meta http-equiv="Content-Security-Policy">` can enforce a subset of CSP directives for a static page, but it is not a substitute for a full response-header strategy and some directives are not effective from meta delivery.

Therefore, the current hardening phase focuses on CSP-readiness in the frontend. Full production security headers should be supplied by the eventual hosting/proxy layer when authenticated features are introduced.

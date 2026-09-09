# Security Regression QA Checklist

Run this checklist after security refactors and before merging to `main`.

## Navigation and page integrity

- All local navigation links resolve.
- All local images/scripts/styles referenced by top-level HTML exist.
- External `_blank` links include `rel="noopener"`.
- No duplicate IDs exist within a page.
- Keyboard navigation remains usable after removing inline handlers.

## Dynamic rendering

- User-controlled or future API-controlled text is rendered with `textContent` or equivalent context-safe encoding.
- No user-controlled value is interpolated into inline JavaScript.
- Dynamic `href` / `src` values are validated against expected schemes/origins where appropriate.
- Forum preview content renders HTML-like payloads as inert text.

## Browser behavior

- Home, Gameplay, Worlds, Nexus, Systems, Skyblock, Store, Community, Forum, Development, Changelog, About, and Team load without uncaught console errors.
- Reduced-motion behavior still works.
- Modal/dialog focus and Escape behavior still work.
- Mobile navigation opens/closes and returns focus correctly.

## Responsive widths

Verify at minimum 1440, 1024, 768, 430, and 390 CSS px. Check for horizontal overflow, clipped controls, overlapping text/media, inaccessible navigation, and layout shifts.

## Security controls

- Repository quality gate passes.
- No real secret appears in the branch diff.
- No `.env`, private key, credential file, or local report is tracked.
- Public data files contain only intentionally PUBLIC information.
- No security claim relies on DevTools blocking, minification, or repository privacy.

# Guide + Player Wiki QA Contract

This document defines the release contract for the two-level Pixel Network documentation experience.

## Product boundary

- `guides.html` remains the curated Guide landing and keeps the nine canonical first-class categories: Getting Started, Currencies, Basic Commands, Progression, Mechanics, Tools, Armor, Specials and Boosts.
- `wiki.html` is the complete Player Wiki for deep system-by-system reference.
- The complete wiki is additive. It must not replace the curated Guide landing or silently change the canonical Guide navigation model.
- The Guide must expose a normal static `<a href="wiki.html">` route so the complete wiki remains discoverable even when JavaScript is unavailable.

## Complete wiki content contract

- The current imported reference contains 42 player-facing articles grouped into 20 sections.
- Content imported from the supplied documentation package must preserve uncertainty instead of promoting it to confirmed behavior.
- Article verification states are limited to `verified`, `partial` and `verification`, rendered to players as Confirmado, Parcial and Requiere verificación.
- Internal audit/reconstruction instructions, implementation wiring, source paths, database details, class names and private operational notes must not be published as player documentation.
- The complete wiki may summarize player-visible behavior but must not expose internal PixelCore/PixelSkyblock architecture.

## Runtime contract

- `wiki.html` must load `pixel-theme-bootstrap.js` synchronously before deferred `data/network.js`.
- The compressed article payload must be assembled before `wiki-library.js` executes.
- `wiki-library.js` must fail closed to a readable Guide fallback if payload decompression is unsupported or fails.
- Search filters navigation entries without mutating article content.
- Hash navigation must resolve to a real article slug; unknown/empty hashes fall back to the first article.
- Previous/next links must stay inside the canonical 42-article ordering.
- Article content is rendered from the bundled static payload only; no remote wiki API or private backend dependency is introduced.

## Visual contract

- The visual language stays documentation-first: restrained surfaces, strong typography, thin separators and limited callout boxes.
- Dense article content uses normal document flow; cards are reserved for navigation/status moments rather than wrapping every paragraph.
- Tables may scroll horizontally on narrow viewports instead of shrinking into unreadable columns.
- Light and Dark must preserve readable article text, verification states, table borders, code blocks, search controls and active navigation.
- At compact widths the left rail becomes a normal in-flow navigation block; the document must not create page-level horizontal overflow.

## Leaderboards alignment

- Leaderboards may show a clearly labeled 100-player synthetic preview while the authoritative producer is unavailable.
- Demo data must never be written to `data/leaderboards.json` as authoritative standings.
- Demo names/values must be visibly distinguishable from real Pixel Network records.
- When a valid `pixel-server-export` snapshot becomes available, the same UI must switch automatically to the real rows without retaining demo standings.

## Release checklist

Before publishing a Guide/Wiki change:

1. `guides.html` still exposes all nine canonical categories in order.
2. `guides.html` contains a static, keyboard-reachable link to `wiki.html` that does not depend on JavaScript.
3. `wiki.html` retains canonical URL, CSP, favicon, theme bootstrap order and deferred shared runtime scripts.
4. All 42 Player Wiki articles are represented exactly once in the bundled library index.
5. Search, hash routing, active navigation and previous/next logic reference canonical article slugs only.
6. Verification state survives import and is never silently upgraded.
7. No internal audit instructions or private implementation vocabulary becomes player-facing copy.
8. `sitemap.xml` contains `wiki.html` and continues to contain `guides.html` plus detailed Guide pages.
9. Leaderboards demo mode remains explicitly synthetic and the authoritative JSON snapshot remains independent.
10. Source-level HTML/CSS/JS review is complete before production publication.
11. Real browser verification remains a separate requirement: 1440 / 1024 / 768 / 430 / 390 px, effective Light/Dark, representative System mode, keyboard focus and 200% zoom.

A source review or successful Pages deployment does not by itself constitute a completed live-browser matrix. Browser-render claims must remain pending until those sessions are actually executed.

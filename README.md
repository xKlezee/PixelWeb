# Pixel Network Web

Official web experience for Pixel Network.

The site presents the network's gameplay model, progression worlds, Nexus endgame, Marketplace collections, development direction, team, community surfaces and player documentation through a lightweight static frontend deployed with GitHub Pages.

## Public architecture

- Product/overview pages explain the experience and relationships between systems.
- `marketplace.html` is a separate primary category for cosmetic collections, rotations and interactive Minecraft-model inspection.
- `data/marketplace.js` owns the browser-public Marketplace catalogue derived from verified Nexo item registrations; `docs/MARKETPLACE-NEXO-STRUCTURE.md` records the source hierarchy and import rules.
- `guides.html` is the current player-documentation entry point.
- Detailed `guide-*.html` pages use a denser documentation-specific interface and canonical public data rather than duplicating exact gameplay values.
- `data/network.js` owns the currently shared verified public network facts used across overview and guide surfaces.
- The old GitBook documentation is retained only as an incomplete legacy migration reference. It is not the current source of truth.
- Community is centered on Discord and Guides; the former Forum surface is retired.

## Security boundary

Sensitive infrastructure, credentials, administrative tooling and private operational documentation are not part of this repository.

The static frontend is not an authorization boundary. Future Login, profiles, moderation and private APIs must use server-side identity/authorization and the requirements documented under `docs/` before they are treated as production features.

Marketplace imports follow a minimum-public-subset rule: Nexo caches, generated/deobfuscated pack caches and unrelated pack resources are not published simply because they exist in the source directory.

## Quality gates

PixelWeb includes dependency-free checks for committed secret material, JavaScript syntax, static-link integrity, CSP invariants and unsafe browser patterns. Guide pages have an additional documented network boundary: they currently permit `connect-src 'self'` only.

Browser-rendered responsive/performance QA is still required before merging substantial visual or interaction changes; static validation is not treated as proof of runtime rendering quality.

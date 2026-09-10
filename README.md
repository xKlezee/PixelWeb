# Pixel Network Web

Official web experience for Pixel Network.

The site presents the network's gameplay model, progression worlds, Nexus endgame, development direction, team, community surfaces and player documentation through a lightweight static frontend deployed with GitHub Pages.

## Public architecture

- Product/overview pages explain the experience and relationships between systems.
- Category pages expose contextual sibling navigation directly below the global navigation so related destinations stay one click away.
- `guides.html` is the current player-documentation entry point.
- Detailed `guide-*.html` pages use a denser documentation-specific interface and canonical public data rather than duplicating exact gameplay values.
- `data/network.js` owns the currently shared verified public network facts used across overview and guide surfaces.
- The old GitBook documentation is retained only as an incomplete legacy migration reference. It is not the current source of truth.
- The former Forum surface has been retired. `forum.html` exists only as a `noindex` compatibility redirect to Community for old bookmarks and links.
- About uses username-synchronized Minecraft skin presentation for the two owners rather than repository-pinned founder renders.

## Security boundary

Sensitive infrastructure, credentials, administrative tooling and private operational documentation are not part of this repository.

The static frontend is not an authorization boundary. Future Login, profiles, moderation, persistent community features and private APIs must use server-side identity/authorization and the requirements documented under `docs/` before they are treated as production features.

## Quality gates

PixelWeb includes dependency-free checks for committed secret material, JavaScript syntax, static-link integrity, CSP invariants and unsafe browser patterns. Guide pages have an additional documented network boundary: they currently permit `connect-src 'self'` only.

Browser-rendered responsive/performance QA is still required before merging substantial visual or interaction changes; static validation is not treated as proof of runtime rendering quality.

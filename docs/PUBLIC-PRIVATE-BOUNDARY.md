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

## Server-side boundary for future features

When Login, profiles, persistent Forum, private APIs, or staff tools are implemented, their privileged logic and secrets must execute on a trusted backend. The browser may request an operation; the server must decide whether it is authorized.

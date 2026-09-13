# PixelWeb navigation structure

This file is the source-of-truth note for the public information architecture. Do not reintroduce retired navigation families from static fallback markup.

## Primary navigation

The canonical top-level order is:

1. **Explore**
2. **Marketplace**
3. **Guide**
4. **Community**
5. **About**

`Store`, `Discord` and `Play` remain header actions rather than content families.

The Discord header action uses Discord's official Symbol asset inside the Pixel navigation material. The source SVG and its geometry must not be redrawn, replaced or distorted. Its rendered CSS tint may follow the effective Light/Dark theme so the glyph keeps sufficient contrast against the themed control; this presentation tint does not modify the source asset.

## Explore

Explore contains the product/gameplay destinations:

- Gameplay
- Systems
- Worlds
- Skyblock
- Nexus

Marketplace stays independent from Explore and Store.

## Guide

**Guide replaces Development as the primary documentation family. There is no Development navigation subcategory.**

Guide categories are shown in this canonical order:

- Getting Started
- Currencies
- Basic Commands
- Progression
- Mechanics
- Tools
- Armor
- Specials
- Boosts

`Getting Started` is intentionally first because the documentation should begin with joining the server and understanding its core concepts before moving into progression or specialized mechanics. Category ordering must come from the shared navigation/data model rather than CSS `order` patches.

### Foundation categories

The first three Guide categories own the server-wide information that should not be buried inside progression:

- **Getting Started** — joining Pixel Network, choosing a play route and understanding where to continue;
- **Currencies** — Coins, Pixels and Nexus Points as separate currency concepts;
- **Basic Commands** — concise, verified player-facing command shortcuts.

These are first-class Guide categories, not subheadings inside Progression.

### Current guide placement

The website currently contains ten canonical guide documents. Category placement is an information-architecture index; it does not duplicate or fork the underlying guide document.

| Guide | Categories |
| --- | --- |
| Getting Started | Getting Started |
| Currencies | Currencies |
| Basic Commands | Basic Commands |
| Levels, Prestige & Legacy | Progression |
| Worlds & Gates | Progression |
| Nexus & Instances | Specials, Progression |
| Skyblock | Mechanics, Progression |
| Stats & Equipment | Mechanics, Tools, Armor |
| Talisman Codex | Specials, Boosts |
| Enchantments | Mechanics, Tools, Armor, Boosts |

A guide may appear in multiple categories when its established content genuinely spans those categories. Do not create a second copy of the guide to achieve this.

`guides.html` remains the canonical Guide landing route. Category navigation uses same-page anchors:

- `guides.html#getting-started`
- `guides.html#currencies`
- `guides.html#basic-commands`
- `guides.html#progression`
- `guides.html#mechanics`
- `guides.html#tools`
- `guides.html#armor`
- `guides.html#specials`
- `guides.html#boosts`

The landing route without a hash defaults to `Getting Started`.

The legacy `development.html` route is retained only as a `noindex` compatibility redirect to `guides.html`. It must not return to canonical navigation or the sitemap.

## Community

Community has exactly four canonical subcategories:

- **Leaderboards** → `leaderboards.html`
- **Changelog** → `changelog.html`
- **Rules** → `rules.html`
- **Staff Team** → `staff.html`

`community.html` remains a landing hub for these four destinations and Discord, but it is not shown as a fifth Community subcategory.

### Staff Team boundary

`staff.html` owns all intentionally public people/ownership presentation, including the equal Klezee/PxlMads owner profiles and their interactive skin viewers. About must not duplicate those profiles.

Staff Team may only publish roles intentionally made public. Do not infer private staff membership.

### Evidence boundaries

- Leaderboards must use a verified server-backed source before publishing player positions or ranking numbers. Do not hand-maintain live standings.
- Rules must come from the current authoritative Pixel Network ruleset. Do not reconstruct enforcement rules from legacy documentation.
- Staff Team may only publish roles intentionally made public. Do not infer private staff membership.
- Changelog is release history, not permanent mechanics documentation.

## About

`team.html` remains the canonical **About** route for URL compatibility, but it is no longer a team-profile page.

About owns cross-site institutional and policy information that should not be scattered through gameplay pages:

- common questions / FAQ;
- official Store and Tebex boundary information;
- independent/unofficial Minecraft service disclaimer;
- external-service boundary notes;
- licensing, copyright and attribution policy.

Pixel-owned website source, branding, copy, layouts and custom assets are governed by the **Pixel Network Proprietary Website, Source, Content & Asset License v1.0** unless a more specific written notice applies. The canonical license text lives in `LICENSE`; `license.html` is the public-readable website copy. The project is proprietary, not open source. Third-party material remains under the rights, licenses and terms of its respective owners and is not relicensed by Pixel Network.

## Shared contextual subnavigation

Explore, Guide and Community contextual rails are generated by `polish.js` from the same canonical navigation model. HTML pages must not fork button order, positioning or active-state behavior with page-specific markup.

Within **Explore**, Gameplay, Systems, Worlds, Skyblock and Nexus use one visual contract. The established Worlds/Nexus Minecraft rail remains the geometry/reference design and is shared across the family.

The global interactive accent system is warm: yellow/gold/amber/orange/copper. Guide may use its denser documentation presentation while retaining the shared DOM order, labels, interaction model and responsive behavior. Community uses the same shared warm-accent contract.

`pixel-global-chrome.css` owns the shared Explore presentation. Contextual rails use the current 48px structural height. On mobile Worlds/Nexus immersive viewport math accounts for the measured 65px header plus 48px rail (113px total); the short-height landscape contract uses 97px after its compact header/rail adjustments.

## Footer

`polish.js` normalizes the footer across canonical pages. The shared footer contains:

- Pixel Network / Java Edition identity;
- primary useful destinations;
- Rules, Staff Team and About;
- the required unofficial Minecraft service disclaimer;
- a concise copyright / third-party attribution boundary.

Detailed FAQ, Store/Tebex boundary and licensing explanation live in About rather than being repeated in full on every page.

## Browser icon

The browser-tab icon is `favicon.png`, a square transparent crop containing only the Pixel Network cube. The full `LOGO OFICIAL.png` remains the brand/social/header asset and must not be used directly as a favicon because its wide canvas is compressed by browser tab UI.

`polish.js` normalizes existing legacy `<link rel="icon">` declarations to `favicon.png` at runtime so older pages do not need to retain the wide logo as tab identity.

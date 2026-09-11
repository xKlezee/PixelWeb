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

Guide categories are:

- Mechanics
- Tools
- Armor
- Specials
- Boosts
- Progression

`Progression` is intentionally retained as a sixth category because the existing Getting Started, account progression, Worlds, Nexus and Skyblock references should not be forced into equipment-only categories.

### Current guide placement

The website currently contains eight actual guide documents. Category placement is an information-architecture index; it does not duplicate or fork the underlying guide document.

| Guide | Categories |
| --- | --- |
| Getting Started | Progression |
| Levels, Prestige & Legacy | Progression |
| Worlds & Gates | Progression |
| Nexus & Instances | Specials, Progression |
| Skyblock | Mechanics, Progression |
| Stats & Equipment | Mechanics, Tools, Armor |
| Talisman Codex | Specials, Boosts |
| Enchantments | Mechanics, Tools, Armor, Boosts |

A guide may appear in multiple categories when its established content genuinely spans those categories. Do not create a second copy of the guide to achieve this.

`guides.html` remains the canonical Guide landing route. Category navigation uses same-page anchors:

- `guides.html#mechanics`
- `guides.html#tools`
- `guides.html#armor`
- `guides.html#specials`
- `guides.html#boosts`
- `guides.html#progression`

The legacy `development.html` route is retained only as a `noindex` compatibility redirect to `guides.html`. It must not return to canonical navigation or the sitemap.

## Community

Community has exactly four canonical subcategories:

- **Leaderboards** → `leaderboards.html`
- **Changelog** → `changelog.html`
- **Rules** → `rules.html`
- **Staff Team** → `staff.html`

`community.html` remains a landing hub for these four destinations and Discord, but it is not shown as a fifth Community subcategory.

### Evidence boundaries

- Leaderboards must use a verified server-backed source before publishing player positions or ranking numbers. Do not hand-maintain live standings.
- Rules must come from the current authoritative Pixel Network ruleset. Do not reconstruct enforcement rules from legacy documentation.
- Staff Team may only publish roles intentionally made public. Do not infer private staff membership.
- Changelog is release history, not permanent mechanics documentation.

## Browser icon

The browser-tab icon is `favicon.png`, a square transparent crop containing only the Pixel Network cube. The full `LOGO OFICIAL.png` remains the brand/social/header asset and must not be used directly as a favicon because its wide canvas is compressed by browser tab UI.

`polish.js` normalizes existing legacy `<link rel="icon">` declarations to `favicon.png` at runtime so older pages do not need to retain the wide logo as tab identity.

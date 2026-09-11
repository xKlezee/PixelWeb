# PixelWeb HTML visual audit — 2026-09

Audit baseline: `62f070c1204db67833d23725614627ab1084f8fe`.

Goal: verify that every public/compatibility HTML route is either using the current Minecraft-first / Origin-Realms-inspired Pixel presentation layer or is intentionally excluded from visual parity because it is a compatibility redirect.

## Result

No canonical user-facing page remains on the old generic SaaS/neumorphic presentation as its primary visual language.

The website intentionally has several presentation families because not every destination should be forced into the same layout:

1. **Minecraft home** — scene-led landing presentation.
2. **Minecraft RPG shell / secondary** — standard player-facing pages.
3. **Immersive chrome** — Worlds and Nexus, preserving viewport/interaction math.
4. **Guide document skin** — Guide landing and detailed documentation.
5. **Marketplace RPG** — collection/model viewer presentation while preserving its renderer.
6. **Compatibility redirects** — noindex routes that are not product destinations.

“Consistent” therefore means shared Pixel/Minecraft materials, navigation behavior, typography hierarchy and interaction rules; it does not mean replacing Worlds, Nexus, Guide or Marketplace with the same card layout.

## Route-by-route audit

| HTML | Role | Visual family | Status / boundary |
| --- | --- | --- | --- |
| `index.html` | Home | Minecraft home | Current Minecraft-first landing. |
| `gameplay.html` | Explore | Minecraft RPG shell | Current; Explore rail now matches Worlds/Nexus. |
| `systems.html` | Explore | Minecraft RPG shell | Current; Explore rail now matches Worlds/Nexus. |
| `worlds.html` | Explore | Immersive chrome | Current; reference visual for the official Explore rail; viewport math preserved. |
| `skyblock.html` | Explore | Minecraft RPG secondary | Current; Explore rail now matches Worlds/Nexus. |
| `nexus.html` | Explore | Immersive chrome | Current; reference visual for the official Explore rail; approved boss PNG contract preserved. |
| `marketplace.html` | Marketplace | Marketplace RPG | Current; 3D renderer/runtime preserved. |
| `guides.html` | Guide landing | Guide wiki / GitBook-like skin | Current; Progression is canonical first category. |
| `guide-getting-started.html` | Guide detail | Guide document skin | Current. |
| `guide-progression.html` | Guide detail | Guide document skin | Current. |
| `guide-worlds.html` | Guide detail | Guide document skin | Current. |
| `guide-nexus.html` | Guide detail | Guide document skin | Current. |
| `guide-skyblock.html` | Guide detail | Guide document skin | Current. |
| `guide-stats-equipment.html` | Guide detail | Guide document skin | Current. |
| `guide-talismans.html` | Guide detail | Guide document skin | Current. |
| `guide-enchantments.html` | Guide detail | Guide document skin | Current. |
| `community.html` | Community hub | Minecraft RPG secondary | Current. |
| `leaderboards.html` | Community | Minecraft RPG secondary | Current; no invented standings. |
| `changelog.html` | Community | Minecraft RPG secondary/document hybrid | Current. |
| `rules.html` | Community | Minecraft RPG secondary | Current; no reconstructed stale rules. |
| `staff.html` | Community | Minecraft RPG secondary + owner viewers | Updated: owns the full public Klezee/PxlMads profiles. |
| `store.html` | Store action | Minecraft RPG secondary/store | Current; official Tebex CTA and verified-publication boundaries retained. |
| `team.html` | About | Minecraft RPG secondary/information | Updated: FAQ, Tebex boundary, disclaimers, proprietary license and attribution; no longer duplicates Staff Team. |
| `license.html` | Rights | Minecraft RPG secondary/information | New: public-readable Pixel Network Proprietary License v1.0. |
| `404.html` | Error | Minecraft RPG shell | Current branded error surface; noindex. |
| `development.html` | Legacy | Compatibility redirect | Intentionally noindex redirect to Guide; not a visual destination. |
| `forum.html` | Legacy | Compatibility redirect | Intentionally noindex redirect to Community; not a visual destination. |

## Contextual subnavigation audit

The visible Explore, Guide and Community sublists are generated centrally in `polish.js`.

Required invariant:

- same DOM structure;
- same item ordering source;
- same active-state logic;
- same keyboard/mobile interaction;
- same horizontal rail behavior;
- within Explore, Gameplay / Systems / Worlds / Skyblock / Nexus use the same typography, sizing, spacing, borders, colors and hover/current-page treatment;
- Worlds/Nexus retain their established 50px rail geometry where needed by immersive viewport math.

The visual reference for Explore is the established **Worlds/Nexus** rail, not the older generic rounded rail from `polish.css`. Its compact uppercase typography, squared button geometry, dark green/stone surface and Pixel Blue lower-edge active state are now shared to Gameplay, Systems and Skyblock through `pixel-global-chrome.css`.

The previous Guide implementation had a structural mismatch: Progression was visually moved to the front by CSS while remaining last in the canonical data array, and `guides.html` without a hash still selected Mechanics by default. This pass fixes the model itself:

- Progression is first in `polish.js`;
- Progression is first in `guide-categories.js`;
- Progression is the default Guide category;
- the documentation source of truth uses the same order.

Existing CSS ordering rules may remain harmless compatibility styling, but they are no longer required to establish the canonical order.

## Header action audit

Discord and Store remain separate destinations but no longer look like unrelated controls. The Discord header action uses Discord's official Symbol asset without redrawing or recoloring it, placed inside an inset/recessed Pixel material control at the same header scale as Store. Mobile navigation retains a readable text destination.

## About / Staff separation

The previous state used `team.html` (labeled About) for the full owner profiles while `staff.html` contained a second, simplified copy of the same people.

New ownership boundary:

- `staff.html` = people, public roles, equal ownership, interactive owner skins;
- `team.html` = About, FAQ, Store/Tebex boundary, Minecraft disclaimer, external-service notes, licensing and attribution;
- `license.html` = full public-readable Pixel Network proprietary license.

This removes duplicated team semantics without changing the established public About URL in this pass.

## Footer boundary

The shared runtime footer now owns information that should appear everywhere but should not be duplicated as long prose on each page:

- Pixel Network / Java Edition identity;
- useful destination links;
- Rules / Staff Team / About;
- unofficial Minecraft disclaimer;
- copyright and third-party-rights boundary.

The full explanation remains in About and the dedicated License page.

## Licensing decision

PixelWeb uses the **Pixel Network Proprietary Website, Source, Content & Asset License v1.0** as the default rights statement for Pixel-owned material.

Canonical sources:

- repository legal text: `LICENSE`;
- public-readable page: `license.html`;
- policy summary and attribution boundary: `team.html` (About).

The license is intentionally proprietary and not open source. It allows ordinary public website access and source inspection while reserving redistribution, public redeployment, derivative publication, commercial exploitation, branding use, bulk asset extraction and other reuse unless Pixel Network gives written permission or applicable law independently permits the activity.

Third-party material is expressly excluded from Pixel Network's license grant and remains governed by the rights, licenses and terms of its respective owners.

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
| `gameplay.html` | Explore | Minecraft RPG shell | Current. |
| `systems.html` | Explore | Minecraft RPG shell | Current. |
| `worlds.html` | Explore | Immersive chrome | Current; must preserve one-world-at-a-time interaction and viewport math. |
| `skyblock.html` | Explore | Minecraft RPG secondary | Current. |
| `nexus.html` | Explore | Immersive chrome | Current; must preserve encounter slider and original boss PNG contract. |
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
| `team.html` | About | Minecraft RPG secondary/information | Updated: FAQ, Tebex boundary, disclaimers and attribution; no longer duplicates Staff Team. |
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
- Worlds/Nexus retain only their established 50px rail geometry where needed by immersive viewport math.

The old immersive chrome was overriding the Explore rail on Worlds/Nexus with smaller uppercase text, squared buttons, a green/gray background and a different active treatment. That override has been removed. `minecraft-rpg-chrome.css` now preserves only the 50px geometry while the complete visual treatment inherits from the shared `polish.css` rules used by Gameplay, Systems and Skyblock.

The previous Guide implementation had a structural mismatch: Progression was visually moved to the front by CSS while remaining last in the canonical data array, and `guides.html` without a hash still selected Mechanics by default. This pass fixes the model itself:

- Progression is first in `polish.js`;
- Progression is first in `guide-categories.js`;
- Progression is the default Guide category;
- the documentation source of truth uses the same order.

Existing CSS ordering rules may remain harmless compatibility styling, but they are no longer required to establish the canonical order.

## About / Staff separation

The previous state used `team.html` (labeled About) for the full owner profiles while `staff.html` contained a second, simplified copy of the same people.

New ownership boundary:

- `staff.html` = people, public roles, equal ownership, interactive owner skins;
- `team.html` = About, FAQ, Store/Tebex boundary, Minecraft disclaimer, external-service notes, copyright and attribution.

This removes duplicated team semantics without changing the established public About URL in this pass.

## Footer boundary

The shared runtime footer now owns information that should appear everywhere but should not be duplicated as long prose on each page:

- Pixel Network / Java Edition identity;
- useful destination links;
- Rules / Staff Team / About;
- unofficial Minecraft disclaimer;
- copyright and third-party-rights boundary.

The full explanation remains in About.

## Licensing decision

Do not apply `CC BY-NC-SA 3.0` or another Creative Commons license globally to PixelWeb by default.

Reasoning:

- a CC license intentionally grants reuse permissions rather than merely protecting attribution;
- PixelWeb mixes original branding/content with software and third-party material;
- Creative Commons does not recommend its licenses for software;
- third-party material cannot be relicensed simply by placing a blanket site notice over it.

Current site policy:

- original Pixel Network branding, site copy, layouts and custom assets are all rights reserved unless specifically stated otherwise;
- third-party material remains under the respective rights/terms;
- future CC releases must mark the exact non-software material and exact license/version individually;
- future source-code reuse rights, if desired, should be granted with a software-specific license.

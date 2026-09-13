# PixelWeb HTML visual audit — 2026-09

Goal: keep every canonical user-facing route inside the current Minecraft-first Pixel presentation while preserving deliberate specialized layouts such as Worlds/Nexus, Guide and Marketplace.

## Result

No canonical user-facing page is intended to use the old generic SaaS/neumorphic presentation as its primary language.

Current presentation families remain intentionally distinct:

1. **Minecraft home** — scene-led landing presentation.
2. **Minecraft RPG shell / secondary** — standard player-facing pages.
3. **Immersive chrome** — Worlds and Nexus, preserving viewport/interaction math.
4. **Guide document skin** — Guide landing and detailed documentation.
5. **Marketplace RPG** — collection/model viewer presentation while preserving its renderer.
6. **Compatibility redirects** — noindex routes that are not product destinations.

Consistency means shared Pixel/Minecraft materials, warm interaction accents, navigation behavior, typography hierarchy and interaction rules; it does not mean forcing every page into the same card layout.

## Route-by-route audit

| HTML | Role | Visual family | Status / boundary |
| --- | --- | --- | --- |
| `index.html` | Home | Minecraft home | Current; Guide entry points to Getting Started. |
| `gameplay.html` | Explore | Minecraft RPG shell | Current. |
| `systems.html` | Explore | Minecraft RPG shell | Current. |
| `worlds.html` | Explore | Immersive chrome | Current; viewport math preserved. |
| `skyblock.html` | Explore | Minecraft RPG secondary | Current; partial feature boundary remains explicit. |
| `nexus.html` | Explore | Immersive chrome | Current; approved boss PNG contract preserved. |
| `marketplace.html` | Marketplace | Marketplace RPG | Current; 3D renderer/runtime preserved. |
| `guides.html` | Guide landing | Guide wiki / GitBook-like skin | Current; Getting Started is canonical first/default category. |
| `guide-getting-started.html` | Guide detail | Guide document skin | Current; join + server basics are static in source. |
| `guide-currencies.html` | Guide detail | Guide document skin | Current; Coins / Pixels / Nexus Points separated. |
| `guide-basic-commands.html` | Guide detail | Guide document skin | Current; concise player-command reference. |
| `guide-progression.html` | Guide detail | Guide document skin | Current. |
| `guide-worlds.html` | Guide detail | Guide document skin | Current. |
| `guide-nexus.html` | Guide detail | Guide document skin | Current. |
| `guide-skyblock.html` | Guide detail | Guide document skin | Current. |
| `guide-stats-equipment.html` | Guide detail | Guide document skin | Current. |
| `guide-talismans.html` | Guide detail | Guide document skin | Current; client-presentation boundary remains. |
| `guide-enchantments.html` | Guide detail | Guide document skin | Current; live-client validation boundary remains. |
| `community.html` | Community hub | Minecraft RPG secondary | Current. |
| `leaderboards.html` | Community | Minecraft RPG secondary | Current frontend foundation; no invented standings. |
| `changelog.html` | Community | Minecraft RPG secondary/document hybrid | Current. |
| `rules.html` | Community | Minecraft RPG secondary | Current. |
| `staff.html` | Community | Minecraft RPG secondary + owner viewers | Current; equal Klezee/PxlMads profiles. |
| `store.html` | Store action | Minecraft RPG secondary/store | Current; Tebex boundary retained. |
| `team.html` | About | Minecraft RPG secondary/information | Current; Start here points to Getting Started. |
| `license.html` | Rights | Minecraft RPG secondary/information | Current public-readable proprietary license. |
| `404.html` | Error | Minecraft RPG shell | Branded error surface; noindex. |
| `development.html` | Legacy | Compatibility redirect | noindex redirect to Guide. |
| `forum.html` | Legacy | Compatibility redirect | noindex redirect to Community. |

## Contextual subnavigation audit

Explore, Guide and Community use the central model in `polish.js` for runtime contextual navigation.

Canonical groups:

- Explore → Gameplay / Systems / Worlds / Skyblock / Nexus
- Guide → Getting Started / Currencies / Basic Commands / Progression / Mechanics / Tools / Armor / Specials / Boosts
- Community → Leaderboards / Changelog / Rules / Staff Team

Getting Started is first/default for Guide. The previous CSS rules that forced Progression visually to the front have been removed; category order now comes from the actual canonical model/markup.

`guides.html` also owns the full Guide Browse information architecture statically. JavaScript only filters/searches and opens matching groups; it no longer creates the foundation categories. This keeps the core documentation structure usable before JavaScript runs.

Within Explore, contextual rails use the current 48px structural geometry. Worlds/Nexus immersive viewport math uses the measured chrome budget rather than the historical 50px rail assumption. Shared interaction/selection accents are warm gold/amber/orange rather than Pixel Blue.

## Guide Browse audit

The visible Browse hierarchy intentionally contains only useful navigation:

- no category counts;
- no `Category overview` filler rows;
- no intermediate labels such as Start here / Account / Journey / Endgame;
- every child is a real link;
- Currencies links directly to Coins, Pixels and Nexus Points sections;
- Basic Commands links directly to the documented command sections.

Getting Started owns the entry/orientation role. Progression now begins with account progression rather than duplicating Getting Started.

## Header action audit

Desktop action contract is theme-aware:

1. Discord — compact secondary control using Discord's official Symbol source; Dark keeps the charcoal treatment and Light uses the approved semantic/light treatment;
2. Play — compact secondary control; Dark keeps the charcoal treatment and Light uses the approved parchment/stone treatment;
3. Store — strongest gold CTA in both themes.

The official Discord Symbol source and glyph geometry must remain unchanged. CSS presentation may tint the rendered Symbol for effective-theme contrast; this does not replace or modify the source asset.

## Warm identity audit

The shared accent family is yellow / gold / amber / orange / copper on warm charcoal/stone neutrals. This affects navigation, selected categories, Guide states and common controls without recoloring authored world/boss media. Semantic brand treatments such as Discord remain allowed where explicitly documented.

## Staff Team / About separation

- `staff.html` owns people, public roles, equal ownership and interactive owner skins;
- `team.html` owns About, FAQ, Store/Tebex boundary, Minecraft disclaimer, external-service notes, licensing and attribution;
- `license.html` owns the full readable proprietary license.

Staff renderer supports classic and slim skins, preserves Minecraft pixel rendering, corrects Klezee's head outer-layer side orientation and no longer displays the old drag-instruction label.

## Footer boundary

The shared runtime footer owns:

- Pixel Network / Java Edition identity;
- useful destination links;
- Rules / Staff Team / About;
- unofficial Minecraft disclaimer;
- concise copyright and third-party-rights boundary.

Full policy explanation remains in About and License.

## Evidence boundary

This audit is a source/architecture record, not a browser-render PASS. Responsive, interaction, CORS/canvas, CSP/network and media-render behavior still require a real browser pass before being described as browser-verified.

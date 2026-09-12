# PixelWeb theme coverage audit — September 2026

This document records the source-level audit performed after the Light / Dark / System selector was introduced. The problem being corrected was incomplete coverage: several pages inherited the global theme while nested mechanics still kept hard-coded dark backgrounds, overlays, frames or modal surfaces.

The goal of this pass is that every current public visual mechanic has an intentional theme treatment, not merely the page body or navigation.

## Status matrix

| Surface / mechanic | Audited states | Coverage |
| --- | --- | --- |
| Global body / header / navigation | light, dark, system, hover, focus, current, mobile | Covered |
| Contextual Explore / Guide / Community rails | default, current, hover, mobile | Covered |
| Footer | identity, links, legal text | Covered |
| Appearance control | system, light, dark, menu, keyboard | Covered |
| Pixel Navigator | trigger, panel, search, examples, results, fallback, mobile | Covered |
| Play / Join dialog | backdrop, steps, IP control, footer actions | Covered |
| Home hero | full-bleed Nexus media, overlays, copy, status | Covered |
| Home progression cards | default / hover / text / accents | Covered |
| Home World gallery | image frames, overlays, hover, captions | Covered |
| Home Nexus media | image stage / frame / copy | Covered |
| Home Marketplace promo | panel / decorative visual / CTA | Covered |
| Gameplay / Systems | heroes, stat cards, information cards, routes, flow lines | Covered |
| Legacy shared content surfaces | World rows, Nexus access, difficulty, development/status, timeline, CTAs, indexes | Covered |
| Marketplace hero / subnav | default, current, route selection | Covered |
| Marketplace 3D visualizer | card, transparent canvas stage, loading, focus, shadow | Covered |
| Marketplace item previews | transparent canvases, cards, active, hover | Covered |
| Marketplace detail / Store bridge | details, facts, CTA boundary | Covered |
| Leaderboards | hero, categories, metrics, records | Covered |
| Leaderboards Top 3 | podium cards, full-player renders, fallback, shadows | Covered |
| Leaderboards table | top 10, full list, player heads, hover | Covered |
| Leaderboards auxiliary states | source/test, empty, badges, full-toggle | Covered |
| Worlds immersive selector | image media, overlays, copy, rail, counter | Covered |
| Worlds investigation control | orb, pulse, hover/focus | Covered |
| Worlds detail dialog | backdrop, image, gradient, stats, note, actions | Covered |
| Nexus immersive selector | boss media, dual media, overlays, copy, rail, counter | Covered |
| Nexus investigation control | orb, pulse, hover/focus | Covered |
| Nexus detail dialog | backdrop, image, body, difficulty ladder, actions | Covered |
| Skyblock page | hero, island cards, capability/reference panels, boundaries | Covered |
| Community | hero, portal cards, Discord banner | Covered |
| Changelog | timeline / current shared information surfaces | Covered |
| Rules | current shared RPG/information surfaces | Covered |
| Staff | hero, staff cards, owner areas | Covered |
| Owner Minecraft skin viewer | viewer stage, canvas surroundings, labels, tags | Covered |
| About | overview, FAQ, policy, disclaimer, external-boundary surfaces | Covered |
| License | hero, policy panels, legal/disclaimer content | Covered |
| Store | hero, rank panel, categories, final CTA | Covered |
| Store rank dialog | modal, backdrop, tier cards, note | Covered |
| Wiki / Guide landing | hero, search, browse tree, article links | Covered |
| Detailed Guide shell | sidebar, document header, facts, tables, callouts | Covered |
| Progression guide | layer rail, milestones, boundary cards, access note | Covered |
| Skyblock guide | capabilities, foundation/partial cards, rules/status | Covered |
| Enchantments guide | principles, mechanics, retired entries, verification | Covered |
| Stats & Equipment guide | formula/code, families, layers, exclusions, verification | Covered |
| Talisman guide | state flow, rarity, pipeline, verification, secret policy | Covered |
| Mobile-only navigation/actions | menu surface, dropdown rail, Store/Discord rows | Covered |

## Media / renderer rule

The theme system does **not** rewrite source art. Theme support around a media mechanic means adapting its environment rather than recoloring the asset itself.

- Marketplace model/item canvases remain transparent. Their CSS stage, border, shadow and surrounding cards change with the theme.
- Minecraft player skins remain their original textures. Their viewer stage, floor/shadow and card treatment change.
- World and Nexus images remain the same files. Light mode uses CSS brightness/contrast and light overlays to keep the full-bleed composition readable; dark mode keeps the authored dark presentation.
- Nexus boss PNGs remain untouched and no image conversion, compression or sprite generation is part of theme switching.
- Logos and other authored images are not replaced.

## Runtime cascade

Theme overrides are intentionally loaded after page-specific authored CSS:

1. `pixel-theme.css`
2. `pixel-theme-coverage.css`
3. `pixel-theme-audit-fixes.css`
4. `pixel-theme-page-fixes.css`
5. `pixel-theme.js`

The active effective mode is exposed through `html[data-theme-effective="light|dark"]`. System mode resolves to one of those modes and reacts to `prefers-color-scheme` changes while the page is open.

## Verification boundary

This matrix records source coverage and selector/state analysis. It does not claim full browser screenshot QA on every viewport/device. A visual QA pass remains useful for detecting browser-specific rendering differences, but current public mechanics no longer intentionally rely on an unthemed dark-only component shell at source level.

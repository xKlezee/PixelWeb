# PixelWeb Minecraft RPG Redesign

This document is the design contract for the 2026 Minecraft-first visual redesign.

## Safety / rollback

The pre-redesign production state is preserved in:

- branch: `checkpoint/pre-minecraft-redesign-2026-09`
- source production commit at redesign start: `9dd0910ab350583d697ab12110ce3fdbf06daf0c`

The historical redesign branch is:

- `design/minecraft-rpg-redesign-2026-09`

Do not rewrite or delete the checkpoint branch while this redesign history remains relevant.

## Product direction

PixelWeb should immediately feel like a premium Minecraft RPG website rather than a generic dark SaaS/product website.

The visual language may take inspiration from the clarity and Minecraft-first orientation of sites such as Origin Realms, but Pixel Network must keep its own composition, branding, UI, code and assets.

Core principles:

1. Minecraft imagery carries most of the message.
2. Player-facing pages use short copy and strong visual hierarchy.
3. Technical/source-of-truth details stay in repository documentation unless a player actually needs them.
4. Surfaces should feel constructed from stone, wood, metal, parchment and in-game UI motifs without becoming a literal inventory-screen clone.
5. Warm yellow/gold/amber/orange/copper is the shared interaction-accent language. The previous Pixel Blue treatment is not the global selection/accent system; authored semantic colors such as Discord identity, biome/world identity and boss artwork may remain distinct.
6. Avoid generic neumorphic/SaaS cards as the dominant visual language.
7. Prefer large scenes, environmental framing, models, icons and screenshots over explanatory paragraphs.
8. Preserve accessible focus states, keyboard navigation, reduced motion and responsive layouts.

## Information architecture

The canonical navigation is:

- Explore
  - Gameplay
  - Systems
  - Worlds
  - Skyblock
  - Nexus
- Marketplace
- Guide
  - Getting Started
  - Currencies
  - Basic Commands
  - Progression
  - Mechanics
  - Tools
  - Armor
  - Specials
  - Boosts
- Community
  - Leaderboards
  - Changelog
  - Rules
  - Staff Team
- About

Store, Discord and Play remain high-priority actions rather than content categories.

Discord uses Discord's official Symbol inside the Pixel navigation control. The source SVG and glyph geometry must not be redrawn, replaced or distorted. CSS may tint the rendered Symbol according to the effective Light/Dark theme so it keeps sufficient contrast without modifying the source asset.

`Getting Started` is the canonical first Guide category. Its position must come from the shared navigation/category model, not from CSS ordering tricks.

## Home contract

Home is not documentation. It should answer only:

- What is Pixel Network?
- What can I play?
- What does progression look like?
- What is the endgame?
- Where do I go next?

Current intended section order:

1. Hero / Play
2. Worlds / Skyblock / Nexus entry points
3. Four-world visual route
4. Nexus endgame
5. Marketplace
6. Guide / Community / Store

The previous long immersive/video explanation, development-status sales copy and repeated system descriptions are intentionally removed from Home.

## Worlds contract

`worlds.html` keeps the immersive region selector that already exists on production.

It must remain:

- one full-screen World scene at a time;
- Overworld → Pirate Kingdom → Nether → Winter;
- vertical node rail;
- wheel / trackpad / swipe / keyboard navigation;
- a smooth state transition between images rather than stacked banners;
- one pulsing Explore control;
- a compact detail view for access, mines, boss and next gate;
- Nexus excluded from the World rail.

The Minecraft RPG redesign may reskin the chrome around this experience, but must not replace it with cards or a conventional page section stack.

## Nexus contract

`nexus.html` follows the same interaction grammar as Worlds, but the selectable states are current Instance encounters rather than regions:

1. Raphael
2. Azazel
3. Abyss + Astral

Rules:

- one encounter scene at a time;
- vertical node rail;
- wheel / trackpad / swipe / keyboard navigation;
- pulsing Explore control;
- Explore opens the encounter format and current difficulty unlocks;
- Raphael and Azazel use one original PNG each;
- Abyss + Astral remains one encounter and displays both original PNGs together;
- do not convert, recompress, sprite, crop or replace the approved Nexus boss PNG files;
- detailed progression explanation remains in `guide-nexus.html`, not duplicated on the visual Nexus page.

## Marketplace contract

`marketplace.html` is a visual collection showcase, not a technical model browser.

The redesign may change the presentation around the runtime, but must preserve:

- the existing `marketplace.js` renderer;
- the Nexo-backed Marketplace manifest and imported model/texture assets;
- live rotating previews on collection cards;
- the large interactive inspection viewer;
- current drag directions;
- idle Y-axis rotation in the large viewer;
- wheel zoom;
- preview/inspection scale normalization;
- click transfer from preview orientation to the large viewer;
- reduced-motion behavior.

The intended presentation is:

1. short Marketplace hero;
2. compact collection route;
3. large model viewer as the primary visual;
4. item-like detail panel;
5. live model slots for the collection;
6. small bridge to Store.

Marketplace and Store remain separate surfaces.

## Interior-page contract

Gameplay, Systems and Guide share one Minecraft RPG presentation family rather than three unrelated layouts.

- `gameplay.html` explains the playable journey at a glance.
- `systems.html` acts as a visual system index.
- `guides.html` is the canonical Wiki/Guide landing and category catalogue.

Guide categories remain, in canonical order:

- Getting Started
- Currencies
- Basic Commands
- Progression
- Mechanics
- Tools
- Armor
- Specials
- Boosts

All current Guide documents must stay reachable. A Guide may appear in more than one category when its subject genuinely crosses categories.

## Secondary-page contract

The secondary pages use the same Minecraft RPG material language while staying intentionally short.

- `skyblock.html` presents persistence, island economy and Skyblock quests as the three current pillars; partial team controls stay clearly separated.
- `community.html` is a portal hub for Leaderboards, Changelog, Rules and Staff Team plus Discord.
- `leaderboards.html` never invents standings while a verified source is unavailable.
- `rules.html` never reconstructs a ruleset from stale sources.
- `changelog.html` is now a Community destination and no longer depends on the retired Development category.
- `staff.html` owns the public team presentation. Klezee and PxlMads remain visually equal, retain their interactive skin viewers and are distinguished only by their published responsibility areas.
- `team.html` remains the canonical About URL for compatibility, but About is institutional rather than a duplicate staff page. It contains FAQ, Store/Tebex boundaries, the unofficial Minecraft disclaimer, external-service notes, licensing and attribution.
- `license.html` publishes the readable Pixel Network proprietary license while `LICENSE` remains the canonical repository text.
- `store.html` focuses on the official Store, cumulative rank path and current purchase categories without publishing unverified thresholds.
- `404.html` uses the same material language and routes users back to maintained destinations.

### About / Staff boundary

Do not move owner profiles back into About.

- **Staff Team** answers “who is publicly listed and what do they work on?”
- **About** answers “what is Pixel Network, where is authoritative information, how do Store/Tebex boundaries work, and what legal/attribution notices apply?”

About must not invent refund policy, pricing, support guarantees or legal terms that are not actually published by the applicable service.

Pixel-owned website source, branding, copy, layouts and custom assets use the **Pixel Network Proprietary Website, Source, Content & Asset License v1.0** by default. The project is proprietary, not open source. Third-party material is excluded from Pixel Network's license grant and remains under the rights and terms of its respective owners.

## Detailed Guide presentation

Detailed `guide-*.html` pages keep their current factual content, tables, evidence labels and page-specific scripts. The redesign changes presentation only.

`guide-rpg.css` is loaded through the shared `guides-status.css` entry point so all current detailed Guides receive the same Minecraft RPG document skin without editing each source document independently.

The guide layer may change:

- sidebar material and framing;
- page header framing;
- table presentation;
- callout presentation;
- evidence badge styling;
- spacing and visual hierarchy.

It must not silently change guide facts, evidence claims, values or source boundaries.

## Shared navigation and contextual sublists

`polish.js` remains the source of truth for the canonical navigation and the Explore / Guide / Community contextual rails.

All contextual rails must share:

- item order from the canonical model;
- the same DOM structure;
- the same active-state semantics;
- the same keyboard/touch behavior;
- the same responsive horizontal-scroll contract.

The **Explore** contextual rail has one visual contract across Gameplay, Systems, Worlds, Skyblock and Nexus. The established **Worlds/Nexus Minecraft rail is the reference design**: compact uppercase typography, squared button geometry, dark green/stone material and the current warm active treatment. Gameplay, Systems and Skyblock must inherit that design rather than replacing Worlds/Nexus with the older generic rounded rail.

`pixel-global-chrome.css` owns this shared Explore presentation. Contextual rails use the current 48px structural height. Worlds/Nexus immersive viewport math is based on the measured chrome rather than the historical 50px rail assumption.

Guide may use its warm document palette, but it must not fork the sublist model. Community uses the standard shared presentation.

## Shared footer contract

The runtime footer is normalized across canonical pages and includes:

- Pixel Network / Java Edition identity;
- useful maintained destinations;
- Rules, Staff Team and About;
- a prominent unofficial Minecraft server disclaimer;
- a concise copyright and third-party-rights boundary.

Long-form FAQ, purchase boundaries and attribution explanations belong in About rather than being duplicated in every footer.

## Shared chrome and immersive responsive behavior

`minecraft-rpg-chrome.css` provides navigation and detail-panel treatment for the immersive Worlds/Nexus destinations while deliberately preserving their viewport math. `pixel-global-chrome.css` promotes the established Worlds/Nexus contextual-rail appearance to the other Explore destinations.

Both immersive pages currently use a 113px standard chrome budget. At mobile widths this corresponds to the measured 65px header plus 48px contextual rail. The short-height landscape contract reduces the compact header/rail combination to a 97px budget. Styling work must update these measured values deliberately rather than reintroducing historical hard-coded assumptions.

On smaller layouts:

- the vertical rail collapses to nodes only;
- side metadata is hidden before core encounter/world information;
- titles scale down without changing the interaction model;
- Explore remains reachable in normal mobile layouts;
- non-essential investigate/hint affordances may be hidden in short-height landscape where vertical space is critically constrained;
- detail dialogs collapse from two columns to one;
- reduced-motion continues to disable non-essential transitions.

## Existing systems that must survive the redesign

Visual work must not casually rewrite or replace these runtime/data contracts:

- `data/network.js`
- `data/worlds-media.js`
- Worlds region selector and scroll controller
- Nexus boss media and approved original PNGs
- Marketplace Nexo manifest/import projection
- Marketplace 3D model renderer
- Guide category mapping
- canonical navigation in `polish.js`
- owner skin viewer

The redesign should wrap these systems in a presentation layer wherever possible rather than fork their source of truth.

## Media direction

Final production visuals should prioritize actual Pixel Network captures and assets.

Temporary media may be used during layout work, but third-party imagery must not be imported merely because it looks attractive. Reuse/license terms must be known. Final screenshots should ideally share shader, camera, color grade and resolution so the site feels like one world.

## Copy density

Player-facing copy should be concise. A typical visual section should need:

- one eyebrow/kicker;
- one short title;
- zero or one short paragraph;
- one primary action.

Long-form explanation belongs in detailed Guide/Changelog/About/License sections, not Home or visual destination pages.

## Current redesign pass

The redesign now covers:

- Home rebuilt around Minecraft-first scenes and shorter copy.
- Worlds preserved as the production full-screen region selector and reskinned only at the chrome/detail level.
- Nexus uses the same scene/slider interaction grammar as Worlds.
- Gameplay simplified to a progression overview.
- Systems simplified to a visual system index.
- Guide landing expanded to the canonical nine-category model with Getting Started first, followed by Currencies and Basic Commands before deeper progression/mechanics references.
- Skyblock simplified to its three current pillars plus an explicit partial-feature boundary.
- Community, Leaderboards, Changelog and Rules aligned to the material language.
- Staff Team owns the two equal owner profiles and preserves both live skin viewers.
- About owns FAQ, Tebex/Store boundaries, Minecraft independence, external-service notices, licensing and attribution.
- Pixel Network Proprietary License v1.0 is published in `LICENSE` and `license.html`.
- Explore rail styling uses the established Worlds/Nexus presentation across all five Explore destinations with the current warm accent contract.
- Discord header action uses the official Discord Symbol source asset; shell and rendered glyph presentation adapt to the effective appearance theme without altering that source asset.
- Store is focused on the official CTA, cumulative rank path, purchase categories and one progression boundary note.
- Marketplace is presented as a Minecraft collection showcase without changing its 3D runtime.
- Detailed Guides receive a shared Minecraft RPG document skin without changing their factual content.
- 404 is aligned to the same visual identity.
- Shared Minecraft RPG material language covers Home, interior, secondary, guide and immersive chrome surfaces.
- Shared footer includes useful destinations, Minecraft disclaimer and rights boundary.
- Responsive composition now follows the shared 1024 / 980 / 768 / 600 / 430 / 390 / 360 checkpoints plus short-height landscape handling.

## Review state

PR #11 remains intentionally draft as the historical redesign review record. The redesign principles in this document continue to govern subsequent visual iteration on `main`.

Production changes after that redesign may land through later PRs, but they must preserve the contracts above unless the source-of-truth documentation is intentionally updated with the change.

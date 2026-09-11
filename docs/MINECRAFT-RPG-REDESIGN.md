# PixelWeb Minecraft RPG Redesign

This document is the design contract for the 2026 Minecraft-first visual redesign.

## Safety / rollback

The pre-redesign production state is preserved in:

- branch: `checkpoint/pre-minecraft-redesign-2026-09`
- source production commit at redesign start: `9dd0910ab350583d697ab12110ce3fdbf06daf0c`

The redesign branch is:

- `design/minecraft-rpg-redesign-2026-09`

Do not rewrite or delete the checkpoint branch while this redesign is being evaluated.

## Product direction

PixelWeb should immediately feel like a premium Minecraft RPG website rather than a generic dark SaaS/product website.

The visual language may take inspiration from the clarity and Minecraft-first orientation of sites such as Origin Realms, but Pixel Network must keep its own composition, branding, UI, code and assets.

Core principles:

1. Minecraft imagery carries most of the message.
2. Player-facing pages use short copy and strong visual hierarchy.
3. Technical/source-of-truth details stay in repository documentation unless a player actually needs them.
4. Surfaces should feel constructed from stone, wood, metal, parchment and in-game UI motifs without becoming a literal inventory-screen clone.
5. Pixel Blue remains the primary branded accent.
6. Avoid generic neumorphic/SaaS cards as the dominant visual language.
7. Prefer large scenes, environmental framing, models, icons and screenshots over explanatory paragraphs.
8. Preserve accessible focus states, keyboard navigation, reduced motion and responsive layouts.

## Information architecture

The canonical navigation remains:

- Explore
  - Gameplay
  - Systems
  - Worlds
  - Skyblock
  - Nexus
- Marketplace
- Guide
  - Mechanics
  - Tools
  - Armor
  - Specials
  - Boosts
  - Progression
- Community
  - Leaderboards
  - Changelog
  - Rules
  - Staff Team
- About

Store, Discord and Play remain high-priority actions rather than content categories.

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

## Interior-page contract

Gameplay, Systems and Guide share one Minecraft RPG presentation layer rather than three unrelated layouts.

- `gameplay.html` explains the playable journey at a glance.
- `systems.html` acts as a visual system index.
- `guides.html` is a category catalogue, not a technical documentation dashboard.

Guide categories remain:

- Mechanics
- Tools
- Armor
- Specials
- Boosts
- Progression

All current Guide documents must stay reachable. A Guide may appear in more than one category when its subject genuinely crosses categories.

## Secondary-page contract

The secondary pages use the same Minecraft RPG material language while staying intentionally short.

- `skyblock.html` presents persistence, island economy and Skyblock quests as the three current pillars; partial team controls stay clearly separated.
- `community.html` is a portal hub for Leaderboards, Changelog, Rules and Staff Team plus Discord.
- `leaderboards.html` never invents standings while a verified source is unavailable.
- `rules.html` never reconstructs a ruleset from stale sources.
- `changelog.html` is now a Community destination and no longer depends on the retired Development category.
- `staff.html` is the compact public roster.
- `team.html` keeps Klezee and PxlMads visually equal and preserves the interactive skin viewers.
- `store.html` focuses on the official Store, cumulative rank path and current purchase categories without publishing unverified thresholds.

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

The redesign should wrap these systems in a new presentation layer wherever possible rather than fork their source of truth.

## Media direction

Final production visuals should prioritize actual Pixel Network captures and assets.

Temporary media may be used during layout work, but third-party imagery must not be imported merely because it looks attractive. Reuse/license terms must be known. Final screenshots should ideally share shader, camera, color grade and resolution so the site feels like one world.

## Copy density

Player-facing copy should be concise. A typical visual section should need:

- one eyebrow/kicker;
- one short title;
- zero or one short paragraph;
- one primary action.

Long-form explanation belongs in detailed Guide/Changelog pages, not Home or visual destination pages.

## Current redesign pass

The draft redesign currently covers:

- Home rebuilt around Minecraft-first scenes and shorter copy.
- Worlds preserved as the production full-screen region selector.
- Nexus converted to the same scene/slider interaction grammar as Worlds.
- Gameplay simplified to a progression overview.
- Systems simplified to a visual system index.
- Guide landing rebuilt around the six canonical Guide categories.
- Skyblock simplified to its three current pillars plus an explicit partial-feature boundary.
- Community, Leaderboards, Changelog, Rules and Staff Team aligned to the new material language.
- About reduced to two equal owner profiles while preserving both live skin viewers.
- Store reduced to the official CTA, cumulative rank path, purchase categories and one progression boundary note.
- Detailed Guides receive a shared Minecraft RPG document skin without changing their factual content.
- Shared Minecraft RPG material language added for interior and secondary pages.

Production `main` remains untouched while PR #11 stays in draft.
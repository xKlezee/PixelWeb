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

Long-form explanation belongs in Guide/Changelog pages, not Home.
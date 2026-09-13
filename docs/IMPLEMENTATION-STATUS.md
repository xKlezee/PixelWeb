# PixelWeb — Implementation Status

This document records the current public-site architecture and remaining verification boundaries. Source inspection is not treated as browser/runtime proof.

## Release posture

- `main` is the published GitHub Pages branch.
- Direct fixes are deployed only after confirming the exact `main` SHA and a successful Pages deployment.
- The owner has explicitly disabled the repository Quality Gate for the current work period because of account/payment runner issues; do not block ordinary frontend fixes on that workflow until this override is reversed.
- Browser/render QA remains separate from source-level validation.

## Current information architecture

### Primary navigation

The canonical top-level order is:

1. Explore
2. Marketplace
3. Guide
4. Community
5. About

Discord, Play and Store remain header actions.

### Guide

Guide currently exposes nine first-class categories:

- Getting Started
- Currencies
- Basic Commands
- Progression
- Mechanics
- Tools
- Armor
- Specials
- Boosts

`Getting Started` is the default Guide state. `polish.js` owns the shared top/section navigation model, while `guides.html` contains the canonical Browse tree statically so the main Guide information architecture exists before JavaScript executes.

The current guide document set is:

- Getting Started
- Currencies
- Basic Commands
- Levels, Prestige & Legacy
- Worlds & Gates
- Nexus & Instances
- Skyblock
- Stats & Equipment
- Talisman Codex
- Enchantments

The old `guide-categories.js` renderer is retired to a compatibility stub; it no longer owns Guide category markup.

### Community

Community remains:

- Leaderboards
- Changelog
- Rules
- Staff Team

Leaderboards has a real frontend/table contract but deliberately publishes no invented standings. A verified server-backed ranking source is still required before player positions can be shown.

## Visual system

PixelWeb uses a warm Minecraft/RPG accent system across shared UI:

- yellow;
- gold;
- amber;
- orange;
- copper;
- warm charcoal/stone neutrals.

The previous Pixel Blue treatment is no longer the global selection/accent language. Discord and Play are theme-aware secondary header controls rather than fixed dark-gray controls: Dark retains the charcoal shell, Light gives Play a parchment/stone treatment, while Discord uses the approved semantic Discord treatment. Store remains the strongest gold CTA in both themes.

Discord continues to use the official Symbol source SVG and original glyph geometry. CSS may tint the rendered Symbol according to the effective theme for contrast; this presentation effect does not replace or modify the source asset.

Worlds and Nexus preserve their established immersive geometry and media treatment; the warm theme applies to shared chrome rather than recoloring approved imagery. Contextual rails use the current 48px structural height. Standard mobile immersive chrome budgets 65px for the header plus 48px for the rail (113px total); the compact short-height landscape contract uses 97px.

## Appearance / theme system

PixelWeb exposes three appearance choices: `System`, `Light` and `Dark`. `System` is a preference mode, not a third palette: it resolves to the current browser/OS light or dark preference and updates while the page is open.

The effective theme is exposed through `html[data-theme-effective="light|dark"]`. Theme switching changes UI surfaces, stages, overlays, borders, shadows, interaction states and browser theme color; it does not replace or recompress authored media.

The current cascade is intentionally layered:

1. `pixel-theme.css`;
2. `pixel-theme-coverage.css`;
3. `pixel-theme-audit-fixes.css`;
4. `pixel-theme-page-fixes.css`, which imports the runtime fixes, shared geometry/components and responsive harmony layers before its final page-specific corrections;
5. `pixel-theme.js` for selection, persistence, system-preference listening and runtime theme updates.

Every current page that loads `data/network.js` now loads `pixel-theme-bootstrap.js` synchronously before it. The bootstrap resolves stored/System mode, sets `data-theme-mode`, `data-theme-effective`, `color-scheme` and the browser `theme-color` before deferred application runtime begins. `data/network.js` retains a defensive fallback only for an unexpected missing bootstrap; it is not the normal contract for any current page. `scripts/validate_site.py` enforces exactly one synchronous bootstrap before `data/network.js`, so source-level first-paint coverage is guarded against regression. Whether a real browser still displays a perceptible opposite-theme flash is a separate render/timing verification question.

The completed source-level coverage pass explicitly includes Home, Gameplay, Systems, Worlds, Nexus, Skyblock, Marketplace, Community, Leaderboards, Changelog, Rules, Staff Team, About, Store, License, the Guide shell and specialized Guide pages, Play, Pixel Navigator, mobile navigation and shared feedback/accessibility states. Marketplace loading/failure feedback, toast/skip-link contrast, theme-aware Play/Discord header actions, semantic Discord/Store mobile action states and late warm-accent cascade collisions are part of that contract.

Approved World/Nexus imagery, Nexus boss PNGs, Minecraft skins and Marketplace model textures remain source-identical. Authored logos are not replaced or recompressed by theme switching. Discord's official Symbol is the documented presentation exception: its source SVG and geometry stay unchanged while its rendered CSS tint/opacity may adapt to the effective theme. Light mode adapts media-containing stages/overlays/contrast environments rather than replacing source files. The detailed source audit is maintained in `docs/THEME-COVERAGE-AUDIT-2026-09.md`.

This is still a source/selectors/states claim. Real-browser visual verification of System/Light/Dark at the responsive matrix remains pending and must not be inferred from the audit.

## Responsive composition

`pixel-responsive-harmony.css` normalizes cross-page composition at the current source-level checkpoints:

- 1024 px compact desktop;
- 980 px canonical navigation/layout switch;
- 768 px tablet / common high-zoom equivalent;
- 600 px compact phone;
- 430 px narrow phone;
- 390 px primary minimum-phone QA width;
- 360 px extreme-width fallback;
- short-height landscape.

The layer coordinates section density, shrink-safe grid/flex children, Marketplace/Guide/Leaderboards/owner layouts, complete mobile brand identity and immersive viewport math. It is preparation for browser QA, not a substitute for it.

## Guide Browse behavior

The left Guide Browse panel uses expandable category groups.

- category counts are not shown;
- internal organizational captions such as `Start here`, `Account`, `Journey`, etc. are not shown;
- every visible child entry is a real destination;
- same-document subtopics such as Coins/Pixels/Nexus Points and individual basic commands link directly to their section anchors;
- Guide search filters both document cards and the matching Browse destinations.

## Staff Team

`staff.html` owns the public owner/team presentation.

Klezee and PxlMads remain equal Owners with the established responsibility split:

- Klezee — Game & Technical Direction: world design, mechanics, programming, progression and level design;
- PxlMads — Visual Direction: textures, menus/UI, bosses, mobs and visual direction.

The custom Canvas skin renderer currently supports:

- classic/Steve geometry;
- slim/Alex geometry and UVs;
- base and outer skin layers;
- corrected Klezee head outer-layer side orientation;
- pointer rotation;
- keyboard yaw/pitch controls;
- Home reset;
- username-based image fallback on renderer load failure.

The old visible `Drag to rotate` hint is intentionally removed.

Browser/network validation of the remote skin provider remains desirable when interactive browser access is available.

## Skyblock publication boundary

Skyblock public copy distinguishes current functionality from partial/planned functionality.

Current player-facing core includes the persistent island/progression systems already supported by current source. Team invite/member-management/promotion must not be presented as a finished collaborative feature while its active wiring remains incomplete.

## Store boundary

The official Store/Tebex destination remains canonical. Exact monetary thresholds, conversion claims, rank benefits or reward values must not be invented where current evidence does not establish them.

Pixels are documented as a distinct currency concept; the website does not claim an unverified Coins↔Pixels conversion.

## Gameplay/public-data invariants

Frontend work must not silently change gameplay semantics. Current guarded facts include:

- four Worlds in order: Overworld → Pirate Kingdom → Nether → Winter;
- Nexus is separate from the World array;
- 27 canonical mines across the current Worlds;
- Nexus access remains account/progression based according to the current public data source;
- Skyblock retains explicit partial-feature boundaries;
- approved Nexus boss PNG files remain uncompressed/unconverted originals;
- legacy GitBook material is historical reference only where current evidence differs or is incomplete.

## Licensing / About

`team.html` remains the canonical About URL for compatibility and no longer owns owner profiles.

About owns:

- FAQ/common questions;
- official Store/Tebex boundary information;
- unofficial Minecraft server disclaimer;
- external-service boundary notes;
- licensing/copyright/attribution information.

Pixel-owned website source, branding, copy, layouts and custom assets are governed by the Pixel Network Proprietary Website, Source, Content & Asset License v1.0 unless a more specific written notice applies. `LICENSE` is canonical and `license.html` is the public-readable copy.

## Retired / compatibility surfaces

- Forum is not an active product family.
- Development is not an active navigation family.
- `forum.html` and `development.html` may remain only as noindex compatibility redirects where applicable.
- legacy Systems Stage10 assets were removed after confirming the current Systems page no longer references that implementation.

## Browser QA still required

A complete browser pass is still required for claims that depend on real rendering or interaction. The pending matrix includes:

- 1440 / 1024 / 768 / 430 / 390 CSS px;
- short-height landscape;
- 200% zoom;
- keyboard/focus navigation;
- reduced motion;
- desktop hover vs mobile/touch boundary;
- contextual navigation horizontal behavior;
- System / Light / Dark selection, persistence and live system-preference switching;
- persisted-theme first-paint behavior;
- theme coverage for default, hover, focus, selected, loading, failure, empty, modal/backdrop and feedback states;
- Play/Discord header actions in both effective themes;
- Play modal;
- Guide Browse/search/anchors/tables;
- Staff skin loading and interaction/fallback;
- About/Store/license readability;
- shared footer;
- console/CSP/network state;
- media crop/stretch/loading, especially Nexus encounter imagery and the Light-mode immersive overlays.

Do not describe browser-specific behavior as verified until that matrix, or an equivalent real-browser pass, has actually been executed.

## Current major remaining product work

1. Connect Leaderboards to an authoritative server-backed ranking source.
2. Complete or deliberately defer the unfinished Skyblock collaboration contract before advertising it as complete.
3. Obtain live-client evidence for Guide mechanics where source validation alone is not enough for a stronger claim.
4. Run the browser/responsive/accessibility/theme interaction matrix when browser control is available.
5. Continue removing stale source/documentation duplication when it can be done without changing player-facing semantics.

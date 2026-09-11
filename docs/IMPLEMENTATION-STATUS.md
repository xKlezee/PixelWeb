# PixelWeb — Implementation Status

This document records current source architecture and release gates without treating source inspection as runtime proof.

## Release posture

- The previous Guide/Store/Play/Nexus polish release is merged into `main` at `62f070c1204db67833d23725614627ab1084f8fe`.
- `main` remains the stable/published frontend branch until the current candidate is promoted.
- The current frontend iteration lives on `frontend/about-footer-consistency-2026-09`.
- This branch audits HTML visual-family coverage, normalizes Guide category order, separates Staff Team from About and expands the shared footer/legal boundary.
- It must not be described as browser-verified until the browser matrix has actually been executed.

## Current frontend iteration

### Contextual navigation

`polish.js` remains the canonical runtime navigation owner and derives the second-level contextual rail from the same navigation model.

Current groups:

- Explore → Gameplay / Systems / Worlds / Skyblock / Nexus
- Guide → Progression / Mechanics / Tools / Armor / Specials / Boosts
- Community → Leaderboards / Changelog / Rules / Staff Team

`Progression` is now first in the actual Guide model, not merely moved visually by CSS. `guides.html` without a hash also treats Progression as the default Guide category. `guide-categories.js` uses the same canonical order.

The rail appears directly below global navigation only when the current page belongs to one of those groups. Home, Marketplace, Store and About do not create an empty contextual rail.

Visual families may recolor the rail, but item order, active-state logic, keyboard/touch behavior and responsive horizontal scrolling come from the shared model. Worlds/Nexus retain their established rail height because immersive viewport math depends on it.

### HTML visual audit

`docs/HTML-VISUAL-AUDIT-2026-09.md` records the route-by-route audit.

No canonical user-facing HTML route remains on the old generic SaaS/neumorphic presentation as its primary visual language. Intentional presentation families remain:

- Minecraft-first Home;
- Minecraft RPG shell/secondary pages;
- Worlds/Nexus immersive chrome;
- Guide wiki/document skin;
- Marketplace 3D collection presentation;
- noindex compatibility redirects.

Different layout families are intentional where the interaction model requires them; consistency means shared Pixel/Minecraft materials and navigation contracts rather than forcing every page into one card layout.

### Forum / Development retirement

The Forum is not an active PixelWeb product surface and `development.html` is not an active documentation family.

- runtime navigation contains neither Forum nor Development as a canonical family;
- `forum.html` remains a `noindex`, `nofollow`, `noarchive` compatibility redirect to `community.html`;
- `development.html` remains a `noindex` compatibility redirect to `guides.html`;
- both remain excluded from canonical navigation and the sitemap.

### Staff Team / owner profiles

`staff.html` now owns all intentionally public people/ownership presentation.

Klezee and PxlMads retain equal Owner status and the established responsibility split:

- Klezee — Game & Technical Direction: world design, mechanics, programming, progression and level design;
- PxlMads — Visual Direction: textures, menus/UI, bosses, mobs and visual direction.

The username-synchronized Minecraft skin viewers moved with those profiles:

- `team-models.js` is now loaded by `staff.html`;
- pointer drag rotates the model;
- ArrowLeft/ArrowRight rotate yaw;
- ArrowUp/ArrowDown adjust pitch;
- Home resets each viewer to that owner's initial orientation;
- model textures retain pixel rendering;
- the no-JavaScript fallback remains username-based.

Staff Team explicitly states that only intentionally public roles are shown. Private/unpublished staff membership is not inferred.

### About

`team.html` remains the canonical About URL for compatibility, but no longer contains owner profiles.

About now owns:

- common questions / FAQ;
- links to maintained player information;
- official Store/Tebex boundary information;
- the unofficial Minecraft server disclaimer;
- external-service boundary notes;
- copyright and attribution policy.

No blanket Creative Commons license is applied to PixelWeb. Original Pixel Network material remains all rights reserved unless specifically marked otherwise; third-party material remains subject to its own rights/terms. If selected non-software material is intentionally released under Creative Commons later, it must be marked individually with an exact license/version. Source-code reuse rights, if later granted, should use a software-specific license.

About does not invent refund terms, prices, rank thresholds, purchase guarantees or legal/support policies that are not actually published.

### Shared footer

`polish.js` now replaces legacy page-specific footer fragments with one shared runtime footer containing:

- Pixel Network / Java Edition identity;
- Marketplace, Store, Guide, Community, Rules, Staff Team and About links;
- the unofficial Minecraft server disclaimer;
- a concise copyright / third-party-rights boundary.

`security-hardening.css` provides the cross-family layout/responsive styling without overriding the intended Home/Guide/immersive footer backgrounds.

## Existing security/repository foundation

The hardening baseline already merged to `main` remains in force:

- defensive `.gitignore` and documented public/private boundary;
- committed-secret scanning;
- strict CSP/static HTML validation;
- canonical/sitemap/social-metadata contracts;
- local fragment integrity;
- structural accessibility checks;
- player-facing copy boundary;
- canonical public-data validation;
- exact integrity protection for the approved Nexus boss PNGs;
- reference-driven `_site/` builder and independent public-bundle validation;
- read-only/commit-pinned GitHub Actions Quality Gate configuration.

## Canonical gameplay/public-data invariants

This frontend refresh does not intentionally change gameplay semantics. Existing guarded facts remain unchanged, including:

- four Worlds in order: Overworld → Pirate Kingdom → Nether → Winter;
- Nexus separate from the World array;
- 27 canonical mines across the current Worlds;
- Nexus permanent access at Prestige IV without a Viking/boss requirement unless intentionally re-evidenced;
- current Nexus encounter/difficulty structure;
- Skyblock remains source-verified / partial;
- Store monetary thresholds remain unpublished while unverified;
- approved Discord, Store and legacy GitBook destinations remain canonical;
- approved Nexus boss PNG bytes remain unchanged.

## Crawl / publication state

- Sitemap-indexed pages keep one absolute HTTPS canonical each.
- Indexed pages retain their static Open Graph/Twitter metadata.
- `forum.html` and `404.html` remain intentionally outside the sitemap and `noindex`.
- The public artifact builder still includes the legacy Forum redirect and branded 404 as explicit non-indexed compatibility/error surfaces.
- The `_site/` model remains prepared but must not be described as the live Pages source unless deployment is actually migrated.

## Validation state for this branch

### Source/static review

The current branch has been reviewed at source level for:

- all top-level HTML visual-family coverage;
- canonical runtime navigation/category order;
- Staff Team / About content ownership;
- owner viewer relocation;
- shared footer structure;
- licensing/attribution boundaries;
- documentation/contract alignment.

This is not validator execution and not browser/render proof.

### Automated execution

Do not claim a green Quality Gate unless a runner actually starts and executes the relevant steps. A workflow startup failure with no assigned runner/steps is infrastructure state, not validator PASS/FAIL.

### Browser QA still required

Required matrix:

- 1440 / 1024 / 768 / 430 / 390 CSS px;
- short-height landscape;
- 200% browser zoom;
- keyboard/focus navigation;
- reduced motion;
- desktop hover-only vs 980 px mobile/touch boundary;
- contextual navigation active state and horizontal overflow behavior;
- Play modal;
- Guide anchors/search/tables and Progression-first state;
- Staff Team skin loading, canvas rendering, pointer drag, keyboard rotation/reset and error state;
- About FAQ, Tebex CTA, disclaimer and attribution readability;
- shared footer across standard, Guide and immersive visual families;
- no visible Forum/Development navigation and correct legacy redirects;
- console/CSP/network state;
- media crop/stretch/loading, especially Abyss + Astral.

## Release rule

Do not promote this frontend branch to `main` solely from source review. First compare the branch to `main`, remediate unintended changes, then obtain the required automated/browser evidence when the execution environment is available. If a merge is approved afterward, prefer a squash merge so the branch's iterative implementation commits land as one coherent frontend change.

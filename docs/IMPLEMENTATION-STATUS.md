# PixelWeb — Implementation Status

This document records current source architecture and release gates without treating source inspection as runtime proof.

## Release posture

- The previous hardening release candidate has already been squash-merged into `main`.
- `main` remains the stable/published frontend branch.
- The current frontend iteration lives on `frontend/navigation-about-refresh-2026-09`.
- This branch changes navigation hierarchy, typography, Community/Forum exposure and About owner presentation.
- It must not be described as browser-verified until the browser matrix has actually been executed.

## Current frontend iteration

### Contextual navigation

`polish.js` remains the canonical runtime navigation owner and now derives a second-level contextual rail from the same navigation model.

Current groups:

- Explore → Gameplay / Systems / Worlds / Skyblock / Nexus
- Development → Development / Changelog
- Community → Community / Guides

The rail appears directly below global navigation only when the current page belongs to one of those groups. Home, Store and About do not create an empty contextual rail.

The current destination and its owning group use the Pixel Blue active treatment (`#64a8ff`). Mobile layouts keep the rail horizontal/scrollable rather than wrapping it into a large second menu.

### Typography direction

The frontend now follows a tighter game-network/editorial hierarchy inspired by the structural analysis of Netherite's public site without copying proprietary font files or site content.

- local/system font stack only;
- compact grotesk body/navigation treatment;
- heavier display headings with tighter tracking;
- small uppercase utility labels;
- no new external font dependency.

Browser QA must confirm acceptable fallback metrics across platforms.

### Forum retirement

The Forum is no longer an active PixelWeb product surface.

- runtime navigation no longer includes Forum;
- Community no longer advertises Forum or exposes its preview cards/actions;
- Home no longer describes Forum as a community destination;
- `data/network.js` no longer declares Forum state/landing data;
- `validate_public_data.js` no longer requires Forum preview state;
- former Forum-specific JavaScript/CSS has been removed;
- `forum.html` remains only as a `noindex`, `nofollow`, `noarchive` compatibility redirect to `community.html` for old bookmarks/links;
- Forum remains excluded from `sitemap.xml`.

Historical security documentation may still mention persistent forum/community functionality as an example of a future authenticated feature. Those references are architectural boundaries, not a claim that Forum is currently available.

### About / owners

About still presents Klezee and PxlMads with equal Owner status and their established responsibility split.

The previous repository-pinned owner portraits have been replaced in the active presentation by username-synchronized Minecraft skin viewers:

- `team-models.js` renders Minecraft geometry into a canvas using the current skin texture resolved by username;
- owner usernames are `Klezee` and `PxlMads`;
- pointer drag rotates the model;
- ArrowLeft/ArrowRight rotate yaw;
- ArrowUp/ArrowDown adjust pitch;
- Home resets each viewer to that owner's own initial orientation;
- the model texture is rendered without smoothing to preserve Minecraft pixel fidelity;
- provider status is described as username-synchronized rather than instant/live to avoid overstating cache freshness;
- the no-JavaScript fallback also uses username-based remote renders instead of the old pinned WebP portraits.

This is a NameMC-style interaction pattern, not a dependency on an undocumented NameMC skin API. The current implementation uses a public username-based skin provider because NameMC does not expose a documented general-purpose browser API for current player skin textures/models.

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

The frontend refresh does not intentionally change gameplay semantics. Existing guarded facts remain unchanged, including:

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

- canonical runtime navigation changes;
- contextual sibling navigation structure;
- Forum retirement path;
- About viewer code and keyboard/pointer interaction model;
- owner fallback behavior;
- documentation/contract alignment.

This is not validator execution and not browser/render proof.

### Automated execution

Do not claim a green Quality Gate unless a runner actually starts and executes the relevant steps. The previously observed account-level GitHub Actions startup/billing issue produced jobs with no assigned runner/steps and therefore was infrastructure state, not validator PASS/FAIL.

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
- Guides anchors/search/tables;
- About skin loading, canvas rendering, pointer drag, keyboard rotation/reset and error state;
- no visible Forum navigation/content and correct legacy redirect;
- console/CSP/network state;
- media crop/stretch/loading, especially Abyss + Astral.

## Release rule

Do not promote this frontend branch to `main` solely from source review. First compare the branch to `main`, remediate unintended changes, then obtain the required automated/browser evidence when the execution environment is available. If a merge is approved afterward, prefer a squash merge so the branch's iterative implementation commits land as one coherent frontend change.

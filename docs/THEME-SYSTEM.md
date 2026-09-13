# PixelWeb theme system

PixelWeb exposes three visual modes through the bottom-right Appearance control:

- `System`: follows `prefers-color-scheme` and reacts to OS/browser changes while the page is open.
- `Light`: warm parchment / pale-stone interpretation of the Pixel gold identity.
- `Dark`: the original charcoal / gold presentation.

The preference is stored locally under `pixel-theme-mode-v1`. No account, cookie or backend is required.

## Runtime ownership

Every current page that loads `data/network.js` also loads `pixel-theme-bootstrap.js` synchronously in `<head>` before deferred application scripts. The bootstrap reads the persisted/System preference, resolves the effective palette and sets:

- `data-theme-mode="system|light|dark"`
- `data-theme-effective="light|dark"`
- the document `color-scheme`
- the browser `theme-color`

It also attaches the shared theme stylesheet stack early. `data/network.js` consumes that bootstrap state and retains a defensive fallback only for an unexpected missing bootstrap. `scripts/validate_site.py` enforces the current contract: a page that loads `data/network.js` must load exactly one synchronous `pixel-theme-bootstrap.js` before it. The fallback is not the normal page path and is not evidence that browser first-paint behavior has been visually verified.

The shared theme assets load in cascade order:

1. `pixel-theme.css` — base theme tokens, shared chrome and the Appearance control.
2. `pixel-theme-coverage.css` — component-by-component coverage for the current public product surfaces.
3. `pixel-theme-audit-fixes.css` — audited nested/immersive and secondary mechanics with their own authored dark shells.
4. `pixel-theme-page-fixes.css` — remaining current page mechanics, legacy shared components, About/License/legal surfaces and mobile-only states.
   - This sheet imports `pixel-theme-runtime-fixes.css`, shared interface geometry/components and `pixel-responsive-harmony.css` before its own late page-specific rules.
5. `pixel-theme.js` — chooser behavior, persistence, system-theme listener and browser `theme-color` updates.

A `pixelthemechange` window event is dispatched after changes with `{ mode, effective }` in `event.detail`.

## Coverage contract

Theme support is a product contract, not a header/background-only feature. Every public visual mechanic must have an intentional light and dark presentation. New components are incomplete until both effective themes work.

Current source-level coverage explicitly includes:

- Home hero, path cards, World image gallery, Nexus media and Marketplace promo.
- Shared RPG page heroes, stat cards, system cards, route panels, portal cards, search controls and footer.
- Gameplay/Systems shared detail cards, flow lines, World progression rows, Nexus access/difficulty, development/status panels, timeline, CTAs and compact index rows.
- Skyblock island cards and boundaries, Community/Discord surfaces, About/Staff owner and staff cards, Store panels and category surfaces.
- Marketplace navigation, route, 3D/model canvas stage, visible loading/failure states, focus frame, item preview canvases, detail panel and Store bridge.
- Leaderboards hero, categories, records, podium/top three, player heads/renders, top-10/full table and empty/source states.
- Worlds immersive full-screen imagery, fallback imagery, content overlays, rail, investigation cue, counters, metadata and detail dialog internals.
- Nexus immersive boss imagery (including dual Abyss/Astral), rails, investigate control, metadata, difficulty ladder and detail dialog.
- Staff/About owner cards, Minecraft skin canvases, render stages, tags and labels.
- Store surfaces and the rank explanation dialog.
- Guide/Wiki shell, tables, callouts and specialized Progression, Skyblock, Enchantments, Stats/Equipment and Talisman components, including late priority overrides.
- About FAQ, information/policy panels, legal disclosure surfaces and the public License page.
- Changelog/timeline and other shared current Phase 1 information surfaces.
- Shared feedback toast and keyboard skip-link.
- Play/join dialog.
- Pixel Navigator and Appearance control.
- Mobile navigation and mobile-only action rows.

## Media rule

Theme changes must not rewrite authored source assets. Boss PNGs, World imagery, Minecraft skins, Marketplace textures/models, logos and other source media stay byte-identical.

The presentation around media *does* adapt:

- Canvas renderers remain transparent; their stage/frame/background belongs to the theme.
- Marketplace renderers expose visible loading/failure feedback instead of becoming unexplained blank themed panels.
- Image frames, borders, shadows and surrounding surfaces follow the active theme.
- Full-bleed World/Nexus imagery may use theme-specific brightness/contrast and separate CSS overlays so text remains readable.
- Player skins and Marketplace model textures are never recolored.
- Images are not converted, recompressed, cropped or replaced as part of theme switching.
- Discord is a documented presentation exception to the generic logo rule: the official Symbol source SVG and its geometry remain unchanged, but CSS may tint the *rendered* glyph according to the effective theme so it retains deliberate contrast against its themed control. The asset itself is not rewritten or replaced.

## Interaction rule

Hover, focus, active, selected, loading, failure, empty, modal/backdrop, feedback and responsive/mobile states must remain legible in both themes. `System` is not a third color palette: it always resolves to the current OS/browser light or dark preference and updates live when that preference changes.

Generic Pixel interaction accents use the shared gold/amber/orange identity. Cool colors remain only where they are semantic or authored — for example Discord identity, World/biome identity or boss artwork — rather than leaking into generic controls through old CSS.

## First-paint boundary

Source inspection now establishes synchronous bootstrap coverage for every current page that loads `data/network.js`, and `scripts/validate_site.py` guards that ordering/synchrony contract against regression. Whether a particular browser visibly flashes an opposite theme is still a render/timing claim and remains part of browser QA. The defensive fallback in `data/network.js` is not a current fallback-only page path and must not be treated as browser proof.

## Verification boundary

The September 2026 pass is a source-level coverage audit of current public mechanics and CSS states. It does not claim pixel-perfect browser/device visual QA. Browser visual QA remains a separate verification step and should be used to catch rendering differences that cannot be proven from source alone.

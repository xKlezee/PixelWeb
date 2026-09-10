# Responsive QA — PixelWeb

This document separates **static/code verification** from **browser-render verification**. A viewport is not marked visually PASS merely because its CSS appears correct.

## Required viewport matrix

The release matrix is:

| Width | Primary purpose | Static review | Browser render |
|---:|---|---|---|
| 1440 px | desktop composition | reviewed | pending |
| 1024 px | compact desktop / tablet landscape | reviewed | pending |
| 768 px | tablet portrait | reviewed | pending |
| 430 px | large mobile | reviewed | pending |
| 390 px | compact mobile | reviewed | pending |

Browser-render status remains pending until the hardening branch can be opened in a real browser with DevTools console/network inspection. Static review must not be presented as visual PASS.

## Static invariants reviewed

### Global public navigation

- desktop navigation remains active above 980 px;
- mobile navigation takes over at 980 px and below;
- mobile menu uses viewport-bounded height with its own vertical scrolling;
- the brand and action area have explicit compact rules at 560 px and below;
- a single canonical runtime navigation model owns Explore, Development, Community, Guides and About destinations;
- detailed `guide-*.html` pages keep Guides selected in the canonical navigation;
- Store and Discord are available in the mobile menu while Play remains directly accessible in the header;
- on fine-pointer desktop layouts, Explore / Development / Community are hover targets rather than pointer-click toggles; their buttons do not receive pointer events, preventing a click from pinning one dropdown open over another;
- the dropdown remains open while the pointer stays anywhere inside its owning navigation group, including the dropdown itself;
- the structural dropdown includes an 8 px hover bridge between the top-level control and the absolute-positioned menu so normal downward pointer travel does not cross a dead gap;
- leaving the owning navigation group collapses the pointer-opened dropdown; entering another group makes that group authoritative and prevents stacked pointer-open menus;
- touch/mobile keeps explicit button toggling because hover is not available;
- keyboard navigation remains available independently of the desktop pointer rule through focus, ArrowDown and Escape handling;
- keyboard Escape closes open navigation groups/mobile navigation;
- dropdown controls expose `aria-expanded` and `aria-controls`;
- a global first-focus **Skip to content** link is generated for standard pages, targets the real `<main>` region, makes that region programmatically focusable when required, and moves focus after activation rather than only scrolling visually.

### Shared content layouts

- page hero grids collapse before their fixed minimum columns can overflow;
- content/detail/metric grids collapse to one column on mobile;
- CTA blocks stack on mobile;
- long text containers use `minmax(0, 1fr)` where grid shrinkage is required;
- body-level horizontal overflow is not relied on as a substitute for intentional horizontal scrollers.

### Home

- hero collapses to one column below 980 px;
- immersive story has reduced mobile height and hides the desktop scroll hint;
- world gallery becomes a two-column compact gallery below 980 px;
- closing/status/store sections collapse below 980 px;
- Story progress is a native `<progress>` element instead of transform-based inline styling;
- the immersive MP4 has no initial `src`, uses `preload="none"`, and is hydrated through `IntersectionObserver` approximately 600 px before the story approaches the viewport;
- if `IntersectionObserver` is unavailable, the video falls back to hydration without breaking the story;
- the scroll scrub waits for valid `loadedmetadata`/duration before seeking;
- direct chapter interaction also hydrates the video when motion is allowed;
- with `prefers-reduced-motion: reduce`, the video is intentionally not hydrated or downloaded and the textual story remains usable against the static background.

### Worlds

- four world cards are intentionally horizontally scrollable below the full four-column breakpoint;
- the route is four Worlds only; `worlds-stage8-media.css` overrides the older five-column base rule with four columns/four colors;
- the mobile progress route becomes vertical below 700 px;
- five boss encounters become a one-column editorial strip below 980 px instead of an uneven 2+2+1 grid;
- individual card content uses shrink-safe grid columns.

**Consolidation note:** `worlds-stage8.css` still contains an older five-stage progress definition that is overridden by `worlds-stage8-media.css`. It is not currently the effective rule, but should be merged out only after browser render verification of the current four-world implementation.

### Nexus

- hero, access block and instance grid collapse below 980 px;
- difficulty ladder changes 4 → 2 → 1 columns;
- long instance copy no longer relies on desktop minimum heights after collapse;
- **fixed in this hardening branch:** Abyss + Astral no longer inherit a 4:3 *combined* container on tablet/mobile. Each unchanged 1448×1086 PNG keeps its own 4:3 panel side by side with `object-fit: contain`, preventing responsive cropping;
- approved Raphael, Azazel, Abyss and Astral source PNG bytes are not recompressed, resized, converted or replaced as a performance shortcut.

### Systems

- progression spine changes from horizontal to vertical below 980 px;
- route links and quest panel collapse to one column below 700 px;
- supporting rows collapse from three-column editorial rows to one column below 700 px;
- full-width mobile route controls are applied below 430 px.

### Guides / documentation

- desktop Guides uses a documentation-specific two-column layout with a sticky 250 px sidebar and shrink-safe article column;
- at 1040 px the sidebar narrows and guide tables remain intentionally horizontally scrollable rather than forcing unreadable cell wrapping;
- at 820 px and below, the sidebar stops being sticky and becomes a horizontal section-navigation rail above the document;
- at 620 px and below, guide facts, detailed route stages and result rows collapse to one column;
- at 390 px the guide shell uses tighter side gutters without removing focus or touch-target space;
- reference tables have an explicit overflow container and minimum readable table width;
- Guide pages do not load heavy Nexus boss artwork when the page's purpose is mechanical reference;
- Guides search filters existing entries only; hidden results are removed from layout with the native `hidden` state;
- exact gameplay values in detailed guides are rendered from canonical public data where a shared canonical value already exists;
- Guide evidence badges retain text labels and a shape marker so status is not communicated by color alone.

#### Progression guide

- the three-layer progression rail is three columns on wide layouts and collapses to one column at 900 px;
- Nexus encounter milestone cards also collapse 3 → 1 at 900 px, avoiding compressed difficulty labels;
- the current-access note changes from split label/value layout to one column below 560 px;
- the World/Nexus gate table stays inside the shared horizontally scrollable guide-table container rather than forcing page-level overflow;
- caps and access milestones are rendered from `data/network.js`, so responsive variants do not maintain duplicate values in markup;
- publication-boundary cards remain readable as a one-column sequence on tablet/mobile.

#### Skyblock guide

- current-capability cards change 3 → 2 → 1 columns at 900 px and 560 px;
- source-foundation and partial-feature grids collapse from two columns to one at 900 px;
- the partial-state banner stacks below 560 px so the status label cannot squeeze explanatory copy;
- team-management content stays visually separated from the current-capability grid at every breakpoint;
- the public Skyblock overview uses the existing global `path-grid`, `detail-grid` and `next-destination` responsive rules rather than adding a parallel layout system.

### About / Owners

- the owner intro collapses below 900 px;
- both owner profiles use the same single-column relationship below 900 px;
- PxlMads remains mirrored inward while preserving equal profile structure;
- portrait heights and copy padding reduce below 560 px.

### Global Play modal

- dialog width is bounded to the viewport;
- dialog height is bounded with internal scrolling;
- below 620 px it becomes bottom-aligned, uses reduced padding and stacks footer actions;
- focus trapping, Escape close and focus restoration remain implemented in JavaScript;
- no runtime inline styles are required.

### Forum

- Forum remains explicitly `noindex` while it is a local preview rather than persistent authentication/community infrastructure;
- sidebar collapses below 860 px;
- dense top navigation is reduced below 640 px;
- post/modal spacing is reduced below 640 px;
- auth and post overlays have their own vertical scrolling and switch to top alignment on short (`max-height: 700px`) viewports, preventing a centered modal from becoming unreachable in landscape/short windows;
- the initial preview dialog now exposes `aria-modal`, a labelled title and descriptive preview copy;
- initial focus enters the active display-name field when the entry dialog is visible;
- Tab/Shift+Tab are trapped inside the entry dialog while the application is hidden;
- after entering the preview, focus moves to the post-title field;
- visible product copy remains explicitly preview/local, including preview-profile creation, planned account linking and local preview posting;
- display name/title/message lengths are bounded in HTML and re-enforced in `app.js` so DOM manipulation does not silently widen the preview contract;
- post dialogs trap focus, close with Escape and restore focus to the triggering post card;
- reduced-motion disables meaningful animation/transition duration.

### Crawl / error surfaces

- the current deployment is a GitHub Pages **project site** under `/PixelWeb/`; the repository-level `PixelWeb/robots.txt` is therefore not treated as authoritative because standards-compliant crawlers request `/robots.txt` at the host root;
- `robots.txt` documents that hosting boundary and must not be described as a security or privacy control;
- `sitemap.xml` contains only indexable public product/Guide pages under the current project-site base URL;
- Forum preview and the branded 404 are excluded from the sitemap and declare `noindex` at page level;
- files published through GitHub Pages remain public whether or not a crawler is asked to ignore them;
- `404.html` uses the same strict CSP/referrer policy and maintained site destinations rather than becoming an unstyled dead end;
- Home exposes canonical and Open Graph/Twitter metadata using the existing official Pixel Network logo; no social-preview image was generated or recompressed.

## Automated structural guards prepared

The Quality Gate now has separate responsibilities rather than treating every concern as one script:

- `security_scan.py`: obvious committed-secret patterns;
- `validate_media_integrity.py`: exact byte size, 1448×1086 dimensions and Git blob SHA for the four approved Nexus PNGs;
- `node --check`: JavaScript syntax across repository JS files;
- `validate_public_data.js`: canonical gameplay/public-data relationships, approved public destinations, static external-link consistency and Worlds media-origin policy;
- `validate_site.py`: CSP, unsafe HTML/JS patterns, local references, HTTPS/protocol-relative policy and sitemap/index consistency;
- `validate_runtime_contracts.py`: deferred-media references and direct/ordinary runtime inline-style mutations;
- `validate_accessibility.py`: document language, viewport, title, exactly one `<main>`, descriptions for indexable pages and explicit `alt` on static images;
- `build_public_site.py`: fail-closed reference-driven `_site/` construction with CSS dependency traversal and symlink/protocol-relative rejection;
- `validate_public_bundle.py`: independent staged-artifact boundary, file-type, reference, CSS dependency, symlink and project-site path validation.

Manual workflow dispatch requires an explicit candidate branch, tag or SHA, so the workflow definition on `main` can validate the actual candidate tree rather than silently checking a different ref. Pull-request runs validate the PR event SHA; the former redundant hardening-branch push trigger has been removed.

These checks are **configured but not reported as PASS** while the GitHub account billing lock prevents the Actions job from starting. The current execution environment also cannot resolve `github.com` for a local clone, so browser/runtime validation remains a separate pending gate.

## Browser verification checklist

When a browser preview of this exact branch is available, every required viewport must be checked for:

1. no unexpected horizontal page scroll;
2. on desktop fine-pointer devices, Explore / Development / Community open on pointer hover without requiring click;
3. pointer-clicking the top-level desktop group area does not pin a dropdown open;
4. pointer movement from a top-level group into its dropdown crosses no dead gap or flicker zone;
5. leaving a desktop navigation group fully collapses its dropdown, and switching directly between groups never leaves two dropdowns visibly stacked;
6. touch/mobile can still open and close navigation groups without relying on hover;
7. keyboard focus / ArrowDown / Escape remain usable independently of pointer-only behavior;
8. dropdowns do not render outside the viewport;
9. the first keyboard focus exposes the Skip to content link and activating it moves both scroll position and focus to `<main>`;
10. Play modal is fully reachable with mouse, touch and keyboard;
11. Forum entry and post modal remain fully reachable at short heights;
12. Forum entry dialog keeps Tab/Shift+Tab inside the modal until preview entry;
13. Forum display-name/post limits match the visible maxlength behavior and no preview action implies persistence/account availability;
14. focus indicators are visible and not clipped;
15. Escape closes modal/menu layers in the expected order;
16. no image is stretched or unintentionally cropped;
17. Abyss + Astral display both complete source images side by side;
18. Worlds rail scroll-snap does not trap page scrolling;
19. 4-world progress geometry is aligned with four rendered steps;
20. owner portraits keep equal visual footprint and PxlMads faces inward;
21. Home immersive video does not cause layout shifts;
22. Home initial network waterfall does **not** request `Video_Perfecto_Con_Fondo_Negro.mp4` before the immersive section approaches the hydration margin;
23. reduced-motion mode makes no request for the immersive MP4 during normal page use;
24. Guides sidebar stays usable at desktop heights and the horizontal guide navigation remains touch-scrollable on tablet/mobile;
25. Guide tables can be horizontally inspected without producing page-level horizontal overflow;
26. Guides search remains usable at 390/430 px and at 200% browser zoom;
27. Progression layer rail and Nexus milestone cards collapse without clipped copy or compressed status values;
28. Skyblock current-capability and partial-feature sections remain visually distinct at 390/430 px;
29. dynamically rendered Guide facts/cards appear after scripts load with no empty structural gaps;
30. reduced-motion produces a stable, usable page;
31. browser console has zero uncaught errors and zero CSP violations caused by first-party code;
32. Network panel shows no insecure HTTP subresources;
33. Guide pages make no unexpected external `connect-src` requests;
34. images marked lazy are not fetched eagerly without reason;
35. canonical/Open Graph metadata resolves to the expected public GitHub Pages URL on Home;
36. unknown routes render the branded 404 without broken local resources;
37. page remains usable at 200% browser zoom.

## Release rule

Do not merge the hardening branch solely because the static responsive review is clean. The final visual/browser matrix is a separate release gate. Static review can prove contradictory CSS, unsafe fixed geometry and missing breakpoints; it cannot prove the rendered result across browsers.

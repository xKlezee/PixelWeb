# PixelWeb Performance Budget

PixelWeb is a static presentation layer, but it still has a real performance budget. Visual fidelity is not a reason to load every asset eagerly.

## Non-negotiable media rule

The approved Nexus boss artwork stays in its original PNG files and original resolution. Do not convert, recompress, sprite, downscale, or replace the following assets as a performance shortcut:

- `assets/nexus/raphael.png`
- `assets/nexus/azazel.png`
- `assets/nexus/abyss.png`
- `assets/nexus/astral.png`

Performance work must optimize **when** those files are requested and decoded, not alter their source bytes.

This requirement is enforced by `scripts/validate_media_integrity.py`. The validator checks each approved file's exact byte size, 1448×1086 PNG dimensions and Git blob SHA. A visually similar recompression is still a failure because the approved source must remain byte-identical.

The logical Abyss/Astral presentation mapping is intentionally separate from file integrity. `data/nexus-media.js` documents that the originally uploaded filenames for those two visuals were inverted; the integrity guard protects both original files without changing that approved mapping.

## Network priority contract

Only content that is plausibly part of the initial viewport may receive high fetch priority.

- Initial hero/LCP media: `fetchpriority=high` only when justified by actual viewport placement.
- Below-fold images: `loading=lazy`, `decoding=async`, `fetchpriority=low`.
- Deferred galleries/rails: do not assign a network URL until the asset approaches the viewport when explicit deferral is already implemented.
- Decorative or fallback media must never compete with the initial LCP resource.
- Repeated references to the same local asset should rely on browser cache rather than duplicate files.

## Current heavy assets

The four approved Nexus PNG files are each roughly 2.1 MB. That size is intentionally accepted because the originals are a product requirement. They therefore must remain below the initial viewport and low-priority unless a future design explicitly makes one of them the LCP image.

The Home immersive MP4 is roughly 1.1 MB and is now explicitly deferred. The HTML contains no initial `src`, uses `preload=none`, and stores the local source in `data-src`. `immersive.js` hydrates the source with `IntersectionObserver` only when the story approaches the viewport (currently a 600 px root margin), then waits for metadata before scroll scrubbing can seek through the video. Under `prefers-reduced-motion: reduce`, the video is not hydrated at all; the section remains readable over its intentional dark fallback surface.

This behavior is a performance contract. Do not restore an eager `src` to the Home story merely to simplify the script.

## External media

World landscape media currently depends on public GitBook-hosted image URLs. Treat these as public presentation assets, not credentials.

Rules:

- no privileged token or authenticated API may ever be required to render a public image;
- external world media is requested with a no-referrer policy from runtime-created images;
- failure must degrade to an intentional visual fallback rather than break layout;
- self-hosting an owned original asset is preferred later when an authoritative source file is available;
- do not copy third-party commercial artwork into the repository.

## Layout stability

Every meaningful image should have intrinsic width/height or an explicit aspect-ratio container before network completion. Media loading must not cause a large geometry jump after first paint.

Dynamic sections should preserve their expected footprint through CSS rather than measuring and rewriting layout on scroll.

## Runtime work

- Scroll handlers use `requestAnimationFrame` when they update visual state.
- No scroll handler may continuously rebuild DOM.
- `IntersectionObserver` is preferred for reveal and media hydration.
- No animation loop should run when the relevant component is absent.
- Reduced-motion behavior must remain supported.
- Deferred media must remain functional when `IntersectionObserver` is unavailable; a safe fallback may hydrate immediately in that legacy case.

## Release measurements

A browser-rendered release QA should measure at minimum:

- Largest Contentful Paint (LCP)
- Interaction to Next Paint (INP)
- Cumulative Layout Shift (CLS)
- initial transferred bytes
- image/video requests before first meaningful interaction
- JavaScript errors and CSP violations

Target guardrails for the public static site on a representative mobile profile:

- LCP: <= 2.5 s where hosting/network conditions permit
- CLS: <= 0.10
- INP: <= 200 ms
- no unexpected eager request for all four Nexus boss PNG files from pages where they are below the fold
- no Home immersive MP4 request during the initial viewport before the story approaches the viewport
- no immersive MP4 request at all when the user requests reduced motion
- no duplicate download of identical local media under different repository paths
- all four approved Nexus PNGs pass byte-level media integrity checks

These are release guardrails, not claims that the current unrendered hardening branch already achieves them.

## Change policy

Do not improve a synthetic score by reducing the visual quality of approved original artwork. Prefer, in order:

1. correct fetch priority;
2. lazy loading / viewport hydration;
3. correct responsive source selection for externally transformed media;
4. removing genuinely unused assets;
5. caching/hosting improvements;
6. only then reconsidering an asset format when the asset owner explicitly approves a source change.

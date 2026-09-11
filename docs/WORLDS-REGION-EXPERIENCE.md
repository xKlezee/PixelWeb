# Worlds Region Experience

This note is the source-of-truth contract for the immersive `worlds.html` presentation.

## Canonical world order

The selector must always derive the current route from `data/network.js` and preserve this order unless the canonical gameplay model changes:

1. Overworld
2. Pirate Kingdom
3. Nether
4. Winter

Nexus is not World 5. It remains a separate endgame destination and must never be inserted into the region rail as another World.

## Interaction model

`worlds.html` is a state-based region selector, not a horizontal card rail and not a long stack of banners.

- One World occupies the visual stage at a time.
- Desktop mouse-wheel input moves one node up/down through the route.
- Touch users can swipe vertically.
- Keyboard users can use ArrowUp / ArrowDown, PageUp / PageDown, Home and End.
- The left-side vertical rail is persistent and is the explicit one-click route between Worlds.
- Changing Worlds crossfades/scales the background and transitions the content rather than physically exposing a stack of cards.
- The active World is synchronized to a hash (`#overworld`, `#pirate`, `#nether`, `#winter`) so a World can be deep-linked.
- `prefers-reduced-motion` removes the major transition and pulse animation.

The interaction was inspired by the region-selection pattern on the public Genshin Impact map page, but PixelWeb does not copy HoYoverse artwork, code, typography, icons, branding or page assets.

## Investigation control

Each World has one pulsing `Explore` control. It opens a native modal with canonical gameplay facts only:

- access condition;
- mine count;
- World Boss;
- next gate;
- optional encounter where applicable;
- link to the detailed Worlds Guide.

Winter additionally reiterates the established invariant that Viking does not gate Nexus and that Nexus uses its own account milestone.

Do not add invented lore, locations, boss phases or progression requirements to this modal.

## Media contract

World background identity remains owned by `data/worlds-media.js`; interaction code must not hard-code image URLs.

The current background media is presentation/reference media and can be replaced independently of the selector. Final production replacements should preferably be screenshots captured from Pixel Network with shaders and a consistent camera/grade across all four Worlds.

Temporary third-party imagery may only be used when its reuse license has been verified. A web search during the September 2026 redesign found Wikimedia Commons examples under CC0 and other Creative Commons licenses, but a mixed set was deliberately not committed because it did not provide four visually coherent shader-style Minecraft scenes. Never import an attractive web image solely because it is discoverable through search.

## Rendering rules

- Background images are decorative (`alt=""`); the accessible World name/content carries meaning.
- A failed image must degrade to a World-accent fallback rather than exposing a broken image icon.
- No external renderer or framework is required for this experience.
- Do not add runtime inline styles or unsafe DOM HTML parsing.
- Keep all gameplay facts data-driven from `data/network.js`.

## Legacy files

The previous `worlds-stage8.*` card-rail implementation is no longer referenced by `worlds.html`. It may be deleted once repository cleanup confirms there are no remaining consumers. Do not reintroduce the old card rail as the main Worlds experience.

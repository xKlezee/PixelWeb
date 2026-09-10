# PixelWeb Marketplace — Nexo Source Structure

This document is the durable repository note for the **Marketplace** content architecture. It records how PixelWeb projects Pixel Network's Nexo content into a browser-public catalogue and defines the viewer behavior that future Marketplace work must preserve.

The first source snapshot reviewed for this architecture was the supplied `Nexo (2).zip` and its `Market_Skins` tree. The ZIP itself is not committed to PixelWeb.

## 1. Publication authority

A file existing under `Nexo/pack/assets/...` is **not enough** to make it a Marketplace item.

PixelWeb publishes an item only when an entry exists in the Nexo item configuration under `Nexo/items/...` and its referenced model can be resolved in the resource pack.

For the current snapshot, the authoritative item file is:

```text
Nexo/items/Market_Skins/01_loot_box/loot_box_rotation_01/01_loot_box_r1_armor.yml
```

It registers exactly five entries:

| Nexo id | Public name | Material | Slot | Set asset id |
|---|---|---|---|---|
| `r1_loot_box_helmet_3d` | Helmet | `CHAINMAIL_HELMET` | HEAD | — |
| `r1_loot_box_helmet_2d` | Helmet 2D | `CHAINMAIL_HELMET` | HEAD | — |
| `r1_loot_box_chestplate` | Chestplate | `CHAINMAIL_CHESTPLATE` | CHEST | `nexo:r1_loot_box` |
| `r1_loot_box_leggings` | Leggings | `CHAINMAIL_LEGGINGS` | LEGS | `nexo:r1_loot_box` |
| `r1_loot_box_boots` | Boots | `CHAINMAIL_BOOTS` | FEET | `nexo:r1_loot_box` |

Do not promote additional resource-pack files into active Marketplace entries unless their Nexo registration is present in the imported source.

## 2. Nexo hierarchy → Marketplace hierarchy

The source relationship is preserved semantically:

```text
Nexo/items/
└── Market_Skins/
    └── 01_loot_box/
        └── loot_box_rotation_01/
            └── 01_loot_box_r1_armor.yml

Nexo/pack/assets/market_skins/
├── models/
│   └── 01_loot_box/
│       └── loot_box_rotation_01/
│           └── loot_box_luminite/
│               └── ...
└── textures/
    └── 01_loot_box/
        └── loot_box_rotation_01/
            └── loot_box_luminite/
                └── ...
```

PixelWeb presents the current content as:

```text
Marketplace
└── Loot Boxes
    └── Rotation 01
        └── Luminite
            ├── Helmet 3D
            ├── Helmet 2D
            ├── Chestplate
            ├── Leggings
            └── Boots
```

Keep `acquisition group → rotation → collection → item` recoverable in the canonical data model. A future filtered UI may flatten results visually, but it must not destroy this relationship.

## 3. Resolving `Pack.model`

A Nexo reference such as:

```text
market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_helmet_3d
```

resolves in the source pack to:

```text
Nexo/pack/assets/market_skins/models/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/
  r1_loot_box_luminite_helmet_3d.json
```

The browser-public geometry projection is stored under:

```text
data/marketplace/nexo/models/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/
  r1_loot_box_luminite_helmet_3d.json
```

Geometry JSON remains in `data/` so PixelWeb does not weaken the public bundle rules by allowing arbitrary JSON under `assets/`.

## 4. Runtime geometry source

`.bbmodel` is not required for the current Marketplace renderer. The exported Minecraft model JSON carries the browser-relevant data used by this implementation:

- `elements[].from` / `elements[].to`;
- per-element rotation axis, angle and origin;
- face UV rectangles;
- face texture references;
- texture map entries;
- alpha from the referenced PNG textures.

`display.gui.rotation` may remain in source metadata for traceability but is **not** the Marketplace presentation camera. The web viewer owns its catalogue orientation independently.

If a future model depends on parent-model inheritance, non-cuboid meshes or another unsupported construct, add support deliberately. Do not silently flatten or guess the intended appearance.

## 5. Texture projection

A texture reference such as:

```text
market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet
```

maps from:

```text
Nexo/pack/assets/market_skins/textures/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet.png
```

to:

```text
assets/marketplace/nexo/textures/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet.png
```

PNG assets are copied without AVIF/WebP conversion, downscale or recompression. Pixel-art rendering uses nearest-neighbor sampling (`imageSmoothingEnabled = false`).

## 6. Animated textures

The Luminite 3D helmet references `animations/animated_6.png` with source metadata equivalent to:

```json
{"animation":{"frametime":2}}
```

The normalized browser metadata is stored at:

```text
data/marketplace/nexo/animation/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/animated_6.json
```

Minecraft `frametime` is interpreted as ticks, so the browser advances a frame every `frametime × 50 ms`. `prefers-reduced-motion: reduce` freezes animated textures to their first frame.

Other animation assets in the resource pack remain excluded unless a registered Marketplace item references them.

## 7. CustomArmor relationships

Chestplate, Leggings and Boots declare:

```text
asset_id: nexo:r1_loot_box
```

and share:

```text
luminite_set_armor_layer_1.png
luminite_set_armor_layer_2.png
```

That relationship is preserved in the manifest. The current viewer renders each item's own model; armor layers remain available for a future equipped-set presentation. The two Helmet entries do not declare the same `asset_id`, so PixelWeb must not invent it.

## 8. Pack-only assets are not active items

The supplied pack also contains visual resources for items including:

```text
axe, bow, chest, crossbow, fishing_rod, hammer, hoe, key, mace,
pickaxe, scythe, shield, shovel, spear_trident, staff, sword
```

Those files demonstrate that more visual content exists, but the supplied Nexo item tree does not register them as Marketplace items. They remain outside `data/marketplace.js` until matching item definitions are supplied and verified.

This distinction must survive future refactors.

## 9. Public subset only

Do **not** copy the complete Nexo working directory into PixelWeb. Generated/cache material such as:

```text
Nexo/pack/.assetCache/
Nexo/pack/.deobfCachedPacks/
```

must never be published just because it exists in the source snapshot.

For a registered item, copy only the browser-required resources: resolved model JSON, directly referenced PNG textures, normalized animation metadata when applicable, declared armor layers required for set semantics, and catalogue metadata.

## 10. Canonical browser data

`data/marketplace.js` is the browser-public catalogue manifest and preserves:

```text
sourceSystem
namespace
acquisitionGroups[]
  rotations[]
    collections[]
      items[]
```

The player-facing UI renders from this manifest. Do not create a second hard-coded item registry in `marketplace.js` or `marketplace.html`.

Internal fields such as model source paths or element counts may remain for traceability, but they are not player-facing copy unless there is a product reason to expose them.

## 11. Viewer presentation contract

`marketplace.js` provides a deliberately minimal live 3D presentation. These rules are part of the Marketplace contract:

### Small card previews

- every card uses the item's real 3D model; never regress to a flat texture thumbnail;
- preview pitch is locked to **0°**;
- the catalogue base orientation is **yaw 90° / pitch 0° / roll 0°**;
- previews rotate continuously around the vertical/Y axis at a restrained, synchronized speed;
- previews do not tilt while spinning;
- previews are not drag-controlled: clicking a card selects it;
- selecting a card transfers the preview's current yaw into the large viewer, with pitch reset to 0°, so the inspected model opens at the angle the player just saw;
- `prefers-reduced-motion: reduce` is allowed to freeze this decorative preview spin.

### Large inspection viewer

- the selected model is static until the player drags it;
- rotation requires primary pointer/touch drag; hover alone never rotates the model;
- drag response is **inverse**: moving the pointer right rotates the model toward the opposite yaw direction, and moving vertically applies the opposite pitch direction;
- releasing the pointer keeps the resulting pose;
- wheel zoom may remain available without visible controls;
- no visible arrows, `+`, `−`, reload/reset button, instruction pill or `drag to rotate` copy is rendered inside the stage.

### Common visual scale

All Marketplace models — armor, tools, weapons and future cosmetic categories — must share the same **perceived catalogue footprint** instead of being enlarged or reduced solely because their model JSON has a different bounding-box extent.

The renderer therefore performs a one-time visual normalization for each model/viewer mode:

1. render the textured model at pitch 0° across sampled yaw angles around a full turn;
2. measure the actual non-transparent rendered footprint, not merely the raw cuboid bounds;
3. derive a scale factor that targets a common canvas occupancy;
4. cache that scale factor;
5. keep it fixed while the model rotates so there is no breathing/pulsing zoom.

This normalization is required specifically so a flat helmet, a deep 3D helmet, armor pieces, future tools and other cosmetics present at a consistent visual size in their respective preview frames.

### Rendering constraints

- no dark mannequin, fallback body or synthetic silhouette is rendered behind armor cosmetics;
- only model faces with a resolved valid item texture are drawn;
- no black directional-shading overlay is painted over the texture;
- the stage contains no synthetic floor shadow or decorative object competing with the cosmetic;
- animated resource-pack textures continue to animate unless reduced motion is requested;
- the renderer remains same-origin and dependency-free; no external 3D CDN/library or CSP widening is required for the current implementation.

## 12. Marketplace vs Store

Marketplace is a **separate primary site category**. It is not Store and must not inherit Store claims about pricing, purchasing, availability or rank progression.

```text
Marketplace -> cosmetic catalogue, collections, rotations, live model inspection
Store       -> current commercial offers and purchase/support flow
```

Do not infer price, rarity, drop chance, sale state, ownership state or availability windows from filenames.

## 13. Adding a future rotation

When importing a new Nexo snapshot:

1. inspect `Nexo/items/Market_Skins/...` first;
2. enumerate registered ids and `Pack.model` references;
3. resolve each model below `Nexo/pack/assets/<namespace>/models/`;
4. resolve every texture used by each registered model;
5. normalize sibling animation metadata only for referenced animated textures;
6. preserve declared `CustomArmor` layers and `asset_id` relationships;
7. extend the acquisition/rotation/collection tree in `data/marketplace.js`;
8. copy only the minimum public resource subset;
9. never promote unregistered pack leftovers into the catalogue;
10. let the viewer's visual-footprint normalization size new tools/cosmetics instead of adding ad-hoc CSS sizes per item;
11. ensure every preview remains pitch 0° and auto-spins only on Y;
12. ensure the large viewer remains inverse-drag only;
13. update this document whenever the source convention or viewer contract changes.

Do not silently reinterpret the hierarchy, scale policy or viewer behavior.

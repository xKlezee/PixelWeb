# PixelWeb Marketplace — Nexo Source Structure

This file is the durable repository note for the **Marketplace** content architecture and viewer behavior. It records how PixelWeb translates Pixel Network's Nexo content into the public website without treating resource-pack leftovers as published Marketplace items.

The first source snapshot used for this architecture was the supplied `Nexo (2).zip`. The ZIP itself is not committed to PixelWeb.

## 1. Publication authority

A file existing under `Nexo/pack/assets/...` does **not** by itself make an item public in Marketplace.

PixelWeb publishes an item only when a corresponding Nexo item entry exists under `Nexo/items/...` and its referenced model can be resolved in the resource pack.

For the current snapshot the authoritative item file is:

```text
Nexo/items/Market_Skins/01_loot_box/loot_box_rotation_01/01_loot_box_r1_armor.yml
```

It registers exactly five entries:

| Nexo id | Public name | Material | Slot | Model elements | Set asset id |
|---|---|---|---|---:|---|
| `r1_loot_box_helmet_3d` | Helmet | `CHAINMAIL_HELMET` | HEAD | 52 | — |
| `r1_loot_box_helmet_2d` | Helmet 2D | `CHAINMAIL_HELMET` | HEAD | 4 | — |
| `r1_loot_box_chestplate` | Chestplate | `CHAINMAIL_CHESTPLATE` | CHEST | 6 | `nexo:r1_loot_box` |
| `r1_loot_box_leggings` | Leggings | `CHAINMAIL_LEGGINGS` | LEGS | 5 | `nexo:r1_loot_box` |
| `r1_loot_box_boots` | Boots | `CHAINMAIL_BOOTS` | FEET | 4 | `nexo:r1_loot_box` |

Do not add pack-only content to `data/marketplace.js` unless its Nexo registration is present in the imported source.

## 2. Nexo hierarchy → Marketplace hierarchy

The source hierarchy is preserved semantically:

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
└── textures/
    └── 01_loot_box/
        └── loot_box_rotation_01/
            └── loot_box_luminite/
```

PixelWeb presents it as:

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

The canonical data model must remain `acquisition group → rotation → collection → item`. A later filtered UI may flatten results visually, but source relationships must remain recoverable.

## 3. Resolving `Pack.model`

A Nexo reference such as:

```text
market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_helmet_3d
```

resolves to:

```text
Nexo/pack/assets/market_skins/models/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/
  r1_loot_box_luminite_helmet_3d.json
```

The browser projection stores model geometry under:

```text
data/marketplace/nexo/models/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/
  ...json
```

Model JSON is kept in `data/` because PixelWeb's public bundle policy restricts arbitrary JSON under `assets/`.

## 4. Runtime geometry source

For the current Marketplace implementation `.bbmodel` is **not required**. The exported Minecraft model JSON already contains the browser-relevant data for the imported snapshot:

- `elements[].from` / `elements[].to` bounds;
- per-element `rotation.angle`, `rotation.axis`, and `rotation.origin`;
- face UV rectangles;
- face texture references;
- model texture mappings;
- alpha in the PNG textures.

`display.gui.rotation` is retained in the manifest for source traceability but is **not** the default catalogue pose anymore. Marketplace uses its own canonical front-facing presentation described in section 11.

If a future model depends on parents, unsupported meshes or another construct the current renderer cannot represent, support must be added deliberately. Do not silently flatten or approximate the model.

## 5. Texture projection

A model texture reference such as:

```text
market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet
```

resolves in Nexo to:

```text
Nexo/pack/assets/market_skins/textures/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet.png
```

and in PixelWeb to:

```text
assets/marketplace/nexo/textures/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet.png
```

PNG files are copied without AVIF/WebP conversion, downscale or recompression. Pixel-art rendering uses nearest-neighbor sampling (`imageSmoothingEnabled = false`).

## 6. Animated textures

The Luminite 3D helmet references `animations/animated_6.png` with source metadata equivalent to:

```json
{"animation":{"frametime":2}}
```

The browser stores normalized animation metadata at:

```text
data/marketplace/nexo/animation/01_loot_box/loot_box_rotation_01/loot_box_luminite/animated_6.json
```

Minecraft `frametime` is interpreted as ticks, so PixelWeb advances a frame every `frametime × 50 ms`. `prefers-reduced-motion: reduce` freezes animated textures to the first frame.

Other animation assets remain excluded unless a registered Marketplace item references them.

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

That relationship is preserved in the Marketplace manifest. The current viewer renders each item's individual model. The armor layers remain available for a future equipped-set presentation.

The two Helmet entries do not declare the same `asset_id`, so PixelWeb must not invent that relationship.

## 8. Pack-only assets are not Marketplace items

The supplied resource pack also contains visual assets for items including:

```text
axe, bow, chest, crossbow, fishing_rod, hammer, hoe, key, mace,
pickaxe, scythe, shield, shovel, spear_trident, staff, sword
```

Those files prove that more visual content exists in the pack, but the supplied Nexo item tree does not register them as Marketplace items. They stay outside `data/marketplace.js` until matching Nexo definitions are supplied and verified.

This rule is intentional and must survive future refactors.

## 9. Public subset only

Do **not** copy the complete Nexo directory into PixelWeb. Generated/cache material such as:

```text
Nexo/pack/.assetCache/
Nexo/pack/.deobfCachedPacks/
```

must never be published merely because it exists in a working tree.

For a registered item, publish only the resources needed by the browser projection: resolved model JSON, directly referenced PNG textures, normalized animation metadata when applicable, declared armor layers required for set semantics, and catalogue metadata.

## 10. Canonical browser data

`data/marketplace.js` is the public catalogue manifest and preserves:

```text
sourceSystem
namespace
acquisitionGroups[]
  rotations[]
    collections[]
      items[]
```

The player-facing UI renders from this manifest. Do not introduce a second hard-coded item registry in `marketplace.js` or `marketplace.html`.

Internal fields such as source paths, element counts and Nexo registration names may remain in the manifest for traceability, but they are not player-facing Marketplace copy unless there is a product reason to expose them.

## 11. Viewer interaction contract

`marketplace.js` provides the live model presentation. The intended interaction is deliberately minimal and must remain consistent between card miniatures and the selected large viewer.

### Default pose

Every item opens in the same canonical catalogue orientation:

```text
pitch = 0°
yaw   = 90°
roll  = 0°
```

This produces the front-facing, elevation-free presentation required for Marketplace. Do not use Nexo/Minecraft `display.gui.rotation` as the default visual pose; those inventory transforms often introduce the slanted perspective that Marketplace intentionally avoids.

The same base orientation applies to:

- every small item preview;
- the first large selected model;
- any newly selected item that has not previously been manually rotated.

### Rotation behavior

- Models do **not** rotate merely because the cursor enters or moves across a viewer.
- Card miniatures do **not** auto-rotate while idle.
- Rotation begins only while primary pointer contact is active: mouse click-and-drag, pen drag or touch drag.
- Horizontal and vertical drag are **direct**, not inverse: moving the pointer right/down applies the corresponding positive yaw/pitch movement rather than deliberately rotating the model in the opposite direction.
- Rotation uses eased interpolation so the model follows the drag smoothly without hard frame-to-frame snapping.
- Releasing the pointer leaves the model at its current pose; there is no automatic return to the default pose.
- Clicking a card without dragging selects it for the large viewer.
- If a miniature has been manually rotated, selecting it transfers that miniature's current yaw/pitch into the large viewer so inspection starts from the same visible pose.
- A drag gesture on a miniature must not accidentally trigger item selection at the end of the same gesture.
- Wheel zoom may remain available on the large viewer without visible control chrome.

### Visual surface

- Every card uses a real 3D canvas, never a flat `primaryTexture` thumbnail.
- No visible arrow, `+`, `−`, reload or reset buttons are rendered.
- No visible instruction/status pill is rendered inside the model window.
- No dark mannequin, fallback body or synthetic silhouette is drawn behind an armor cosmetic.
- Only faces with a resolved valid item texture are drawn.
- No black directional-shading overlay is painted over the source texture.
- No synthetic floor shadow or decorative object is rendered inside the stage.
- Animated resource-pack textures continue to animate unless reduced motion is requested.

The renderer remains same-origin and dependency-free; no external 3D CDN/library or CSP widening is required for this implementation.

## 12. Marketplace vs Store

Marketplace is a **separate primary site category**. It is not Store and must not inherit Store claims about pricing, purchasing, availability or rank progression.

```text
Marketplace -> cosmetic catalogue, collections, rotations, live model inspection
Store       -> current commercial offers and purchase/support flow
```

Do not infer price, rarity, drop chance, sale state, ownership state or availability windows from filenames.

## 13. Adding a future rotation

When a new Nexo snapshot is imported:

1. inspect `Nexo/items/Market_Skins/...` first;
2. enumerate registered ids and their `Pack.model` references;
3. resolve each model under `Nexo/pack/assets/<namespace>/models/`;
4. resolve every texture referenced by the model;
5. normalize sibling animation metadata only for referenced animated textures;
6. preserve declared `CustomArmor` layers and `asset_id` relationships;
7. extend the acquisition/rotation/collection tree in `data/marketplace.js`;
8. copy only the minimum required public subset;
9. never promote unregistered pack leftovers into the public catalogue;
10. ensure every new card uses the live miniature renderer with the canonical `0° / 90° / 0°` catalogue pose;
11. ensure drag direction remains direct and rotation remains pointer-down-only;
12. update this document in the same change if the source convention or viewer contract changes.

Do not silently reinterpret either the Nexo hierarchy or the viewer behavior.

# PixelWeb Marketplace — Nexo Source Structure

This document is the repository contract for the **Marketplace** content architecture and viewer behavior. It records how PixelWeb translates Pixel Network's Nexo content into a browser-public catalogue without turning resource-pack leftovers into player-facing products.

The first source snapshot reviewed for this architecture was the supplied `Nexo (2).zip` and its `Market_Skins` tree. The ZIP itself is not committed to PixelWeb.

## 1. Publication authority

A file existing under `Nexo/pack/assets/...` is **not enough** to make it a Marketplace item.

PixelWeb publishes an item only when an entry exists in the Nexo item configuration under `Nexo/items/...` and the referenced model can be resolved in the resource pack.

Current authority:

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

The web manifest must not claim additional active items unless their Nexo registration is present in the imported source.

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

PixelWeb presents that as:

```text
Marketplace
└── Loot Boxes                 <- 01_loot_box
    └── Rotation 01            <- loot_box_rotation_01
        └── Luminite           <- loot_box_luminite
            ├── Helmet 3D
            ├── Helmet 2D
            ├── Chestplate
            ├── Leggings
            └── Boots
```

Do not flatten `acquisition group → rotation → collection → item` into a different canonical data model. Filtered UI may be added later, but the source relationship must remain recoverable.

## 3. `Pack.model` resolution

A Nexo model reference such as:

```text
market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_helmet_3d
```

resolves to:

```text
Nexo/pack/assets/market_skins/models/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/
  r1_loot_box_luminite_helmet_3d.json
```

The browser projection intentionally separates geometry/data from binary media:

```text
Nexo model JSON
  -> data/marketplace/nexo/models/...

Nexo texture PNG
  -> assets/marketplace/nexo/textures/...

Nexo .png.mcmeta
  -> normalized data/marketplace/nexo/animation/.../*.json
```

Do not widen the public asset policy merely to mirror the raw Nexo folder byte-for-byte. JSON belongs under `data/`; PNG media belongs under `assets/`.

## 4. Model source

For the current viewer, `.bbmodel` is not required. The exported Minecraft model JSON contains the required visual information for this snapshot:

- element bounds;
- per-element rotation and origin;
- face UVs;
- face texture references;
- texture map entries;
- GUI display rotation;
- PNG alpha.

If a future model relies on parents, meshes or constructs not represented by the renderer, support must be added deliberately. Do not silently flatten unsupported model behavior.

## 5. Texture resolution and integrity

A resource-pack reference such as:

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

The Luminite 3D helmet references `animations/animated_6.png` with sibling source metadata:

```json
{"animation":{"frametime":2}}
```

The browser stores the normalized metadata at:

```text
data/marketplace/nexo/animation/01_loot_box/loot_box_rotation_01/loot_box_luminite/animated_6.json
```

Minecraft `frametime` is interpreted as ticks, so the browser advances a frame every `frametime × 50 ms`. `prefers-reduced-motion: reduce` freezes animated textures to their first frame.

Other animation assets present in the pack remain excluded unless a registered Marketplace item references them.

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

## 8. Pack-only assets are not current Marketplace items

The supplied resource pack also contains visual assets for items including:

```text
axe, bow, chest, crossbow, fishing_rod, hammer, hoe, key, mace,
pickaxe, scythe, shield, shovel, spear_trident, staff, sword
```

Those resources demonstrate that more content exists in the pack, but the supplied Nexo item tree does not register them as Marketplace items. They remain outside `data/marketplace.js` until matching Nexo definitions are supplied and verified.

This distinction is intentional and must survive future refactors.

## 9. Public subset only

Do **not** copy the complete Nexo directory into PixelWeb. Generated/cache material such as:

```text
Nexo/pack/.assetCache/
Nexo/pack/.deobfCachedPacks/
```

must never be published simply because it exists in the working tree.

For a registered item, copy only the resources needed by the browser projection: resolved model JSON, directly referenced PNG textures, normalized animation metadata when applicable, declared armor layers required for set semantics, and catalogue metadata.

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

The player-facing UI renders from this manifest. Do not repeat a second hard-coded item registry inside `marketplace.js` or `marketplace.html`.

Internal fields such as element counts, Nexo source paths and registration filenames may remain in the manifest for traceability, but they are **not player-facing Marketplace copy** unless there is a product reason to expose them.

## 11. Viewer interaction contract

`marketplace.js` provides the live model presentation. The intended interaction is deliberately minimal:

- each Marketplace card contains a real miniature 3D canvas of that item's model; flat `primaryTexture` images are not used as card previews;
- miniature models rotate continuously at a restrained speed when reduced motion is not requested;
- clicking a card transfers the miniature's current yaw/pitch into the large inspection viewer, so selection does not snap back to an unrelated orientation;
- on fine-pointer/desktop input, the large model follows cursor position continuously without requiring drag;
- pointer response is **inverse**: cursor movement right/left and up/down drives model rotation in the opposite direction;
- movement is interpolated/eased rather than applied as a hard step;
- leaving the viewer eases the model back to the pose inherited when the item was selected;
- touch devices use inverse drag because hover positioning is unavailable;
- wheel zoom may remain available as an unlabelled direct manipulation, but there are no visible `+`, `−`, arrow or reset controls;
- keyboard arrow support may remain for accessibility but must not introduce visible control chrome;
- the viewer contains no visible instruction/status pills such as `drag to rotate`, loading text or control legends;
- no dark mannequin, fallback body or synthetic silhouette is rendered behind an armor cosmetic;
- only model faces with a resolved valid item texture are drawn;
- no black directional-shading overlay is painted over the texture in the current presentation;
- the stage contains no synthetic floor shadow or decorative object competing with the cosmetic;
- animated resource-pack textures continue to animate unless reduced motion is requested.

This contract applies to both card miniatures and the selected inspection viewer. Do not regress cards back to flat texture thumbnails.

The renderer remains same-origin and dependency-free; no external 3D CDN/library or CSP widening is required.

## 12. Marketplace vs Store

Marketplace is a **separate primary site category**. It is not the Store and must not inherit Store claims about pricing, purchasing, availability or rank progression.

```text
Marketplace -> cosmetic catalogue, collections, rotations, live model inspection
Store       -> current commercial offers and purchase/support flow
```

Do not infer a Marketplace price, rarity, drop chance, sale state, ownership state or availability window from filenames.

## 13. Adding a future rotation

When a new Nexo snapshot is imported:

1. inspect `Nexo/items/Market_Skins/...` first;
2. enumerate registered ids and `Pack.model` references;
3. resolve each model under `Nexo/pack/assets/<namespace>/models/`;
4. resolve every texture used by the model;
5. normalize sibling animation metadata only for referenced animated textures;
6. preserve declared `CustomArmor` layers and `asset_id` relationships;
7. extend the acquisition/rotation/collection tree in `data/marketplace.js`;
8. copy only the minimum required public subset;
9. never promote unregistered pack leftovers into the catalogue;
10. ensure every new card uses a live miniature renderer and that inspection inherits its pose;
11. update this document if the source convention or viewer contract changes.

Do not silently reinterpret the hierarchy or viewer behavior.

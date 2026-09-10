# PixelWeb Marketplace — Nexo Source Structure

This document is the repository note for the **Marketplace** content architecture. It records how PixelWeb translates Pixel Network's Nexo content into a browser-public catalogue without turning resource-pack leftovers into player-facing products.

The first source snapshot reviewed for this architecture was the supplied `Nexo (2).zip` and its `Market_Skins` tree. The ZIP itself is not committed to PixelWeb.

## 1. Primary rule: Nexo item registration is the publication gate

A file existing under `Nexo/pack/assets/...` is **not enough** to make it a Marketplace item.

PixelWeb publishes an item only when an entry exists in the Nexo item configuration under `Nexo/items/...` and the referenced model can be resolved in the resource pack.

For the current snapshot, the authoritative item file is:

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

The web manifest must not claim additional active items unless their Nexo registration is present in the source being imported.

## 2. Nexo hierarchy → Marketplace hierarchy

The source structure is preserved semantically:

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

Do not flatten `acquisition group → rotation → collection → item` into one global item list as the canonical data model. A filtered UI may show a flat view later, but the source relationship must remain recoverable.

## 3. Resolving `Pack.model`

A Nexo model reference such as:

```text
market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_helmet_3d
```

is resolved as:

```text
Nexo/pack/assets/market_skins/models/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/
  r1_loot_box_luminite_helmet_3d.json
```

PixelWeb mirrors the browser-required subset under:

```text
assets/marketplace/nexo/pack/assets/market_skins/
```

The mirrored files remain in Minecraft resource-pack layout so texture references from the model stay deterministic.

## 4. Minecraft model JSON is the runtime geometry source

For the current Marketplace renderer, `.bbmodel` is **not required**. The exported Minecraft model JSON already carries the browser-relevant geometry for this snapshot:

- `elements[].from` / `elements[].to` cuboid bounds;
- per-element `rotation.angle`, `rotation.axis`, and `rotation.origin`;
- face UV rectangles;
- face texture references such as `#1` / `#2`;
- texture map entries;
- `display.gui.rotation`, used as the initial viewer orientation;
- alpha contained in the PNG textures.

Blockbench-only group metadata is not treated as a gameplay/publication authority. Current imported models contain simple groups, but their visual runtime is defined by the exported item-model elements.

If a future Nexo model relies on model parents, non-cuboid meshes, or another construct not represented by the current renderer, support must be added deliberately; the importer/viewer must fail closed rather than silently flattening the model.

## 5. Texture resolution

A model texture reference such as:

```text
market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet
```

maps to:

```text
Nexo/pack/assets/market_skins/textures/
  01_loot_box/loot_box_rotation_01/loot_box_luminite/armor_textures/helmet.png
```

The browser mirror uses the equivalent path below `assets/marketplace/nexo/pack/assets/market_skins/textures/`.

Pixel-art textures must be rendered without image smoothing.

## 6. Animated resource-pack textures

The Luminite 3D helmet references `animations/animated_6.png`. Its source texture is a vertical sprite strip and has a sibling:

```text
animated_6.png.mcmeta
```

with:

```json
{"animation":{"frametime":2}}
```

Minecraft `frametime` is interpreted in game ticks. The web renderer therefore advances a frame every `frametime × 50 ms`. `prefers-reduced-motion: reduce` freezes animated textures to the first frame.

The supplied snapshot also contains `animated_1` through `animated_5` and `wings_animated`, with `frametime` values of 1–2 ticks. They are **not copied into the current browser subset unless a registered Marketplace item references them**.

## 7. CustomArmor / equipped-set relationship

Chestplate, Leggings and Boots define:

```text
asset_id: nexo:r1_loot_box
```

and share these two armor layers:

```text
luminite_set_armor_layer_1.png
luminite_set_armor_layer_2.png
```

That is treated as a real set relationship in the Marketplace manifest. The item-model viewer renders the individual item JSON; the armor layers are retained in the browser subset for a future equipped/mannequin view.

The two Helmet entries in the supplied YAML do not declare the same `asset_id`, so PixelWeb does not invent that field for them.

## 8. Pack-only assets are not current Marketplace items

The supplied resource pack contains additional Luminite visual assets including:

```text
axe, bow, chest, crossbow, fishing_rod, hammer, hoe, key, mace,
pickaxe, scythe, shield, shovel, spear_trident, staff, sword
```

and an exported `axe.json` model with 58 elements. It also contains animation textures not referenced by the five registered armor entries.

Those resources demonstrate that more content exists in the pack, but **the supplied Nexo item tree does not register them as Marketplace items**. They therefore stay out of `data/marketplace.js` until the corresponding Nexo item definitions are supplied and verified.

This distinction is intentional and must survive future refactors.

## 9. Browser-public mirror: copy the minimum required subset

Do **not** copy the complete Nexo directory into PixelWeb.

The source snapshot also contains generated/cache material such as:

```text
Nexo/pack/.assetCache/
Nexo/pack/.deobfCachedPacks/
```

Those are not Marketplace content and must never be published merely because they were present in a Nexo working directory.

For each registered item, the web subset should contain only:

1. the resolved Minecraft model JSON;
2. textures directly referenced by that model;
3. referenced `.png.mcmeta` files when present;
4. declared `CustomArmor` layers needed to preserve equipped-set semantics;
5. browser metadata in `data/marketplace.js`.

## 10. Canonical browser data

`data/marketplace.js` is the browser-public catalogue manifest. It preserves:

```text
sourceSystem
namespace
acquisitionGroups[]
  rotations[]
    collections[]
      items[]
```

Each item records the Nexo id, public item name, material, equipment slot, source model reference, browser model path, texture mapping, element count, initial GUI rotation and any declared set/armor-layer relationship.

Player-facing UI must render from this manifest instead of repeating item lists in multiple JavaScript files.

## 11. Runtime viewer contract

`marketplace.js` is intentionally tailored to Minecraft item-model JSON. It:

- loads models and textures only from same-origin PixelWeb assets;
- applies per-element X/Y/Z rotations around the JSON origin;
- projects cuboids orthographically for a Minecraft-like presentation;
- maps each face's UV rectangle to the referenced texture;
- disables image smoothing;
- culls back faces and applies restrained directional shading;
- supports vertical resource-pack sprite animation through `.mcmeta`;
- uses `display.gui.rotation` as the reset orientation;
- supports pointer drag, keyboard rotation, zoom, and reset;
- honors reduced-motion for animated textures.

No external 3D CDN/library is required for this first implementation, and the existing `connect-src 'self'` / `script-src 'self'` CSP does not need to be widened.

## 12. Marketplace vs Store

Marketplace is a **separate primary site category**. It is not the Tebex Store and must not inherit Store claims about pricing, purchasing, availability or rank progression.

Current responsibility split:

```text
Marketplace -> cosmetic catalogue, collections, rotations, live model inspection
Store       -> current commercial offers and purchase/support flow
```

Do not infer a Marketplace price, rarity, drop chance, sale state, ownership state or availability window from filenames. Those fields require their own verified source before publication.

## 13. Adding a future rotation

When a new Nexo snapshot is imported:

1. inspect `Nexo/items/Market_Skins/...` first;
2. enumerate registered ids and their `Pack.model` references;
3. resolve each model below `Nexo/pack/assets/<namespace>/models/`;
4. resolve every texture reference used by the model;
5. include sibling `.mcmeta` only when the referenced texture is animated;
6. preserve declared `CustomArmor` layers and `asset_id` relationships;
7. add a new acquisition/rotation/collection node to `data/marketplace.js`;
8. copy only the required public resource subset;
9. never promote unregistered pack leftovers into the public catalogue;
10. review the live viewer against the exact imported assets before publishing.

If the Nexo folder convention changes, update this document and the manifest mapping in the same change. Do not silently reinterpret the hierarchy.

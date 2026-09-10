(() => {
  'use strict';

  const freezeItems = items => Object.freeze(items.map(item => Object.freeze({
    ...item,
    textures: Object.freeze({ ...(item.textures || {}) }),
    animationMetadata: Object.freeze({ ...(item.animationMetadata || {}) }),
    armorLayers: Object.freeze([...(item.armorLayers || [])]),
    guiRotation: Object.freeze([...(item.guiRotation || [30, 135, 0])])
  })));

  const modelRoot = 'data/marketplace/nexo/models/01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads';
  const textureRoot = 'assets/marketplace/nexo/textures/01_loot_box/loot_box_rotation_01/loot_box_luminite';
  const metadataRoot = 'data/marketplace/nexo/animation/01_loot_box/loot_box_rotation_01/loot_box_luminite';

  const luminiteItems = freezeItems([
    {
      id: 'r1_loot_box_helmet_3d',
      name: 'Helmet',
      variant: '3D',
      material: 'CHAINMAIL_HELMET',
      slot: 'HEAD',
      assetId: null,
      itemModelComponent: null,
      registeredBy: '01_loot_box_r1_armor.yml',
      sourceModelRef: 'market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_helmet_3d',
      model: `${modelRoot}/r1_loot_box_luminite_helmet_3d.json`,
      textures: {
        '1': `${textureRoot}/animations/animated_6.png`,
        '2': `${textureRoot}/armor_textures/helmet.png`
      },
      animationMetadata: {
        '1': `${metadataRoot}/animated_6.json`
      },
      primaryTexture: `${textureRoot}/armor_textures/helmet.png`,
      armorLayers: [],
      elementCount: 52,
      guiRotation: [30, 135, 0]
    },
    {
      id: 'r1_loot_box_helmet_2d',
      name: 'Helmet 2D',
      variant: '2D',
      material: 'CHAINMAIL_HELMET',
      slot: 'HEAD',
      assetId: null,
      itemModelComponent: null,
      registeredBy: '01_loot_box_r1_armor.yml',
      sourceModelRef: 'market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_helmet_2d',
      model: `${modelRoot}/r1_loot_box_luminite_helmet_2d.json`,
      textures: {
        '1': `${textureRoot}/armor_textures/r1_loot_box_luminite_helmet_2d.png`
      },
      animationMetadata: {},
      primaryTexture: `${textureRoot}/armor_textures/r1_loot_box_luminite_helmet_2d.png`,
      armorLayers: [],
      elementCount: 4,
      guiRotation: [30, 135, 0]
    },
    {
      id: 'r1_loot_box_chestplate',
      name: 'Chestplate',
      variant: 'Armor',
      material: 'CHAINMAIL_CHESTPLATE',
      slot: 'CHEST',
      assetId: 'nexo:r1_loot_box',
      itemModelComponent: 'nexo:r1_loot_box_chestplate',
      registeredBy: '01_loot_box_r1_armor.yml',
      sourceModelRef: 'market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_chestplate',
      model: `${modelRoot}/r1_loot_box_luminite_chestplate.json`,
      textures: {
        '2': `${textureRoot}/armor_textures/luminite_set_chestplate.png`
      },
      animationMetadata: {},
      primaryTexture: `${textureRoot}/armor_textures/luminite_set_chestplate.png`,
      armorLayers: [
        `${textureRoot}/armor_layers/luminite_set_armor_layer_1.png`,
        `${textureRoot}/armor_layers/luminite_set_armor_layer_2.png`
      ],
      elementCount: 6,
      guiRotation: [30, 135, 0]
    },
    {
      id: 'r1_loot_box_leggings',
      name: 'Leggings',
      variant: 'Armor',
      material: 'CHAINMAIL_LEGGINGS',
      slot: 'LEGS',
      assetId: 'nexo:r1_loot_box',
      itemModelComponent: 'nexo:r1_loot_box_leggings',
      registeredBy: '01_loot_box_r1_armor.yml',
      sourceModelRef: 'market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_leggings',
      model: `${modelRoot}/r1_loot_box_luminite_leggings.json`,
      textures: {
        '1': `${textureRoot}/armor_textures/luminite_set_leggings.png`
      },
      animationMetadata: {},
      primaryTexture: `${textureRoot}/armor_textures/luminite_set_leggings.png`,
      armorLayers: [
        `${textureRoot}/armor_layers/luminite_set_armor_layer_1.png`,
        `${textureRoot}/armor_layers/luminite_set_armor_layer_2.png`
      ],
      elementCount: 5,
      guiRotation: [30, 135, 0]
    },
    {
      id: 'r1_loot_box_boots',
      name: 'Boots',
      variant: 'Armor',
      material: 'CHAINMAIL_BOOTS',
      slot: 'FEET',
      assetId: 'nexo:r1_loot_box',
      itemModelComponent: 'nexo:r1_loot_box_boots',
      registeredBy: '01_loot_box_r1_armor.yml',
      sourceModelRef: 'market_skins:01_loot_box/loot_box_rotation_01/loot_box_luminite/custom_mads/r1_loot_box_luminite_boots',
      model: `${modelRoot}/r1_loot_box_luminite_boots.json`,
      textures: {
        '2': `${textureRoot}/armor_textures/luminite_set_boots.png`
      },
      animationMetadata: {},
      primaryTexture: `${textureRoot}/armor_textures/luminite_set_boots.png`,
      armorLayers: [
        `${textureRoot}/armor_layers/luminite_set_armor_layer_1.png`,
        `${textureRoot}/armor_layers/luminite_set_armor_layer_2.png`
      ],
      elementCount: 4,
      guiRotation: [30, 135, 0]
    }
  ]);

  const marketplace = {
    schemaVersion: 1,
    sourceSystem: 'Nexo',
    namespace: 'market_skins',
    acquisitionGroups: Object.freeze([
      Object.freeze({
        id: '01_loot_box',
        name: 'Loot Boxes',
        rotations: Object.freeze([
          Object.freeze({
            id: 'loot_box_rotation_01',
            name: 'Rotation 01',
            collections: Object.freeze([
              Object.freeze({
                id: 'loot_box_luminite',
                name: 'Luminite',
                type: 'armor-set',
                sourceItemFile: 'Nexo/items/Market_Skins/01_loot_box/loot_box_rotation_01/01_loot_box_r1_armor.yml',
                sourcePackRoot: 'Nexo/pack/assets/market_skins',
                itemCount: luminiteItems.length,
                items: luminiteItems
              })
            ])
          })
        ])
      })
    ]),
    publicationRule: 'Only entries registered by Nexo item YAML are player-facing marketplace items.'
  };

  window.PIXEL_MARKETPLACE = Object.freeze(marketplace);
})();

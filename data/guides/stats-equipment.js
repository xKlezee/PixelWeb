(() => {
  const data = {
    verification: {
      level: 'source-verified',
      verifiedAsOf: '2026-09-07',
      liveClient: 'not-asserted',
      scope: 'core combat and equipment semantics',
      exclusions: ['mining-specific stats', 'candidate stats without current gameplay evidence']
    },
    coreStats: [
      {
        key: 'attack_damage',
        name: 'Attack Damage',
        family: 'Melee weapons',
        role: 'Melee damage basis',
        meaning: 'The damage basis for a progression melee weapon before later combat modifiers and target mitigation.',
        status: 'source-verified'
      },
      {
        key: 'attack_speed',
        name: 'Attack Speed',
        family: 'Melee weapons',
        role: 'Attack cadence',
        meaning: 'Controls weapon attack cadence and therefore matters together with damage-per-hit when comparing sustained melee output.',
        status: 'source-verified'
      },
      {
        key: 'projectile_damage',
        name: 'Projectile Damage',
        family: 'Bows',
        role: 'Ranged damage basis',
        meaning: 'The progression damage basis carried by an eligible bow shot before target mitigation.',
        status: 'source-verified'
      },
      {
        key: 'defense',
        name: 'Defense',
        family: 'Defensive equipment',
        role: 'Damage mitigation',
        meaning: 'The defensive input used by Pixel mitigation. More Defense increases reduction with diminishing returns relative to the target’s maximum health.',
        status: 'source-verified'
      },
      {
        key: 'max_health',
        name: 'Max Health',
        family: 'Defensive equipment',
        role: 'Health + mitigation curve',
        meaning: 'Raises the player’s health pool and also participates in the mitigation curve, preventing Defense from behaving like an isolated linear percentage.',
        status: 'source-verified'
      },
      {
        key: 'knockback_resistance',
        name: 'Knockback Resistance',
        family: 'Defensive equipment',
        role: 'Movement resistance',
        meaning: 'Reduces displacement from knockback and can be supported by specialized defensive effects such as Anchor.',
        status: 'source-verified'
      }
    ],
    mitigation: {
      formula: 'reduction = min(0.80, defense / (defense + max_health × 0.0216))',
      cap: '80%',
      softness: '0.0216',
      principle: 'Defense and Max Health form one survivability curve. Increasing either stat changes effective survivability, but Defense cannot exceed the global mitigation ceiling.'
    },
    equipmentFamilies: [
      {
        name: 'Sword',
        category: 'Melee',
        primary: ['attack_damage', 'attack_speed'],
        documentation: 'source-verified',
        note: 'Reference melee family. Damage-per-hit and cadence must be read together.'
      },
      {
        name: 'Axe',
        category: 'Melee',
        primary: ['attack_damage', 'attack_speed'],
        documentation: 'source-verified',
        note: 'High-hit / slower-cadence identity. Sustained DPS, not isolated hit size, is the comparison model.'
      },
      {
        name: 'Spear',
        category: 'Melee',
        primary: ['attack_damage', 'attack_speed'],
        documentation: 'source-verified',
        note: 'A separate melee family whose identity is extended by its own enchant mechanics.'
      },
      {
        name: 'Bow',
        category: 'Ranged',
        primary: ['projectile_damage'],
        documentation: 'source-verified',
        note: 'Uses the ranged progression-damage model and a dedicated enchant pool.'
      },
      {
        name: 'Armor',
        category: 'Defense',
        primary: ['defense', 'max_health', 'knockback_resistance'],
        documentation: 'source-verified',
        note: 'Survivability comes from the interaction of health, mitigation and specialized defensive effects.'
      },
      {
        name: 'Shield',
        category: 'Offhand / defense',
        primary: ['defense', 'knockback_resistance'],
        documentation: 'source-verified',
        note: 'Shield behavior includes the equipped offhand and avoids double-counting the same enchantment across held items.'
      },
      {
        name: 'Elytra',
        category: 'Equipment',
        primary: ['defense'],
        documentation: 'partial-reference',
        note: 'Elytra has its own equipment identity. This page documents only the core stat semantics supported by current evidence.'
      },
      {
        name: 'Wands',
        category: 'Ability equipment',
        primary: [],
        documentation: 'separate-audit-required',
        note: 'Wand abilities are not flattened into the melee/ranged stat model and need their own dedicated reference.'
      },
      {
        name: 'Mining tools',
        category: 'Mining',
        primary: [],
        documentation: 'separate-audit-required',
        note: 'Mining-specific stats remain outside this guide until their dedicated reference is ready.'
      }
    ],
    layeredMechanics: [
      {
        name: 'Penetration',
        owner: 'Enchantments',
        relation: 'Changes how a qualifying hit interacts with mitigation. It is a combat mechanic rather than another stored base equipment stat.'
      },
      {
        name: 'Lifesteal',
        owner: 'Enchantments / Talismans',
        relation: 'Heals from qualifying damage under the rules of the effect that grants it. It is not interchangeable with Max Health or Defense.'
      },
      {
        name: 'Boss-conditional damage',
        owner: 'Enchantments / Talismans',
        relation: 'Applies only in its intended target context. The condition is part of the mechanic, not a universal Attack Damage increase.'
      },
      {
        name: 'Area damage',
        owner: 'Enchantments',
        relation: 'A bounded secondary-target mechanic such as Pulse; it does not redefine the base Attack Damage stat.'
      }
    ],
    excludedCoverage: [
      {
        name: 'Mining-specific stats',
        reason: 'Mining has its own stat surface and remains outside this combat/equipment reference until that dedicated coverage is ready.'
      },
      {
        name: 'Candidate stats',
        reason: 'A stat name is not published as current merely because it exists in an older list or definition; current gameplay evidence must support it.'
      },
      {
        name: 'Historical planning values',
        reason: 'Older planning material can help identify topics to revisit, but it does not override the current documented stat model.'
      }
    ]
  };

  window.PIXEL_GUIDE_STATS_EQUIPMENT = Object.freeze(data);
})();
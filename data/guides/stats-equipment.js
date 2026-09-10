(() => {
  const data = {
    verification: {
      level: 'source-verified',
      verifiedAsOf: '2026-09-07',
      liveClient: 'not-asserted',
      scope: 'core combat and equipment semantics',
      exclusions: ['mining-specific PixelStats', 'unverified registry-only stats']
    },
    coreStats: [
      {
        key: 'attack_damage',
        name: 'Attack Damage',
        family: 'Melee weapons',
        backing: 'Weapon attribute / combat pipeline',
        meaning: 'The declared damage basis for a progression melee weapon before later combat modifiers and target mitigation.',
        status: 'source-verified'
      },
      {
        key: 'attack_speed',
        name: 'Attack Speed',
        family: 'Melee weapons',
        backing: 'Weapon attribute',
        meaning: 'Controls weapon attack cadence and therefore matters together with damage-per-hit when comparing sustained melee output.',
        status: 'source-verified'
      },
      {
        key: 'projectile_damage',
        name: 'Projectile Damage',
        family: 'Bows',
        backing: 'Progression projectile pipeline',
        meaning: 'The progression damage basis carried by an eligible bow shot before the target-side mitigation step.',
        status: 'source-verified'
      },
      {
        key: 'defense',
        name: 'Defense',
        family: 'Defensive equipment',
        backing: 'Mitigation pipeline',
        meaning: 'The armour input used by Pixel mitigation. More Defense increases reduction with diminishing returns relative to the target’s maximum health.',
        status: 'source-verified'
      },
      {
        key: 'max_health',
        name: 'Max Health',
        family: 'Defensive equipment',
        backing: 'Player health attribute',
        meaning: 'Raises the player’s health pool and also participates in the mitigation curve, preventing Defense from behaving like an isolated linear percentage.',
        status: 'source-verified'
      },
      {
        key: 'knockback_resistance',
        name: 'Knockback Resistance',
        family: 'Defensive equipment',
        backing: 'Vanilla attribute',
        meaning: 'Reduces displacement from knockback. It is a real passive attribute path and can be contributed by specialized defensive effects such as Anchor.',
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
        note: 'Separate melee family whose identity is extended by its own enchant mechanics rather than a fabricated stat namespace.'
      },
      {
        name: 'Bow',
        category: 'Ranged',
        primary: ['projectile_damage'],
        documentation: 'source-verified',
        note: 'Uses the progression projectile damage path and a dedicated ranged enchant pool.'
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
        note: 'Offhand resolution is intentional; shield enchant identity is read from the actual offhand and duplicate enchant IDs are guarded.'
      },
      {
        name: 'Elytra',
        category: 'Equipment',
        primary: ['defense'],
        documentation: 'partial-reference',
        note: 'The equipment family exists with its own enchant pool. This guide only documents the core stat semantics supported by current evidence.'
      },
      {
        name: 'Wands',
        category: 'Ability equipment',
        primary: [],
        documentation: 'separate-audit-required',
        note: 'Wand behavior is not flattened into the melee/ranged stat model. A dedicated Wand reference should own ability-specific semantics.'
      },
      {
        name: 'Mining tools',
        category: 'Mining',
        primary: [],
        documentation: 'separate-audit-required',
        note: 'Mining-specific PixelStats are intentionally excluded until their producer-to-consumer coverage is audited as its own system.'
      }
    ],
    layeredMechanics: [
      {
        name: 'Penetration',
        owner: 'Enchant / combat snapshot',
        relation: 'Modifies how a hit interacts with mitigation. It is documented as combat behavior rather than pretending every modifier is a stored base equipment stat.'
      },
      {
        name: 'Lifesteal',
        owner: 'Enchant / Talisman effect',
        relation: 'Heals from qualifying damage under the owning system’s rules. It is not interchangeable with Max Health or Defense.'
      },
      {
        name: 'Boss-conditional damage',
        owner: 'Enchant / Talisman effect',
        relation: 'Applies only in its intended target context. The condition is part of the mechanic, not a universal Attack Damage increase.'
      },
      {
        name: 'Area damage',
        owner: 'Enchant effect',
        relation: 'A bounded secondary-target mechanic such as Pulse; it does not redefine the base Attack Damage stat.'
      }
    ],
    excludedRegistryExamples: [
      {
        name: 'oxygen_bonus',
        reason: 'A previous registry/consumer audit found a backing-versus-consumer contradiction. It stays out of the public current-stat table until that path is re-verified.'
      },
      {
        name: 'step_height',
        reason: 'A previous registry/consumer audit found a backing-versus-consumer contradiction. It stays out of the public current-stat table until that path is re-verified.'
      },
      {
        name: 'Mining-specific stats',
        reason: 'Current continuity explicitly reserves these for a dedicated producer-to-consumer audit rather than assuming the registry alone proves gameplay behavior.'
      }
    ]
  };

  window.PIXEL_GUIDE_STATS_EQUIPMENT = Object.freeze(data);
})();

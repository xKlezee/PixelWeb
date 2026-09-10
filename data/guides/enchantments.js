(() => {
  const data = {
    verification: {
      level: 'source-verified',
      verifiedAsOf: '2026-09-07',
      liveClient: 'not-asserted',
      scope: 'family compatibility, effect semantics and retired identities',
      note: 'Current mechanics are documented from verified source behavior. Live-client presentation is not claimed where it has not been observed directly.'
    },
    limits: {
      maxPerItem: 4
    },
    principles: [
      {
        name: 'Family-specific pools',
        description: 'An item receives enchantments from the pool defined for its equipment family rather than one unrestricted global list.'
      },
      {
        name: 'Stable enchant identity',
        description: 'Enchant identities remain stable over time. Retired identities are not silently reused for unrelated mechanics.'
      },
      {
        name: 'One damage model',
        description: 'Enchant effects participate in the same combat model so damage modifiers, mitigation and final damage remain consistent.'
      },
      {
        name: 'Specialized mechanics stay specialized',
        description: 'Defensive, penetration, execution and area effects keep their intended behavior instead of being reduced to generic bonus damage.'
      }
    ],
    families: [
      {
        id: 'sword',
        name: 'Sword',
        type: 'Melee',
        identity: 'PRECISION',
        shared: ['PIERCE', 'IGNITE', 'OVERLOAD', 'FRACTURE'],
        note: 'Balanced around the standard melee baseline.'
      },
      {
        id: 'axe',
        name: 'Axe',
        type: 'Melee',
        identity: 'PHASE_STRIKE',
        shared: ['PIERCE', 'IGNITE', 'OVERLOAD', 'FRACTURE'],
        note: 'Higher damage per hit with slower attack speed; sustained damage is the balance reference.'
      },
      {
        id: 'spear',
        name: 'Spear',
        type: 'Melee',
        identity: 'EXECUTION',
        shared: ['PIERCE', 'IGNITE', 'OVERLOAD', 'FRACTURE'],
        note: 'A distinct melee family. EXECUTION is its characteristic conditional mechanic and does not apply to bosses.'
      },
      {
        id: 'bow',
        name: 'Bow',
        type: 'Ranged',
        identity: 'Own pool',
        shared: [],
        note: 'Ranged enchantments remain in a dedicated Bow pool rather than inheriting melee rules.'
      },
      {
        id: 'elytra',
        name: 'Elytra',
        type: 'Utility / mobility',
        identity: 'Own pool',
        shared: [],
        note: 'Elytra keeps a dedicated enchantment pool.'
      },
      {
        id: 'shield',
        name: 'Shield',
        type: 'Offhand / defense',
        identity: 'Offhand resolved',
        shared: [],
        note: 'Shield enchantments are read from the equipped offhand without double-counting the same enchantment across held items.'
      }
    ],
    specialized: [
      {
        name: 'LIFESTEAL',
        kind: 'Defensive sustain',
        behavior: 'Heals from actual final damage dealt, scales by enchant level, caps at 20% of dealt damage and never exceeds the player’s maximum health.',
        status: 'current'
      },
      {
        name: 'EXECUTION',
        kind: 'Conditional offense',
        behavior: 'A low-probability Spear-exclusive execution mechanic. Bosses are excluded.',
        status: 'current'
      },
      {
        name: 'FRACTURE / SPLINTER',
        kind: 'Boss conditional',
        behavior: 'Their special conditional effect is restricted to boss targets.',
        status: 'current'
      },
      {
        name: 'PHASE_STRIKE / WRAITH',
        kind: 'Penetration',
        behavior: 'Uses penetration semantics for the qualifying hit rather than becoming generic bonus damage.',
        status: 'current'
      },
      {
        name: 'PULSE',
        kind: 'Area effect',
        behavior: 'Uses a bounded area effect in which secondary targets are evaluated independently. Exact feel and balance parameters are intentionally omitted from this guide.',
        status: 'current'
      },
      {
        name: 'GUARD / RESILIENCE / ANCHOR / SECOND_WIND',
        kind: 'Defense',
        behavior: 'Use dedicated defensive behavior rather than falling through to generic offensive damage.',
        status: 'current'
      }
    ],
    conservativeDamage: [
      {
        name: 'PRECISION / TRUESHOT',
        behavior: 'Flat proc damage',
        clarification: 'No additional hidden mechanic is implied by the name.'
      },
      {
        name: 'IGNITE / EMBER',
        behavior: 'Flat proc damage',
        clarification: 'No fire damage-over-time effect is currently implied.'
      },
      {
        name: 'MOMENTUM',
        behavior: 'Flat proc damage',
        clarification: 'No movement-speed or momentum subsystem is implied.'
      },
      {
        name: 'FROSTBITE',
        behavior: 'Flat proc damage',
        clarification: 'No slow or freeze effect is currently implied.'
      },
      {
        name: 'DISRUPT',
        behavior: 'Flat proc damage',
        clarification: 'No crowd-control or interrupt effect is currently implied.'
      }
    ],
    retired: [
      {
        name: 'GRAVITY_WELL',
        status: 'retired',
        note: 'The mechanic is retired. Its identity is kept reserved instead of being reused for an unrelated effect.'
      },
      {
        name: 'REFLECTION',
        status: 'retired-offense',
        note: 'Retired as a generic offensive enchant source. Active reflection behavior belongs to ReflectWand rather than being recreated here.'
      },
      {
        name: 'THORNS / BURN_POWER',
        status: 'removed',
        note: 'Removed from the active enchant system and not part of the current catalogue.'
      }
    ]
  };

  window.PIXEL_GUIDE_ENCHANTMENTS = Object.freeze(data);
})();
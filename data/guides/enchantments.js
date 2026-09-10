(() => {
  const data = {
    verification: {
      level: 'source-verified',
      verifiedAsOf: '2026-09-07',
      completenessAudit: 'no source-backed unfinished functionality found',
      runtimeClaim: 'not asserted',
      note: 'Current source and regression coverage are verified. This guide does not convert source/test evidence into an unobserved live-client claim.'
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
        description: 'Enchant IDs and their stored positions remain stable. Retired IDs are not silently recycled for unrelated mechanics.'
      },
      {
        name: 'One damage pipeline',
        description: 'Enchant contributions feed the shared combat pipeline so permission, modifiers, mitigation and final application are not duplicated.'
      },
      {
        name: 'Specialized mechanics stay specialized',
        description: 'Defensive, penetration, execution and area effects use their intended behavior instead of falling back to generic bonus damage.'
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
        note: 'Shield enchantments are resolved from the offhand and duplicate IDs are guarded against.'
      }
    ],
    specialized: [
      {
        name: 'LIFESTEAL',
        kind: 'Defensive sustain',
        behavior: 'Heals from actual final damage dealt, scales by enchant level, caps at 20% of dealt damage and never exceeds the player’s maximum health.',
        status: 'implemented'
      },
      {
        name: 'EXECUTION',
        kind: 'Conditional offense',
        behavior: 'A low-probability Spear-exclusive execution mechanic. Bosses are excluded.',
        status: 'implemented'
      },
      {
        name: 'FRACTURE / SPLINTER',
        kind: 'Boss conditional',
        behavior: 'Their special conditional path is restricted to boss targets.',
        status: 'implemented'
      },
      {
        name: 'PHASE_STRIKE / WRAITH',
        kind: 'Penetration',
        behavior: 'Feeds real penetration semantics into the combat snapshot rather than becoming generic bonus damage.',
        status: 'implemented'
      },
      {
        name: 'PULSE',
        kind: 'Area effect',
        behavior: 'Uses a bounded area-of-effect path in which secondary targets are evaluated independently. Exact feel/balance parameters are intentionally omitted from this guide.',
        status: 'implemented'
      },
      {
        name: 'GUARD / RESILIENCE / ANCHOR / SECOND_WIND',
        kind: 'Defense',
        behavior: 'Use specialized defensive implementations and are not allowed to fall through to generic offensive damage.',
        status: 'implemented'
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
        note: 'The mechanic is retired. Its stable ID must not be repurposed for a new pull effect without a new design decision.'
      },
      {
        name: 'REFLECTION',
        status: 'retired-offense',
        note: 'Retired as a generic offensive enchant source. Active reflection behavior belongs to ReflectWand rather than being recreated here.'
      },
      {
        name: 'THORNS / BURN_POWER',
        status: 'removed',
        note: 'Removed from the active enchant system and should not be reintroduced merely to satisfy stale code or documentation.'
      }
    ]
  };

  window.PIXEL_GUIDE_ENCHANTMENTS = Object.freeze(data);
})();

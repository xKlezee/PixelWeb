(() => {
  const data = {
    verification: {
      level: 'server-verified',
      verifiedAsOf: '2026-08-25',
      clientPresentation: 'pending',
      note: 'Talisman mechanics and persistent collection behavior are server-verified. Final visual, audio and interaction feel still require a real-client pass.'
    },
    commands: {
      codex: '/codex',
      bag: '/bag'
    },
    stateFlow: [
      {
        id: 'unknown',
        name: 'Unknown',
        display: '???',
        description: 'The entry stays concealed until its discovery condition is satisfied.'
      },
      {
        id: 'discovered',
        name: 'Discovered',
        description: 'The entry is known, but its unlock or acquisition requirements are not complete yet.'
      },
      {
        id: 'unlocked',
        name: 'Unlocked',
        description: 'The entry’s requirements are complete and its intended acquisition path becomes available.'
      },
      {
        id: 'obtained',
        name: 'Obtained',
        description: 'The Talisman is recorded as owned in the Codex.'
      }
    ],
    categories: [
      {
        id: 'world-progression',
        name: 'World Progression',
        scope: '12 concepts · 36 tiers',
        description: 'Core progression talismans arranged around the current World route and tier structure.',
        disclosure: 'public'
      },
      {
        id: 'world-boss',
        name: 'World Boss',
        scope: '5 talismans',
        description: 'Talismans associated with World Boss progression and boss-clear acquisition.',
        disclosure: 'public'
      },
      {
        id: 'collection',
        name: 'Collection',
        scope: '1 track · 3 tiers',
        description: 'Collection milestones that advance from account-wide Talisman ownership.',
        disclosure: 'public'
      },
      {
        id: 'mob-hunt',
        name: 'Mob Hunt',
        scope: '1 current entry',
        description: 'A hunt-oriented category driven by combat progress.',
        disclosure: 'public'
      },
      {
        id: 'secret',
        name: 'Secret',
        scope: '4 concealed entries',
        description: 'Hidden content whose identity and requirements are deliberately protected until discovery.',
        disclosure: 'concealed'
      },
      {
        id: 'meta',
        name: 'Meta',
        scope: 'Advanced set interactions',
        description: 'Advanced combinations can modify eligible effects when the required equipped set qualifies.',
        disclosure: 'partial'
      }
    ],
    acquisitionPaths: [
      {
        name: 'In-world acquisition',
        description: 'When a Talisman is earned through its gameplay source, the Codex records that ownership instead of granting a duplicate reward.'
      },
      {
        name: 'Codex claim',
        description: 'Only Talismans intended to be claimed from the Codex can be obtained directly through that interface.'
      },
      {
        name: 'External progression source',
        description: 'Some entries can come from another progression system such as Battle Pass; the Codex records the resulting ownership.'
      },
      {
        name: 'Concealed acquisition',
        description: 'Secret content remains intentionally non-spoilery; this guide does not publish hidden requirement trees.'
      }
    ],
    bag: {
      slots: 7,
      description: 'The Talisman Bag defines the equipped set. Changes take effect when the Bag closes and active Talisman effects update from the equipped contents.'
    },
    rarity: {
      levels: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Divine'],
      note: 'The global progression-item rarity ladder is shared across Talisman content; individual categories may use only part of it.'
    },
    effectPipeline: [
      {
        id: 'base',
        name: 'Base effects',
        description: 'Effects contributed by equipped Talismans are established first.'
      },
      {
        id: 'affinity',
        name: 'World Affinity',
        description: 'Eligible effects tied to a Talisman’s home World receive the home-World bonus before later modifiers.',
        publicValue: '+3% home-world bonus'
      },
      {
        id: 'synergy',
        name: 'Synergy',
        description: 'Qualifying equipped combinations can contribute an additional effect. Synergy is world-neutral and is not itself boosted by World Affinity.'
      },
      {
        id: 'meta',
        name: 'Meta',
        description: 'Eligible effects are modified last. When more than one qualifying Meta modifier affects the same eligible effect, only the strongest value applies rather than stacking recursively.'
      }
    ],
    clientPending: [
      'Category and state presentation',
      'Discovery feedback timing and presentation',
      'Inventory interaction feel',
      'Equip / unequip audio perception',
      'Nexus Jewelry presentation in a real client'
    ]
  };

  window.PIXEL_GUIDE_TALISMANS = Object.freeze(data);
})();
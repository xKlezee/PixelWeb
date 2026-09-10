(() => {
  const data = {
    verification: {
      level: 'server-verified',
      verifiedAsOf: '2026-08-25',
      clientPresentation: 'pending',
      note: 'Mechanics and persistence are server-verified. Final visual, audio and interaction feel still require a real-client pass.'
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
        description: 'The requirement engine has accepted the entry and its configured acquisition path can proceed.'
      },
      {
        id: 'obtained',
        name: 'Obtained',
        description: 'Ownership is recorded and the Codex treats the item as acquired.'
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
        description: 'Talismans associated with World Boss progression and boss-clear acquisition logic.',
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
        description: 'A hunt-oriented category driven by tracked combat requirements.',
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
        scope: 'Configured set logic',
        description: 'Advanced combinations that modify eligible effects only when their required equipped set qualifies.',
        disclosure: 'partial'
      }
    ],
    acquisitionPaths: [
      {
        name: 'In-world acquisition',
        description: 'The Codex observes ownership earned through the relevant gameplay source instead of duplicating the reward.'
      },
      {
        name: 'Codex claim',
        description: 'Only entries explicitly configured as Codex-claimable can be granted from the Codex interface.'
      },
      {
        name: 'External progression source',
        description: 'Some entries can come from another system such as Battle Pass; the Codex records the result without becoming a second grant path.'
      },
      {
        name: 'Concealed acquisition',
        description: 'Secret content remains intentionally non-spoilery; this guide does not publish hidden requirement trees.'
      }
    ],
    bag: {
      slots: 7,
      guiRange: '10–16',
      jewelrySlots: '6–7',
      description: 'The Talisman Bag is the equipped-set surface. Changes are committed when the bag closes and the active effects are recalculated.'
    },
    rarity: {
      levels: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Divine'],
      note: 'The global progression-item rarity ladder is shared across Talisman content; individual categories may use only part of it.'
    },
    effectPipeline: [
      {
        id: 'base',
        name: 'Base effects',
        description: 'Effects contributed by the equipped talismans are collected first.'
      },
      {
        id: 'affinity',
        name: 'World Affinity',
        description: 'Eligible home-world effect buckets receive the configured home-world bonus before later modifiers.',
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
        description: 'Eligible effects are modified last. Competing Meta modifiers for the same effect use the strongest qualifying value rather than stacking recursively.'
      }
    ],
    clientPending: [
      'Final category-screen presentation and state colors',
      'Completion-glow appearance',
      'Discovery ActionBar timing and presentation',
      'Tab-completion feel for player-facing aliases',
      'Shift-click and drag interaction feel',
      'Equip / unequip audio perception',
      'Nexus Jewelry presentation in a real client'
    ]
  };

  window.PIXEL_GUIDE_TALISMANS = Object.freeze(data);
})();

(() => {
  const data = {
    meta: {
      brand: 'Pixel Network',
      edition: 'Java Edition',
      language: 'en',
      experimentalLanguages: ['es', 'fr', 'it', 'de']
    },
    server: {
      ip: 'pixelboxxx.minehut.gg'
    },
    development: {
      completion: 87,
      updatedLabel: 'September 2026',
      verified: true
    },
    progression: {
      maxLevel: 300,
      maxPrestige: 10,
      maxLegacy: 4,
      verified: true
    },
    content: {
      currentWorlds: 4,
      mines: 27,
      enchantments: 27,
      worldProgressionTalismans: 36,
      mineTalismans: 81,
      worldBossEncounters: 5,
      instanceEncounters: 3,
      instanceBosses: 4,
      instanceDifficulties: 3,
      verified: true
    },
    quests: {
      verified: true,
      currentSystems: ['BattlePass', 'Skyblock'],
      generalProgressionQuestline: false
    },
    worlds: [
      {
        id: 'overworld',
        name: 'Overworld',
        order: 1,
        role: 'Foundation',
        mines: 9,
        boss: 'Beholder',
        bossRole: 'Progression World Boss',
        unlock: 'Starting world',
        nextGate: 'Prestige I + defeat Beholder',
        verified: true
      },
      {
        id: 'pirate',
        name: 'Pirate Kingdom',
        order: 2,
        role: 'Expansion',
        mines: 6,
        boss: 'HollowKeeper',
        bossRole: 'Progression World Boss',
        optionalEncounter: 'Kraken',
        unlock: 'Prestige I + defeat Beholder',
        nextGate: 'Prestige II + defeat HollowKeeper',
        verified: true
      },
      {
        id: 'nether',
        name: 'Nether',
        order: 3,
        role: 'Pressure',
        mines: 6,
        boss: 'Eldric',
        bossRole: 'Progression World Boss',
        unlock: 'Prestige II + defeat HollowKeeper',
        nextGate: 'Prestige III + defeat Eldric',
        verified: true
      },
      {
        id: 'winter',
        name: 'Winter',
        order: 4,
        role: 'Late progression',
        mines: 6,
        boss: 'Viking',
        bossRole: 'World Boss',
        unlock: 'Prestige III + defeat Eldric',
        nextGate: 'Prestige IV Nexus access',
        verified: true
      }
    ],
    nexus: {
      unlock: 'Prestige IV',
      accessPersists: true,
      vikingRequired: false,
      accessModel: 'Permanent once unlocked',
      combatLayer: 'Instance progression',
      verified: true,
      instances: [
        {
          name: 'Raphael',
          format: 'Single-boss encounter',
          difficulties: [
            { name: 'Easy', unlock: 'Prestige IV' },
            { name: 'Medium', unlock: 'Prestige VII' },
            { name: 'Hard', unlock: 'Legacy I' }
          ]
        },
        {
          name: 'Azazel',
          format: 'Single-boss encounter',
          difficulties: [
            { name: 'Easy', unlock: 'Prestige IV' },
            { name: 'Medium', unlock: 'Prestige VII' },
            { name: 'Hard', unlock: 'Legacy I' }
          ]
        },
        {
          name: 'Abyss + Astral',
          format: 'Dual-boss encounter',
          difficulties: [
            { name: 'Easy', unlock: 'Prestige VII' },
            { name: 'Medium', unlock: 'Legacy I' },
            { name: 'Hard', unlock: 'Legacy II' }
          ]
        }
      ]
    },
    skyblock: {
      verified: true,
      features: [
        'Own island',
        'Island progression',
        'Invite friends',
        'Build together',
        'Visit other islands',
        'Improve the island',
        'Skyblock quests',
        'Personal storage',
        'Personal vaults'
      ]
    },
    store: {
      model: 'Lifetime support progression',
      ranks: ['VIP', 'MVP', 'Ultra', 'Pixel', 'Pixel+'],
      thresholdsVerified: false,
      thresholds: null
    },
    planned: [
      'Progressive raids',
      'Progressive dungeons',
      'The Crucible of Legends',
      'Additional worlds',
      'Further Nexus content'
    ]
  };

  window.PIXEL_NETWORK_PUBLIC = Object.freeze(data);
})();

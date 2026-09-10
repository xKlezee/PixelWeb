(() => {
  const planned = [
    'Progressive raids',
    'Progressive dungeons',
    'The Crucible of Legends',
    'Additional worlds',
    'Further Nexus content'
  ];

  const developmentStatus = {
    available: [
      '4-world progression structure',
      '27 mines across the current worlds',
      '300 levels, Prestige and Legacy progression',
      'Talisman Codex and mine talisman collections',
      '27 custom enchantments',
      'World Boss progression',
      'Nexus access and instance difficulty structure',
      'Skyblock island progression and Skyblock quests',
      'BattlePass progression with BattlePass quests'
    ],
    inDevelopment: [
      'Ongoing balance across existing progression',
      'Player-facing clarity and system polish',
      'Further content work around the current endgame structure',
      'Continued iteration as the network approaches the current completion target'
    ],
    planned
  };

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
      status: developmentStatus,
      verified: true
    },
    changelog: {
      landing: 'changelog.html',
      externalUrl: 'https://pixel-network-1.gitbook.io/home/changelog',
      latest: [],
      verified: true
    },
    community: {
      discordUrl: 'https://discord.gg/7KzWpezTNZ',
      forumLanding: 'forum.html',
      guidesLanding: 'guides.html',
      legacyDocumentationUrl: 'https://pixel-network-1.gitbook.io/home/documentation',
      forum: {
        mode: 'preview',
        persistent: false,
        accountSystemAvailable: false
      },
      testimonials: [],
      verified: true
    },
    progression: {
      maxLevel: 300,
      maxPrestige: 10,
      maxLegacy: 4,
      evidence: 'reconciled-reference',
      state: 'current',
      verified: false,
      verifiedScope: 'Public caps and access milestones are maintained here; reset, reward and persistence semantics remain intentionally unpublished until independently re-verified.'
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
        bossRole: 'Progression World Boss',
        unlock: 'Prestige III + defeat Eldric',
        nextGate: 'Prestige IV → Nexus',
        verified: true
      }
    ],
    nexus: {
      unlock: 'Prestige IV',
      unlockMilestone: 'Prestige IV',
      requiredBoss: null,
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
      evidence: 'source-verified',
      state: 'partial',
      verified: false,
      features: [
        'Own island',
        'Island progression',
        'Island persistence',
        'Island upgrades',
        'Island bank',
        'Skyblock quests'
      ],
      partialFeatures: [
        {
          name: 'Island team management',
          status: 'Partially implemented',
          detail: 'Invite, accept, deny, leave and kick foundations exist in source, but the player-facing command and menu wiring is not complete.'
        },
        {
          name: 'Member promotion',
          status: 'Coming soon',
          detail: 'The promotion surface exists as a placeholder and is not documented as an available player action.'
        }
      ]
    },
    store: {
      landing: 'store.html',
      url: 'https://pixelboxx.tebex.io/',
      model: 'Lifetime support progression',
      ranks: ['VIP', 'MVP', 'Ultra', 'Pixel', 'Pixel+'],
      purchaseCategories: ['Cosmetics', 'Keys', 'Decoration'],
      purchasesCountTowardSupport: true,
      rankUpgradesAutomatic: true,
      purchasesCanAccelerateProgression: true,
      progressionAvailableThroughPlay: true,
      thresholdsVerified: false,
      thresholds: null,
      verified: true
    },
    planned
  };

  window.PIXEL_NETWORK_PUBLIC = Object.freeze(data);
})();
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

  const worldMedia = {
    overworld: {
      theme: 'forest',
      scene: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252Fi2tm3Y1jcEiOxK2PaII4%252FImage_fx%2520%2817%29.png%3Falt%3Dmedia%26token%3D2b1dfa01-3645-4ea0-9608-57d90114ac12&width=768&dpr=2&quality=90',
      bossImage: 'assets/worlds/boss-beholder.svg',
      bossVisualStatus: 'original-placeholder',
      referenceLabel: 'Void Beholder archetype; exact server model not asserted'
    },
    pirate: {
      theme: 'ocean',
      scene: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FCCUBM7YeamDndDjhkrjD%252F01K55740KGP2VJ0ZF14MFM3WJP.png%3Falt%3Dmedia%26token%3Da2859a65-78ca-4f37-ba39-d48464f6e726&width=768&dpr=2&quality=90',
      bossImage: 'assets/worlds/boss-hollowkeeper.svg',
      optionalBossImage: 'assets/worlds/boss-kraken.svg',
      bossVisualStatus: 'original-placeholder',
      referenceLabel: 'HollowKeeper exact marketplace model unconfirmed; Kraken archetype publicly matched'
    },
    nether: {
      theme: 'inferno',
      scene: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FTeslxzxtfv637Q0qUwd7%252FImage_fx%2520%287%29.png%3Falt%3Dmedia%26token%3D5ef48e3f-0c6b-4ee6-b257-3d8166ed6f57&width=768&dpr=2&quality=90',
      bossImage: 'assets/worlds/boss-eldric.svg',
      bossVisualStatus: 'original-placeholder',
      referenceLabel: 'Eldric exact marketplace model unconfirmed'
    },
    winter: {
      theme: 'frost',
      scene: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FyIhbKmsLNws7h50DFutx%252Fconsumables.png%3Falt%3Dmedia%26token%3D165c7aa4-9dba-4fdd-a79e-3753df117989&width=768&dpr=2&quality=90',
      bossImage: 'assets/worlds/boss-viking.svg',
      bossVisualStatus: 'original-placeholder',
      referenceLabel: 'Viking boss archetype; exact server model not asserted'
    }
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
      discordUrl: 'https://discord.gg/khRCRhR9d4',
      forumLanding: 'forum.html',
      documentationUrl: 'https://pixel-network-1.gitbook.io/home/documentation/',
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
        summary: 'The opening stage establishes mining, equipment, economy and combat before later access begins requiring both account progression and boss completion.',
        media: worldMedia.overworld,
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
        summary: 'The first world where a required progression boss and an optional thematic encounter coexist: HollowKeeper controls the route while Kraken adds non-gating content.',
        media: worldMedia.pirate,
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
        summary: 'The same account progression moves into a harsher combat stage, with Eldric serving as the final required boss clear before the current late-game world.',
        media: worldMedia.nether,
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
        summary: 'The final world in the current route. Viking remains its World Boss, but Nexus access deliberately uses Prestige IV rather than a Viking clear.',
        media: worldMedia.winter,
        verified: true
      }
    ],
    nexus: {
      unlock: 'Prestige IV',
      accessPersists: true,
      vikingRequired: false,
      accessModel: 'Permanent once unlocked',
      combatLayer: 'Instance progression',
      media: {
        teaserImage: 'assets/worlds/nexus-portal.svg',
        theme: 'nexus'
      },
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
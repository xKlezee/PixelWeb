(() => {
  window.PIXEL_GUIDE_SKYBLOCK = Object.freeze({
    evidence: {
      level: 'source-qualified',
      state: 'partial',
      summary: 'Island lifecycle, persistence and economy-backed progression have current source paths. Team-management controls remain explicitly partial and are not presented as available.'
    },
    foundations: [
      {
        name: 'Island lifecycle',
        label: 'Source-backed',
        detail: 'Skyblock has dedicated world lifecycle paths for creating, restoring and saving island worlds rather than treating islands as temporary frontend state.'
      },
      {
        name: 'Persistent island data',
        label: 'Source-backed',
        detail: 'The Skyblock data layer owns persistence for island, player and bank state through its own database path.'
      },
      {
        name: 'Economy-backed progression',
        label: 'Source-backed',
        detail: 'Island upgrades and island-bank operations use the active economy boundary, including explicit success and compensation paths.'
      },
      {
        name: 'Skyblock quests',
        label: 'Current public system',
        detail: 'Skyblock quests are maintained as a current quest surface and remain separate from the four-World progression route.'
      }
    ],
    publicationRules: [
      'A menu label is not treated as a working feature when its click or command route is missing.',
      'Substantial manager logic is not described as player-available until the manager is instantiated and reachable.',
      'Coming Soon actions remain visibly partial instead of being rewritten as launch-ready marketing.'
    ]
  });
})();
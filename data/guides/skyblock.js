(() => {
  window.PIXEL_GUIDE_SKYBLOCK = Object.freeze({
    evidence: {
      level: 'source-verified',
      state: 'partial',
      summary: 'Persistent island play, upgrades, banking and Skyblock quests have current source support. Collaboration remains explicitly partial and is not presented as generally available.'
    },
    foundations: [
      {
        name: 'Persistent island',
        label: 'Current foundation',
        detail: 'Your island is a persistent gameplay space that can be created, restored and saved rather than a temporary activity that disappears between sessions.'
      },
      {
        name: 'Saved island progress',
        label: 'Current foundation',
        detail: 'Island progress, player-specific island state and island-bank state are designed to persist as part of the Skyblock experience.'
      },
      {
        name: 'Upgrades & banking',
        label: 'Current foundation',
        detail: 'Island upgrades and the island bank connect Skyblock progression to Pixel’s economy instead of existing as disconnected menu counters.'
      },
      {
        name: 'Skyblock quests',
        label: 'Current public system',
        detail: 'Skyblock quests provide island-focused objectives and remain separate from the four-World progression route.'
      }
    ],
    publicationRules: [
      'Current means a capability belongs to the player-facing Skyblock experience, not simply that an idea or internal foundation exists.',
      'Partial means the area is real but the complete player flow is not yet available enough to advertise as a finished feature.',
      'Planned or Coming Soon behavior stays labelled that way until it reaches the same availability standard as the current feature set.'
    ]
  });
})();

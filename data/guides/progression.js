(() => {
  window.PIXEL_GUIDE_PROGRESSION = Object.freeze({
    evidence: {
      level: 'reconciled-reference',
      state: 'current',
      summary: 'Current public caps and access milestones are centralized in the network data model. Detailed reset, reward and persistence semantics remain unpublished until independently re-verified.'
    },
    layers: [
      {
        key: 'level',
        name: 'Levels',
        description: 'The baseline account-progression layer. Guides treats the configured cap as a current public reference without inventing the underlying XP curve or reset behavior.'
      },
      {
        key: 'prestige',
        name: 'Prestige',
        description: 'A long-term progression layer used by current World and Nexus access requirements. Its milestone role is documented where a real gate consumes it.'
      },
      {
        key: 'legacy',
        name: 'Legacy',
        description: 'The late account-progression layer used by the highest currently documented Nexus difficulty gates.'
      }
    ],
    publicationBoundary: [
      {
        title: 'Reset behavior',
        state: 'Unpublished',
        detail: 'This reference does not state what a Prestige or Legacy action resets, preserves or transforms until that lifecycle is independently re-verified.'
      },
      {
        title: 'XP and requirement curves',
        state: 'Unpublished',
        detail: 'The exact experience curve and per-tier requirements are not derived from visual mockups or legacy documentation.'
      },
      {
        title: 'Rewards and currencies',
        state: 'Unpublished',
        detail: 'No reward, currency grant or multiplier is attributed to Prestige or Legacy here without a current authoritative producer and consumer path.'
      }
    ]
  });
})();
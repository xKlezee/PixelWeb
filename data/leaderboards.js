(() => {
  'use strict';

  const data = {
    schemaVersion: 1,
    source: {
      state: 'pending',
      label: 'Server-backed ranking source not connected',
      generatedAt: null
    },
    categories: [
      {
        id: 'progression',
        label: 'Progression',
        description: 'Verified account progression standings.',
        entries: []
      },
      {
        id: 'combat',
        label: 'Combat',
        description: 'Verified competitive combat statistics.',
        entries: []
      },
      {
        id: 'islands',
        label: 'Islands',
        description: 'Verified Skyblock island progression standings.',
        entries: []
      }
    ]
  };

  window.PIXEL_LEADERBOARDS = Object.freeze(data);
})();

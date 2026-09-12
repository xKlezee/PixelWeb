(() => {
  'use strict';

  const data = {
    schemaVersion: 3,
    endpoint: 'data/leaderboards.json',
    source: {
      state: 'pending',
      authority: 'pending',
      label: 'Leaderboard tracking is not connected yet',
      generatedAt: null
    },
    categories: [
      {
        id: 'mining',
        label: 'Mining',
        short: 'MIN',
        description: 'Records built through mining and resource progression.',
        metrics: [
          { id: 'blocks-mined', label: 'Blocks Mined', kicker: 'Lifetime mining', description: 'Total blocks mined across the tracked Pixel Network progression loop.', unit: 'blocks', entries: [] }
        ]
      },
      {
        id: 'economy',
        label: 'Economy',
        short: 'ECO',
        description: 'Wealth and lifetime economy records.',
        metrics: [
          { id: 'money', label: 'Money', kicker: 'Current balance', description: 'Current Money balance held by each player.', unit: 'money', entries: [] },
          { id: 'money-earned', label: 'Money Earned', kicker: 'Lifetime economy', description: 'Lifetime Money generated through tracked gameplay activity.', unit: 'money', entries: [] },
          { id: 'nexus-points', label: 'Nexus Points', kicker: 'Endgame currency', description: 'Current Nexus Points balance earned through Nexus-facing progression.', unit: 'points', entries: [] }
        ]
      },
      {
        id: 'progression',
        label: 'Progression',
        short: 'PRO',
        description: 'Account milestones across the main Pixel journey.',
        metrics: [
          { id: 'level', label: 'Level', kicker: 'Account progression', description: 'Highest current account level within the main progression path.', unit: 'level', entries: [] },
          { id: 'prestige', label: 'Prestige', kicker: 'Account progression', description: 'Highest current Prestige reached by each account.', unit: 'prestige', entries: [] },
          { id: 'legacy', label: 'Legacy', kicker: 'Account progression', description: 'Highest current Legacy reached by each account.', unit: 'legacy', entries: [] },
          { id: 'quests-completed', label: 'Quests Completed', kicker: 'Journey completion', description: 'Total tracked quests completed across supported progression systems.', unit: 'quests', entries: [] }
        ]
      },
      {
        id: 'combat',
        label: 'Combat',
        short: 'CMB',
        description: 'Combat activity and total boss victories.',
        metrics: [
          { id: 'kills', label: 'Kills', kicker: 'Lifetime combat', description: 'Total tracked kills accumulated through combat.', unit: 'kills', entries: [] },
          { id: 'boss-kills', label: 'Boss Kills', kicker: 'Boss record', description: 'Combined tracked boss victories across Pixel Network.', unit: 'kills', entries: [] }
        ]
      },
      {
        id: 'skyblock',
        label: 'Skyblock',
        short: 'SKY',
        description: 'Island progression records.',
        metrics: [
          { id: 'island-level', label: 'Island Level', kicker: 'Island progression', description: 'Highest tracked Skyblock island level.', unit: 'level', entries: [] },
          { id: 'skyblock-quests', label: 'Skyblock Quests', kicker: 'Island objectives', description: 'Total tracked Skyblock quests completed.', unit: 'quests', entries: [] }
        ]
      },
      {
        id: 'nexus',
        label: 'Nexus',
        short: 'NXS',
        description: 'Endgame encounter and Instance records.',
        metrics: [
          { id: 'raphael-kills', label: 'Raphael Kills', kicker: 'Nexus encounter', description: 'Tracked victories against Raphael.', unit: 'kills', entries: [] },
          { id: 'azazel-kills', label: 'Azazel Kills', kicker: 'Nexus encounter', description: 'Tracked victories against Azazel.', unit: 'kills', entries: [] },
          { id: 'abyss-astral-kills', label: 'Abyss / Astral Kills', kicker: 'Nexus encounter', description: 'Tracked victories for the Abyss / Astral encounter.', unit: 'kills', entries: [] },
          { id: 'instance-clears', label: 'Instance Clears', kicker: 'Endgame completion', description: 'Total completed Nexus Instances.', unit: 'clears', entries: [] },
          { id: 'highest-difficulty', label: 'Highest Difficulty', kicker: 'Endgame mastery', description: 'Highest verified Instance difficulty cleared.', unit: 'difficulty', entries: [] },
          { id: 'fastest-clear', label: 'Fastest Clear', kicker: 'Endgame speed', description: 'Fastest verified comparable Instance clear time.', unit: 'time', entries: [] }
        ]
      },
      {
        id: 'collection',
        label: 'Collection',
        short: 'COL',
        description: 'Completion-focused records across persistent collections.',
        metrics: [
          { id: 'bestiary-completion', label: 'Bestiary Completion', kicker: 'Collection progress', description: 'Highest tracked Bestiary completion.', unit: 'completion', entries: [] },
          { id: 'talisman-codex', label: 'Talisman Codex', kicker: 'Collection progress', description: 'Highest tracked Talisman Codex completion.', unit: 'completion', entries: [] }
        ]
      }
    ]
  };

  window.PIXEL_LEADERBOARDS = Object.freeze(data);
})();

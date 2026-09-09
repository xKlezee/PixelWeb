(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const progression = network.progression || {};
  const content = network.content || {};
  const worlds = Array.isArray(network.worlds) ? network.worlds : [];
  const nexus = network.nexus || {};

  const spineHost = document.querySelector('[data-systems-spine]');
  const codexHost = document.querySelector('[data-systems-codex]');
  const enchantHost = document.querySelector('[data-systems-enchantments]');
  const miningHost = document.querySelector('[data-systems-mining]');
  const supportHost = document.querySelector('[data-systems-support]');

  const spine = [
    {
      code: '01',
      eyebrow: 'Account growth',
      value: String(progression.maxLevel ?? 300),
      title: 'Levels',
      copy: 'The permanent account curve builds toward the current level cap before Prestige becomes the larger access layer.'
    },
    {
      code: '02',
      eyebrow: 'Access layer',
      value: `${progression.maxPrestige ?? 10} tiers`,
      title: 'Prestige',
      copy: 'Prestige milestones combine with progression boss clears to open later worlds and the current endgame threshold.'
    },
    {
      code: '03',
      eyebrow: 'World route',
      value: String(content.currentWorlds ?? worlds.length ?? 4),
      title: 'World gates',
      copy: 'Overworld, Pirate Kingdom, Nether and Winter form one route. Each closes with its own progression boss.'
    },
    {
      code: '04',
      eyebrow: 'Endgame threshold',
      value: nexus.unlockMilestone || 'Prestige IV',
      title: 'Nexus',
      copy: `${nexus.requiredBoss || 'Viking'} completes the final world gate. Once cleared, Nexus access remains permanent.`
    },
    {
      code: '05',
      eyebrow: 'Late endgame',
      value: `${progression.maxLegacy ?? 4} tiers`,
      title: 'Legacy',
      copy: 'Legacy continues the account after Prestige and becomes part of the later Instance difficulty unlock structure.'
    }
  ];

  if (spineHost) {
    spineHost.innerHTML = spine.map(stage => `
      <article class="systems-spine-stage reveal">
        <div class="systems-spine-marker">${stage.code}</div>
        <div class="systems-spine-copy">
          <small>${stage.eyebrow}</small>
          <b>${stage.value}</b>
          <h3>${stage.title}</h3>
          <p>${stage.copy}</p>
        </div>
      </article>`).join('');
  }

  if (codexHost) {
    codexHost.innerHTML = `
      <span class="systems-feature-kicker">Talisman Codex</span>
      <h3>Collections with distinct jobs.</h3>
      <p>The World Progression Codex stays separate from mine and special-purpose talisman collections, so completion remains readable.</p>
      <div class="systems-codex-metrics">
        <div class="systems-codex-metric"><b>${content.worldProgressionTalismans ?? 36}</b><span>World progression</span><small>Defined Codex entries carried through the main world journey.</small></div>
        <div class="systems-codex-metric"><b>${content.mineTalismans ?? 81}</b><span>Mine talismans</span><small>A separate collection distributed through mine progression.</small></div>
        <div class="systems-codex-metric"><b>+</b><span>Special categories</span><small>Secret, World Boss, Mob Hunt and seasonal talismans expand independently.</small></div>
      </div>`;
  }

  if (enchantHost) {
    enchantHost.innerHTML = `
      <span class="systems-feature-kicker">Equipment decisions</span>
      <span class="systems-big-number">${content.enchantments ?? 27}</span>
      <h3>Custom enchantments</h3>
      <p>Combat, mining and equipment choices gain another layer without becoming a separate progression path.</p>
      <span class="systems-feature-note">${content.enchantments ?? 27} verified enchantments</span>`;
  }

  if (miningHost) {
    const maxMines = Math.max(1, ...worlds.map(world => Number(world.mines) || 0));
    miningHost.innerHTML = `
      <span class="systems-feature-kicker">Mining backbone</span>
      <div class="systems-mining-title"><span class="systems-big-number">${content.mines ?? 27}</span><div><h3>Mines follow the world route.</h3><p>Resources move with progression instead of living in a detached loop.</p></div></div>
      <div class="systems-mine-bars">${worlds.map(world => `
        <div class="systems-mine-world" data-world="${world.id}">
          <div><b>${world.mines}</b><span>${world.name}</span></div>
          <div class="systems-mine-track" aria-hidden="true"><i style="--share:${Math.round((Number(world.mines) / maxMines) * 100)}%"></i></div>
        </div>`).join('')}</div>`;
  }

  if (supportHost) {
    const supporting = [
      ['Equipment', 'Blacksmith & Forge', 'Equipment improvement and preparation feed the same account progression without becoming a separate route.'],
      ['Item history', 'StatTrack', 'Selected equipment can retain performance history, giving individual items context beyond their base statistics.'],
      ['Creature record', 'Bestiary', 'Repeated encounters contribute to a broader record of what the player has fought and progressed through.'],
      ['Social play', 'Parties', 'Players can organize around shared activity and encounters without turning the network into disconnected queues.'],
      ['Rewards', 'Crates & Keys', 'Reward containers sit beside the progression model rather than defining access to its core systems.']
    ];

    supportHost.innerHTML = supporting.map(([category, title, copy]) => `
      <article class="systems-support-row reveal">
        <small>${category}</small>
        <h3>${title}</h3>
        <p>${copy}</p>
      </article>`).join('');
  }
})();
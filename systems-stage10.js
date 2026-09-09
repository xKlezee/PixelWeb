(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const progression = network.progression || {};
  const content = network.content || {};
  const worlds = Array.isArray(network.worlds) ? network.worlds : [];
  const nexus = network.nexus || {};

  const heroMap = document.querySelector('[data-systems-hero-map]');
  const spineHost = document.querySelector('[data-systems-spine]');
  const codexHost = document.querySelector('[data-systems-codex]');
  const enchantHost = document.querySelector('[data-systems-enchantments]');
  const miningHost = document.querySelector('[data-systems-mining]');
  const supportHost = document.querySelector('[data-systems-support]');

  if (heroMap) {
    heroMap.innerHTML = `
      <div class="systems-hero-map-head">
        <small>Account architecture</small>
        <strong>Permanent progression connects worlds, collections and endgame.</strong>
      </div>
      <div class="systems-hero-orbit" aria-label="Pixel Network system relationship overview">
        <div class="systems-orbit-core">ACCOUNT</div>
        <div class="systems-orbit-node"><small>Progression</small><b>${progression.maxLevel ?? 300} levels</b></div>
        <div class="systems-orbit-node"><small>Collection</small><b>${content.worldProgressionTalismans ?? 36} Codex</b></div>
        <div class="systems-orbit-node"><small>World route</small><b>${content.currentWorlds ?? 4} worlds</b></div>
        <div class="systems-orbit-node"><small>Endgame</small><b>${content.instanceEncounters ?? 3} Instances</b></div>
      </div>`;
  }

  const spine = [
    {
      code: '01',
      eyebrow: 'Account growth',
      value: String(progression.maxLevel ?? 300),
      title: 'Levels',
      copy: 'The base account curve builds toward the current level cap before Prestige becomes the larger access layer.'
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
      copy: 'Overworld, Pirate Kingdom, Nether and Winter form one route. Each world closes with its own progression boss.',
      href: 'worlds.html',
      link: 'See exact gates →'
    },
    {
      code: '04',
      eyebrow: 'Endgame threshold',
      value: nexus.unlockMilestone || 'Prestige IV',
      title: 'Nexus',
      copy: `${nexus.requiredBoss || 'Viking'} completes the final world gate. Once the threshold is cleared, Nexus access remains permanent.`,
      href: 'nexus.html',
      link: 'See Instance ladder →'
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
          ${stage.href ? `<a href="${stage.href}">${stage.link}</a>` : ''}
        </div>
      </article>`).join('');
  }

  if (codexHost) {
    codexHost.innerHTML = `
      <span class="systems-feature-kicker">Talisman Codex / collection</span>
      <h3>Collections with distinct jobs.</h3>
      <p>The World Progression Codex is kept separate from mine and special-purpose talisman collections, so completion stays readable instead of collapsing every collectible into one inflated number.</p>
      <div class="systems-codex-metrics">
        <div class="systems-codex-metric"><b>${content.worldProgressionTalismans ?? 36}</b><span>World progression</span><small>The defined Codex carried through the main world journey.</small></div>
        <div class="systems-codex-metric"><b>${content.mineTalismans ?? 81}</b><span>Mine talismans</span><small>A separate collection body distributed through mine progression.</small></div>
        <div class="systems-codex-metric"><b>+</b><span>Special categories</span><small>Secret, World Boss, Mob Hunt and seasonal talismans expand independently.</small></div>
      </div>`;
  }

  if (enchantHost) {
    const count = Number(content.enchantments || 27);
    enchantHost.innerHTML = `
      <span class="systems-feature-kicker">Equipment decisions</span>
      <span class="systems-big-number">${count}</span>
      <h3>Custom enchantments</h3>
      <p>Enchantments extend combat, mining and equipment choices without becoming a separate progression path.</p>
      <div class="systems-enchant-index" aria-label="${count} custom enchantments">${Array.from({ length: count }, (_, index) => `<span>${String(index + 1).padStart(2, '0')}</span>`).join('')}</div>`;
  }

  if (miningHost) {
    const maxMines = Math.max(1, ...worlds.map(world => Number(world.mines) || 0));
    miningHost.innerHTML = `
      <div class="systems-mining-head">
        <div><span class="systems-feature-kicker">Mining backbone</span><h3>Resources move with the world route.</h3></div>
        <span class="systems-mining-total">${content.mines ?? 27} mines total</span>
      </div>
      <div class="systems-mine-bars">${worlds.map(world => `
        <div class="systems-mine-world" data-world="${world.id}">
          <b>${world.mines}</b><span>${world.name}</span>
          <div class="systems-mine-track" aria-hidden="true"><i style="--share:${Math.round((Number(world.mines) / maxMines) * 100)}%"></i></div>
        </div>`).join('')}</div>`;
  }

  if (supportHost) {
    const supporting = [
      ['Equipment', 'Blacksmith & Forge', 'Equipment improvement and preparation sit outside the immediate combat loop while still feeding the same account progression.'],
      ['Item history', 'StatTrack', 'Selected equipment can retain performance history, giving individual items context beyond their base statistics.'],
      ['Creature progression', 'Bestiary', 'Repeated encounters contribute to a broader record of what the player has fought and progressed through.'],
      ['Social play', 'Parties', 'Players can organize around shared activity and encounters without turning the network into disconnected queues.'],
      ['Rewards', 'Crates & Keys', 'Reward containers sit beside the progression model rather than defining access to its core systems.']
    ];
    supportHost.innerHTML = supporting.map(([category, title, copy]) => `
      <article class="systems-support-row reveal">
        <small>${category}</small><h3>${title}</h3><p>${copy}</p>
      </article>`).join('');
  }
})();

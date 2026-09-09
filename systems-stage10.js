(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const progression = network.progression || {};
  const content = network.content || {};

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
      copy: 'The permanent account curve establishes the base layer before Prestige becomes the larger long-term progression system.'
    },
    {
      code: '02',
      eyebrow: 'Long-term progression',
      value: `${progression.maxPrestige ?? 10} tiers`,
      title: 'Prestige',
      copy: 'Prestige extends the account beyond levels and becomes the main milestone layer before Legacy.'
    },
    {
      code: '03',
      eyebrow: 'Late progression',
      value: `${progression.maxLegacy ?? 4} tiers`,
      title: 'Legacy',
      copy: 'Legacy continues permanent account progression after Prestige and carries the account into the later endgame.'
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
      <p>The World Progression Codex stays separate from mine and special-purpose talisman collections, keeping completion readable.</p>
      <div class="systems-codex-metrics">
        <div class="systems-codex-metric"><b>${content.worldProgressionTalismans ?? 36}</b><span>World progression</span><small>The defined Codex collection.</small></div>
        <div class="systems-codex-metric"><b>${content.mineTalismans ?? 81}</b><span>Mine talismans</span><small>A separate collection tied to mine progression.</small></div>
        <div class="systems-codex-metric"><b>+</b><span>Special categories</span><small>Secret, World Boss, Mob Hunt and seasonal collections expand independently.</small></div>
      </div>`;
  }

  if (enchantHost) {
    enchantHost.innerHTML = `
      <span class="systems-feature-kicker">Equipment decisions</span>
      <span class="systems-big-number">${content.enchantments ?? 27}</span>
      <h3>Enchantments</h3>
      <p>Custom enchantments add another decision layer to combat, mining and equipment without becoming a separate progression path.</p>`;
  }

  if (miningHost) {
    miningHost.innerHTML = `
      <span class="systems-feature-kicker">Mining backbone</span>
      <h3>Mining follows progression.</h3>
      <p>Resources and mine progression move with the world structure instead of living in a detached loop.</p>`;
  }

  if (supportHost) {
    const supporting = [
      ['Equipment', 'Blacksmith & Forge', 'Equipment improvement and preparation support the main account without creating a separate progression route.'],
      ['Item history', 'StatTrack', 'Selected equipment can retain performance history, giving individual items context beyond their base statistics.'],
      ['Creature record', 'Bestiary', 'Repeated encounters contribute to a broader record of what the player has fought.'],
      ['Social play', 'Parties', 'Players can organize around shared activity and encounters without turning the network into disconnected queues.'],
      ['Rewards', 'Crates & Keys', 'Reward containers sit beside progression rather than defining access to its core systems.']
    ];

    supportHost.innerHTML = supporting.map(([category, title, copy]) => `
      <article class="systems-support-row reveal">
        <small>${category}</small>
        <h3>${title}</h3>
        <p>${copy}</p>
      </article>`).join('');
  }
})();
(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const progression = network.progression || {};
  const content = network.content || {};

  const spineHost = document.querySelector('[data-systems-spine]');
  const codexHost = document.querySelector('[data-systems-codex]');
  const enchantHost = document.querySelector('[data-systems-enchantments]');
  const miningHost = document.querySelector('[data-systems-mining]');
  const supportHost = document.querySelector('[data-systems-support]');

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const displayCap = (value, suffix = '') => value == null ? '—' : `${value}${suffix}`;

  const spine = [
    {
      code: '01',
      eyebrow: 'Account growth',
      value: displayCap(progression.maxLevel),
      title: 'Levels',
      copy: 'Levels are the baseline account-progression layer. Exact lifecycle semantics live in the detailed reference only when independently verified.'
    },
    {
      code: '02',
      eyebrow: 'Long-term progression',
      value: displayCap(progression.maxPrestige, ' tiers'),
      title: 'Prestige',
      copy: 'Prestige is a real milestone axis used by the current World and Nexus access model; this overview does not invent reset or reward behavior.'
    },
    {
      code: '03',
      eyebrow: 'Late progression',
      value: displayCap(progression.maxLegacy, ' tiers'),
      title: 'Legacy',
      copy: 'Legacy is the late account-progression layer used by the highest currently documented Nexus difficulty milestones.'
    }
  ];

  if (spineHost) {
    const stages = spine.map(stage => {
      const article = el('article', 'systems-spine-stage reveal');
      article.appendChild(el('div', 'systems-spine-marker', stage.code));
      const copy = el('div', 'systems-spine-copy');
      copy.append(
        el('small', '', stage.eyebrow),
        el('b', '', stage.value),
        el('h3', '', stage.title),
        el('p', '', stage.copy)
      );
      article.appendChild(copy);
      return article;
    });
    spineHost.replaceChildren(...stages);
  }

  if (codexHost) {
    const metrics = el('div', 'systems-codex-metrics');
    [
      [content.worldProgressionTalismans ?? '—', 'World progression', 'The defined Codex collection.'],
      [content.mineTalismans ?? '—', 'Mine talismans', 'A separate collection tied to mine progression.'],
      ['+', 'Special categories', 'Secret, World Boss, Mob Hunt and seasonal collections expand independently.']
    ].forEach(([value, label, note]) => {
      const metric = el('div', 'systems-codex-metric');
      metric.append(el('b', '', value), el('span', '', label), el('small', '', note));
      metrics.appendChild(metric);
    });

    codexHost.replaceChildren(
      el('span', 'systems-feature-kicker', 'Talisman Codex'),
      el('h3', '', 'Collections with distinct jobs.'),
      el('p', '', 'The World Progression Codex stays separate from mine and special-purpose talisman collections, keeping completion readable.'),
      metrics
    );
  }

  if (enchantHost) {
    enchantHost.replaceChildren(
      el('span', 'systems-feature-kicker', 'Equipment decisions'),
      el('span', 'systems-big-number', content.enchantments ?? '—'),
      el('h3', '', 'Enchantments'),
      el('p', '', 'Custom enchantments add another decision layer to combat, mining and equipment without becoming a separate progression path.')
    );
  }

  if (miningHost) {
    miningHost.replaceChildren(
      el('span', 'systems-feature-kicker', 'Mining backbone'),
      el('h3', '', 'Mining follows progression.'),
      el('p', '', 'Resources and mine progression move with the world structure instead of living in a detached loop.')
    );
  }

  if (supportHost) {
    const supporting = [
      ['Equipment', 'Blacksmith & Forge', 'Equipment improvement and preparation support the main account without creating a separate progression route.'],
      ['Item history', 'StatTrack', 'Selected equipment can retain performance history, giving individual items context beyond their base statistics.'],
      ['Creature record', 'Bestiary', 'Repeated encounters contribute to a broader record of what the player has fought.'],
      ['Social play', 'Parties', 'Players can organize around shared activity and encounters without turning the network into disconnected queues.'],
      ['Rewards', 'Crates & Keys', 'Reward containers sit beside progression rather than defining access to its core systems.']
    ];

    supportHost.replaceChildren(...supporting.map(([category, title, copy]) => {
      const article = el('article', 'systems-support-row reveal');
      article.append(el('small', '', category), el('h3', '', title), el('p', '', copy));
      return article;
    }));
  }
})();
(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const guide = window.PIXEL_GUIDE_PROGRESSION || {};
  const progression = network.progression || {};
  const worlds = Array.isArray(network.worlds) ? network.worlds : [];
  const nexus = network.nexus || {};

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const facts = document.querySelector('[data-progression-summary]');
  if (facts) {
    const entries = [
      ['Level cap', progression.maxLevel ?? '—'],
      ['Prestige tiers', progression.maxPrestige ?? '—'],
      ['Legacy tiers', progression.maxLegacy ?? '—'],
      ['Evidence', 'Reconciled reference']
    ];
    facts.replaceChildren(...entries.map(([label, value]) => {
      const item = el('div', 'guide-fact');
      item.append(el('span', '', label), el('strong', '', value));
      return item;
    }));
  }

  const layerValues = {
    level: progression.maxLevel != null ? `1–${progression.maxLevel}` : 'Current cap',
    prestige: progression.maxPrestige != null ? `I–${progression.maxPrestige}` : 'Current tiers',
    legacy: progression.maxLegacy != null ? `I–${progression.maxLegacy}` : 'Current tiers'
  };

  const rail = document.querySelector('[data-progression-layers]');
  if (rail && Array.isArray(guide.layers)) {
    rail.replaceChildren(...guide.layers.map((layer, index) => {
      const article = el('article', 'progression-layer');
      article.append(
        el('span', 'progression-layer-index', String(index + 1).padStart(2, '0')),
        el('small', '', layerValues[layer.key] || 'Progression layer'),
        el('h3', '', layer.name || 'Layer'),
        el('p', '', layer.description || '')
      );
      return article;
    }));
  }

  const gatesBody = document.querySelector('[data-progression-gates]');
  if (gatesBody) {
    const rows = worlds.map(world => {
      const tr = document.createElement('tr');
      tr.append(
        el('td', '', `World ${world.order ?? '—'}`),
        el('td', '', world.name || '—'),
        el('td', '', world.unlock || '—'),
        el('td', '', world.boss || '—')
      );
      return tr;
    });

    const nexusRow = document.createElement('tr');
    nexusRow.className = 'is-nexus-row';
    nexusRow.append(
      el('td', '', 'Endgame'),
      el('td', '', 'Nexus'),
      el('td', '', nexus.unlockMilestone || nexus.unlock || '—'),
      el('td', '', nexus.vikingRequired === false ? 'Viking not required for access' : 'See Nexus reference')
    );
    rows.push(nexusRow);
    gatesBody.replaceChildren(...rows);
  }

  const milestones = document.querySelector('[data-progression-nexus-milestones]');
  if (milestones && Array.isArray(nexus.instances)) {
    const cards = nexus.instances.map(instance => {
      const article = el('article', 'progression-milestone-card');
      article.append(el('small', '', instance.format || 'Instance'), el('h3', '', instance.name || 'Encounter'));
      const list = el('div', 'progression-milestone-list');
      (instance.difficulties || []).forEach(difficulty => {
        const row = el('div', 'progression-milestone-row');
        row.append(el('span', '', difficulty.name || 'Difficulty'), el('strong', '', difficulty.unlock || '—'));
        list.appendChild(row);
      });
      article.appendChild(list);
      return article;
    });
    milestones.replaceChildren(...cards);
  }

  const boundary = document.querySelector('[data-progression-boundary]');
  if (boundary && Array.isArray(guide.publicationBoundary)) {
    boundary.replaceChildren(...guide.publicationBoundary.map(item => {
      const article = el('article', 'progression-boundary-card');
      article.append(el('small', '', item.state || 'Unpublished'), el('h3', '', item.title || 'Boundary'), el('p', '', item.detail || ''));
      return article;
    }));
  }

  const access = document.querySelector('[data-progression-access-model]');
  if (access) access.textContent = nexus.accessModel || 'See Nexus guide';
})();
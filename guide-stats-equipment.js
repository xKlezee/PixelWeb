(() => {
  const guide = window.PIXEL_GUIDE_STATS_EQUIPMENT || {};

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const appendFacts = (host, facts) => {
    if (!host) return;
    host.replaceChildren(...facts.map(([label, value]) => {
      const item = el('div', 'guide-fact');
      item.append(el('span', '', label), el('strong', '', value ?? '—'));
      return item;
    }));
  };

  appendFacts(document.querySelector('[data-guide-stats-summary]'), [
    ['Core documented stats', Array.isArray(guide.coreStats) ? guide.coreStats.length : '—'],
    ['Mitigation cap', guide.mitigation?.cap ?? '—'],
    ['Evidence', 'Source verified'],
    ['Mining stats', 'Separate audit']
  ]);

  const statsBody = document.querySelector('[data-guide-core-stats]');
  if (statsBody && Array.isArray(guide.coreStats)) {
    statsBody.replaceChildren(...guide.coreStats.map(stat => {
      const tr = document.createElement('tr');
      const identity = el('td');
      identity.append(el('strong', 'guide-table-title', stat.name || '—'), el('code', 'stats-key', stat.key || ''));
      const family = el('td', '', stat.family || '—');
      const backing = el('td', '', stat.backing || '—');
      const meaning = el('td', '', stat.meaning || '');
      tr.append(identity, family, backing, meaning);
      return tr;
    }));
  }

  const mitigationFormula = document.querySelector('[data-guide-mitigation-formula]');
  if (mitigationFormula) mitigationFormula.textContent = guide.mitigation?.formula || '—';
  const mitigationPrinciple = document.querySelector('[data-guide-mitigation-principle]');
  if (mitigationPrinciple) mitigationPrinciple.textContent = guide.mitigation?.principle || '';
  document.querySelectorAll('[data-guide-mitigation-cap]').forEach(node => {
    node.textContent = String(guide.mitigation?.cap ?? '—');
  });

  const familyHost = document.querySelector('[data-guide-equipment-families]');
  if (familyHost && Array.isArray(guide.equipmentFamilies)) {
    familyHost.replaceChildren(...guide.equipmentFamilies.map(family => {
      const article = el('article', 'stats-family-card');
      article.dataset.documentation = family.documentation || '';

      const head = el('div', 'stats-family-head');
      head.append(el('span', 'stats-family-category', family.category || 'Equipment'), el('span', 'stats-family-status', String(family.documentation || 'reference').replaceAll('-', ' ')));

      const chips = el('div', 'stats-family-chips');
      if (Array.isArray(family.primary) && family.primary.length) {
        family.primary.forEach(stat => chips.appendChild(el('code', '', stat)));
      } else {
        chips.appendChild(el('span', 'stats-family-empty', 'Dedicated semantics'));
      }

      article.append(head, el('h3', '', family.name || 'Equipment'), chips, el('p', '', family.note || ''));
      return article;
    }));
  }

  const layeredHost = document.querySelector('[data-guide-layered-mechanics]');
  if (layeredHost && Array.isArray(guide.layeredMechanics)) {
    layeredHost.replaceChildren(...guide.layeredMechanics.map(item => {
      const article = el('article', 'stats-layer-card');
      article.append(el('small', '', item.owner || 'System mechanic'), el('h3', '', item.name || 'Mechanic'), el('p', '', item.relation || ''));
      return article;
    }));
  }

  const excludedHost = document.querySelector('[data-guide-excluded-stats]');
  if (excludedHost && Array.isArray(guide.excludedRegistryExamples)) {
    excludedHost.replaceChildren(...guide.excludedRegistryExamples.map(item => {
      const article = el('article', 'stats-exclusion');
      article.append(el('code', '', item.name || 'stat'), el('p', '', item.reason || ''));
      return article;
    }));
  }

  const verificationHost = document.querySelector('[data-guide-stats-verification]');
  if (verificationHost) {
    const current = el('article', 'verification-card is-verified');
    current.append(el('small', '', 'Core semantics'), el('h3', '', 'Source verified'), el('p', '', 'The published core stat meanings are tied to current producer/consumer paths rather than a registry name alone.'));

    const deploy = el('article', 'verification-card is-pending');
    deploy.append(el('small', '', 'Recent combat fixes'), el('h3', '', 'Deployment-sensitive'), el('p', '', 'Recent source-ready combat corrections are not described as live until their deployment is independently established.'));

    const mining = el('article', 'verification-card is-pending');
    mining.append(el('small', '', 'Mining stats'), el('h3', '', 'Dedicated audit required'), el('p', '', 'Mining-specific stats remain outside this page until their complete producer-to-consumer coverage is re-verified.'));

    verificationHost.replaceChildren(current, deploy, mining);
  }
})();

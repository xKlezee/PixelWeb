(() => {
  const guide = window.PIXEL_GUIDE_TALISMANS || {};

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

  appendFacts(document.querySelector('[data-guide-talisman-summary]'), [
    ['Codex', guide.commands?.codex],
    ['Talisman Bag', guide.commands?.bag],
    ['Codex categories', Array.isArray(guide.categories) ? guide.categories.length : '—'],
    ['Equipped slots', guide.bag?.slots]
  ]);

  const stateHost = document.querySelector('[data-guide-talisman-states]');
  if (stateHost && Array.isArray(guide.stateFlow)) {
    const items = guide.stateFlow.map((state, index) => {
      const article = el('article', 'talisman-state');
      article.dataset.state = state.id || '';
      const marker = el('div', 'talisman-state-marker', String(index + 1).padStart(2, '0'));
      marker.setAttribute('aria-hidden', 'true');
      const copy = el('div', 'talisman-state-copy');
      const heading = el('h3', '', state.name || 'State');
      if (state.display) heading.appendChild(el('span', 'talisman-state-display', state.display));
      copy.append(heading, el('p', '', state.description || ''));
      article.append(marker, copy);
      return article;
    });
    stateHost.replaceChildren(...items);
  }

  const categoryBody = document.querySelector('[data-guide-talisman-categories]');
  if (categoryBody && Array.isArray(guide.categories)) {
    const rows = guide.categories.map(category => {
      const tr = document.createElement('tr');
      const name = el('td');
      name.appendChild(el('strong', 'guide-table-title', category.name || '—'));
      const scope = el('td', '', category.scope || '—');
      const purpose = el('td', '', category.description || '');
      const disclosure = el('td');
      disclosure.appendChild(el('span', `guide-disclosure is-${category.disclosure || 'public'}`, category.disclosure || 'public'));
      tr.append(name, scope, purpose, disclosure);
      return tr;
    });
    categoryBody.replaceChildren(...rows);
  }

  const acquisitionHost = document.querySelector('[data-guide-talisman-acquisition]');
  if (acquisitionHost && Array.isArray(guide.acquisitionPaths)) {
    const items = guide.acquisitionPaths.map((path, index) => {
      const article = el('article', 'guide-reference-item');
      article.append(
        el('small', '', `Path ${String(index + 1).padStart(2, '0')}`),
        el('h3', '', path.name || 'Acquisition'),
        el('p', '', path.description || '')
      );
      return article;
    });
    acquisitionHost.replaceChildren(...items);
  }

  const bagHost = document.querySelector('[data-guide-talisman-bag]');
  appendFacts(bagHost, [
    ['Equipped slots', guide.bag?.slots],
    ['Changes apply', 'When the Bag closes']
  ]);

  const rarityHost = document.querySelector('[data-guide-talisman-rarity]');
  if (rarityHost && Array.isArray(guide.rarity?.levels)) {
    rarityHost.replaceChildren(...guide.rarity.levels.map((rarity, index) => {
      const chip = el('span', 'talisman-rarity-chip', rarity);
      chip.dataset.rank = String(index + 1);
      return chip;
    }));
  }

  const pipelineHost = document.querySelector('[data-guide-talisman-pipeline]');
  if (pipelineHost && Array.isArray(guide.effectPipeline)) {
    const items = guide.effectPipeline.map((stage, index) => {
      const article = el('article', 'talisman-pipeline-stage');
      const head = el('div', 'talisman-pipeline-head');
      head.append(el('span', '', `0${index + 1}`), el('h3', '', stage.name || 'Effect stage'));
      article.append(head, el('p', '', stage.description || ''));
      if (stage.publicValue) article.appendChild(el('strong', 'talisman-pipeline-value', stage.publicValue));
      return article;
    });
    pipelineHost.replaceChildren(...items);
  }

  const verificationHost = document.querySelector('[data-guide-talisman-verification]');
  if (verificationHost) {
    const server = el('article', 'verification-card is-verified');
    server.append(
      el('small', '', 'Evidence'),
      el('h3', '', 'Server verified'),
      el('p', '', `Talisman mechanics and persistent collection behavior were server-verified on ${guide.verification?.verifiedAsOf || 'the recorded verification date'}.`)
    );

    const client = el('article', 'verification-card is-pending');
    client.append(
      el('small', '', 'Client presentation'),
      el('h3', '', 'Validation pending'),
      el('p', '', 'Visual, audio and interaction feel still require a real Minecraft client pass.')
    );

    verificationHost.replaceChildren(server, client);
  }

  const pendingHost = document.querySelector('[data-guide-talisman-pending]');
  if (pendingHost && Array.isArray(guide.clientPending)) {
    pendingHost.replaceChildren(...guide.clientPending.map(item => {
      const li = el('li');
      li.append(el('span', 'verification-dot'), el('span', '', item));
      return li;
    }));
  }
})();
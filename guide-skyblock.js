(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const guide = window.PIXEL_GUIDE_SKYBLOCK || {};
  const skyblock = network.skyblock || {};

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const summary = document.querySelector('[data-skyblock-summary]');
  if (summary) {
    const entries = [
      ['Reference state', 'Partial'],
      ['Evidence', 'Source verified'],
      ['Current capabilities', Array.isArray(skyblock.features) ? skyblock.features.length : '—'],
      ['Partial areas', Array.isArray(skyblock.partialFeatures) ? skyblock.partialFeatures.length : '—']
    ];
    summary.replaceChildren(...entries.map(([label, value]) => {
      const item = el('div', 'guide-fact');
      item.append(el('span', '', label), el('strong', '', value));
      return item;
    }));
  }

  const capabilities = document.querySelector('[data-skyblock-capabilities]');
  if (capabilities && Array.isArray(skyblock.features)) {
    capabilities.replaceChildren(...skyblock.features.map((feature, index) => {
      const article = el('article', 'skyblock-capability');
      article.append(el('span', 'skyblock-capability-index', String(index + 1).padStart(2, '0')), el('h3', '', feature));
      return article;
    }));
  }

  const foundations = document.querySelector('[data-skyblock-foundations]');
  if (foundations && Array.isArray(guide.foundations)) {
    foundations.replaceChildren(...guide.foundations.map(item => {
      const article = el('article', 'skyblock-foundation-card');
      article.append(el('small', '', item.label || 'Reference'), el('h3', '', item.name || 'Foundation'), el('p', '', item.detail || ''));
      return article;
    }));
  }

  const partial = document.querySelector('[data-skyblock-partial]');
  if (partial && Array.isArray(skyblock.partialFeatures)) {
    partial.replaceChildren(...skyblock.partialFeatures.map(item => {
      const article = el('article', 'skyblock-partial-card');
      article.append(el('small', '', item.status || 'Partial'), el('h3', '', item.name || 'Feature'), el('p', '', item.detail || ''));
      return article;
    }));
  }

  const rules = document.querySelector('[data-skyblock-publication-rules]');
  if (rules && Array.isArray(guide.publicationRules)) {
    rules.replaceChildren(...guide.publicationRules.map((rule, index) => {
      const row = el('div', 'skyblock-rule');
      row.append(el('span', '', String(index + 1).padStart(2, '0')), el('p', '', rule));
      return row;
    }));
  }
})();
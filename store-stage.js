(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const store = network.store || {};

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const rankHost = document.querySelector('[data-store-ranks]');
  const ranks = Array.isArray(store.ranks) ? store.ranks : [];
  if (rankHost) {
    rankHost.replaceChildren(...ranks.map(rank => {
      const step = el('div', 'flow-step');
      step.append(el('b', '', rank), el('span', '', 'Support milestone'));
      return step;
    }));
  }

  const categoryHost = document.querySelector('[data-store-categories]');
  const categories = Array.isArray(store.purchaseCategories) ? store.purchaseCategories : [];
  const descriptions = {
    Cosmetics: ['Visual identity.', 'Optional visual content can support the network while still contributing to lifetime support progression.'],
    Keys: ['Reward access.', 'Keys sit inside the wider reward economy rather than replacing the long-term progression structure.'],
    Decoration: ['Personal expression.', 'Decorative purchases provide another way to support Pixel without making the Store only about rank packages.']
  };

  if (categoryHost) {
    categoryHost.replaceChildren(...categories.map(category => {
      const [title, description] = descriptions[category] || ['Store content.', 'Available Store content contributes to the same cumulative support path.'];
      const article = el('article', 'detail-card reveal visible');
      article.append(el('small', '', category), el('h3', '', title), el('p', '', description));
      return article;
    }));
  }
})();
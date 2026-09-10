(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const worlds = Array.isArray(network.worlds) ? network.worlds : [];
  const summaryHost = document.querySelector('[data-guide-start-summary]');
  const routeHost = document.querySelector('[data-guide-start-route]');
  const skyblockHost = document.querySelector('[data-guide-start-skyblock]');
  const addressHosts = document.querySelectorAll('[data-guide-server-address]');

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  addressHosts.forEach(node => {
    node.textContent = String(network.server?.ip || '—');
  });

  if (summaryHost) {
    const facts = [
      ['Edition', network.meta?.edition ?? '—'],
      ['Server address', network.server?.ip ?? '—'],
      ['Current Worlds', network.content?.currentWorlds ?? worlds.length],
      ['Nexus access', network.nexus?.unlock ?? '—']
    ];
    summaryHost.replaceChildren(...facts.map(([label, value]) => {
      const item = el('div', 'guide-fact');
      item.append(el('span', '', label), el('strong', '', value));
      return item;
    }));
  }

  if (routeHost) {
    const stages = worlds.map(world => {
      const article = el('article', 'guide-world-stage');
      const head = el('div', 'guide-world-stage-head');
      head.append(el('span', '', `WORLD ${world.order}`), el('strong', '', world.name));
      const facts = el('dl', 'guide-definition-list');
      facts.append(
        el('dt', '', 'Role'), el('dd', '', world.role || '—'),
        el('dt', '', 'Access'), el('dd', '', world.unlock || '—'),
        el('dt', '', 'World Boss'), el('dd', '', world.boss || '—')
      );
      article.append(head, facts);
      return article;
    });

    const nexusArticle = el('article', 'guide-world-stage');
    const nexusHead = el('div', 'guide-world-stage-head');
    nexusHead.append(el('span', '', 'ENDGAME'), el('strong', '', 'Nexus'));
    const nexusFacts = el('dl', 'guide-definition-list');
    nexusFacts.append(
      el('dt', '', 'Access'), el('dd', '', network.nexus?.unlock || '—'),
      el('dt', '', 'Model'), el('dd', '', network.nexus?.accessModel || '—'),
      el('dt', '', 'Layer'), el('dd', '', network.nexus?.combatLayer || '—')
    );
    nexusArticle.append(nexusHead, nexusFacts);

    routeHost.replaceChildren(...stages, nexusArticle);
  }

  if (skyblockHost) {
    const features = Array.isArray(network.skyblock?.features) ? network.skyblock.features : [];
    skyblockHost.replaceChildren(...features.map(feature => {
      const item = el('span', 'guide-status is-live', feature);
      return item;
    }));
  }
})();

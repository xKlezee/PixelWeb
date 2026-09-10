(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const worlds = Array.isArray(network.worlds) ? network.worlds : [];
  const tableBody = document.querySelector('[data-guide-worlds-table]');
  const routeHost = document.querySelector('[data-guide-worlds-route]');
  const summaryHost = document.querySelector('[data-guide-worlds-summary]');
  const orderHosts = document.querySelectorAll('[data-guide-worlds-order]');

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const orderedNames = worlds
    .slice()
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map(world => world.name)
    .filter(Boolean)
    .join(' → ');
  orderHosts.forEach(node => { node.textContent = orderedNames || '—'; });

  if (summaryHost) {
    const values = [
      ['Current Worlds', network.content?.currentWorlds ?? worlds.length],
      ['Mines', network.content?.mines ?? '—'],
      ['World Boss encounters', network.content?.worldBossEncounters ?? '—'],
      ['Nexus threshold', network.nexus?.unlock ?? '—']
    ];

    const items = values.map(([label, value]) => {
      const item = el('div', 'guide-fact');
      item.append(el('span', '', label), el('strong', '', value));
      return item;
    });
    summaryHost.replaceChildren(...items);
  }

  if (tableBody) {
    const rows = worlds.map(world => {
      const tr = document.createElement('tr');
      const values = [world.order, world.name, world.mines, world.boss, world.unlock, world.nextGate];
      values.forEach(value => tr.appendChild(el('td', '', value ?? '—')));
      return tr;
    });
    tableBody.replaceChildren(...rows);
  }

  if (routeHost) {
    const cards = worlds.map(world => {
      const article = el('article', 'guide-world-stage');
      const head = el('div', 'guide-world-stage-head');
      head.append(el('span', '', `WORLD ${world.order}`), el('strong', '', world.name));
      article.appendChild(head);

      const facts = el('dl', 'guide-definition-list');
      const addFact = (term, value) => {
        facts.append(el('dt', '', term), el('dd', '', value ?? '—'));
      };
      addFact('Role', world.role);
      addFact('Mines', world.mines);
      addFact('World Boss', world.boss);
      if (world.optionalEncounter) addFact('Optional encounter', world.optionalEncounter);
      addFact('Access', world.unlock);
      addFact('Next gate', world.nextGate);
      article.appendChild(facts);
      return article;
    });
    routeHost.replaceChildren(...cards);
  }
})();

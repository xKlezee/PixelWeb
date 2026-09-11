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

  const mountCoreReference = () => {
    const documentRoot = document.querySelector('.guides-document');
    const choosePath = document.getElementById('choose-path');
    if (!documentRoot || !choosePath || document.getElementById('core-reference')) return;

    const section = el('section', 'guide-section');
    section.id = 'core-reference';

    const head = el('div', 'guide-section-head');
    const titleWrap = el('div');
    titleWrap.append(el('small', '', '02 / Core reference'), el('h2', '', 'Know the server basics before going deeper.'));
    head.append(titleWrap, el('p', '', 'Joining is only the first step. These references explain the balances and shortcuts you will see across Pixel Network.'));

    const grid = el('div', 'guide-reference-grid');
    [
      ['Currencies', 'Coins, Pixels and Nexus Points each have a different role in the network economy.', 'guide-currencies.html', 'Open Currencies →'],
      ['Basic Commands', 'The current player-facing shortcuts for Store, Skyblock, Bestiary and Talisman systems.', 'guide-basic-commands.html', 'Open Basic Commands →'],
      ['Progression', 'Levels, Prestige, Legacy and the access milestones that structure the main account journey.', 'guide-progression.html', 'Open Progression →']
    ].forEach(([name, copy, href, action], index) => {
      const card = el('article', 'guide-reference-item');
      card.append(el('small', '', index === 0 ? 'Economy' : index === 1 ? 'Player shortcuts' : 'Account'), el('h3', '', name), el('p', '', copy));
      const link = el('a', 'guide-text-link', action);
      link.href = href;
      card.appendChild(link);
      grid.appendChild(card);
    });

    section.append(head, grid);
    documentRoot.insertBefore(section, choosePath);

    const onThisPage = [...document.querySelectorAll('.guides-sidebar-nav .guides-nav-group')]
      .find(group => group.querySelector('small')?.textContent.trim() === 'On this page');
    const joinLink = onThisPage?.querySelector('a[href="#join"]');
    if (onThisPage && !onThisPage.querySelector('a[href="#core-reference"]')) {
      const link = el('a', '', 'Server basics');
      link.href = '#core-reference';
      if (joinLink?.nextSibling) onThisPage.insertBefore(link, joinLink.nextSibling);
      else onThisPage.appendChild(link);
    }

    const renumber = [
      ['choose-path', '03 / Choose a path'],
      ['main-route', '04 / Main route'],
      ['skyblock', '05 / Skyblock'],
      ['next-guides', '06 / Go deeper']
    ];
    renumber.forEach(([id, label]) => {
      const small = document.querySelector(`#${id} .guide-section-head small`);
      if (small) small.textContent = label;
    });

    const staleSystemsLink = document.querySelector('a[href="guides.html#systems"]');
    if (staleSystemsLink) staleSystemsLink.href = 'guides.html#mechanics';
  };

  mountCoreReference();

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
    skyblockHost.replaceChildren(...features.map(feature => el('span', 'guide-status is-live', feature)));
  }
})();

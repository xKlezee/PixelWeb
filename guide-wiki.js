(() => {
  'use strict';

  const baseHref = value => String(value || '').split('#')[0];

  const makeBrowseGroup = ({ id, label, links, open = false }) => {
    const group = document.createElement('details');
    group.className = 'wiki-browse-group is-foundation';
    group.dataset.wikiBrowseGroup = id;
    group.open = open;

    const summary = document.createElement('summary');
    const title = document.createElement('span');
    title.className = 'wiki-browse-label';
    title.textContent = label;
    summary.appendChild(title);

    const menu = document.createElement('div');
    menu.className = 'wiki-browse-menu';
    links.forEach(([href, text]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = text;
      menu.appendChild(link);
    });

    group.append(summary, menu);
    return group;
  };

  const makeCategorySection = ({ id, title, descriptor, href, copy, search }) => {
    const section = document.createElement('section');
    section.className = 'wiki-category';
    section.id = id;
    section.dataset.wikiCategory = '';

    const head = document.createElement('div');
    head.className = 'wiki-category-head';
    const heading = document.createElement('h2');
    heading.textContent = title;
    const label = document.createElement('span');
    label.textContent = descriptor;
    head.append(heading, label);

    const list = document.createElement('div');
    list.className = 'wiki-article-list';
    const link = document.createElement('a');
    link.className = 'wiki-article-link';
    link.href = href;
    link.dataset.wikiEntry = '';
    link.dataset.search = search;
    const strong = document.createElement('strong');
    strong.textContent = title;
    const paragraph = document.createElement('p');
    paragraph.textContent = copy;
    const kind = document.createElement('em');
    kind.textContent = title;
    link.append(strong, paragraph, kind);
    list.appendChild(link);

    section.append(head, list);
    return section;
  };

  const mountFoundationInformationArchitecture = () => {
    const browseTree = document.querySelector('.wiki-browse-tree');
    const content = document.querySelector('.wiki-index-content');
    const progressionGroup = browseTree?.querySelector('[data-wiki-browse-group="progression"]');
    const progressionSection = content?.querySelector('#progression[data-wiki-category]');
    if (!browseTree || !content || !progressionGroup || !progressionSection) return;

    /* Counts and intermediate subgroup captions are implementation metadata, not navigation. */
    browseTree.querySelectorAll('.wiki-browse-count, .wiki-browse-overview').forEach(node => node.remove());
    browseTree.querySelectorAll('.wiki-browse-subgroup').forEach(subgroup => {
      const menu = subgroup.parentElement;
      [...subgroup.querySelectorAll(':scope > a')].forEach(link => menu?.insertBefore(link, subgroup));
      subgroup.remove();
    });

    /* Getting Started owns its own foundation category instead of being buried in Progression. */
    progressionGroup.querySelector('a[href="guide-getting-started.html"]')?.remove();
    progressionSection.querySelector('[data-wiki-entry][href="guide-getting-started.html"]')?.remove();
    progressionGroup.open = false;

    const foundations = [
      {
        id: 'getting-started',
        label: 'Getting Started',
        links: [['guide-getting-started.html', 'Getting Started']],
        section: {
          id: 'getting-started',
          title: 'Getting Started',
          descriptor: 'Start here',
          href: 'guide-getting-started.html',
          copy: 'Join Pixel Network, understand the two main play paths and move into the right reference.',
          search: 'getting started join server address beginner first steps start play'
        }
      },
      {
        id: 'currencies',
        label: 'Currencies',
        links: [
          ['guide-currencies.html', 'Currency Overview'],
          ['guide-currencies.html#coins', 'Coins'],
          ['guide-currencies.html#pixels', 'Pixels'],
          ['guide-currencies.html#nexus-points', 'Nexus Points']
        ],
        section: {
          id: 'currencies',
          title: 'Currencies',
          descriptor: 'Economy reference',
          href: 'guide-currencies.html',
          copy: 'Understand Coins, Pixels and Nexus Points without mixing their different roles.',
          search: 'currencies currency economy coins pixels nexus points wallet money'
        }
      },
      {
        id: 'basic-commands',
        label: 'Basic Commands',
        links: [
          ['guide-basic-commands.html', 'Command Overview'],
          ['guide-basic-commands.html#store', '/store'],
          ['guide-basic-commands.html#skyblock', '/is'],
          ['guide-basic-commands.html#bestiary', '/bestiary'],
          ['guide-basic-commands.html#codex', '/codex'],
          ['guide-basic-commands.html#bag', '/bag']
        ],
        section: {
          id: 'basic-commands',
          title: 'Basic Commands',
          descriptor: 'Player shortcuts',
          href: 'guide-basic-commands.html',
          copy: 'A concise list of current player-facing commands with verified purposes and boundaries.',
          search: 'basic commands command store is island bestiary codex bag talismans player shortcuts'
        }
      }
    ];

    const firstExistingGroup = browseTree.firstElementChild;
    foundations.forEach((definition, index) => {
      const group = makeBrowseGroup({
        id: definition.id,
        label: definition.label,
        links: definition.links,
        open: index === 0
      });
      browseTree.insertBefore(group, firstExistingGroup);
    });

    foundations.forEach(definition => {
      content.insertBefore(makeCategorySection(definition.section), progressionSection);
    });
  };

  mountFoundationInformationArchitecture();

  const input = document.querySelector('[data-wiki-search]');
  const entries = [...document.querySelectorAll('[data-wiki-entry]')];
  const categories = [...document.querySelectorAll('[data-wiki-category]')];
  const count = document.querySelector('[data-wiki-search-count]');
  const empty = document.querySelector('[data-wiki-empty]');
  const browseGroups = [...document.querySelectorAll('[data-wiki-browse-group]')];

  const normalize = value => String(value || '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const uniqueArticleCount = visibleEntries => new Set(
    visibleEntries.map(entry => baseHref(entry.getAttribute('href'))).filter(Boolean)
  ).size;

  const openBrowseGroupFromHash = () => {
    const id = decodeURIComponent(String(window.location.hash || '').replace(/^#/, ''));
    if (!id) return;
    const group = browseGroups.find(item => item.dataset.wikiBrowseGroup === id);
    if (group) group.open = true;
  };

  const syncBrowseSearch = query => {
    if (!browseGroups.length) return;

    browseGroups.forEach(group => {
      const categoryId = group.dataset.wikiBrowseGroup;
      const category = categories.find(item => item.id === categoryId);
      const visibleHrefs = new Set(
        [...(category?.querySelectorAll('[data-wiki-entry]:not([hidden])') || [])]
          .map(entry => baseHref(entry.getAttribute('href')))
          .filter(Boolean)
      );
      const articleLinks = [...group.querySelectorAll('.wiki-browse-menu a')];

      articleLinks.forEach(link => {
        link.hidden = Boolean(query) && !visibleHrefs.has(baseHref(link.getAttribute('href')));
      });

      const hasVisibleArticle = articleLinks.some(link => !link.hidden);
      group.hidden = Boolean(query) && !hasVisibleArticle;
      if (query && hasVisibleArticle) group.open = true;
    });
  };

  const update = () => {
    const query = normalize(input?.value || '');
    const visible = [];

    entries.forEach(entry => {
      const haystack = normalize(`${entry.textContent} ${entry.dataset.search || ''}`);
      const matches = !query || haystack.includes(query);
      entry.hidden = !matches;
      if (matches) visible.push(entry);
    });

    categories.forEach(category => {
      const hasVisibleEntry = category.querySelector('[data-wiki-entry]:not([hidden])');
      category.hidden = !hasVisibleEntry;
    });

    syncBrowseSearch(query);

    const articles = uniqueArticleCount(visible);
    if (count) count.textContent = `${articles} ${articles === 1 ? 'article' : 'articles'}`;
    if (empty) empty.hidden = visible.length !== 0;
  };

  browseGroups.forEach(group => {
    const summary = group.querySelector(':scope > summary');
    const syncExpanded = () => summary?.setAttribute('aria-expanded', group.open ? 'true' : 'false');
    group.addEventListener('toggle', syncExpanded);
    syncExpanded();
  });

  window.addEventListener('hashchange', openBrowseGroupFromHash);
  openBrowseGroupFromHash();

  if (input) input.addEventListener('input', update, { passive: true });
  update();
})();

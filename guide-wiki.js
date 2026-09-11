(() => {
  'use strict';

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
    visibleEntries.map(entry => entry.getAttribute('href')).filter(Boolean)
  ).size;

  const openBrowseGroupFromHash = () => {
    const id = decodeURIComponent(String(window.location.hash || '').replace(/^#/, ''));
    if (!id) return;
    const group = browseGroups.find(item => item.dataset.wikiBrowseGroup === id);
    if (group) group.open = true;
  };

  const syncBrowseSearch = (query, visibleEntries) => {
    if (!browseGroups.length) return;
    const visibleHrefs = new Set(visibleEntries.map(entry => entry.getAttribute('href')).filter(Boolean));

    browseGroups.forEach(group => {
      const articleLinks = [...group.querySelectorAll('.wiki-browse-menu a:not(.wiki-browse-overview)')];
      const subgroups = [...group.querySelectorAll('.wiki-browse-subgroup')];

      articleLinks.forEach(link => {
        link.hidden = Boolean(query) && !visibleHrefs.has(link.getAttribute('href'));
      });

      subgroups.forEach(subgroup => {
        const hasVisibleLink = subgroup.querySelector('a:not([hidden])');
        subgroup.hidden = Boolean(query) && !hasVisibleLink;
      });

      const hasVisibleArticle = articleLinks.some(link => !link.hidden);
      group.hidden = Boolean(query) && !hasVisibleArticle;
      if (query && hasVisibleArticle) group.open = true;
    });
  };

  const update = () => {
    if (!input) return;
    const query = normalize(input.value);
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

    syncBrowseSearch(query, visible);

    const articles = uniqueArticleCount(visible);
    if (count) count.textContent = `${articles} ${articles === 1 ? 'article' : 'articles'}`;
    if (empty) empty.hidden = visible.length !== 0;
  };

  browseGroups.forEach(group => {
    group.addEventListener('toggle', () => {
      if (!group.open) return;
      const summary = group.querySelector(':scope > summary');
      summary?.setAttribute('aria-expanded', 'true');
    });
    const summary = group.querySelector(':scope > summary');
    if (summary) summary.setAttribute('aria-expanded', group.open ? 'true' : 'false');
  });

  window.addEventListener('hashchange', openBrowseGroupFromHash);
  openBrowseGroupFromHash();

  if (input) {
    input.addEventListener('input', update, { passive: true });
    update();
  }
})();

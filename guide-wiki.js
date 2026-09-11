(() => {
  'use strict';

  const baseHref = value => String(value || '').split('#')[0];
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

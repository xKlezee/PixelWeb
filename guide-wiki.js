(() => {
  'use strict';

  const input = document.querySelector('[data-wiki-search]');
  if (!input) return;

  const entries = [...document.querySelectorAll('[data-wiki-entry]')];
  const categories = [...document.querySelectorAll('[data-wiki-category]')];
  const count = document.querySelector('[data-wiki-search-count]');
  const empty = document.querySelector('[data-wiki-empty]');

  const normalize = value => String(value || '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const uniqueArticleCount = visibleEntries => new Set(
    visibleEntries.map(entry => entry.getAttribute('href')).filter(Boolean)
  ).size;

  const update = () => {
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

    const articles = uniqueArticleCount(visible);
    if (count) count.textContent = `${articles} ${articles === 1 ? 'article' : 'articles'}`;
    if (empty) empty.hidden = visible.length !== 0;
  };

  input.addEventListener('input', update, { passive: true });
  update();
})();

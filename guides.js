(() => {
  const search = document.querySelector('[data-guide-search]');
  const rows = [...document.querySelectorAll('[data-guide-entry]')];
  const empty = document.querySelector('[data-guide-empty]');
  const count = document.querySelector('[data-guide-count]');

  if (!(search instanceof HTMLInputElement) || !rows.length) return;

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const update = () => {
    const query = normalize(search.value);
    let visible = 0;

    rows.forEach(row => {
      const haystack = normalize([
        row.dataset.guideTitle,
        row.dataset.guideCategory,
        row.textContent
      ].join(' '));
      const match = !query || haystack.includes(query);
      row.hidden = !match;
      if (match) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;
    if (count) count.textContent = `${visible} ${visible === 1 ? 'entry' : 'entries'}`;
  };

  search.addEventListener('input', update);
  search.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !search.value) return;
    search.value = '';
    update();
    search.focus();
  });

  update();
})();

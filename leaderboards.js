(() => {
  'use strict';

  const root = document.querySelector('[data-leaderboards-root]');
  if (!root) return;

  const source = window.PIXEL_LEADERBOARDS || { categories: [], source: {} };
  const categories = Array.isArray(source.categories) ? source.categories : [];
  const tabs = root.querySelector('[data-leaderboard-tabs]');
  const title = root.querySelector('[data-leaderboard-title]');
  const description = root.querySelector('[data-leaderboard-description]');
  const sourceLabel = root.querySelector('[data-leaderboard-source]');
  const updated = root.querySelector('[data-leaderboard-updated]');
  const table = root.querySelector('[data-leaderboard-table]');
  const body = root.querySelector('[data-leaderboard-body]');
  const empty = root.querySelector('[data-leaderboard-empty]');

  const formatUpdated = value => {
    if (!value) return 'Awaiting verified data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Awaiting verified data';
    return `Updated ${date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`;
  };

  const cleanEntries = entries => (Array.isArray(entries) ? entries : [])
    .filter(entry => entry && typeof entry === 'object')
    .map((entry, index) => ({
      rank: Number.isFinite(Number(entry.rank)) ? Number(entry.rank) : index + 1,
      player: String(entry.player || 'Unknown'),
      metric: String(entry.metric || entry.label || '—'),
      value: String(entry.value ?? '—')
    }))
    .sort((a, b) => a.rank - b.rank);

  const categoryFromHash = () => {
    const requested = decodeURIComponent(String(location.hash || '').replace(/^#/, ''));
    return categories.find(category => category.id === requested) || categories[0] || null;
  };

  const setHash = id => {
    if (!id) return;
    const next = `#${encodeURIComponent(id)}`;
    if (location.hash === next) return;
    history.replaceState(null, '', next);
  };

  const makeCell = (tag, text, className = '') => {
    const cell = document.createElement(tag);
    if (className) cell.className = className;
    cell.textContent = text;
    return cell;
  };

  const renderEntries = category => {
    const entries = cleanEntries(category?.entries);
    if (body) body.replaceChildren();

    if (!entries.length) {
      if (table) table.hidden = true;
      if (empty) {
        empty.hidden = false;
        const strong = empty.querySelector('strong');
        const span = empty.querySelector('span');
        if (strong) strong.textContent = 'No verified standings published yet.';
        if (span) span.textContent = `${category?.label || 'This category'} will appear here only when a server-backed source is connected and validated.`;
      }
      return;
    }

    if (empty) empty.hidden = true;
    if (table) table.hidden = false;

    entries.forEach(entry => {
      const row = document.createElement('tr');
      row.append(
        makeCell('td', `#${entry.rank}`, 'leaderboard-rank'),
        makeCell('td', entry.player, 'leaderboard-player'),
        makeCell('td', entry.metric, 'leaderboard-metric'),
        makeCell('td', entry.value, 'leaderboard-value')
      );
      body?.appendChild(row);
    });
  };

  const renderTabs = active => {
    if (!tabs) return;
    tabs.replaceChildren();

    categories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'leaderboard-tab';
      button.dataset.leaderboardCategory = category.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', category.id === active?.id ? 'true' : 'false');
      button.textContent = category.label;
      button.addEventListener('click', () => {
        setHash(category.id);
        render(category);
      });
      tabs.appendChild(button);
    });
  };

  const render = category => {
    if (!category) return;
    renderTabs(category);
    if (title) title.textContent = category.label;
    if (description) description.textContent = category.description || '';
    renderEntries(category);
  };

  if (sourceLabel) sourceLabel.textContent = source.source?.label || 'Ranking source unavailable';
  if (updated) updated.textContent = formatUpdated(source.source?.generatedAt);

  window.addEventListener('hashchange', () => render(categoryFromHash()));
  render(categoryFromHash());
})();

(() => {
  'use strict';

  const root = document.querySelector('[data-leaderboards-root]');
  if (!root) return;

  const fallback = window.PIXEL_LEADERBOARDS || {};
  const endpoint = String(fallback.endpoint || 'data/leaderboards.json');
  const tabs = root.querySelector('[data-leaderboard-tabs]');
  const title = root.querySelector('[data-leaderboard-title]');
  const description = root.querySelector('[data-leaderboard-description]');
  const sourceLabel = root.querySelector('[data-leaderboard-source]');
  const updated = root.querySelector('[data-leaderboard-updated]');
  const table = root.querySelector('[data-leaderboard-table]');
  const body = root.querySelector('[data-leaderboard-body]');
  const empty = root.querySelector('[data-leaderboard-empty]');

  const CATEGORY_DEFS = Object.freeze([
    { id: 'progression', label: 'Progression', description: 'Verified account progression standings.' },
    { id: 'combat', label: 'Combat', description: 'Verified competitive combat statistics.' },
    { id: 'islands', label: 'Islands', description: 'Verified Skyblock island progression standings.' }
  ]);

  let snapshot = null;

  const validIsoDate = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const formatUpdated = value => {
    if (!value) return 'Awaiting verified data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Awaiting verified data';
    return `Updated ${date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`;
  };

  const cleanEntries = entries => (Array.isArray(entries) ? entries : [])
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => ({
      rank: Number(entry.rank),
      player: String(entry.player || '').trim(),
      metric: String(entry.metric || entry.label || '').trim(),
      value: String(entry.value ?? '').trim()
    }))
    .filter(entry => Number.isInteger(entry.rank) && entry.rank > 0 && entry.player && entry.metric && entry.value)
    .sort((a, b) => a.rank - b.rank);

  const normalizeSnapshot = candidate => {
    const input = candidate && typeof candidate === 'object' ? candidate : {};
    const source = input.source && typeof input.source === 'object' ? input.source : {};
    const generatedAt = validIsoDate(source.generatedAt);
    const ready = input.schemaVersion === 2
      && source.state === 'ready'
      && source.authority === 'pixel-server-export'
      && Boolean(generatedAt);

    const inputCategories = Array.isArray(input.categories) ? input.categories : [];
    const categories = CATEGORY_DEFS.map(definition => {
      const incoming = inputCategories.find(category => category && category.id === definition.id) || {};
      return {
        ...definition,
        description: typeof incoming.description === 'string' && incoming.description.trim()
          ? incoming.description.trim()
          : definition.description,
        entries: ready ? cleanEntries(incoming.entries) : []
      };
    });

    return {
      schemaVersion: 2,
      source: {
        state: ready ? 'ready' : 'pending',
        authority: ready ? 'pixel-server-export' : 'pending',
        label: typeof source.label === 'string' && source.label.trim()
          ? source.label.trim()
          : ready
            ? 'Pixel Network server snapshot'
            : 'Server-backed ranking source not connected',
        generatedAt: ready ? generatedAt : null
      },
      categories
    };
  };

  const loadSnapshot = async () => {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`Leaderboard snapshot request failed: ${response.status}`);
      return normalizeSnapshot(await response.json());
    } catch {
      return normalizeSnapshot(fallback);
    }
  };

  const categoryFromHash = () => {
    const categories = snapshot?.categories || [];
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
    const entries = Array.isArray(category?.entries) ? category.entries : [];
    if (body) body.replaceChildren();

    if (!entries.length) {
      if (table) table.hidden = true;
      if (empty) {
        empty.hidden = false;
        const strong = empty.querySelector('strong');
        const span = empty.querySelector('span');
        if (strong) strong.textContent = 'No verified standings published yet.';
        if (span) span.textContent = `${category?.label || 'This category'} will appear here only when an authorized server snapshot is connected and validated.`;
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

    (snapshot?.categories || []).forEach(category => {
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

  const applySourceStatus = () => {
    const source = snapshot?.source || {};
    if (sourceLabel) sourceLabel.textContent = source.label || 'Server-backed ranking source not connected';
    if (updated) updated.textContent = formatUpdated(source.generatedAt);
    root.dataset.leaderboardState = source.state === 'ready' ? 'ready' : 'pending';
  };

  window.addEventListener('hashchange', () => render(categoryFromHash()));

  loadSnapshot().then(loaded => {
    snapshot = loaded;
    applySourceStatus();
    render(categoryFromHash());
  });
})();

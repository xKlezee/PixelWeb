(() => {
  'use strict';

  const root = document.querySelector('[data-leaderboards-root]');
  if (!root) return;

  const fallback = window.PIXEL_LEADERBOARDS || {};
  const endpoint = String(fallback.endpoint || 'data/leaderboards.json');
  const categoryNav = root.querySelector('[data-leaderboard-categories]');
  const metricNav = root.querySelector('[data-leaderboard-metrics]');
  const categoryTitle = root.querySelector('[data-leaderboard-category-title]');
  const categoryDescription = root.querySelector('[data-leaderboard-category-description]');
  const metricEyebrow = root.querySelector('[data-leaderboard-metric-eyebrow]');
  const metricTitle = root.querySelector('[data-leaderboard-metric-title]');
  const metricDescription = root.querySelector('[data-leaderboard-metric-description]');
  const sourceLabel = root.querySelector('[data-leaderboard-source]');
  const updated = root.querySelector('[data-leaderboard-updated]');
  const table = root.querySelector('[data-leaderboard-table]');
  const body = root.querySelector('[data-leaderboard-body]');
  const empty = root.querySelector('[data-leaderboard-empty]');
  const podium = root.querySelector('[data-leaderboard-podium]');

  const FALLBACK_CATEGORIES = Object.freeze([
    { id: 'mining', label: 'Mining', short: 'MIN', description: 'Records built through mining and resource progression.', metrics: [] },
    { id: 'economy', label: 'Economy', short: 'ECO', description: 'Wealth and lifetime economy records.', metrics: [] },
    { id: 'progression', label: 'Progression', short: 'PRO', description: 'Account milestones across the main Pixel journey.', metrics: [] },
    { id: 'combat', label: 'Combat', short: 'CMB', description: 'Combat activity and total boss victories.', metrics: [] },
    { id: 'skyblock', label: 'Skyblock', short: 'SKY', description: 'Island progression records.', metrics: [] },
    { id: 'nexus', label: 'Nexus', short: 'NXS', description: 'Endgame encounter and Instance records.', metrics: [] },
    { id: 'collection', label: 'Collection', short: 'COL', description: 'Completion-focused records across persistent collections.', metrics: [] }
  ]);

  let snapshot = null;

  const validIsoDate = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const formatUpdated = value => {
    if (!value) return 'Tracking not connected yet';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Tracking not connected yet';
    return `Updated ${date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`;
  };

  const cleanEntries = entries => (Array.isArray(entries) ? entries : [])
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => ({
      rank: Number(entry.rank),
      player: String(entry.player || '').trim(),
      value: String(entry.value ?? '').trim()
    }))
    .filter(entry => Number.isInteger(entry.rank) && entry.rank > 0 && entry.player && entry.value)
    .sort((a, b) => a.rank - b.rank);

  const cleanMetric = metric => ({
    id: String(metric?.id || '').trim(),
    label: String(metric?.label || '').trim(),
    kicker: String(metric?.kicker || '').trim(),
    description: String(metric?.description || '').trim(),
    unit: String(metric?.unit || '').trim(),
    entries: cleanEntries(metric?.entries)
  });

  const normalizeSnapshot = candidate => {
    const input = candidate && typeof candidate === 'object' ? candidate : {};
    const source = input.source && typeof input.source === 'object' ? input.source : {};
    const generatedAt = validIsoDate(source.generatedAt);
    const ready = input.schemaVersion === 3
      && source.state === 'ready'
      && source.authority === 'pixel-server-export'
      && Boolean(generatedAt);

    const incomingCategories = Array.isArray(input.categories) ? input.categories : [];
    const categories = FALLBACK_CATEGORIES.map(definition => {
      const incoming = incomingCategories.find(category => category && category.id === definition.id) || {};
      const metrics = (Array.isArray(incoming.metrics) ? incoming.metrics : [])
        .map(cleanMetric)
        .filter(metric => metric.id && metric.label)
        .map(metric => ({ ...metric, entries: ready ? metric.entries : [] }));

      return {
        ...definition,
        label: String(incoming.label || definition.label),
        short: String(incoming.short || definition.short),
        description: String(incoming.description || definition.description),
        metrics
      };
    });

    return {
      schemaVersion: 3,
      source: {
        state: ready ? 'ready' : 'pending',
        authority: ready ? 'pixel-server-export' : 'pending',
        label: String(source.label || (ready ? 'Pixel Network live records' : 'Leaderboard tracking is not connected yet')),
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

  const routeFromHash = () => {
    const raw = decodeURIComponent(String(location.hash || '').replace(/^#/, ''));
    const [categoryId, metricId] = raw.split('/');
    const categories = snapshot?.categories || [];
    const category = categories.find(item => item.id === categoryId) || categories[0] || null;
    const metric = category?.metrics.find(item => item.id === metricId) || category?.metrics[0] || null;
    return { category, metric };
  };

  const setHash = (category, metric) => {
    if (!category?.id || !metric?.id) return;
    const next = `#${encodeURIComponent(category.id)}/${encodeURIComponent(metric.id)}`;
    if (location.hash === next) return;
    history.replaceState(null, '', next);
  };

  const makeCell = (tag, text, className = '') => {
    const cell = document.createElement(tag);
    if (className) cell.className = className;
    cell.textContent = text;
    return cell;
  };

  const renderPodium = metric => {
    if (!podium) return;
    const entries = Array.isArray(metric?.entries) ? metric.entries : [];
    const positions = [2, 1, 3];
    podium.replaceChildren();

    positions.forEach(position => {
      const entry = entries.find(item => item.rank === position);
      const card = document.createElement('article');
      card.className = `leaderboard-podium-card place-${position}${entry ? ' has-entry' : ''}`;

      const crown = document.createElement('span');
      crown.className = 'leaderboard-podium-rank';
      crown.textContent = `#${position}`;

      const avatar = document.createElement('div');
      avatar.className = 'leaderboard-podium-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = entry ? entry.player.slice(0, 1).toUpperCase() : '—';

      const player = document.createElement('strong');
      player.textContent = entry?.player || 'Awaiting player';

      const value = document.createElement('span');
      value.textContent = entry?.value || '—';

      card.append(crown, avatar, player, value);
      podium.appendChild(card);
    });
  };

  const renderEntries = metric => {
    const entries = Array.isArray(metric?.entries) ? metric.entries : [];
    if (body) body.replaceChildren();

    if (!entries.length) {
      if (table) table.hidden = true;
      if (empty) {
        empty.hidden = false;
        const strong = empty.querySelector('strong');
        const span = empty.querySelector('div > span');
        if (strong) strong.textContent = `${metric?.label || 'This ranking'} is ready for standings.`;
        if (span) span.textContent = 'The board layout is live; player positions will appear when leaderboard tracking is connected.';
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
        makeCell('td', metric?.label || 'Record', 'leaderboard-metric'),
        makeCell('td', entry.value, 'leaderboard-value')
      );
      body?.appendChild(row);
    });
  };

  const renderCategories = activeCategory => {
    if (!categoryNav) return;
    categoryNav.replaceChildren();

    (snapshot?.categories || []).forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'leaderboard-category';
      button.dataset.leaderboardCategory = category.id;
      button.setAttribute('aria-pressed', category.id === activeCategory?.id ? 'true' : 'false');

      const short = document.createElement('span');
      short.className = 'leaderboard-category-short';
      short.textContent = category.short;
      const copy = document.createElement('span');
      copy.className = 'leaderboard-category-copy';
      const strong = document.createElement('strong');
      strong.textContent = category.label;
      const small = document.createElement('small');
      small.textContent = `${category.metrics.length} ranking${category.metrics.length === 1 ? '' : 's'}`;
      copy.append(strong, small);
      button.append(short, copy);

      button.addEventListener('click', () => {
        const metric = category.metrics[0] || null;
        if (!metric) return;
        setHash(category, metric);
        render(category, metric);
      });
      categoryNav.appendChild(button);
    });
  };

  const renderMetrics = (category, activeMetric) => {
    if (!metricNav) return;
    metricNav.replaceChildren();

    (category?.metrics || []).forEach(metric => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'leaderboard-metric-button';
      button.setAttribute('aria-pressed', metric.id === activeMetric?.id ? 'true' : 'false');

      const copy = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = metric.label;
      const small = document.createElement('small');
      small.textContent = metric.kicker || metric.unit || 'Ranking';
      copy.append(strong, small);

      const arrow = document.createElement('span');
      arrow.className = 'leaderboard-metric-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';

      button.append(copy, arrow);
      button.addEventListener('click', () => {
        setHash(category, metric);
        render(category, metric);
      });
      metricNav.appendChild(button);
    });
  };

  const render = (category, metric) => {
    if (!category) return;
    renderCategories(category);
    renderMetrics(category, metric);
    if (categoryTitle) categoryTitle.textContent = category.label;
    if (categoryDescription) categoryDescription.textContent = category.description || '';
    if (metricEyebrow) metricEyebrow.textContent = metric?.kicker || category.label;
    if (metricTitle) metricTitle.textContent = metric?.label || 'Leaderboard';
    if (metricDescription) metricDescription.textContent = metric?.description || 'Player standings for this record.';
    renderPodium(metric);
    renderEntries(metric);
  };

  const applySourceStatus = () => {
    const source = snapshot?.source || {};
    if (sourceLabel) sourceLabel.textContent = source.label || 'Leaderboard tracking is not connected yet';
    if (updated) updated.textContent = formatUpdated(source.generatedAt);
    root.dataset.leaderboardState = source.state === 'ready' ? 'ready' : 'pending';
  };

  window.addEventListener('hashchange', () => {
    const { category, metric } = routeFromHash();
    render(category, metric);
  });

  loadSnapshot().then(loaded => {
    snapshot = loaded;
    applySourceStatus();
    const { category, metric } = routeFromHash();
    if (category && metric && !location.hash) setHash(category, metric);
    render(category, metric);
  });
})();

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
  const fullToggle = root.querySelector('[data-leaderboard-full-toggle]');
  const recordBadge = root.querySelector('.leaderboard-record-badge strong');

  const DEFAULT_VISIBLE_ROWS = 10;

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
  let activeMetric = null;
  let showingAll = false;

  const validIsoDate = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

  const buildTestEntries = (metricId, roster, values) => {
    const metricValues = Array.isArray(values?.[metricId]) ? values[metricId] : [];
    return roster
      .map((player, index) => ({
        rank: index + 1,
        player: String(player || '').trim(),
        value: String(metricValues[index] ?? '').trim()
      }))
      .filter(entry => entry.player && entry.value);
  };

  const normalizeSnapshot = candidate => {
    const input = candidate && typeof candidate === 'object' ? candidate : {};
    const source = input.source && typeof input.source === 'object' ? input.source : {};
    const generatedAt = validIsoDate(source.generatedAt);

    const liveReady = input.schemaVersion === 3
      && source.state === 'ready'
      && source.authority === 'pixel-server-export'
      && Boolean(generatedAt);

    const testReady = input.schemaVersion === 3
      && source.state === 'test'
      && source.authority === 'pixel-test-fixture';

    const testRoster = Array.isArray(input.testRoster) ? input.testRoster : [];
    const testValues = input.testValues && typeof input.testValues === 'object' ? input.testValues : {};
    const incomingCategories = Array.isArray(input.categories) ? input.categories : [];

    const categories = FALLBACK_CATEGORIES.map(definition => {
      const incoming = incomingCategories.find(category => category && category.id === definition.id) || {};
      const metrics = (Array.isArray(incoming.metrics) ? incoming.metrics : [])
        .map(cleanMetric)
        .filter(metric => metric.id && metric.label)
        .map(metric => ({
          ...metric,
          entries: liveReady
            ? metric.entries
            : testReady
              ? buildTestEntries(metric.id, testRoster, testValues)
              : []
        }));

      return {
        ...definition,
        label: String(incoming.label || definition.label),
        short: String(incoming.short || definition.short),
        description: String(incoming.description || definition.description),
        metrics
      };
    });

    const state = liveReady ? 'ready' : testReady ? 'test' : 'pending';

    return {
      schemaVersion: 3,
      source: {
        state,
        authority: liveReady ? 'pixel-server-export' : testReady ? 'pixel-test-fixture' : 'pending',
        label: liveReady
          ? String(source.label || 'Pixel Network live records')
          : testReady
            ? String(source.label || 'TEST DATA · real usernames, fictional values')
            : 'Leaderboard tracking is not connected yet',
        generatedAt: liveReady || testReady ? generatedAt : null
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

  const headRenderSrc = (player, size = 64) =>
    `https://api.mcheads.org/head/${encodeURIComponent(player)}/${size}/hat`;

  const podiumRenderSrc = (player, place) => {
    const direction = place === 2 ? 'left' : 'right';
    const size = place === 1 ? 320 : 256;
    return `https://api.mcheads.org/avatar/${encodeURIComponent(player)}/${direction}/${size}`;
  };

  const makePlayerIdentity = player => {
    const identity = document.createElement('span');
    identity.className = 'leaderboard-player-identity is-compact';

    const head = document.createElement('img');
    head.className = 'leaderboard-player-head';
    head.src = headRenderSrc(player, 48);
    head.alt = '';
    head.loading = 'lazy';
    head.decoding = 'async';
    head.addEventListener('error', () => head.remove(), { once: true });

    const name = document.createElement('span');
    name.className = 'leaderboard-player-name';
    name.textContent = player;

    identity.append(head, name);
    return identity;
  };

  const renderPodium = metric => {
    if (!podium) return;
    const entries = Array.isArray(metric?.entries) ? metric.entries : [];
    podium.replaceChildren();

    [2, 1, 3].forEach(position => {
      const entry = entries.find(item => item.rank === position);
      const card = document.createElement('article');
      card.className = `leaderboard-podium-card place-${position}${entry ? ' has-entry' : ''}`;

      const rank = document.createElement('span');
      rank.className = 'leaderboard-podium-rank';
      rank.textContent = `#${position}`;

      const render = document.createElement('div');
      render.className = 'leaderboard-podium-render';

      if (entry) {
        const skin = document.createElement('img');
        skin.className = 'leaderboard-podium-skin';
        skin.src = podiumRenderSrc(entry.player, position);
        skin.alt = `${entry.player} Minecraft skin`;
        skin.loading = 'eager';
        skin.decoding = 'async';
        skin.addEventListener('error', () => {
          skin.remove();
          const fallbackLetter = document.createElement('span');
          fallbackLetter.className = 'leaderboard-podium-fallback';
          fallbackLetter.textContent = entry.player.slice(0, 1).toUpperCase();
          fallbackLetter.setAttribute('aria-hidden', 'true');
          render.appendChild(fallbackLetter);
        }, { once: true });
        render.appendChild(skin);
      } else {
        const fallbackMark = document.createElement('span');
        fallbackMark.className = 'leaderboard-podium-fallback';
        fallbackMark.textContent = '—';
        fallbackMark.setAttribute('aria-hidden', 'true');
        render.appendChild(fallbackMark);
      }

      const player = document.createElement('strong');
      player.textContent = entry?.player || 'Awaiting player';

      const value = document.createElement('span');
      value.textContent = entry?.value || '—';

      card.append(rank, render, player, value);
      podium.appendChild(card);
    });
  };

  const updateFullToggle = entries => {
    if (!fullToggle) return;

    const hasMore = entries.length > DEFAULT_VISIBLE_ROWS;
    fullToggle.hidden = !hasMore;
    fullToggle.setAttribute('aria-expanded', showingAll ? 'true' : 'false');

    const label = fullToggle.querySelector('[data-leaderboard-full-label]');
    if (label) label.textContent = showingAll ? 'Show top 10' : 'View full leaderboard';

    const icon = fullToggle.querySelector('[data-leaderboard-full-icon]');
    if (icon) icon.textContent = showingAll ? '↑' : '↗';

    if (recordBadge) recordBadge.textContent = showingAll ? 'ALL PLAYERS' : 'TOP 10';
  };

  const renderRows = metric => {
    const entries = Array.isArray(metric?.entries) ? metric.entries : [];
    if (body) body.replaceChildren();

    if (!entries.length) {
      showingAll = false;
      updateFullToggle(entries);
      if (table) table.hidden = true;
      if (empty) {
        empty.hidden = false;
        const strong = empty.querySelector(':scope > div > strong');
        const span = empty.querySelector(':scope > div > span');
        if (strong) strong.textContent = `${metric?.label || 'This ranking'} is ready for standings.`;
        if (span) span.textContent = 'Player positions will appear here when leaderboard tracking is connected.';
      }
      return;
    }

    if (empty) empty.hidden = true;
    if (table) table.hidden = false;

    const visibleEntries = showingAll ? entries : entries.slice(0, DEFAULT_VISIBLE_ROWS);

    visibleEntries.forEach(entry => {
      const row = document.createElement('tr');

      const playerCell = document.createElement('td');
      playerCell.className = 'leaderboard-player';
      playerCell.appendChild(makePlayerIdentity(entry.player));

      row.append(
        makeCell('td', `#${entry.rank}`, 'leaderboard-rank'),
        playerCell,
        makeCell('td', entry.value, 'leaderboard-value')
      );

      body?.appendChild(row);
    });

    updateFullToggle(entries);
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

      copy.appendChild(strong);
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

  const renderMetrics = (category, activeMetricValue) => {
    if (!metricNav) return;
    metricNav.replaceChildren();

    (category?.metrics || []).forEach(metric => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'leaderboard-metric-button';
      button.setAttribute('aria-pressed', metric.id === activeMetricValue?.id ? 'true' : 'false');

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

    showingAll = false;
    activeMetric = metric;

    renderCategories(category);
    renderMetrics(category, metric);

    if (categoryTitle) categoryTitle.textContent = category.label;
    if (categoryDescription) categoryDescription.textContent = category.description || '';
    if (metricEyebrow) metricEyebrow.textContent = metric?.kicker || category.label;
    if (metricTitle) metricTitle.textContent = metric?.label || 'Leaderboard';
    if (metricDescription) metricDescription.textContent = metric?.description || 'Player standings for this record.';

    renderPodium(metric);
    renderRows(metric);
  };

  const applySourceStatus = () => {
    const source = snapshot?.source || {};

    if (sourceLabel) sourceLabel.textContent = source.label || 'Leaderboard tracking is not connected yet';

    if (updated) {
      updated.textContent = source.state === 'test'
        ? 'Preview only · standings and values are fictional'
        : source.generatedAt
          ? `Updated ${new Date(source.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
          : 'Tracking not connected yet';
    }

    root.dataset.leaderboardState = ['ready', 'test'].includes(source.state) ? source.state : 'pending';
  };

  fullToggle?.addEventListener('click', () => {
    if (!activeMetric) return;
    showingAll = !showingAll;
    renderRows(activeMetric);

    if (!showingAll) {
      table?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

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

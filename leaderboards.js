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
  const recordBadgeLabel = root.querySelector('.leaderboard-record-badge span');

  const DEFAULT_VISIBLE_ROWS = 10;
  const DEMO_ROW_COUNT = 100;

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

  const formatInteger = value => Math.max(0, Math.round(value)).toLocaleString('en-US');

  const demoValueForMetric = (metricId, rank) => {
    const offset = rank - 1;

    switch (metricId) {
      case 'blocks-mined': return formatInteger(4_250_000 - offset * 31_250);
      case 'money': return formatInteger(32_500_000 - offset * 245_000);
      case 'money-earned': return formatInteger(95_000_000 - offset * 700_000);
      case 'nexus-points': return formatInteger(18_500 - offset * 137);
      case 'level': return formatInteger(250 - offset * 2);
      case 'prestige': return formatInteger(100 - offset);
      case 'legacy': return formatInteger(100 - offset);
      case 'quests-completed': return formatInteger(1_200 - offset * 9);
      case 'kills': return formatInteger(185_000 - offset * 1_350);
      case 'boss-kills': return formatInteger(8_700 - offset * 63);
      case 'island-level': return formatInteger(42_000 - offset * 311);
      case 'skyblock-quests': return formatInteger(900 - offset * 7);
      case 'raphael-kills': return formatInteger(1_100 - offset * 8);
      case 'azazel-kills': return formatInteger(980 - offset * 7);
      case 'abyss-astral-kills': return formatInteger(820 - offset * 6);
      case 'instance-clears': return formatInteger(2_400 - offset * 18);
      case 'highest-difficulty': return formatInteger(DEMO_ROW_COUNT - offset);
      case 'fastest-clear': {
        const totalSeconds = 84 + offset * 2;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
      }
      case 'bestiary-completion': return `${Math.max(50.5, 100 - offset * 0.5).toFixed(1)}%`;
      case 'talisman-codex': return `${Math.max(55.5, 100 - offset * 0.45).toFixed(1)}%`;
      default: return formatInteger(DEMO_ROW_COUNT - offset);
    }
  };

  const buildDemoEntries = metricId => Array.from({ length: DEMO_ROW_COUNT }, (_, index) => {
    const rank = index + 1;
    return { rank, player: `DemoPlayer${String(rank).padStart(3, '0')}`, value: demoValueForMetric(metricId, rank) };
  });

  const cleanEntries = entries => (Array.isArray(entries) ? entries : [])
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => ({ rank: Number(entry.rank), player: String(entry.player || '').trim(), value: String(entry.value ?? '').trim() }))
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
    const liveReady = input.schemaVersion === 3 && source.state === 'ready' && source.authority === 'pixel-server-export' && Boolean(generatedAt);
    const incomingCategories = Array.isArray(input.categories) ? input.categories : [];

    const categories = FALLBACK_CATEGORIES.map(definition => {
      const incoming = incomingCategories.find(category => category && category.id === definition.id) || {};
      const metrics = (Array.isArray(incoming.metrics) ? incoming.metrics : [])
        .map(cleanMetric)
        .filter(metric => metric.id && metric.label)
        .map(metric => ({ ...metric, entries: liveReady ? metric.entries : buildDemoEntries(metric.id) }));
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
        state: liveReady ? 'ready' : 'demo',
        authority: liveReady ? 'pixel-server-export' : 'pixel-demo',
        label: liveReady ? String(source.label || 'Pixel Network live records') : 'Demo standings',
        generatedAt: liveReady ? generatedAt : null
      },
      categories
    };
  };

  const loadSnapshot = async () => {
    try {
      const response = await fetch(endpoint, { method: 'GET', credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
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

  const headRenderSrc = (player, size = 64) => `https://api.mcheads.org/head/${encodeURIComponent(player)}/${size}/hat`;
  const podiumRenderSrc = (player, place) => {
    const direction = place === 2 ? 'left' : 'right';
    const size = place === 1 ? 320 : 256;
    return `https://api.mcheads.org/avatar/${encodeURIComponent(player)}/${direction}/${size}`;
  };

  const makePlayerIdentity = player => {
    const identity = document.createElement('span');
    identity.className = 'leaderboard-player-identity is-compact';
    if (snapshot?.source?.state === 'demo') {
      const head = document.createElement('span');
      head.className = 'leaderboard-player-head is-demo';
      head.textContent = String(player).slice(-3);
      head.setAttribute('aria-hidden', 'true');
      identity.appendChild(head);
    } else {
      const head = document.createElement('img');
      head.className = 'leaderboard-player-head';
      head.src = headRenderSrc(player, 48);
      head.alt = '';
      head.loading = 'lazy';
      head.decoding = 'async';
      head.addEventListener('error', () => head.remove(), { once: true });
      identity.appendChild(head);
    }
    const name = document.createElement('span');
    name.className = 'leaderboard-player-name';
    name.textContent = player;
    identity.appendChild(name);
    return identity;
  };

  const renderPodium = metric => {
    if (!podium) return;
    const entries = Array.isArray(metric?.entries) ? metric.entries : [];
    const demoMode = snapshot?.source?.state === 'demo';
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
      if (entry && demoMode) {
        const demoRender = document.createElement('span');
        demoRender.className = 'leaderboard-podium-fallback';
        demoRender.textContent = `D${position}`;
        demoRender.setAttribute('aria-hidden', 'true');
        render.appendChild(demoRender);
      } else if (entry) {
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
    const demoMode = snapshot?.source?.state === 'demo';
    fullToggle.hidden = !hasMore;
    fullToggle.setAttribute('aria-expanded', showingAll ? 'true' : 'false');
    const label = fullToggle.querySelector('[data-leaderboard-full-label]');
    if (label) label.textContent = showingAll ? 'Show top 10' : demoMode ? `View top ${Math.min(DEMO_ROW_COUNT, entries.length)}` : 'View full leaderboard';
    const icon = fullToggle.querySelector('[data-leaderboard-full-icon]');
    if (icon) icon.textContent = showingAll ? '↑' : '↗';
    if (recordBadge) recordBadge.textContent = showingAll ? (demoMode ? `TOP ${Math.min(DEMO_ROW_COUNT, entries.length)}` : 'ALL PLAYERS') : 'TOP 10';
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
        if (span) span.textContent = 'This board will populate automatically when live tracking is connected.';
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
      row.append(makeCell('td', `#${entry.rank}`, 'leaderboard-rank'), playerCell, makeCell('td', entry.value, 'leaderboard-value'));
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
    const demoMode = source.state === 'demo';
    if (sourceLabel) sourceLabel.textContent = source.label || 'Leaderboard tracking is not connected yet';
    if (updated) {
      updated.textContent = source.generatedAt
        ? `Updated ${new Date(source.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
        : demoMode ? `${DEMO_ROW_COUNT} example players · preview only` : 'Tracking not connected yet';
    }
    if (recordBadgeLabel) recordBadgeLabel.textContent = demoMode ? 'DEMO' : 'PIXEL';
    root.dataset.leaderboardState = source.state === 'ready' ? 'ready' : demoMode ? 'demo' : 'pending';
  };

  fullToggle?.addEventListener('click', () => {
    if (!activeMetric) return;
    showingAll = !showingAll;
    renderRows(activeMetric);
    if (!showingAll) table?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const media = window.PIXEL_WORLDS_MEDIA || {};
  const rail = document.querySelector('[data-worlds-visual-rail]');
  const progress = document.querySelector('[data-worlds-progress]');
  const bossStrip = document.querySelector('[data-worlds-boss-strip]');
  const WORLD_IMAGE_PROXY_ORIGIN = 'https://pixel-network-1.gitbook.io';
  const WORLD_IMAGE_PROXY_PATH = '/home/~gitbook/image';
  const LOCAL_WORLD_MEDIA_RE = /^assets\/worlds\/[A-Za-z0-9._-]+\.(?:svg|png|jpe?g|webp|avif)$/i;

  if (!rail || !Array.isArray(network.worlds)) return;

  const descriptions = {
    overworld: 'The foundation of the shared route: mining, equipment, economy and combat establish the language used by every later stage.',
    pirate: 'The first expansion stage, where the required World Boss and optional encounter deliberately serve different progression roles.',
    nether: 'Pressure rises without resetting the route. Its World Boss closes the third stage before Winter begins.',
    winter: 'The fourth and final current world. Its World Boss closes the World arc while Nexus remains a separate endgame access layer.'
  };

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const safeImageUrl = (source, width = null) => {
    if (!source) return '';
    const value = String(source).trim();
    if (LOCAL_WORLD_MEDIA_RE.test(value)) return value;

    try {
      const url = new URL(value);
      if (
        url.protocol !== 'https:' ||
        url.origin !== WORLD_IMAGE_PROXY_ORIGIN ||
        url.pathname !== WORLD_IMAGE_PROXY_PATH ||
        url.username || url.password || url.hash
      ) {
        return '';
      }

      if (width) {
        url.searchParams.set('width', String(width));
        url.searchParams.set('dpr', '1');
        url.searchParams.set('quality', width >= 1000 ? '86' : '82');
      }
      return url.toString();
    } catch {
      return '';
    }
  };

  const markExternal = (img, source) => {
    if (/^https:\/\//i.test(source)) img.referrerPolicy = 'no-referrer';
  };

  const statRow = (label, value, accent = false) => {
    const row = el('div', 'worlds-stat');
    row.append(el('span', '', label));
    row.append(el('strong', accent ? 'accent' : '', value ?? '—'));
    return row;
  };

  const bossVisual = (name, bossMedia, label, optional = false) => {
    const source = safeImageUrl(bossMedia?.source);
    if (!name || !source) return null;

    const figure = el('figure', `worlds-card-boss${optional ? ' is-optional' : ''}`);
    const img = el('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.fetchPriority = 'low';
    markExternal(img, source);
    img.src = source;
    img.alt = bossMedia?.alt || `${name} concept visual`;
    img.width = 160;
    img.height = 120;

    const caption = el('figcaption');
    caption.append(el('small', '', label), el('strong', '', name));
    figure.append(img, caption);
    return figure;
  };

  const worldCard = (world, index) => {
    const visual = media[world.id] || {};
    const article = el('article', 'worlds-card');
    article.dataset.accent = visual.accent || 'green';

    const mediaWrap = el('div', `worlds-card-media${visual.source ? '' : ' is-fallback'}`);
    mediaWrap.appendChild(el('span', 'worlds-card-index', String(index + 1).padStart(2, '0')));

    const visualSource = safeImageUrl(visual.source, 960);
    if (visualSource) {
      const img = el('img');
      img.alt = visual.alt || `${world.name} landscape`;
      img.width = 960;
      img.height = 540;
      img.decoding = 'async';
      markExternal(img, visualSource);
      const src640 = safeImageUrl(visual.source, 640);
      const src960 = safeImageUrl(visual.source, 960);
      const src1280 = safeImageUrl(visual.source, 1280);
      const srcset = [[src640, '640w'], [src960, '960w'], [src1280, '1280w']]
        .filter(([src]) => src)
        .map(([src, size]) => `${src} ${size}`)
        .join(', ');
      const sizes = '(max-width:700px) 82vw, (max-width:1199px) 300px, 25vw';

      if (index === 0) {
        img.fetchPriority = 'high';
        img.src = src960;
        if (srcset) img.srcset = srcset;
        img.sizes = sizes;
      } else {
        img.fetchPriority = 'low';
        img.dataset.src = src960;
        if (srcset) img.dataset.srcset = srcset;
        img.dataset.sizes = sizes;
        img.loading = 'lazy';
      }
      mediaWrap.appendChild(img);
    }

    const body = el('div', 'worlds-card-body');
    body.append(
      el('span', 'worlds-card-kicker', visual.label || world.role),
      el('h3', '', world.name),
      el('p', 'worlds-card-summary', descriptions[world.id] || '')
    );

    const bossStack = el('div', 'worlds-card-boss-stack');
    const mainBoss = bossVisual(world.boss, visual.boss, 'World Boss');
    if (mainBoss) bossStack.appendChild(mainBoss);
    if (world.optionalEncounter) {
      const optionalBoss = bossVisual(world.optionalEncounter, visual.optionalBoss, 'Optional encounter', true);
      if (optionalBoss) bossStack.appendChild(optionalBoss);
    }
    body.appendChild(bossStack);

    const stats = el('div', 'worlds-card-stats');
    stats.append(
      statRow('Role', world.role),
      statRow('Mines', world.mines),
      statRow(world.id === 'pirate' ? 'Main boss' : 'World boss', world.boss, true)
    );
    if (world.optionalEncounter) stats.appendChild(statRow('Optional', world.optionalEncounter, true));
    stats.appendChild(statRow('Next gate', world.nextGate));
    body.appendChild(stats);

    if (world.id === 'winter') {
      const nexusGate = network?.nexus?.unlockMilestone || network?.nexus?.unlock || 'account progression';
      body.appendChild(el('div', 'worlds-card-note', `Winter is the final current world. ${world.boss || 'Its World Boss'} closes the World Boss arc; Nexus access is a separate ${nexusGate} unlock.`));
    }

    article.append(mediaWrap, body);
    return article;
  };

  rail.replaceChildren(...network.worlds.map(worldCard));

  const immediateImages = [...rail.querySelectorAll('.worlds-card-media img[src]')];
  immediateImages.forEach(img => {
    if (img.complete && img.naturalWidth) img.classList.add('is-loaded');
    else img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    img.addEventListener('error', () => img.closest('.worlds-card-media')?.classList.add('is-fallback'), { once: true });
  });

  const deferredImages = [...rail.querySelectorAll('.worlds-card-media img[data-src]')];
  const hydrateImage = img => {
    if (!img?.dataset.src) return;
    img.src = img.dataset.src;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    if (img.dataset.sizes) img.sizes = img.dataset.sizes;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
    img.removeAttribute('data-sizes');
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    img.addEventListener('error', () => img.closest('.worlds-card-media')?.classList.add('is-fallback'), { once: true });
  };

  if ('IntersectionObserver' in window && deferredImages.length) {
    const imageObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        hydrateImage(entry.target);
        imageObserver.unobserve(entry.target);
      }
    }, { rootMargin: '500px 320px' });
    deferredImages.forEach(img => imageObserver.observe(img));
  } else {
    deferredImages.forEach(hydrateImage);
  }

  if (progress) {
    const line = el('div', 'worlds-progress-line');
    line.setAttribute('aria-hidden', 'true');
    const grid = el('div', 'worlds-progress-grid');
    network.worlds.forEach(world => {
      const step = el('div', 'worlds-progress-step');
      const dot = el('div', 'worlds-progress-dot');
      dot.setAttribute('aria-hidden', 'true');
      const copy = el('div');
      const access = world.order === 1 ? 'Starting world' : world.unlock;
      copy.append(el('b', '', world.name), el('span', '', `World ${world.order ?? '—'} · ${access || 'Access milestone'}`));
      step.append(dot, copy);
      grid.appendChild(step);
    });
    progress.replaceChildren(line, grid);
  }

  if (bossStrip) {
    const bosses = [];
    network.worlds.forEach(world => {
      const visual = media[world.id] || {};
      bosses.push({
        label: `${world.name} · ${world.id === 'winter' ? 'Final World Boss' : 'Required World Boss'}`,
        name: world.boss,
        copy: world.id === 'winter'
          ? 'Closes the current four-World boss arc; Nexus access remains a separate account milestone.'
          : 'Required as part of the transition into the next World stage.',
        media: visual.boss
      });
      if (world.optionalEncounter) {
        bosses.push({
          label: `${world.name} · Optional`,
          name: world.optionalEncounter,
          copy: 'Optional encounter; it is not part of the main World Boss gate.',
          media: visual.optionalBoss
        });
      }
    });

    bossStrip.replaceChildren(...bosses.map(entry => {
      const item = el('article', 'worlds-boss-item reveal');
      const source = safeImageUrl(entry.media?.source);
      if (source) {
        const img = el('img', 'worlds-boss-art');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.fetchPriority = 'low';
        markExternal(img, source);
        img.src = source;
        img.alt = entry.media?.alt || `${entry.name} concept visual`;
        img.width = 320;
        img.height = 240;
        item.appendChild(img);
      }
      const copy = el('div', 'worlds-boss-copy');
      copy.append(el('small', '', entry.label), el('h3', '', entry.name || ''), el('p', '', entry.copy));
      item.appendChild(copy);
      return item;
    }));
  }
})();
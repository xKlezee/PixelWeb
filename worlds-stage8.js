(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const media = window.PIXEL_WORLDS_MEDIA || {};
  const rail = document.querySelector('[data-worlds-visual-rail]');
  const progress = document.querySelector('[data-worlds-progress]');
  const bossStrip = document.querySelector('[data-worlds-boss-strip]');

  if (!rail || !Array.isArray(network.worlds)) return;

  const descriptions = {
    overworld: 'The foundation of the shared route: mining, equipment, economy and combat establish the language used by every later stage.',
    pirate: 'The first expansion stage, where the required HollowKeeper and optional Kraken deliberately serve different progression roles.',
    nether: 'Pressure rises without resetting the account. Eldric closes the third world stage before Winter begins.',
    winter: 'The fourth and final current world. Viking closes Winter\'s World Boss arc, while Prestige IV separately unlocks Nexus.'
  };

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const safeImageUrl = (source, width = null) => {
    if (!source) return '';
    const value = String(source);
    if (/^(?:assets\/|\.\/|\.\.\/)/.test(value)) return value;
    try {
      const url = new URL(value, location.href);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
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
    if (/^https?:\/\//i.test(source)) img.referrerPolicy = 'no-referrer';
  };

  const statRow = (label, value, accent = false) => {
    const row = el('div', 'worlds-stat');
    row.append(el('span', '', label));
    const strong = el('strong', accent ? 'accent' : '', value ?? '—');
    row.append(strong);
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
    mediaWrap.appendChild(el('span', 'worlds-card-index', `0${index + 1}`));

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
      body.appendChild(el('div', 'worlds-card-note', 'Winter is the final current world. Viking is its final World Boss; Nexus access is a separate Prestige IV unlock.'));
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
    const steps = [
      ['Overworld', 'World 1 · Beholder'],
      ['Prestige I', 'World 2 · Pirate Kingdom · HollowKeeper'],
      ['Prestige II', 'World 3 · Nether · Eldric'],
      ['Prestige III', 'World 4 · Winter · Viking']
    ];
    const line = el('div', 'worlds-progress-line');
    line.setAttribute('aria-hidden', 'true');
    const grid = el('div', 'worlds-progress-grid');
    steps.forEach(([title, sub]) => {
      const step = el('div', 'worlds-progress-step');
      const dot = el('div', 'worlds-progress-dot');
      dot.setAttribute('aria-hidden', 'true');
      const copy = el('div');
      copy.append(el('b', '', title), el('span', '', sub));
      step.append(dot, copy);
      grid.appendChild(step);
    });
    progress.replaceChildren(line, grid);
  }

  if (bossStrip) {
    const byId = id => network.worlds.find(world => world.id === id) || {};
    const overworld = byId('overworld');
    const pirate = byId('pirate');
    const nether = byId('nether');
    const winter = byId('winter');
    const bosses = [
      { label: 'Overworld · Required', name: overworld.boss, copy: 'Paired with Prestige I to open Pirate Kingdom.', media: media.overworld?.boss },
      { label: 'Pirate · Required', name: pirate.boss, copy: 'Paired with Prestige II to open Nether.', media: media.pirate?.boss },
      { label: 'Pirate · Optional', name: pirate.optionalEncounter, copy: 'A thematic encounter that gates nothing.', media: media.pirate?.optionalBoss },
      { label: 'Nether · Required', name: nether.boss, copy: 'Paired with Prestige III to open Winter.', media: media.nether?.boss },
      { label: 'Winter · Final boss', name: winter.boss, copy: 'Winter\'s final World Boss. Nexus access is not tied to this clear.', media: media.winter?.boss }
    ];

    const items = bosses.map(entry => {
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
    });
    bossStrip.replaceChildren(...items);
  }
})();

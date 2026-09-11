(() => {
  'use strict';

  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const media = window.PIXEL_WORLDS_MEDIA || {};
  const stage = document.querySelector('[data-worlds-region-stage]');
  const panelRoot = document.querySelector('[data-worlds-region-panels]');
  const rail = document.querySelector('[data-worlds-region-rail]');
  const counterCurrent = document.querySelector('[data-worlds-region-current]');
  const counterTotal = document.querySelector('[data-worlds-region-total]');
  const dialog = document.querySelector('[data-worlds-region-dialog]');

  if (!stage || !panelRoot || !rail || !Array.isArray(network.worlds) || !network.worlds.length) return;

  const WORLD_IMAGE_PROXY_ORIGIN = 'https://pixel-network-1.gitbook.io';
  const WORLD_IMAGE_PROXY_PATH = '/home/~gitbook/image';
  const LOCAL_WORLD_MEDIA_RE = /^assets\/worlds\/[A-Za-z0-9._/-]+\.(?:svg|png|jpe?g|webp|avif)$/i;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const descriptions = Object.freeze({
    overworld: 'The foundation of Pixel Network. Mining, equipment, economy and combat establish the language used by every later World.',
    pirate: 'The first major expansion of the route. HollowKeeper advances progression while Kraken remains a separate optional encounter.',
    nether: 'The third World raises the pressure without resetting the route. Eldric closes the stage before Winter becomes available.',
    winter: 'The fourth and final current World. Viking closes the World Boss arc while Nexus remains a separate permanent account unlock.'
  });

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const safeImageUrl = source => {
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
      ) return '';
      return url.toString();
    } catch {
      return '';
    }
  };

  const twoDigits = value => String(value).padStart(2, '0');

  const createMetaRow = (label, value) => {
    const row = el('div', 'worlds-region-meta-row');
    row.append(el('span', '', label), el('strong', '', value || '—'));
    return row;
  };

  const createPanel = (world, index) => {
    const visual = media[world.id] || {};
    const panel = el('section', 'worlds-region-panel');
    panel.dataset.worldId = world.id;
    panel.dataset.accent = visual.accent || 'green';
    panel.setAttribute('aria-label', `${world.name}, World ${world.order || index + 1}`);
    panel.setAttribute('aria-hidden', 'true');

    const background = el('div', 'worlds-region-background');
    const source = safeImageUrl(visual.source);
    if (source) {
      const image = el('img');
      image.alt = '';
      image.decoding = 'async';
      image.draggable = false;
      image.dataset.worldBackground = '';
      if (index === 0) {
        image.src = source;
        image.fetchPriority = 'high';
      } else {
        image.dataset.src = source;
        image.loading = 'lazy';
      }
      image.addEventListener('error', () => background.classList.add('is-fallback'), { once: true });
      background.appendChild(image);
    } else {
      background.classList.add('is-fallback');
    }

    const content = el('div', 'worlds-region-content');
    const copy = el('div', 'worlds-region-copy');
    copy.append(
      el('div', 'worlds-region-order', `World ${twoDigits(world.order || index + 1)} · ${visual.label || world.role}`),
      el('h1', 'worlds-region-title', world.name),
      el('p', 'worlds-region-role', descriptions[world.id] || '')
    );

    const meta = el('div', 'worlds-region-meta');
    meta.append(
      createMetaRow('Role', world.role),
      createMetaRow('Mines', world.mines),
      createMetaRow('World Boss', world.boss),
      createMetaRow('Access', world.unlock)
    );
    content.append(copy, meta);

    const investigate = el('button', 'worlds-investigate');
    investigate.type = 'button';
    investigate.dataset.worldInvestigate = world.id;
    investigate.setAttribute('aria-label', `Explore ${world.name} details`);
    investigate.append(el('span', 'worlds-investigate-orb'), el('span', 'worlds-investigate-label', 'Explore'));

    panel.append(background, content, investigate);
    return panel;
  };

  const createNode = (world, index) => {
    const button = el('button', 'worlds-region-node');
    button.type = 'button';
    button.dataset.worldIndex = String(index);
    button.setAttribute('aria-label', `Show ${world.name}`);
    button.append(el('span', '', `World ${twoDigits(world.order || index + 1)}`), el('strong', '', world.name));
    return button;
  };

  const worlds = network.worlds;
  const panels = worlds.map(createPanel);
  const nodes = worlds.map(createNode);
  panelRoot.replaceChildren(...panels);
  rail.replaceChildren(...nodes);
  if (counterTotal) counterTotal.textContent = twoDigits(worlds.length);

  const hydrateImage = index => {
    const image = panels[index]?.querySelector('img[data-src]');
    if (!image?.dataset.src) return;
    image.src = image.dataset.src;
    image.removeAttribute('data-src');
  };

  let activeIndex = Math.max(0, worlds.findIndex(world => `#${world.id}` === location.hash));
  let wheelAccumulator = 0;
  let transitionLockUntil = 0;
  let touchStartY = null;
  let touchPointerId = null;
  let lastInvestigator = null;

  const updateHash = world => {
    if (!world?.id) return;
    const next = `#${world.id}`;
    if (location.hash === next) return;
    try {
      history.replaceState(null, '', next);
    } catch {
      /* Hash synchronization is progressive enhancement only. */
    }
  };

  const setActive = (index, options = {}) => {
    const nextIndex = Math.max(0, Math.min(worlds.length - 1, Number(index) || 0));
    activeIndex = nextIndex;

    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === activeIndex;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    nodes.forEach((node, nodeIndex) => {
      if (nodeIndex === activeIndex) node.setAttribute('aria-current', 'true');
      else node.removeAttribute('aria-current');
    });

    if (counterCurrent) counterCurrent.textContent = twoDigits(activeIndex + 1);
    hydrateImage(activeIndex);
    hydrateImage(activeIndex + 1);
    hydrateImage(activeIndex - 1);
    if (options.syncHash !== false) updateHash(worlds[activeIndex]);
  };

  const step = direction => {
    const next = Math.max(0, Math.min(worlds.length - 1, activeIndex + direction));
    if (next === activeIndex) return;
    setActive(next);
  };

  nodes.forEach((node, index) => node.addEventListener('click', () => setActive(index)));

  stage.addEventListener('wheel', event => {
    if (dialog?.open) return;
    event.preventDefault();
    wheelAccumulator += event.deltaY;
    if (Math.abs(wheelAccumulator) < 34) return;

    const now = performance.now();
    const direction = wheelAccumulator > 0 ? 1 : -1;
    wheelAccumulator = 0;
    if (now < transitionLockUntil) return;
    transitionLockUntil = now + (reducedMotion.matches ? 180 : 720);
    step(direction);
  }, { passive: false });

  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    if (event.target.closest('button, a')) return;
    touchStartY = event.clientY;
    touchPointerId = event.pointerId;
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener('pointerup', event => {
    if (event.pointerId !== touchPointerId || touchStartY === null) return;
    const delta = event.clientY - touchStartY;
    touchStartY = null;
    touchPointerId = null;
    if (Math.abs(delta) < 44) return;
    step(delta < 0 ? 1 : -1);
  });

  stage.addEventListener('pointercancel', () => {
    touchStartY = null;
    touchPointerId = null;
  });

  stage.addEventListener('keydown', event => {
    if (dialog?.open) return;
    if (['ArrowDown', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      step(1);
    } else if (['ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(worlds.length - 1);
    }
  });

  const dialogStat = (label, value) => {
    const row = el('div', 'worlds-region-dialog-stat');
    row.append(el('span', '', label), el('strong', '', value || '—'));
    return row;
  };

  const openDetails = (world, trigger) => {
    if (!(dialog instanceof HTMLDialogElement) || !world) return;
    const visual = media[world.id] || {};
    const shell = el('div', 'worlds-region-dialog-shell');
    const visualPane = el('div', 'worlds-region-dialog-visual');
    const backgroundSource = safeImageUrl(visual.source);
    if (backgroundSource) {
      const image = el('img');
      image.src = backgroundSource;
      image.alt = '';
      image.decoding = 'async';
      visualPane.appendChild(image);
    }

    const body = el('div', 'worlds-region-dialog-body');
    const close = el('button', 'worlds-region-dialog-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close world details');
    close.addEventListener('click', () => dialog.close());

    body.append(
      close,
      el('div', 'worlds-region-dialog-eyebrow', `World ${twoDigits(world.order)} · ${world.role}`),
      el('h2', '', world.name),
      el('p', 'worlds-region-dialog-summary', descriptions[world.id] || '')
    );

    const stats = el('div', 'worlds-region-dialog-stats');
    stats.append(
      dialogStat('Access', world.unlock),
      dialogStat('Mines', String(world.mines ?? '—')),
      dialogStat('World Boss', world.boss),
      dialogStat('Next gate', world.nextGate)
    );
    if (world.optionalEncounter) stats.appendChild(dialogStat('Optional', world.optionalEncounter));
    body.appendChild(stats);

    if (world.id === 'winter') {
      body.appendChild(el('p', 'worlds-region-dialog-note', `Winter closes the current World route. ${world.boss || 'Viking'} does not gate Nexus; Nexus is unlocked separately at ${network?.nexus?.unlock || 'its account milestone'}.`));
    }

    const actions = el('div', 'worlds-region-dialog-actions');
    const guide = el('a', 'button primary', 'Open Worlds Guide');
    guide.href = 'guide-worlds.html';
    if (world.id === 'winter') {
      const nexus = el('a', 'button secondary', 'Open Nexus');
      nexus.href = 'nexus.html';
      actions.append(guide, nexus);
    } else {
      actions.appendChild(guide);
    }
    body.appendChild(actions);
    shell.append(visualPane, body);
    dialog.replaceChildren(shell);
    lastInvestigator = trigger || null;
    dialog.showModal();
  };

  panelRoot.addEventListener('click', event => {
    const trigger = event.target.closest('[data-world-investigate]');
    if (!(trigger instanceof HTMLButtonElement)) return;
    const world = worlds.find(entry => entry.id === trigger.dataset.worldInvestigate);
    openDetails(world, trigger);
  });

  if (dialog instanceof HTMLDialogElement) {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => lastInvestigator?.focus?.());
  }

  addEventListener('hashchange', () => {
    const index = worlds.findIndex(world => `#${world.id}` === location.hash);
    if (index >= 0 && index !== activeIndex) setActive(index, { syncHash: false });
  });

  setActive(activeIndex, { syncHash: location.hash.length > 1 });
})();

(() => {
  'use strict';

  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const media = window.PIXEL_NEXUS_MEDIA || {};
  const nexus = network.nexus || {};
  const encounters = Array.isArray(nexus.instances) ? nexus.instances : [];
  const stage = document.querySelector('[data-nexus-encounter-stage]');
  const panelRoot = document.querySelector('[data-nexus-encounter-panels]');
  const rail = document.querySelector('[data-nexus-encounter-rail]');
  const currentNode = document.querySelector('[data-nexus-encounter-current]');
  const totalNode = document.querySelector('[data-nexus-encounter-total]');
  const dialog = document.querySelector('[data-nexus-encounter-dialog]');

  if (!stage || !panelRoot || !rail || !encounters.length) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const TRANSITION_MS = reducedMotion.matches ? 1 : 650;
  const WHEEL_THRESHOLD = 46;
  const GESTURE_GAP_MS = 150;
  const INERTIA_WINDOW_MS = 220;

  const encounterIds = ['raphael', 'azazel', 'abyss-astral'];
  const copy = Object.freeze({
    raphael: 'The first current Nexus Instance. A single-boss encounter available from the permanent Nexus unlock.',
    azazel: 'A second single-boss Instance on the same account-driven difficulty ladder.',
    'abyss-astral': 'The current dual-boss encounter and the latest point in the defined Nexus difficulty path.'
  });

  const accentById = Object.freeze({
    raphael: 'gold',
    azazel: 'crimson',
    'abyss-astral': 'void'
  });

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const twoDigits = value => String(value).padStart(2, '0');

  const imageFor = (source, alt = '') => {
    const img = el('img');
    img.src = String(source || '');
    img.alt = alt;
    img.decoding = 'async';
    img.draggable = false;
    return img;
  };

  const firstDifficulty = encounter => encounter?.difficulties?.[0] || null;
  const lastDifficulty = encounter => encounter?.difficulties?.at?.(-1) || encounter?.difficulties?.[encounter.difficulties.length - 1] || null;

  const createVisual = id => {
    const host = el('div', 'nexus-encounter-background');
    if (id === 'abyss-astral') {
      host.classList.add('is-dual');
      host.append(
        imageFor(media.abyss?.source, media.abyss?.alt || ''),
        imageFor(media.astral?.source, media.astral?.alt || '')
      );
      return host;
    }

    const entry = media[id] || {};
    if (entry.source) host.appendChild(imageFor(entry.source, entry.alt || ''));
    else host.classList.add('is-fallback');
    return host;
  };

  const createPanel = (encounter, index) => {
    const id = encounterIds[index] || `encounter-${index + 1}`;
    const first = firstDifficulty(encounter);
    const last = lastDifficulty(encounter);
    const panel = el('section', 'nexus-encounter-panel');
    panel.dataset.encounterId = id;
    panel.dataset.accent = accentById[id] || 'violet';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', `${encounter.name}, Nexus encounter ${index + 1}`);

    const content = el('div', 'nexus-encounter-content');
    const main = el('div', 'nexus-encounter-copy');
    main.append(
      el('div', 'nexus-encounter-order', `Instance ${twoDigits(index + 1)} · ${encounter.format}`),
      el('h1', 'nexus-encounter-title', encounter.name),
      el('p', 'nexus-encounter-role', copy[id] || '')
    );

    const meta = el('div', 'nexus-encounter-meta');
    const metaRows = [
      ['Nexus access', nexus.unlock || '—'],
      ['First tier', first ? `${first.name} · ${first.unlock}` : '—'],
      ['Current apex', last ? `${last.name} · ${last.unlock}` : '—']
    ];
    metaRows.forEach(([label, value]) => {
      const row = el('div', 'nexus-encounter-meta-row');
      row.append(el('span', '', label), el('strong', '', value));
      meta.appendChild(row);
    });
    content.append(main, meta);

    const investigate = el('button', 'nexus-investigate');
    investigate.type = 'button';
    investigate.dataset.nexusInvestigate = id;
    investigate.setAttribute('aria-label', `Explore ${encounter.name} details`);
    investigate.append(el('span', 'nexus-investigate-orb'), el('span', 'nexus-investigate-label', 'Explore'));

    panel.append(createVisual(id), content, investigate);
    return panel;
  };

  const createNode = (encounter, index) => {
    const node = el('button', 'nexus-encounter-node');
    node.type = 'button';
    node.dataset.encounterIndex = String(index);
    node.setAttribute('aria-label', `Show ${encounter.name}`);
    node.append(el('span', '', `Instance ${twoDigits(index + 1)}`), el('strong', '', encounter.name));
    return node;
  };

  const panels = encounters.map(createPanel);
  const nodes = encounters.map(createNode);
  panelRoot.replaceChildren(...panels);
  rail.replaceChildren(...nodes);
  if (totalNode) totalNode.textContent = twoDigits(encounters.length);

  let activeIndex = Math.max(0, encounterIds.findIndex(id => `#${id}` === location.hash));
  if (activeIndex < 0) activeIndex = 0;
  let transitioning = false;
  let queuedDirection = 0;
  let wheelTotal = 0;
  let lastWheelAt = 0;
  let lastCommitAt = -Infinity;
  let lastDirection = 0;
  let gestureTimer = 0;
  let touchStartY = null;
  let touchPointerId = null;
  let lastTrigger = null;

  const syncHash = index => {
    const id = encounterIds[index];
    if (!id || location.hash === `#${id}`) return;
    try { history.replaceState(null, '', `#${id}`); } catch { /* progressive enhancement */ }
  };

  const finishTransition = () => {
    transitioning = false;
    stage.classList.remove('is-transitioning');
    if (!queuedDirection) return;
    const direction = queuedDirection;
    queuedDirection = 0;
    requestAnimationFrame(() => step(direction));
  };

  const setActive = (index, options = {}) => {
    const next = Math.max(0, Math.min(encounters.length - 1, Number(index) || 0));
    if (next === activeIndex && options.force !== true) return false;
    activeIndex = next;

    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === activeIndex;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    nodes.forEach((node, nodeIndex) => {
      if (nodeIndex === activeIndex) node.setAttribute('aria-current', 'true');
      else node.removeAttribute('aria-current');
    });
    if (currentNode) currentNode.textContent = twoDigits(activeIndex + 1);
    if (options.syncHash !== false) syncHash(activeIndex);

    transitioning = !reducedMotion.matches;
    stage.classList.toggle('is-transitioning', transitioning);
    clearTimeout(setActive.transitionTimer);
    if (transitioning) setActive.transitionTimer = setTimeout(finishTransition, TRANSITION_MS);
    else finishTransition();
    return true;
  };

  const step = direction => {
    const normalized = direction > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(encounters.length - 1, activeIndex + normalized));
    if (next === activeIndex) return false;
    if (transitioning) {
      queuedDirection = normalized;
      return false;
    }
    return setActive(next);
  };

  nodes.forEach((node, index) => node.addEventListener('click', () => {
    queuedDirection = 0;
    transitioning = false;
    clearTimeout(setActive.transitionTimer);
    setActive(index, { force: true });
  }));

  const normalizeWheel = event => {
    const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1;
    return event.deltaY * unit;
  };

  const commitWheelGesture = direction => {
    const now = performance.now();
    const residual = now - lastCommitAt < INERTIA_WINDOW_MS && direction === lastDirection;
    if (residual) return;
    lastCommitAt = now;
    lastDirection = direction;
    step(direction);
  };

  const resetWheelGesture = () => {
    wheelTotal = 0;
    lastWheelAt = 0;
  };

  stage.addEventListener('wheel', event => {
    if (dialog?.open) return;
    event.preventDefault();
    const now = performance.now();
    const delta = normalizeWheel(event);
    const direction = Math.sign(delta);
    if (!direction) return;

    if (lastWheelAt && now - lastWheelAt > GESTURE_GAP_MS) wheelTotal = 0;
    if (wheelTotal && Math.sign(wheelTotal) !== direction) wheelTotal = 0;
    lastWheelAt = now;
    wheelTotal += delta;

    clearTimeout(gestureTimer);
    gestureTimer = setTimeout(resetWheelGesture, GESTURE_GAP_MS + 20);
    if (Math.abs(wheelTotal) < WHEEL_THRESHOLD) return;

    wheelTotal = 0;
    commitWheelGesture(direction);
  }, { passive: false });

  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('button,a')) return;
    touchStartY = event.clientY;
    touchPointerId = event.pointerId;
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener('pointerup', event => {
    if (event.pointerId !== touchPointerId || touchStartY === null) return;
    const delta = event.clientY - touchStartY;
    touchStartY = null;
    touchPointerId = null;
    if (Math.abs(delta) >= 44) step(delta < 0 ? 1 : -1);
  });

  stage.addEventListener('pointercancel', () => {
    touchStartY = null;
    touchPointerId = null;
  });

  stage.addEventListener('keydown', event => {
    if (dialog?.open) return;
    if (['ArrowDown', 'PageDown'].includes(event.key)) { event.preventDefault(); step(1); }
    else if (['ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); step(-1); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0, { force: true }); }
    else if (event.key === 'End') { event.preventDefault(); setActive(encounters.length - 1, { force: true }); }
  });

  const openDetails = (encounter, index, trigger) => {
    if (!(dialog instanceof HTMLDialogElement)) return;
    const id = encounterIds[index];
    const shell = el('div', 'nexus-encounter-dialog-shell');
    const visual = el('div', 'nexus-encounter-dialog-visual');
    const visualSource = id === 'abyss-astral' ? media.abyss : media[id];
    if (visualSource?.source) visual.appendChild(imageFor(visualSource.source, ''));

    const body = el('div', 'nexus-encounter-dialog-body');
    const close = el('button', 'nexus-encounter-dialog-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close encounter details');
    close.addEventListener('click', () => dialog.close());
    body.append(
      close,
      el('div', 'nexus-encounter-dialog-eyebrow', `Instance ${twoDigits(index + 1)} · ${encounter.format}`),
      el('h2', '', encounter.name),
      el('p', 'nexus-encounter-dialog-summary', copy[id] || '')
    );

    const ladder = el('div', 'nexus-encounter-dialog-ladder');
    (encounter.difficulties || []).forEach((difficulty, difficultyIndex) => {
      const row = el('div', 'nexus-encounter-dialog-tier');
      row.append(el('span', '', `${twoDigits(difficultyIndex + 1)} · ${difficulty.name}`), el('strong', '', difficulty.unlock));
      ladder.appendChild(row);
    });
    body.appendChild(ladder);

    const actions = el('div', 'nexus-encounter-dialog-actions');
    const guide = el('a', 'button primary', 'Open Nexus Guide');
    guide.href = 'guide-nexus.html';
    actions.appendChild(guide);
    body.appendChild(actions);
    shell.append(visual, body);
    dialog.replaceChildren(shell);
    lastTrigger = trigger;
    dialog.showModal();
  };

  panelRoot.addEventListener('click', event => {
    const trigger = event.target.closest('[data-nexus-investigate]');
    if (!(trigger instanceof HTMLButtonElement)) return;
    const index = encounterIds.indexOf(trigger.dataset.nexusInvestigate);
    if (index >= 0) openDetails(encounters[index], index, trigger);
  });

  if (dialog instanceof HTMLDialogElement) {
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => lastTrigger?.focus?.());
  }

  addEventListener('hashchange', () => {
    const index = encounterIds.findIndex(id => `#${id}` === location.hash);
    if (index >= 0 && index !== activeIndex) setActive(index, { syncHash: false, force: true });
  });

  setActive(activeIndex, { syncHash: location.hash.length > 1, force: true });
})();
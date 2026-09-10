(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const network = window.PIXEL_NETWORK_PUBLIC || {};

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  // Same-origin URLs may follow the page's local development scheme. Any external
  // browser destination must be HTTPS; data files cannot widen that boundary to HTTP.
  const safePublicUrl = value => {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, window.location.href);
      const sameOrigin = url.origin === window.location.origin;
      if (sameOrigin && ['http:', 'https:'].includes(url.protocol)) return url.href;
      if (window.location.protocol === 'file:' && url.protocol === 'file:') return url.href;
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  };

  if (!document.querySelector('link[data-play-modal-styles], link[href="play-modal.css"]')) {
    const modalStyles = document.createElement('link');
    modalStyles.rel = 'stylesheet';
    modalStyles.href = 'play-modal.css';
    modalStyles.dataset.playModalStyles = '';
    document.head.appendChild(modalStyles);
  }

  const readPath = path => path.split('.').reduce((value, key) => value?.[key], network);

  // Public product data is rendered from data/network.js so repeated figures stay consistent.
  $$('[data-network]').forEach(node => {
    const value = readPath(node.dataset.network);
    if (value !== undefined && value !== null) node.textContent = String(value);
  });
  $$('[data-network-progress]').forEach(node => {
    const value = Number(readPath(node.dataset.networkProgress));
    if (!Number.isFinite(value)) return;
    const bounded = Math.max(0, Math.min(100, value));
    if (node instanceof HTMLProgressElement) {
      node.max = 100;
      node.value = bounded;
    }
    node.setAttribute('aria-valuemin', '0');
    node.setAttribute('aria-valuemax', '100');
    node.setAttribute('aria-valuenow', String(bounded));
  });
  $$('[data-store-url]').forEach(link => {
    const storeUrl = safePublicUrl(network?.store?.url);
    if (storeUrl) {
      link.href = storeUrl;
      link.removeAttribute('aria-disabled');
      return;
    }
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
  });

  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // Mobile navigation: no animation library, no continuous listeners.
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  navToggle?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(Boolean(open)));
  });
  $$('#navLinks a').forEach(link => link.addEventListener('click', () => {
    navLinks?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // There is deliberately no concrete fallback here. The public data model owns the
  // server address; if it is unavailable, the UI fails closed instead of drifting.
  const serverIp = String(network?.server?.ip ?? '').trim();
  const hasServerIp = Boolean(serverIp);

  async function copyServerIp(button = null) {
    if (!hasServerIp) {
      showToast('Server address unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(serverIp);
    } catch {
      const input = document.createElement('textarea');
      input.value = serverIp;
      input.setAttribute('readonly', '');
      input.className = 'clipboard-fallback';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

    showToast('Server IP copied');
    const label = button?.querySelector('[data-copy-label]');
    if (label) {
      const original = label.dataset.originalLabel || label.textContent;
      label.dataset.originalLabel = original;
      label.textContent = 'Copied';
      clearTimeout(button._copyResetTimer);
      button._copyResetTimer = setTimeout(() => { label.textContent = original; }, 1500);
    }
  }

  const appendRichText = (parent, parts) => {
    parts.forEach(part => {
      if (typeof part === 'string') {
        parent.appendChild(document.createTextNode(part));
        return;
      }
      const strong = el('strong', '', part.strong || '');
      parent.appendChild(strong);
    });
    return parent;
  };

  const createStep = (number, title, parts) => {
    const article = el('article', 'play-step');
    article.appendChild(el('span', 'play-step-number', number));
    const body = el('div');
    body.appendChild(el('h3', '', title));
    body.appendChild(appendRichText(el('p'), parts));
    article.appendChild(body);
    return { article, body };
  };

  // Play is an onboarding action, not a blind clipboard action. Build the dialog through DOM
  // primitives only: no HTML parsing sink is needed anywhere in the shared runtime.
  const playModal = el('div', 'play-modal');
  playModal.id = 'playModal';
  playModal.hidden = true;
  playModal.setAttribute('aria-hidden', 'true');

  const backdrop = el('div', 'play-modal-backdrop');
  backdrop.dataset.playClose = '';
  backdrop.setAttribute('aria-hidden', 'true');

  const playDialog = el('section', 'play-dialog');
  playDialog.setAttribute('role', 'dialog');
  playDialog.setAttribute('aria-modal', 'true');
  playDialog.setAttribute('aria-labelledby', 'playModalTitle');
  playDialog.setAttribute('aria-describedby', 'playModalDescription');
  playDialog.tabIndex = -1;

  const dialogHeader = el('header', 'play-dialog-header');
  const headerCopy = el('div');
  headerCopy.append(el('span', 'play-dialog-kicker', 'Java Edition · Join guide'));
  const modalTitle = el('h2', '', 'Play Pixel Network');
  modalTitle.id = 'playModalTitle';
  headerCopy.appendChild(modalTitle);
  const closeButton = el('button', 'play-dialog-close', '×');
  closeButton.type = 'button';
  closeButton.dataset.playClose = '';
  closeButton.setAttribute('aria-label', 'Close join guide');
  dialogHeader.append(headerCopy, closeButton);

  const intro = el('p', 'play-dialog-intro', 'Add Pixel Network once and it will stay in your Multiplayer server list for future sessions.');
  intro.id = 'playModalDescription';

  const steps = el('div', 'play-steps');
  steps.setAttribute('aria-label', 'Steps to join Pixel Network');
  steps.appendChild(createStep('1', 'Open Minecraft', [
    'Launch ', { strong: 'Minecraft: Java Edition' }, ' and wait for the main menu.'
  ]).article);
  steps.appendChild(createStep('2', 'Open Multiplayer', [
    'Choose ', { strong: 'Multiplayer' }, ' from the Minecraft main menu.'
  ]).article);
  steps.appendChild(createStep('3', 'Add the server', [
    'In your server list, select ', { strong: 'Add Server' }, '.'
  ]).article);

  const ipStep = createStep('4', 'Paste the server address', [
    'You can name it ', { strong: 'Pixel Network' }, '. Paste this address into ', { strong: 'Server Address' }, '.'
  ]);
  ipStep.article.classList.add('play-step-ip');
  const ipControl = el('button', 'play-ip-control');
  ipControl.type = 'button';
  ipControl.dataset.copyServerIp = '';
  ipControl.setAttribute('aria-label', 'Copy Pixel Network server address');
  const ipCode = el('code');
  ipCode.dataset.playIp = '';
  const ipLabel = el('span', '', 'Copy IP');
  ipLabel.dataset.copyLabel = '';
  ipControl.append(ipCode, ipLabel);
  ipStep.body.appendChild(ipControl);
  steps.appendChild(ipStep.article);

  steps.appendChild(createStep('5', 'Save and join', [
    'Press ', { strong: 'Done' }, ', select Pixel Network from the list, then click ', { strong: 'Join Server' }, '.'
  ]).article);

  const dialogFooter = el('footer', 'play-dialog-footer');
  const address = el('div', 'play-dialog-address');
  address.appendChild(el('span', '', 'Server address'));
  const footerCode = el('code');
  footerCode.dataset.playIp = '';
  address.appendChild(footerCode);

  const dialogActions = el('div', 'play-dialog-actions');
  const footerClose = el('button', 'button secondary', 'Close');
  footerClose.type = 'button';
  footerClose.dataset.playClose = '';
  const footerCopy = el('button', 'button primary');
  footerCopy.type = 'button';
  footerCopy.dataset.copyServerIp = '';
  const footerCopyLabel = el('span', '', 'Copy Server IP');
  footerCopyLabel.dataset.copyLabel = '';
  footerCopy.appendChild(footerCopyLabel);
  dialogActions.append(footerClose, footerCopy);
  dialogFooter.append(address, dialogActions);

  playDialog.append(dialogHeader, intro, steps, dialogFooter);
  playModal.append(backdrop, playDialog);
  document.body.appendChild(playModal);
  $$('[data-play-ip]', playModal).forEach(node => { node.textContent = hasServerIp ? serverIp : 'Unavailable'; });
  $$('[data-copy-server-ip]', playModal).forEach(button => {
    if (!hasServerIp) {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
    }
  });

  let lastPlayTrigger = null;
  let closeModalTimer = null;

  const modalFocusable = () => $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', playDialog)
    .filter(node => !node.hidden && node.offsetParent !== null);

  function openPlayModal(trigger) {
    clearTimeout(closeModalTimer);
    lastPlayTrigger = trigger || document.activeElement;
    navLinks?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');

    playModal.hidden = false;
    playModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('play-modal-open');
    requestAnimationFrame(() => {
      playModal.classList.add('is-open');
      closeButton.focus();
    });
  }

  function closePlayModal() {
    if (playModal.hidden) return;
    playModal.classList.remove('is-open');
    playModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('play-modal-open');
    closeModalTimer = setTimeout(() => {
      if (!playModal.classList.contains('is-open')) playModal.hidden = true;
    }, 180);
    if (lastPlayTrigger instanceof HTMLElement) lastPlayTrigger.focus({ preventScroll: true });
  }

  // Legacy data-copy-ip hooks are now Play triggers. Actual clipboard actions live inside the guide.
  $$('[data-copy-ip]').forEach(button => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'playModal');
    if (!button.getAttribute('aria-label') || /copy/i.test(button.getAttribute('aria-label'))) {
      button.setAttribute('aria-label', 'Open Pixel Network join guide');
    }
    button.addEventListener('click', event => {
      event.preventDefault();
      openPlayModal(button);
    });
  });

  $$('[data-copy-server-ip]', playModal).forEach(button => button.addEventListener('click', () => copyServerIp(button)));
  $$('[data-play-close]', playModal).forEach(control => control.addEventListener('click', closePlayModal));

  document.addEventListener('keydown', event => {
    if (playModal.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePlayModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = modalFocusable();
    if (!focusable.length) {
      event.preventDefault();
      playDialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Reveal work starts before content reaches the viewport so scrolling never pays the first paint cost.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '240px 0px 180px 0px', threshold: 0.01 });
    $$('.reveal').forEach(node => revealObserver.observe(node));
  } else {
    $$('.reveal').forEach(node => node.classList.add('visible'));
  }

  // Worlds: hidden panels keep their remote images unloaded until selected.
  const worldTabs = $$('.world-tab');
  const worldPanels = $$('.world-panel');
  function activateWorld(id) {
    worldTabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.world === id)));
    worldPanels.forEach(panel => {
      const active = panel.dataset.worldPanel === id;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
      if (active) {
        const img = $('img[data-src]', panel);
        if (img?.dataset.src) {
          const source = safePublicUrl(img.dataset.src);
          if (source) img.src = source;
          img.removeAttribute('data-src');
        }
      }
    });
  }
  worldTabs.forEach(tab => tab.addEventListener('click', () => activateWorld(tab.dataset.world)));

  // Server status is deliberately deferred until the browser is idle.
  const statusText = $('#serverStatusText');
  const playerCount = $('#playerCount');
  const statusDot = $('#serverStatusDot');

  function paintStatus(online, current = 0, max = 0) {
    if (statusDot) statusDot.classList.toggle('off', !online);
    if (statusText) statusText.textContent = online ? `Online · ${current}/${max}` : 'Status unavailable';
    if (playerCount) playerCount.textContent = online ? String(current) : '—';
  }

  async function fetchStatus() {
    if (!statusText && !playerCount && !statusDot) return;
    if (!hasServerIp) {
      paintStatus(false);
      return;
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(serverIp)}`, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error('status request failed');
      const data = await response.json();
      paintStatus(Boolean(data?.online), data?.players?.online ?? 0, data?.players?.max ?? 0);
    } catch {
      paintStatus(false);
    }
  }

  const scheduleStatus = () => {
    if (!statusText && !playerCount && !statusDot) return;
    fetchStatus();
    if (hasServerIp) setInterval(fetchStatus, 120000);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(scheduleStatus, { timeout: 2500 });
  } else {
    setTimeout(scheduleStatus, 1200);
  }
})();
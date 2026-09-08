(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const network = window.PIXEL_NETWORK_PUBLIC || {};

  if (!document.querySelector('link[data-play-modal-styles]')) {
    const modalStyles = document.createElement('link');
    modalStyles.rel = 'stylesheet';
    modalStyles.href = 'play-modal.css';
    modalStyles.dataset.playModalStyles = '';
    document.head.appendChild(modalStyles);
  }

  const readPath = (path) => path.split('.').reduce((value, key) => value?.[key], network);

  // Public product data is rendered from data/network.js so repeated figures stay consistent.
  $$('[data-network]').forEach(el => {
    const value = readPath(el.dataset.network);
    if (value !== undefined && value !== null) el.textContent = String(value);
  });
  $$('[data-network-progress]').forEach(el => {
    const value = Number(readPath(el.dataset.networkProgress));
    if (Number.isFinite(value)) el.style.setProperty('--progress', `${Math.max(0, Math.min(100, value))}%`);
  });
  $$('[data-store-url]').forEach(link => {
    if (network?.store?.url) link.href = network.store.url;
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

  const serverIp = network?.server?.ip || 'pixelboxxx.minehut.gg';

  async function copyServerIp(button = null) {
    try {
      await navigator.clipboard.writeText(serverIp);
    } catch {
      const input = document.createElement('textarea');
      input.value = serverIp;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
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

  // Play is an onboarding action, not a blind clipboard action. The modal is generated once
  // so every Play control across PixelWeb follows the same join flow without duplicating markup.
  const playModal = document.createElement('div');
  playModal.className = 'play-modal';
  playModal.id = 'playModal';
  playModal.hidden = true;
  playModal.setAttribute('aria-hidden', 'true');
  playModal.innerHTML = `
    <div class="play-modal-backdrop" data-play-close aria-hidden="true"></div>
    <section class="play-dialog" role="dialog" aria-modal="true" aria-labelledby="playModalTitle" aria-describedby="playModalDescription" tabindex="-1">
      <header class="play-dialog-header">
        <div>
          <span class="play-dialog-kicker">Java Edition · Join guide</span>
          <h2 id="playModalTitle">Play Pixel Network</h2>
        </div>
        <button class="play-dialog-close" type="button" data-play-close aria-label="Close join guide">×</button>
      </header>

      <p class="play-dialog-intro" id="playModalDescription">Add Pixel Network once and it will stay in your Multiplayer server list for future sessions.</p>

      <div class="play-steps" aria-label="Steps to join Pixel Network">
        <article class="play-step">
          <span class="play-step-number">1</span>
          <div><h3>Open Minecraft</h3><p>Launch <strong>Minecraft: Java Edition</strong> and wait for the main menu.</p></div>
        </article>
        <article class="play-step">
          <span class="play-step-number">2</span>
          <div><h3>Open Multiplayer</h3><p>Choose <strong>Multiplayer</strong> from the Minecraft main menu.</p></div>
        </article>
        <article class="play-step">
          <span class="play-step-number">3</span>
          <div><h3>Add the server</h3><p>In your server list, select <strong>Add Server</strong>.</p></div>
        </article>
        <article class="play-step play-step-ip">
          <span class="play-step-number">4</span>
          <div>
            <h3>Paste the server address</h3>
            <p>You can name it <strong>Pixel Network</strong>. Paste this address into <strong>Server Address</strong>.</p>
            <button class="play-ip-control" type="button" data-copy-server-ip aria-label="Copy Pixel Network server address">
              <code data-play-ip></code><span data-copy-label>Copy IP</span>
            </button>
          </div>
        </article>
        <article class="play-step">
          <span class="play-step-number">5</span>
          <div><h3>Save and join</h3><p>Press <strong>Done</strong>, select Pixel Network from the list, then click <strong>Join Server</strong>.</p></div>
        </article>
      </div>

      <footer class="play-dialog-footer">
        <div class="play-dialog-address"><span>Server address</span><code data-play-ip></code></div>
        <div class="play-dialog-actions">
          <button class="button secondary" type="button" data-play-close>Close</button>
          <button class="button primary" type="button" data-copy-server-ip><span data-copy-label>Copy Server IP</span></button>
        </div>
      </footer>
    </section>`;
  document.body.appendChild(playModal);
  $$('[data-play-ip]', playModal).forEach(el => { el.textContent = serverIp; });

  const playDialog = $('.play-dialog', playModal);
  let lastPlayTrigger = null;
  let closeModalTimer = null;

  const modalFocusable = () => $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', playDialog)
    .filter(el => !el.hidden && el.offsetParent !== null);

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
      $('.play-dialog-close', playModal)?.focus();
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
  $$('[data-copy-ip]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    openPlayModal(button);
  }));

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
      playDialog?.focus();
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
    $$('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('visible'));
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
          img.src = img.dataset.src;
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
    setInterval(fetchStatus, 120000);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(scheduleStatus, { timeout: 2500 });
  } else {
    setTimeout(scheduleStatus, 1200);
  }
})();

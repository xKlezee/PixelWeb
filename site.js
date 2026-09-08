(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const network = window.PIXEL_NETWORK_PUBLIC || {};

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

  // Every Play / IP control uses the same public server address.
  const copyButtons = $$('[data-copy-ip]');
  copyButtons.forEach(button => button.addEventListener('click', async () => {
    const ip = button.dataset.ip || network?.server?.ip || 'pixelboxxx.minehut.gg';
    try {
      await navigator.clipboard.writeText(ip);
      showToast('Server IP copied');
    } catch {
      const input = document.createElement('textarea');
      input.value = ip;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      showToast('Server IP copied');
    }
  }));

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
      const serverIp = network?.server?.ip || 'pixelboxxx.minehut.gg';
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

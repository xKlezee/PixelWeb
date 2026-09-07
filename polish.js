(() => {
  const nav = document.querySelector('.site-nav');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  let scheduled = false;
  const updateScrollState = () => {
    scheduled = false;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, y / max))})`;
    nav?.classList.toggle('is-scrolled', y > 18);
  };

  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateScrollState);
  };

  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  updateScrollState();

  const seen = new Set();
  const prefetch = href => {
    if (!href || seen.has(href)) return;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
    seen.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    document.head.appendChild(link);
  };

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    link.addEventListener('pointerenter', () => prefetch(href), { passive: true, once: true });
    link.addEventListener('focus', () => prefetch(href), { passive: true, once: true });
  });

  if (!reducedMotion) {
    document.querySelectorAll('.detail-card, .system-card, .person').forEach(card => {
      card.addEventListener('pointermove', event => {
        if (matchMedia('(pointer: coarse)').matches) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--mx', `${x * 4}px`);
        card.style.setProperty('--my', `${y * 4}px`);
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      }, { passive: true });
    });
  }
})();

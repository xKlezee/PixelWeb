(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const worldsMedia = window.PIXEL_WORLDS_MEDIA || {};
  const nexusMedia = window.PIXEL_NEXUS_MEDIA || {};
  const worldHost = document.querySelector('[data-home-world-media]');
  const nexusHost = document.querySelector('[data-home-nexus-media]');

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const sizedImage = (source, width = 720) => {
    if (!source) return '';
    const value = String(source).trim();
    if (/^(?:assets\/|\.\/|\.\.\/)/.test(value)) return value;
    try {
      const url = new URL(value, location.href);
      const sameOrigin = url.origin === location.origin;
      if (!sameOrigin && url.protocol !== 'https:') return '';
      if (sameOrigin && !['http:', 'https:'].includes(url.protocol)) {
        if (!(location.protocol === 'file:' && url.protocol === 'file:')) return '';
      }
      if (url.protocol === 'https:') {
        url.searchParams.set('width', String(width));
        url.searchParams.set('dpr', '1');
        url.searchParams.set('quality', '84');
      }
      return url.toString();
    } catch {
      return '';
    }
  };

  const markBelowFoldImage = img => {
    img.loading = 'lazy';
    img.decoding = 'async';
    img.fetchPriority = 'low';
  };

  if (worldHost) {
    const worlds = Array.isArray(network.worlds) ? network.worlds : [];
    const figures = worlds.flatMap(world => {
      const visual = worldsMedia[world.id] || {};
      const source = sizedImage(visual.source);
      if (!source) return [];

      const figure = el('figure', 'home-world-shot');
      figure.dataset.world = world.id || '';
      const img = el('img');
      markBelowFoldImage(img);
      if (/^https:\/\//i.test(source)) img.referrerPolicy = 'no-referrer';
      img.src = source;
      img.alt = visual.alt || `${world.name || 'Pixel Network world'} landscape`;
      img.width = 720;
      img.height = 405;
      figure.append(img, el('figcaption', '', world.name || 'World'));
      return [figure];
    });
    worldHost.replaceChildren(...figures);
  }

  if (nexusHost) {
    const source = sizedImage(nexusMedia.hero?.source, 960);
    if (!source) {
      nexusHost.replaceChildren();
      return;
    }

    const figure = el('figure', 'home-nexus-shot');
    const img = el('img');
    markBelowFoldImage(img);
    if (/^https:\/\//i.test(source)) img.referrerPolicy = 'no-referrer';
    img.src = source;
    img.alt = nexusMedia.hero?.alt || 'Nexus threshold';
    img.width = 960;
    img.height = 720;
    figure.appendChild(img);
    nexusHost.replaceChildren(figure);
  }
})();
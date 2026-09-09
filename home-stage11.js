(() => {
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
    const value = String(source);
    if (/^(?:assets\/|\.\/|\.\.\/)/.test(value)) return value;
    try {
      const url = new URL(value, location.href);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      url.searchParams.set('width', String(width));
      url.searchParams.set('dpr', '1');
      url.searchParams.set('quality', '84');
      return url.toString();
    } catch {
      return '';
    }
  };

  if (worldHost) {
    const worlds = [
      ['overworld', 'Overworld'],
      ['pirate', 'Pirate Kingdom'],
      ['nether', 'Nether'],
      ['winter', 'Winter']
    ];

    const figures = worlds.flatMap(([id, name]) => {
      const visual = worldsMedia[id] || {};
      const source = sizedImage(visual.source);
      if (!source) return [];

      const figure = el('figure', 'home-world-shot');
      figure.dataset.world = id;
      const img = el('img');
      img.src = source;
      img.alt = visual.alt || `${name} landscape`;
      img.width = 720;
      img.height = 405;
      img.loading = 'lazy';
      img.decoding = 'async';
      figure.append(img, el('figcaption', '', name));
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
    img.src = source;
    img.alt = nexusMedia.hero?.alt || 'Nexus threshold';
    img.width = 960;
    img.height = 720;
    img.loading = 'lazy';
    img.decoding = 'async';
    figure.appendChild(img);
    nexusHost.replaceChildren(figure);
  }
})();

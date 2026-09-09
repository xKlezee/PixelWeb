(() => {
  const worldsMedia = window.PIXEL_WORLDS_MEDIA || {};
  const nexusMedia = window.PIXEL_NEXUS_MEDIA || {};
  const worldHost = document.querySelector('[data-home-world-media]');
  const nexusHost = document.querySelector('[data-home-nexus-media]');

  const sizedImage = (source, width = 720) => {
    if (!source || /^(?:assets\/|\.\/|\.\.\/)/.test(source)) return source || '';
    try {
      const url = new URL(source, location.href);
      url.searchParams.set('width', String(width));
      url.searchParams.set('dpr', '1');
      url.searchParams.set('quality', '84');
      return url.toString();
    } catch {
      return source;
    }
  };

  if (worldHost) {
    const worlds = [
      ['overworld', 'Overworld'],
      ['pirate', 'Pirate Kingdom'],
      ['nether', 'Nether'],
      ['winter', 'Winter']
    ];

    worldHost.innerHTML = worlds.map(([id, name]) => {
      const visual = worldsMedia[id] || {};
      if (!visual.source) return '';
      return `<figure class="home-world-shot" data-world="${id}">
        <img src="${sizedImage(visual.source)}" alt="${visual.alt || `${name} landscape`}" width="720" height="405" loading="lazy" decoding="async">
        <figcaption>${name}</figcaption>
      </figure>`;
    }).join('');
  }

  if (nexusHost && nexusMedia.hero?.source) {
    nexusHost.innerHTML = `<figure class="home-nexus-shot">
      <img src="${nexusMedia.hero.source}" alt="${nexusMedia.hero.alt || 'Nexus threshold'}" width="960" height="720" loading="lazy" decoding="async">
    </figure>`;
  }
})();
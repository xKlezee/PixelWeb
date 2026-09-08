(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const worlds = Array.isArray(network.worlds) ? network.worlds : [];
  const nexus = network.nexus || {};

  const journey = document.querySelector('[data-world-visual-grid]');
  const showcase = document.querySelector('[data-world-showcase-list]');
  if (!journey && !showcase) return;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const sceneImage = (world, index, className = '') => {
    const src = world?.media?.scene;
    if (!src) return '';
    const loading = index === 0 ? 'eager' : 'lazy';
    const priority = index === 0 ? ' fetchpriority="high"' : '';
    return `<img class="${className}" src="${esc(src)}" alt="${esc(`Pixel Network ${world.name}`)}" loading="${loading}" decoding="async"${priority} data-world-scene>`;
  };

  const bossFigure = (name, src, label, className = '') => {
    if (!name || !src) return '';
    return `
      <figure class="world-boss-figure ${className}">
        <img src="${esc(src)}" alt="${esc(`${name} visual placeholder`)}" loading="lazy" decoding="async">
        <figcaption><small>${esc(label)}</small><strong>${esc(name)}</strong></figcaption>
      </figure>`;
  };

  const card = (world, index) => {
    const optional = world.optionalEncounter && world.media?.optionalBossImage
      ? bossFigure(world.optionalEncounter, world.media.optionalBossImage, 'Optional encounter', 'is-optional')
      : '';
    const bossLabel = world.id === 'winter' ? 'World Boss' : 'Required World Boss';
    const winterNote = world.id === 'winter'
      ? '<div class="world-exception-note"><span aria-hidden="true">i</span><p>Viking remains Winter’s World Boss, but <strong>does not gate Nexus access</strong>.</p></div>'
      : '';

    return `
      <article class="world-visual-card theme-${esc(world.media?.theme || world.id)}" data-world-card="${esc(world.id)}">
        <div class="world-card-media">
          ${sceneImage(world, index, 'world-card-scene')}
          <div class="world-card-shade"></div>
          <div class="world-card-index">${String(index + 1).padStart(2, '0')} / ${esc(world.role)}</div>
          <div class="world-card-title"><h3>${esc(world.name)}</h3><span>${esc(world.role)}</span></div>
        </div>
        <div class="world-card-body">
          <div class="world-card-stat"><span>Role</span><strong>${esc(world.role)}</strong></div>
          <div class="world-card-stat"><span>Mines</span><strong>${esc(world.mines)}</strong></div>
          <div class="world-boss-stack">
            ${bossFigure(world.boss, world.media?.bossImage, bossLabel)}
            ${optional}
          </div>
          ${winterNote}
          <div class="world-card-gate"><small>Next gate</small><strong>${esc(world.nextGate)}</strong></div>
        </div>
      </article>`;
  };

  if (journey) {
    journey.innerHTML = worlds.map(card).join('') + `
      <article class="world-visual-card world-nexus-card theme-nexus">
        <div class="world-card-media">
          <img class="world-card-scene" src="${esc(nexus?.media?.teaserImage || 'assets/worlds/nexus-portal.svg')}" alt="Nexus endgame portal" loading="lazy" decoding="async">
          <div class="world-card-shade"></div>
          <div class="world-card-index">05 / NEXT CHAPTER</div>
          <div class="world-card-title"><h3>Nexus</h3><span>Endgame</span></div>
        </div>
        <div class="world-card-body nexus-card-body">
          <small>Endgame begins at</small>
          <strong>${esc(nexus.unlock || 'Prestige IV')}</strong>
          <p>Permanent access once unlocked. The progression model then shifts into Instance difficulty tiers.</p>
          <a class="button secondary" href="nexus.html">Explore Nexus</a>
        </div>
      </article>`;
  }

  if (showcase) {
    showcase.innerHTML = worlds.map((world, index) => {
      const details = [
        `<li><strong>${esc(world.mines)}</strong> mines</li>`,
        `<li>${world.id === 'winter' ? 'World Boss' : 'Progression World Boss'}: <strong>${esc(world.boss)}</strong></li>`,
        world.optionalEncounter ? `<li>Optional encounter: <strong>${esc(world.optionalEncounter)}</strong></li>` : '',
        `<li>Entry: <strong>${esc(world.unlock)}</strong></li>`,
        `<li>Next: <strong>${esc(world.nextGate)}</strong></li>`
      ].filter(Boolean).join('');

      return `
        <article class="world-story-row theme-${esc(world.media?.theme || world.id)} reveal">
          <div class="world-story-media">
            ${sceneImage(world, index, 'world-story-scene')}
            <div class="world-story-boss">${bossFigure(world.boss, world.media?.bossImage, world.id === 'winter' ? 'World Boss' : 'Progression boss')}</div>
          </div>
          <div class="world-story-copy">
            <span class="tag">${String(index + 1).padStart(2, '0')} / ${esc(world.role)}</span>
            <h2>${esc(world.name)}</h2>
            <p>${esc(world.summary)}</p>
            <ul>${details}</ul>
            ${world.id === 'winter' ? '<p class="world-story-note"><strong>Nexus exception:</strong> Prestige IV is enough; Viking is not a Nexus access requirement.</p>' : ''}
          </div>
        </article>`;
    }).join('');
  }

  document.querySelectorAll('[data-world-scene]').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('.world-card-media, .world-story-media')?.classList.add('is-fallback');
      img.hidden = true;
    }, { once: true });
  });
})();
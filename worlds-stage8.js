(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const media = window.PIXEL_WORLDS_MEDIA || {};
  const rail = document.querySelector('[data-worlds-visual-rail]');
  const progress = document.querySelector('[data-worlds-progress]');
  const bossStrip = document.querySelector('[data-worlds-boss-strip]');

  if (!rail || !Array.isArray(network.worlds)) return;

  const descriptions = {
    overworld: 'The foundation of the shared route: mining, equipment, economy and combat establish the language used by every later stage.',
    pirate: 'The first expansion stage, where the required HollowKeeper and optional Kraken deliberately serve different progression roles.',
    nether: 'Pressure rises without resetting the account. Eldric becomes the final required boss clear in the current four-world route.',
    winter: 'The last current world before endgame access. Viking remains its World Boss, but Prestige IV—not a Viking clear—opens Nexus.'
  };

  const imageUrl = (source, width) => {
    if (!source) return '';
    try {
      const url = new URL(source, location.href);
      url.searchParams.set('width', String(width));
      url.searchParams.set('dpr', '1');
      url.searchParams.set('quality', width >= 1000 ? '86' : '82');
      return url.toString();
    } catch {
      return source;
    }
  };

  const statRow = (label, value, accent = false) => `
    <div class="worlds-stat"><span>${label}</span><strong${accent ? ' class="accent"' : ''}>${value}</strong></div>`;

  const worldCard = (world, index) => {
    const visual = media[world.id] || {};
    const optional = world.optionalEncounter
      ? statRow('Optional', world.optionalEncounter, true)
      : '';
    const note = world.id === 'winter'
      ? '<div class="worlds-card-note">Viking is a World Boss, but it is not required for Nexus access.</div>'
      : '';
    const picture = visual.source
      ? `<img alt="${visual.alt || `${world.name} landscape`}" width="960" height="540" decoding="async"
          ${index === 0 ? `src="${imageUrl(visual.source, 960)}" srcset="${imageUrl(visual.source, 640)} 640w, ${imageUrl(visual.source, 960)} 960w, ${imageUrl(visual.source, 1280)} 1280w" sizes="(max-width:700px) 82vw, (max-width:1459px) 300px, 20vw" fetchpriority="high"` : `data-src="${imageUrl(visual.source, 960)}" data-srcset="${imageUrl(visual.source, 640)} 640w, ${imageUrl(visual.source, 960)} 960w, ${imageUrl(visual.source, 1280)} 1280w" data-sizes="(max-width:700px) 82vw, (max-width:1459px) 300px, 20vw" loading="lazy"`} />`
      : '';

    return `<article class="worlds-card" data-accent="${visual.accent || 'green'}">
      <div class="worlds-card-media${visual.source ? '' : ' is-fallback'}">
        <span class="worlds-card-index">0${index + 1}</span>${picture}
      </div>
      <div class="worlds-card-body">
        <span class="worlds-card-kicker">${visual.label || world.role}</span>
        <h3>${world.name}</h3>
        <p class="worlds-card-summary">${descriptions[world.id] || ''}</p>
        <div class="worlds-card-stats">
          ${statRow('Role', world.role)}
          ${statRow('Mines', world.mines)}
          ${statRow(world.id === 'pirate' ? 'Main boss' : 'World boss', world.boss, true)}
          ${optional}
          ${statRow('Next gate', world.nextGate)}
        </div>
        ${note}
      </div>
    </article>`;
  };

  const nexusVisual = media.nexus || {};
  const nexusCard = `<article class="worlds-card worlds-card--nexus" data-accent="${nexusVisual.accent || 'violet'}">
    <div class="worlds-card-media is-fallback"><span class="worlds-card-index">05</span></div>
    <div class="worlds-card-body">
      <span class="worlds-card-kicker">${nexusVisual.label || 'The next chapter'}</span>
      <h3>Nexus</h3>
      <p class="worlds-card-summary">Permanent endgame access begins here. The progression model changes from world gates to an Instance difficulty ladder.</p>
      <div class="worlds-card-stats">
        ${statRow('Access', network?.nexus?.unlock || 'Prestige IV', true)}
        ${statRow('Model', network?.nexus?.accessModel || 'Permanent once unlocked')}
        ${statRow('Combat', network?.nexus?.combatLayer || 'Instance progression')}
        ${statRow('Encounters', `${network?.content?.instanceEncounters ?? 3} / ${network?.content?.instanceBosses ?? 4} bosses`)}
      </div>
      <div class="worlds-card-note">Viking is not required. Nexus access starts at Prestige IV and persists once unlocked.</div>
      <div class="worlds-card-action"><a class="button primary" href="nexus.html">Explore Nexus</a></div>
    </div>
  </article>`;

  rail.innerHTML = network.worlds.map(worldCard).join('') + nexusCard;

  const firstImage = rail.querySelector('img[src]');
  if (firstImage) {
    if (firstImage.complete) firstImage.classList.add('is-loaded');
    else firstImage.addEventListener('load', () => firstImage.classList.add('is-loaded'), { once: true });
    firstImage.addEventListener('error', () => firstImage.closest('.worlds-card-media')?.classList.add('is-fallback'), { once: true });
  }

  const deferredImages = [...rail.querySelectorAll('img[data-src]')];
  const hydrateImage = img => {
    if (!img?.dataset.src) return;
    img.src = img.dataset.src;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    if (img.dataset.sizes) img.sizes = img.dataset.sizes;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
    img.removeAttribute('data-sizes');
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    img.addEventListener('error', () => img.closest('.worlds-card-media')?.classList.add('is-fallback'), { once: true });
  };

  if ('IntersectionObserver' in window && deferredImages.length) {
    const imageObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        hydrateImage(entry.target);
        imageObserver.unobserve(entry.target);
      }
    }, { rootMargin: '500px 320px' });
    deferredImages.forEach(img => imageObserver.observe(img));
  } else {
    deferredImages.forEach(hydrateImage);
  }

  if (progress) {
    const steps = [
      ['Start', 'Overworld'],
      ['Prestige I', '+ Beholder'],
      ['Prestige II', '+ HollowKeeper'],
      ['Prestige III', '+ Eldric'],
      ['Prestige IV', 'Nexus access']
    ];
    progress.innerHTML = `<div class="worlds-progress-line" aria-hidden="true"></div><div class="worlds-progress-grid">${steps.map(([title, sub]) => `<div class="worlds-progress-step"><div class="worlds-progress-dot" aria-hidden="true"></div><div><b>${title}</b><span>${sub}</span></div></div>`).join('')}</div>`;
  }

  if (bossStrip) {
    const bosses = [
      ['Overworld · Required', 'Beholder', 'Paired with Prestige I to open Pirate Kingdom.'],
      ['Pirate · Required', 'HollowKeeper', 'Paired with Prestige II to open Nether.'],
      ['Pirate · Optional', 'Kraken', 'A thematic encounter that gates nothing.'],
      ['Nether · Required', 'Eldric', 'Paired with Prestige III to open Winter.'],
      ['Winter · World Boss', 'Viking', 'Important encounter, but not a Nexus requirement.']
    ];
    bossStrip.innerHTML = bosses.map(([label, name, copy]) => `<article class="worlds-boss-item reveal"><small>${label}</small><h3>${name}</h3><p>${copy}</p></article>`).join('');
  }
})();
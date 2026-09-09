(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const media = window.PIXEL_NEXUS_MEDIA || {};
  const nexus = network.nexus || {};
  const encounters = Array.isArray(nexus.instances) ? nexus.instances : [];
  const encounterHost = document.querySelector('[data-nexus-encounters]');
  const ladderHost = document.querySelector('[data-nexus-ladder]');

  const mediaFor = name => {
    const normalized = String(name || '').toLowerCase();
    if (normalized === 'raphael') return [media.raphael].filter(Boolean);
    if (normalized === 'azazel') return [media.azazel].filter(Boolean);
    if (normalized.includes('abyss') && normalized.includes('astral')) return [media.abyss, media.astral].filter(Boolean);
    return [];
  };

  const accentFor = name => {
    const normalized = String(name || '').toLowerCase();
    if (normalized === 'raphael') return 'gold';
    if (normalized === 'azazel') return 'crimson';
    if (normalized.includes('abyss')) return 'dual';
    return 'violet';
  };

  const difficultyCopy = instance => {
    const path = (instance.difficulties || []).map(item => `${item.name} · ${item.unlock}`).join(' → ');
    return path || 'Difficulty path defined by account milestones.';
  };

  const renderVisual = (visual, label = '') => {
    if (!visual?.source) return '';
    return `<figure class="nexus-boss-art">
      <img src="${visual.source}" alt="${visual.alt}" width="1448" height="1086" loading="lazy" decoding="async">
      ${label ? `<figcaption>${label}</figcaption>` : ''}
    </figure>`;
  };

  const renderMedia = instance => {
    const visuals = mediaFor(instance.name);
    if (!visuals.length) return '<div class="nexus-instance-media is-fallback" aria-hidden="true"></div>';
    if (visuals.length === 1) {
      return `<div class="nexus-instance-media">${renderVisual(visuals[0])}</div>`;
    }
    return `<div class="nexus-instance-media nexus-instance-media--dual">
      ${renderVisual(visuals[0], 'Abyss')}
      ${renderVisual(visuals[1], 'Astral')}
    </div>`;
  };

  if (encounterHost) {
    encounterHost.innerHTML = encounters.map((instance, index) => `
      <article class="nexus-instance-card" data-accent="${accentFor(instance.name)}">
        ${renderMedia(instance)}
        <div class="nexus-instance-body">
          <div class="nexus-instance-topline"><span>0${index + 1} / INSTANCE</span><small>${instance.format}</small></div>
          <h3>${instance.name}</h3>
          <p>${instance.name === 'Abyss + Astral'
            ? 'A dual-boss encounter that joins the endgame ladder later and reaches the final current difficulty at Legacy II.'
            : `${instance.name} opens at Easy with the Nexus threshold, then advances through Medium and Hard as the account reaches later milestones.`}</p>
          <div class="nexus-difficulty-chips">${(instance.difficulties || []).map(item => `<span><b>${item.name}</b>${item.unlock}</span>`).join('')}</div>
          <div class="nexus-instance-path">${difficultyCopy(instance)}</div>
        </div>
      </article>`).join('');
  }

  if (ladderHost) {
    const milestoneOrder = [
      nexus.unlock || 'Prestige IV + defeat Viking',
      'Prestige VII',
      'Legacy I',
      'Legacy II'
    ];
    const stageNames = ['Threshold', 'Expansion', 'Legacy', 'Apex'];
    const grouped = new Map(milestoneOrder.map(milestone => [milestone, []]));

    encounters.forEach(instance => {
      (instance.difficulties || []).forEach(difficulty => {
        if (!grouped.has(difficulty.unlock)) grouped.set(difficulty.unlock, []);
        grouped.get(difficulty.unlock).push(`${instance.name} · ${difficulty.name}`);
      });
    });

    ladderHost.innerHTML = milestoneOrder.map((milestone, index) => {
      const unlocked = grouped.get(milestone) || [];
      return `<article class="nexus-ladder-stage">
        <div class="nexus-ladder-marker"><span>0${index + 1}</span></div>
        <div class="nexus-ladder-copy"><small>${stageNames[index]}</small><h3>${milestone}</h3><div class="nexus-ladder-unlocks">${unlocked.map(item => `<span>${item}</span>`).join('')}</div></div>
      </article>`;
    }).join('');
  }
})();
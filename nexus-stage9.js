(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const media = window.PIXEL_NEXUS_MEDIA || {};
  const nexus = network.nexus || {};
  const encounters = Array.isArray(nexus.instances) ? nexus.instances : [];
  const encounterHost = document.querySelector('[data-nexus-encounters]');
  const ladderHost = document.querySelector('[data-nexus-ladder]');

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const safeImageUrl = source => {
    if (!source) return '';
    const value = String(source);
    if (/^(?:assets\/|\.\/|\.\.\/)/.test(value)) return value;
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

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
    const source = safeImageUrl(visual?.source);
    if (!source) return null;
    const figure = el('figure', 'nexus-boss-art');
    const img = el('img');
    img.src = source;
    img.alt = visual?.alt || `${label || 'Nexus encounter'} concept visual`;
    img.width = 1448;
    img.height = 1086;
    img.loading = 'lazy';
    img.decoding = 'async';
    figure.appendChild(img);
    if (label) figure.appendChild(el('figcaption', '', label));
    return figure;
  };

  const renderMedia = instance => {
    const visuals = mediaFor(instance.name);
    if (!visuals.length) {
      const fallback = el('div', 'nexus-instance-media is-fallback');
      fallback.setAttribute('aria-hidden', 'true');
      return fallback;
    }

    const wrap = el('div', visuals.length === 1 ? 'nexus-instance-media' : 'nexus-instance-media nexus-instance-media--dual');
    if (visuals.length === 1) {
      const figure = renderVisual(visuals[0]);
      if (figure) wrap.appendChild(figure);
      return wrap;
    }

    const abyss = renderVisual(visuals[0], 'Abyss');
    const astral = renderVisual(visuals[1], 'Astral');
    if (abyss) wrap.appendChild(abyss);
    if (astral) wrap.appendChild(astral);
    return wrap;
  };

  if (encounterHost) {
    const cards = encounters.map((instance, index) => {
      const article = el('article', 'nexus-instance-card');
      article.dataset.accent = accentFor(instance.name);
      article.appendChild(renderMedia(instance));

      const body = el('div', 'nexus-instance-body');
      const topline = el('div', 'nexus-instance-topline');
      topline.append(el('span', '', `0${index + 1} / INSTANCE`), el('small', '', instance.format || ''));
      body.append(topline, el('h3', '', instance.name || 'Nexus encounter'));

      const description = instance.name === 'Abyss + Astral'
        ? 'A dual-boss encounter that joins the endgame ladder later and reaches the final current difficulty at Legacy II.'
        : `${instance.name} opens at Easy with the Nexus threshold, then advances through Medium and Hard as the account reaches later milestones.`;
      body.appendChild(el('p', '', description));

      const chips = el('div', 'nexus-difficulty-chips');
      (instance.difficulties || []).forEach(item => {
        const chip = el('span');
        chip.append(el('b', '', item.name || ''), document.createTextNode(item.unlock || ''));
        chips.appendChild(chip);
      });
      body.append(chips, el('div', 'nexus-instance-path', difficultyCopy(instance)));
      article.appendChild(body);
      return article;
    });
    encounterHost.replaceChildren(...cards);
  }

  if (ladderHost) {
    const milestoneOrder = [
      nexus.unlock || 'Prestige IV',
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

    const stages = milestoneOrder.map((milestone, index) => {
      const article = el('article', 'nexus-ladder-stage');
      const marker = el('div', 'nexus-ladder-marker');
      marker.appendChild(el('span', '', `0${index + 1}`));

      const copy = el('div', 'nexus-ladder-copy');
      copy.append(el('small', '', stageNames[index] || 'Stage'), el('h3', '', milestone));
      const unlocks = el('div', 'nexus-ladder-unlocks');
      (grouped.get(milestone) || []).forEach(item => unlocks.appendChild(el('span', '', item)));
      copy.appendChild(unlocks);
      article.append(marker, copy);
      return article;
    });
    ladderHost.replaceChildren(...stages);
  }
})();

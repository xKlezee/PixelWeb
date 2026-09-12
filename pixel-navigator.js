(() => {
  'use strict';

  if (document.querySelector('[data-pixel-navigator-root]')) return;

  const DESTINATIONS = Object.freeze([...(window.PIXEL_NAV_DESTINATIONS || [])]);

  const STOP_WORDS = new Set([
    'a','an','and','are','can','do','find','for','from','go','how','i','in','is','it','me','of','on','please','show','the','to','want','what','where','which','with',
    'a','al','como','cual','cuales','de','del','donde','el','en','es','esta','hay','ir','la','las','lo','los','me','para','por','puedo','que','quiero','se','un','una','ver'
  ]);
  const RANKING_WORDS = new Set(['leaderboard','leaderboards','ranking','rankings','top','record','records','clasificacion','clasificaciones']);

  const normalize = value => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  const tokenize = value => normalize(value)
    .split(' ')
    .filter(token => token && !STOP_WORDS.has(token));

  const INDEX = DESTINATIONS.map((destination, order) => {
    const title = normalize(destination.title);
    const section = normalize(destination.section);
    const description = normalize(destination.description);
    const aliases = (destination.aliases || []).map(normalize).filter(Boolean);
    const titleTokens = new Set(tokenize(destination.title));
    const sectionTokens = new Set(tokenize(destination.section));
    const descriptionTokens = new Set(tokenize(destination.description));
    const aliasTokens = new Set(aliases.flatMap(tokenize));
    return { ...destination, order, titleNorm:title, sectionNorm:section, descriptionNorm:description, aliasesNorm:aliases, titleTokens, sectionTokens, descriptionTokens, aliasTokens };
  });

  const scoreDestination = (entry, rawQuery) => {
    const query = normalize(rawQuery);
    const tokens = tokenize(rawQuery);
    if (!query || !tokens.length) return 0;

    let score = 0;
    if (query === entry.titleNorm) score += 120;
    else if (entry.titleNorm.includes(query) && query.length >= 4) score += 38;
    else if (query.includes(entry.titleNorm) && entry.titleNorm.length >= 4) score += 56;

    entry.aliasesNorm.forEach(alias => {
      if (query === alias) score += 105;
      else if (alias.length >= 3 && query.includes(alias)) score += 48;
      else if (query.length >= 4 && alias.includes(query)) score += 22;
    });

    tokens.forEach(token => {
      if (entry.titleTokens.has(token)) score += 18;
      if (entry.aliasTokens.has(token)) score += 10;
      if (entry.sectionTokens.has(token)) score += 5;
      if (entry.descriptionTokens.has(token)) score += 3;

      if (token.length >= 4) {
        const titlePartial = [...entry.titleTokens].some(candidate => candidate.startsWith(token) || token.startsWith(candidate));
        const aliasPartial = [...entry.aliasTokens].some(candidate => candidate.startsWith(token) || token.startsWith(candidate));
        if (titlePartial) score += 5;
        else if (aliasPartial) score += 3;
      }
    });

    const rankingIntent = tokens.some(token => RANKING_WORDS.has(token));
    if (rankingIntent) score += entry.section === 'Leaderboards' ? 34 : -8;
    else if (entry.section === 'Leaderboards' && ['prestige','legacy','level','nexus','points','talisman','codex','bestiary'].some(token => tokens.includes(token))) score -= 14;

    if (tokens.includes('guide') || tokens.includes('guia')) score += entry.section === 'Guide' ? 16 : -3;
    if (tokens.includes('rules') || tokens.includes('reglas')) score += entry.title === 'Rules' ? 36 : 0;
    if (tokens.includes('store') || tokens.includes('tienda')) {
      if (entry.title === 'Store') score += 10;
      if (entry.title === '/store command' && (tokens.includes('command') || tokens.includes('comando'))) score += 24;
    }

    return score;
  };

  const search = query => INDEX
    .map(entry => ({ entry, score:scoreDestination(entry, query) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.order - b.entry.order);

  const root = document.createElement('div');
  root.className = 'pixel-navigator';
  root.dataset.pixelNavigatorRoot = '';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'pixel-navigator-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'pixel-navigator-panel');
  trigger.setAttribute('aria-label', 'Ask Pixel where to find something');
  trigger.innerHTML = '<span class="pixel-navigator-trigger-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="pixel-navigator-trigger-label">Ask Pixel</span>';

  const panel = document.createElement('section');
  panel.id = 'pixel-navigator-panel';
  panel.className = 'pixel-navigator-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'pixel-navigator-title');

  panel.innerHTML = `
    <header class="pixel-navigator-head">
      <div>
        <span class="pixel-navigator-kicker">Pixel Navigator</span>
        <h2 id="pixel-navigator-title">Where do you want to go?</h2>
        <p>Ask about a system, command, guide or ranking and I’ll take you to the right section.</p>
      </div>
      <button class="pixel-navigator-close" type="button" aria-label="Close navigator">×</button>
    </header>
    <form class="pixel-navigator-form" data-pixel-navigator-form>
      <label class="pixel-navigator-label" for="pixel-navigator-input">Ask a question</label>
      <div class="pixel-navigator-search-row">
        <input id="pixel-navigator-input" class="pixel-navigator-input" type="search" autocomplete="off" spellcheck="false" placeholder="How do I prestige?" />
        <button class="pixel-navigator-submit" type="submit">Find</button>
      </div>
    </form>
    <div class="pixel-navigator-examples" aria-label="Example questions">
      <button type="button" data-pixel-question="How do I prestige?">Prestige</button>
      <button type="button" data-pixel-question="What are Nexus Points?">Nexus Points</button>
      <button type="button" data-pixel-question="Where is the Raphael kills leaderboard?">Raphael ranking</button>
      <button type="button" data-pixel-question="Basic commands">Commands</button>
    </div>
    <div class="pixel-navigator-status" data-pixel-navigator-status aria-live="polite">Searches the public Pixel Network site. English / Español.</div>
    <div class="pixel-navigator-results" data-pixel-navigator-results></div>
    <footer class="pixel-navigator-foot">Navigation only · no chat history · no account data</footer>
  `;

  root.append(panel, trigger);
  document.body.appendChild(root);

  const form = panel.querySelector('[data-pixel-navigator-form]');
  const input = panel.querySelector('.pixel-navigator-input');
  const closeButton = panel.querySelector('.pixel-navigator-close');
  const status = panel.querySelector('[data-pixel-navigator-status]');
  const results = panel.querySelector('[data-pixel-navigator-results]');
  const questionButtons = [...panel.querySelectorAll('[data-pixel-question]')];
  let redirectTimer = 0;

  const sectionCode = section => ({ Guide:'GUIDE', Explore:'EXPLORE', Community:'COMM', Leaderboards:'RANK' }[section] || 'PIXEL');

  const createResult = ({ entry, score }, primary = false) => {
    const link = document.createElement('a');
    link.className = `pixel-navigator-result${primary ? ' is-primary' : ''}`;
    link.href = entry.href;
    link.dataset.score = String(score);

    const meta = document.createElement('span');
    meta.className = 'pixel-navigator-result-meta';
    meta.textContent = sectionCode(entry.section);

    const copy = document.createElement('span');
    copy.className = 'pixel-navigator-result-copy';
    const strong = document.createElement('strong');
    strong.textContent = entry.title;
    const description = document.createElement('span');
    description.textContent = entry.description;
    copy.append(strong, description);

    const arrow = document.createElement('span');
    arrow.className = 'pixel-navigator-result-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    link.append(meta, copy, arrow);
    return link;
  };

  const open = () => {
    if (!panel.hidden) return;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    root.classList.add('is-open');
    requestAnimationFrame(() => input?.focus());
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (panel.hidden) return;
    clearTimeout(redirectTimer);
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
    if (restoreFocus) trigger.focus();
  };

  const navigate = entry => {
    clearTimeout(redirectTimer);
    status.textContent = `Opening ${entry.title}…`;
    results.replaceChildren(createResult({ entry, score:999 }, true));
    root.classList.add('is-routing');
    redirectTimer = window.setTimeout(() => {
      location.assign(entry.href);
    }, 220);
  };

  const showFallbacks = query => {
    status.textContent = `I couldn't match “${query}” precisely. Try one of these areas or use a system name.`;
    const fallbackEntries = [
      INDEX.find(item => item.title === 'Getting Started'),
      INDEX.find(item => item.title === 'Currencies'),
      INDEX.find(item => item.title === 'Leaderboards'),
      INDEX.find(item => item.title === 'Gameplay')
    ].filter(Boolean).map(entry => ({ entry, score:1 }));
    results.replaceChildren(...fallbackEntries.map((result, index) => createResult(result, index === 0)));
  };

  const handleQuery = rawQuery => {
    const query = String(rawQuery || '').trim();
    root.classList.remove('is-routing');
    clearTimeout(redirectTimer);
    if (!query) {
      status.textContent = 'Type what you are looking for — for example “Prestige”, “/bag” or “Money leaderboard”.';
      results.replaceChildren();
      input?.focus();
      return;
    }

    const matches = search(query);
    if (!matches.length || matches[0].score < 18) {
      showFallbacks(query);
      return;
    }

    const [first, second] = matches;
    const lead = first.score - (second?.score || 0);
    const confident = first.score >= 62 && (lead >= 12 || first.score >= 105);

    if (confident) {
      navigate(first.entry);
      return;
    }

    const visible = matches.slice(0, 4);
    status.textContent = visible.length === 1
      ? 'I found one likely destination.'
      : 'I found a few possible destinations. Choose the one you meant.';
    results.replaceChildren(...visible.map((result, index) => createResult(result, index === 0)));
  };

  trigger.addEventListener('click', () => panel.hidden ? open() : close());
  closeButton?.addEventListener('click', () => close());
  form?.addEventListener('submit', event => {
    event.preventDefault();
    handleQuery(input?.value);
  });
  questionButtons.forEach(button => button.addEventListener('click', () => {
    const question = button.dataset.pixelQuestion || button.textContent;
    if (input) input.value = question;
    handleQuery(question);
  }));

  document.addEventListener('pointerdown', event => {
    if (panel.hidden || root.contains(event.target)) return;
    close({ restoreFocus:false });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      close();
      return;
    }
  });

  window.PixelNavigator = Object.freeze({ open, search: query => search(query).map(({ entry, score }) => ({ ...entry, score })) });
})();

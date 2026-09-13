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

  const triggerIcon = document.createElement('span');
  triggerIcon.className = 'pixel-navigator-trigger-icon';
  triggerIcon.setAttribute('aria-hidden', 'true');
  triggerIcon.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'pixel-navigator-trigger-label';
  triggerLabel.textContent = 'Ask Pixel';
  trigger.append(triggerIcon, triggerLabel);

  const panel = document.createElement('section');
  panel.id = 'pixel-navigator-panel';
  panel.className = 'pixel-navigator-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'pixel-navigator-title');

  const head = document.createElement('header');
  head.className = 'pixel-navigator-head';
  const headCopy = document.createElement('div');
  const kicker = document.createElement('span');
  kicker.className = 'pixel-navigator-kicker';
  kicker.textContent = 'Pixel Navigator';
  const title = document.createElement('h2');
  title.id = 'pixel-navigator-title';
  title.textContent = 'Where do you want to go?';
  const intro = document.createElement('p');
  intro.textContent = 'Ask about a system, command, guide or ranking and I’ll take you to the right section.';
  headCopy.append(kicker, title, intro);

  const closeButton = document.createElement('button');
  closeButton.className = 'pixel-navigator-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close navigator');
  closeButton.textContent = '×';
  head.append(headCopy, closeButton);

  const form = document.createElement('form');
  form.className = 'pixel-navigator-form';
  form.dataset.pixelNavigatorForm = '';
  const label = document.createElement('label');
  label.className = 'pixel-navigator-label';
  label.htmlFor = 'pixel-navigator-input';
  label.textContent = 'Ask a question';
  const searchRow = document.createElement('div');
  searchRow.className = 'pixel-navigator-search-row';
  const input = document.createElement('input');
  input.id = 'pixel-navigator-input';
  input.className = 'pixel-navigator-input';
  input.type = 'search';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = 'How do I prestige?';
  const submit = document.createElement('button');
  submit.className = 'pixel-navigator-submit';
  submit.type = 'submit';
  submit.textContent = 'Find';
  searchRow.append(input, submit);
  form.append(label, searchRow);

  const examples = document.createElement('div');
  examples.className = 'pixel-navigator-examples';
  examples.setAttribute('aria-label', 'Example questions');
  const questionDefinitions = [
    ['How do I prestige?', 'Prestige'],
    ['What are Nexus Points?', 'Nexus Points'],
    ['Where is the Raphael kills leaderboard?', 'Raphael ranking'],
    ['Basic commands', 'Commands']
  ];
  const questionButtons = questionDefinitions.map(([question, copy]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.pixelQuestion = question;
    button.textContent = copy;
    examples.appendChild(button);
    return button;
  });

  const status = document.createElement('div');
  status.className = 'pixel-navigator-status';
  status.dataset.pixelNavigatorStatus = '';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Searches the public Pixel Network site. English / Español.';

  const results = document.createElement('div');
  results.className = 'pixel-navigator-results';
  results.dataset.pixelNavigatorResults = '';

  const foot = document.createElement('footer');
  foot.className = 'pixel-navigator-foot';
  foot.textContent = 'Navigation only · no chat history · no account data';

  panel.append(head, form, examples, status, results, foot);
  root.append(panel, trigger);
  document.body.appendChild(root);

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
  closeButton.addEventListener('click', () => close());
  form.addEventListener('submit', event => {
    event.preventDefault();
    handleQuery(input.value);
  });
  questionButtons.forEach(button => button.addEventListener('click', () => {
    const question = button.dataset.pixelQuestion || button.textContent;
    input.value = question;
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

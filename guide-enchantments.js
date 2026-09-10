(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const guide = window.PIXEL_GUIDE_ENCHANTMENTS || {};

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  const appendFacts = (host, facts) => {
    if (!host) return;
    host.replaceChildren(...facts.map(([label, value]) => {
      const item = el('div', 'guide-fact');
      item.append(el('span', '', label), el('strong', '', value ?? '—'));
      return item;
    }));
  };

  appendFacts(document.querySelector('[data-guide-enchant-summary]'), [
    ['Current catalogue', network.content?.enchantments ?? '—'],
    ['Max per item', guide.limits?.maxPerItem ?? '—'],
    ['Evidence', 'Source verified'],
    ['Live-client claim', 'Not asserted']
  ]);

  document.querySelectorAll('[data-guide-enchant-cap]').forEach(node => {
    node.textContent = String(guide.limits?.maxPerItem ?? '—');
  });

  const principlesHost = document.querySelector('[data-guide-enchant-principles]');
  if (principlesHost && Array.isArray(guide.principles)) {
    principlesHost.replaceChildren(...guide.principles.map((item, index) => {
      const article = el('article', 'enchant-principle');
      article.append(
        el('span', 'enchant-principle-index', String(index + 1).padStart(2, '0')),
        el('h3', '', item.name || 'Principle'),
        el('p', '', item.description || '')
      );
      return article;
    }));
  }

  const familyBody = document.querySelector('[data-guide-enchant-families]');
  if (familyBody && Array.isArray(guide.families)) {
    familyBody.replaceChildren(...guide.families.map(family => {
      const tr = document.createElement('tr');
      const name = el('td');
      name.append(el('strong', 'guide-table-title', family.name || '—'), el('span', 'enchant-family-type', family.type || ''));
      const identity = el('td', '', family.identity || '—');
      const shared = el('td', '', Array.isArray(family.shared) && family.shared.length ? family.shared.join(' · ') : 'Dedicated pool / rules');
      const note = el('td', '', family.note || '');
      tr.append(name, identity, shared, note);
      return tr;
    }));
  }

  const specializedHost = document.querySelector('[data-guide-enchant-specialized]');
  if (specializedHost && Array.isArray(guide.specialized)) {
    specializedHost.replaceChildren(...guide.specialized.map(item => {
      const article = el('article', 'enchant-mechanic');
      const head = el('div', 'enchant-mechanic-head');
      head.append(el('span', 'enchant-mechanic-kind', item.kind || 'Mechanic'), el('span', 'enchant-mechanic-status', item.status || 'current'));
      article.append(head, el('h3', '', item.name || 'Enchant'), el('p', '', item.behavior || ''));
      return article;
    }));
  }

  const conservativeBody = document.querySelector('[data-guide-enchant-conservative]');
  if (conservativeBody && Array.isArray(guide.conservativeDamage)) {
    conservativeBody.replaceChildren(...guide.conservativeDamage.map(item => {
      const tr = document.createElement('tr');
      tr.append(
        el('td', 'guide-table-title', item.name || '—'),
        el('td', '', item.behavior || '—'),
        el('td', '', item.clarification || '')
      );
      return tr;
    }));
  }

  const retiredHost = document.querySelector('[data-guide-enchant-retired]');
  if (retiredHost && Array.isArray(guide.retired)) {
    retiredHost.replaceChildren(...guide.retired.map(item => {
      const article = el('article', 'enchant-retired-item');
      article.append(
        el('span', 'enchant-retired-status', String(item.status || 'retired').replaceAll('-', ' ')),
        el('h3', '', item.name || 'Retired enchant'),
        el('p', '', item.note || '')
      );
      return article;
    }));
  }

  const verificationHost = document.querySelector('[data-guide-enchant-verification]');
  if (verificationHost) {
    const source = el('article', 'verification-card is-verified');
    source.append(
      el('small', '', 'Evidence'),
      el('h3', '', 'Source verified'),
      el('p', '', `Family compatibility, effect semantics and retired identities were verified against the current source as of ${guide.verification?.verifiedAsOf || 'the recorded verification date'}.`)
    );

    const scope = el('article', 'verification-card is-verified');
    scope.append(
      el('small', '', 'Publication scope'),
      el('h3', '', 'Bounded'),
      el('p', '', 'Only current behavior and explicit retirements are documented. An enchant name alone is never treated as proof of an extra mechanic.')
    );

    const live = el('article', 'verification-card is-pending');
    live.append(
      el('small', '', 'Live client'),
      el('h3', '', 'Not claimed'),
      el('p', '', 'This guide does not claim that every effect has been visually or experientially re-tested in a live Minecraft client.')
    );

    verificationHost.replaceChildren(source, scope, live);
  }
})();
(() => {
  'use strict';

  const nav = document.querySelector('.site-nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const main = document.querySelector('main');
  const mobileNav = matchMedia('(max-width: 980px)');
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const currentHash = location.hash.replace(/^#/, '');

  /* Browser tab identity is deliberately separate from the full horizontal/root logo. */
  const faviconHref = 'favicon.png';
  const faviconLinks = [...document.querySelectorAll('link[rel~="icon"]')];
  const configureFavicon = link => {
    link.href = faviconHref;
    link.type = 'image/png';
    link.sizes = '32x32';
  };
  if (faviconLinks.length) faviconLinks.forEach(configureFavicon);
  else {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    configureFavicon(icon);
    document.head.appendChild(icon);
  }

  const safePublicUrl = (value, fallback = null) => {
    const raw = String(value ?? '').trim();
    if (!raw) return fallback;
    try {
      const url = new URL(raw, location.href);
      const sameOrigin = url.origin === location.origin;
      if (sameOrigin && ['http:', 'https:'].includes(url.protocol)) return url.href;
      if (location.protocol === 'file:' && url.protocol === 'file:') return url.href;
      return url.protocol === 'https:' ? url.href : fallback;
    } catch {
      return fallback;
    }
  };

  const safeLocalPage = (value, fallback = 'index.html') => {
    if (!value) return fallback;
    const candidate = String(value).trim();
    if (/^[A-Za-z0-9._-]+\.html$/.test(candidate)) return candidate;
    try {
      const url = new URL(candidate, location.href);
      if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return fallback;
      const file = url.pathname.split('/').pop();
      return /^[A-Za-z0-9._-]+\.html$/.test(file || '') ? file : fallback;
    } catch {
      return fallback;
    }
  };

  const safeLocalTarget = (value, fallback = 'index.html') => {
    if (!value) return fallback;
    const candidate = String(value).trim();
    if (/^[A-Za-z0-9._-]+\.html(?:#[A-Za-z0-9_-]+)?$/.test(candidate)) return candidate;
    try {
      const url = new URL(candidate, location.href);
      if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return fallback;
      const file = url.pathname.split('/').pop();
      if (!/^[A-Za-z0-9._-]+\.html$/.test(file || '')) return fallback;
      const hash = /^#[A-Za-z0-9_-]+$/.test(url.hash) ? url.hash : '';
      return `${file}${hash}`;
    } catch {
      return fallback;
    }
  };

  const targetPage = value => String(value || '').split('#')[0];
  const targetHash = value => String(value || '').includes('#') ? String(value).split('#')[1] : '';
  const changelogLanding = safeLocalPage(network?.changelog?.landing, 'changelog.html');
  const guidesLanding = safeLocalPage(network?.community?.guidesLanding, 'guides.html');
  const marketplaceLanding = 'marketplace.html';
  const isGuideDetailPage = /^guide-[A-Za-z0-9._-]+\.html$/.test(currentPage);

  const guideCategoryByPage = Object.freeze({
    'guide-getting-started.html': 'getting-started',
    'guide-currencies.html': 'currencies',
    'guide-basic-commands.html': 'basic-commands',
    'guide-progression.html': 'progression',
    'guide-worlds.html': 'progression',
    'guide-nexus.html': 'specials',
    'guide-skyblock.html': 'mechanics',
    'guide-stats-equipment.html': 'armor',
    'guide-talismans.html': 'specials',
    'guide-enchantments.html': 'boosts'
  });

  const currentGuideCategory = isGuideDetailPage
    ? guideCategoryByPage[currentPage]
    : (currentPage === guidesLanding ? (currentHash || 'getting-started') : null);

  const isCurrentLocalDestination = href => {
    const page = targetPage(href);
    const hash = targetHash(href);
    if (page !== currentPage) {
      if (!(isGuideDetailPage && page === guidesLanding)) return false;
    }
    if (page === guidesLanding && hash) return currentGuideCategory === hash;
    if (page === guidesLanding && (currentPage === guidesLanding || isGuideDetailPage)) return true;
    return page === currentPage;
  };

  const appendNavCopy = (link, title, description) => {
    const strong = document.createElement('strong');
    strong.textContent = title;
    const span = document.createElement('span');
    span.textContent = description;
    link.replaceChildren(strong, span);
  };

  const createLocalTextLink = (href, label) => {
    const link = document.createElement('a');
    link.href = safeLocalTarget(href, 'index.html');
    link.textContent = label;
    if (isCurrentLocalDestination(link.getAttribute('href'))) link.setAttribute('aria-current', 'page');
    return link;
  };

  let skipLink = null;
  if (main) {
    if (!main.id) main.id = 'main-content';
    if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
    skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = `#${main.id}`;
    skipLink.textContent = 'Skip to content';
    skipLink.addEventListener('click', () => requestAnimationFrame(() => main.focus({ preventScroll: true })));
  }

  const progress = document.createElement('progress');
  progress.className = 'scroll-progress';
  progress.max = 1;
  progress.value = 0;
  progress.setAttribute('aria-hidden', 'true');
  if (skipLink) document.body.prepend(skipLink, progress);
  else document.body.prepend(progress);

  const root = document.documentElement;
  let maxScroll = 1;
  let scheduled = false;
  const measureScrollRange = () => { maxScroll = Math.max(1, root.scrollHeight - innerHeight); };
  const updateScrollProgress = () => {
    scheduled = false;
    const y = scrollY || root.scrollTop || 0;
    progress.value = Math.min(1, Math.max(0, y / maxScroll));
  };
  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateScrollProgress);
  };
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', () => { measureScrollRange(); requestUpdate(); }, { passive: true });
  addEventListener('load', () => { measureScrollRange(); requestUpdate(); }, { once: true });
  if ('ResizeObserver' in window && document.body) new ResizeObserver(() => {
    measureScrollRange();
    requestUpdate();
  }).observe(document.body);
  measureScrollRange();
  updateScrollProgress();

  const canonicalNavigation = [
    {
      label: 'Explore',
      items: [
        ['gameplay.html', 'Gameplay', 'The main player journey.'],
        ['systems.html', 'Systems', 'Progression, collection and equipment.'],
        ['worlds.html', 'Worlds', 'The current world progression.'],
        ['skyblock.html', 'Skyblock', 'Personal island progression.'],
        ['nexus.html', 'Nexus', 'Endgame access and instance progression.']
      ]
    },
    {
      label: 'Guide',
      relatedPages: [guidesLanding],
      guideFamily: true,
      items: [
        [`${guidesLanding}#getting-started`, 'Getting Started', 'Join Pixel Network and learn the server basics.'],
        [`${guidesLanding}#currencies`, 'Currencies', 'Coins, Pixels and Nexus Points.'],
        [`${guidesLanding}#basic-commands`, 'Basic Commands', 'Common player commands and shortcuts.'],
        [`${guidesLanding}#progression`, 'Progression', 'Worlds, Prestige and progression routes.'],
        [`${guidesLanding}#mechanics`, 'Mechanics', 'Gameplay systems and how they behave.'],
        [`${guidesLanding}#tools`, 'Tools', 'Tool families and their supporting systems.'],
        [`${guidesLanding}#armor`, 'Armor', 'Defense, equipment and armor modifiers.'],
        [`${guidesLanding}#specials`, 'Specials', 'Talismans, Nexus and specialized systems.'],
        [`${guidesLanding}#boosts`, 'Boosts', 'Effects and systems that improve performance.']
      ]
    },
    {
      label: 'Community',
      relatedPages: ['community.html'],
      items: [
        ['leaderboards.html', 'Leaderboards', 'Public rankings and competitive progression.'],
        [changelogLanding, 'Changelog', 'Player-facing release notes.'],
        ['rules.html', 'Rules', 'Current player and community rules.'],
        ['staff.html', 'Staff Team', 'The currently published Pixel Network team.']
      ]
    }
  ];

  const createNavLink = ([href, title, description]) => {
    const link = document.createElement('a');
    link.href = safeLocalTarget(href, 'index.html');
    appendNavCopy(link, title, description);
    if (isCurrentLocalDestination(link.getAttribute('href'))) link.setAttribute('aria-current', 'page');
    return link;
  };

  if (navLinks) {
    const fragment = document.createDocumentFragment();
    canonicalNavigation.forEach(groupData => {
      const group = document.createElement('div');
      group.className = 'nav-group';
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-haspopup', 'true');
      button.textContent = groupData.label;
      const menu = document.createElement('div');
      menu.className = 'nav-dropdown';
      groupData.items.forEach(item => menu.appendChild(createNavLink(item)));
      group.append(button, menu);
      fragment.appendChild(group);

      if (groupData.label === 'Explore') {
        const marketplace = createLocalTextLink(marketplaceLanding, 'Marketplace');
        marketplace.classList.add('nav-marketplace');
        fragment.appendChild(marketplace);
      }
    });
    fragment.appendChild(createLocalTextLink('team.html', 'About'));
    navLinks.replaceChildren(fragment);
  }

  const currentNavigationGroup = canonicalNavigation.find(groupData => {
    if (groupData.guideFamily && (currentPage === guidesLanding || isGuideDetailPage)) return true;
    if (groupData.relatedPages?.includes(currentPage)) return true;
    return groupData.items.some(([href]) => isCurrentLocalDestination(safeLocalTarget(href, 'index.html')));
  });

  if (nav && main && currentNavigationGroup) {
    const sectionNav = document.createElement('nav');
    sectionNav.className = 'section-subnav';
    sectionNav.setAttribute('aria-label', `${currentNavigationGroup.label} sections`);
    const inner = document.createElement('div');
    inner.className = 'shell section-subnav-inner';
    const label = document.createElement('span');
    label.className = 'section-subnav-label';
    label.textContent = currentNavigationGroup.label;
    const links = document.createElement('div');
    links.className = 'section-subnav-links';
    currentNavigationGroup.items.forEach(([href, title]) => {
      const safeHref = safeLocalTarget(href, 'index.html');
      const link = document.createElement('a');
      link.href = safeHref;
      link.textContent = title;
      if (isCurrentLocalDestination(safeHref)) {
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
      }
      links.appendChild(link);
    });
    inner.append(label, links);
    sectionNav.appendChild(inner);
    nav.insertAdjacentElement('afterend', sectionNav);
    document.body.classList.add('has-section-subnav');
  }

  const groups = [...document.querySelectorAll('.nav-group')];
  const closeGroup = group => {
    const button = group?.querySelector(':scope > button');
    group?.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
  };
  const closeGroups = (except = null) => groups.forEach(group => { if (group !== except) closeGroup(group); });
  const openGroup = group => {
    if (!group) return;
    closeGroups(group);
    group.classList.add('is-open');
    group.querySelector(':scope > button')?.setAttribute('aria-expanded', 'true');
  };

  groups.forEach((group, index) => {
    const button = group.querySelector(':scope > button');
    const menu = group.querySelector(':scope > .nav-dropdown');
    if (!button || !menu) return;
    menu.id = `nav-menu-${index + 1}`;
    button.setAttribute('aria-controls', menu.id);
    button.setAttribute('aria-expanded', 'false');
    if (menu.querySelector('[aria-current="page"]') || currentNavigationGroup?.label === button.textContent) {
      group.classList.add('contains-current');
    }
    button.addEventListener('click', event => {
      event.preventDefault();
      group.classList.contains('is-open') ? closeGroup(group) : openGroup(group);
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openGroup(group);
        menu.querySelector('a')?.focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeGroup(group);
        button.focus();
      }
    });
    menu.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeGroup(group);
      button.focus();
    });
    group.addEventListener('pointerenter', () => { if (!mobileNav.matches) openGroup(group); });
    group.addEventListener('pointerleave', () => {
      if (!mobileNav.matches && !group.contains(document.activeElement)) closeGroup(group);
    });
    group.addEventListener('focusin', () => { if (!mobileNav.matches) openGroup(group); });
    group.addEventListener('focusout', () => {
      if (mobileNav.matches) return;
      setTimeout(() => { if (!group.contains(document.activeElement)) closeGroup(group); }, 0);
    });
  });

  const navActions = nav?.querySelector('.nav-actions');
  const storeLanding = safeLocalPage(network?.store?.landing, 'store.html');
  const discordUrl = safePublicUrl(network?.community?.discordUrl);
  const configureDiscordLink = link => {
    if (!link) return;
    link.textContent = 'Discord';
    link.setAttribute('aria-label', 'Join Pixel Network on Discord');
    if (discordUrl) {
      link.href = discordUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.removeAttribute('aria-disabled');
    } else {
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-disabled', 'true');
    }
  };

  if (navActions) {
    let desktopDiscord = navActions.querySelector('.nav-discord');
    if (!desktopDiscord) {
      desktopDiscord = document.createElement('a');
      desktopDiscord.className = 'button quiet nav-discord';
      navActions.prepend(desktopDiscord);
    }
    configureDiscordLink(desktopDiscord);

    const desktopPlay = navActions.querySelector('.nav-play');
    let desktopStore = navActions.querySelector('.nav-store');
    if (!desktopStore) {
      desktopStore = document.createElement('a');
      desktopStore.className = 'button quiet nav-store';
      navActions.insertBefore(desktopStore, navToggle || null);
    }
    desktopStore.textContent = 'Store';
    desktopStore.href = storeLanding;
    desktopStore.removeAttribute('target');
    desktopStore.removeAttribute('rel');
    if (currentPage === storeLanding) desktopStore.setAttribute('aria-current', 'page');
    else desktopStore.removeAttribute('aria-current');

    // Keep source/focus order identical to the visual desktop order.
    navActions.insertBefore(desktopDiscord, desktopPlay || desktopStore || navToggle || null);
    if (desktopPlay) navActions.insertBefore(desktopPlay, desktopStore || navToggle || null);
    navActions.insertBefore(desktopStore, navToggle || null);
  }

  if (navLinks) {
    const mobileDiscord = document.createElement('a');
    mobileDiscord.className = 'nav-mobile-store nav-mobile-discord';
    configureDiscordLink(mobileDiscord);
    const mobileStore = document.createElement('a');
    mobileStore.className = 'nav-mobile-store nav-mobile-store-link';
    mobileStore.href = storeLanding;
    mobileStore.textContent = 'Store';
    if (currentPage === storeLanding) mobileStore.setAttribute('aria-current', 'page');
    navLinks.append(mobileDiscord, mobileStore);
  }

  const footerInner = document.querySelector('.site-footer .site-footer-inner');
  if (footerInner) {
    footerInner.classList.add('site-footer-rich');

    const identity = document.createElement('div');
    identity.className = 'site-footer-brand';
    const brandName = document.createElement('strong');
    brandName.textContent = 'Pixel Network';
    const brandMeta = document.createElement('span');
    brandMeta.textContent = 'Java Edition · Independent community server';
    identity.append(brandName, brandMeta);

    const destinations = document.createElement('nav');
    destinations.className = 'site-footer-links';
    destinations.setAttribute('aria-label', 'Footer navigation');
    [
      [marketplaceLanding, 'Marketplace'],
      [storeLanding, 'Store'],
      [guidesLanding, 'Guide'],
      ['community.html', 'Community'],
      ['rules.html', 'Rules'],
      ['staff.html', 'Staff Team'],
      ['team.html', 'About']
    ].forEach(([href, label]) => destinations.appendChild(createLocalTextLink(href, label)));

    const legal = document.createElement('div');
    legal.className = 'site-footer-legal';
    const disclaimer = document.createElement('p');
    disclaimer.className = 'site-footer-disclaimer';
    disclaimer.textContent = 'NOT AN OFFICIAL MINECRAFT SERVER. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.';
    const rights = document.createElement('p');
    rights.textContent = `© ${new Date().getFullYear()} Pixel Network. Original Pixel Network branding, site copy and custom assets are all rights reserved unless otherwise stated. Third-party names, trademarks and assets remain subject to their respective owners' terms.`;
    legal.append(disclaimer, rights);

    footerInner.replaceChildren(identity, destinations, legal);
  }

  document.querySelectorAll('[data-discord-url]').forEach(configureDiscordLink);

  const closeMobileNav = () => {
    navLinks?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    closeGroups();
  };

  navToggle?.addEventListener('click', event => {
    event.stopImmediatePropagation();
    if (!mobileNav.matches || !navLinks) {
      closeMobileNav();
      return;
    }
    const willOpen = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', willOpen);
    navToggle.setAttribute('aria-expanded', String(willOpen));
    document.body.classList.toggle('nav-open', willOpen);
    if (!willOpen) closeGroups();
  }, { capture: true });

  navLinks?.addEventListener('click', event => {
    if (!mobileNav.matches || !event.target.closest('a')) return;
    closeMobileNav();
  });
  document.addEventListener('pointerdown', event => {
    if (nav?.contains(event.target)) return;
    closeGroups();
    if (mobileNav.matches && navLinks?.classList.contains('open')) closeMobileNav();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openGroupButton = document.querySelector('.nav-group.is-open > button');
    if (openGroupButton) {
      closeGroups();
      openGroupButton.focus();
    } else if (mobileNav.matches && navLinks?.classList.contains('open')) {
      closeMobileNav();
      navToggle?.focus();
    }
  });
  mobileNav.addEventListener?.('change', () => {
    document.body.classList.remove('nav-open');
    closeGroups();
    if (!mobileNav.matches) {
      navLinks?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  if (currentPage === guidesLanding && !document.querySelector('script[data-guide-categories]')) {
    const script = document.createElement('script');
    script.src = 'guide-categories.js';
    script.dataset.guideCategories = '';
    document.head.appendChild(script);
  }

  const prefetched = new Set();
  const prefetch = href => {
    if (!href || prefetched.has(href)) return;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
      prefetched.add(href);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url.href;
      document.head.appendChild(link);
    } catch {
      /* Invalid destinations are ignored. */
    }
  };
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    link.addEventListener('pointerenter', () => prefetch(href), { once: true, passive: true });
    link.addEventListener('focus', () => prefetch(href), { once: true });
  });
})();
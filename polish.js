(() => {
  const nav = document.querySelector('.site-nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const mobileNav = matchMedia('(max-width: 980px)');
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  const safeHttpUrl = (value, fallback = null) => {
    if (!value) return fallback;
    try {
      const url = new URL(String(value), location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : fallback;
    } catch {
      return fallback;
    }
  };

  const safeLocalPage = (value, fallback) => {
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

  const appendNavCopy = (link, title, description) => {
    const strong = document.createElement('strong');
    strong.textContent = title;
    const span = document.createElement('span');
    span.textContent = description;
    link.replaceChildren(strong, span);
  };

  /* Reading progress only. Scroll handlers must not mutate page geometry. */
  const progress = document.createElement('progress');
  progress.className = 'scroll-progress';
  progress.max = 1;
  progress.value = 0;
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  const root = document.documentElement;
  let maxScroll = 1;
  let scheduled = false;

  const measureScrollRange = () => {
    maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
  };

  const updateScrollProgress = () => {
    scheduled = false;
    const y = window.scrollY || root.scrollTop || 0;
    progress.value = Math.min(1, Math.max(0, y / maxScroll));
  };

  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateScrollProgress);
  };

  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', () => {
    measureScrollRange();
    requestUpdate();
  }, { passive: true });
  addEventListener('load', () => {
    measureScrollRange();
    requestUpdate();
  }, { once: true });

  if ('ResizeObserver' in window && document.body) {
    const resizeObserver = new ResizeObserver(() => {
      measureScrollRange();
      requestUpdate();
    });
    resizeObserver.observe(document.body);
  }

  measureScrollRange();
  updateScrollProgress();

  /* One canonical navigation model for every public-site page. Static HTML remains a
     no-JS fallback, but runtime navigation never depends on legacy page-specific markup. */
  const changelogLanding = safeLocalPage(network?.changelog?.landing, 'changelog.html');
  const forumLanding = safeLocalPage(network?.community?.forumLanding, 'forum.html');
  const canonicalNavigation = [
    {
      label: 'Explore',
      items: [
        ['gameplay.html', 'Gameplay', 'The main player journey.'],
        ['systems.html', 'Systems', 'Progression, collection and equipment.'],
        ['worlds.html', 'Worlds', 'The current world progression.'],
        ['skyblock.html', 'Skyblock', 'Personal and collaborative island progression.'],
        ['nexus.html', 'Nexus', 'Endgame access and instance progression.']
      ]
    },
    {
      label: 'Development',
      items: [
        ['development.html', 'Development', 'Current status, roadmap and product scale.'],
        [changelogLanding, 'Changelog', 'Player-facing release notes.']
      ]
    },
    {
      label: 'Community',
      items: [
        ['community.html', 'Community', 'Discord, Forum and documentation.'],
        [forumLanding, 'Forum', 'Long-form discussion preview.']
      ]
    }
  ];

  const createNavLink = ([href, title, description]) => {
    const link = document.createElement('a');
    link.href = safeLocalPage(href, 'index.html');
    appendNavCopy(link, title, description);
    if (currentPage === link.getAttribute('href')) link.setAttribute('aria-current', 'page');
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
    });

    const about = document.createElement('a');
    about.href = 'team.html';
    about.textContent = 'About';
    if (currentPage === 'team.html') about.setAttribute('aria-current', 'page');
    fragment.appendChild(about);

    navLinks.replaceChildren(fragment);
  }

  /* Navigation groups: hover is convenient on desktop, click/keyboard is authoritative. */
  const groups = [...document.querySelectorAll('.nav-group')];

  const closeGroup = group => {
    const button = group?.querySelector(':scope > button');
    group?.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
  };

  const closeGroups = (except = null) => {
    groups.forEach(group => {
      if (group !== except) closeGroup(group);
    });
  };

  const openGroup = group => {
    if (!group) return;
    const button = group.querySelector(':scope > button');
    closeGroups(group);
    group.classList.add('is-open');
    button?.setAttribute('aria-expanded', 'true');
  };

  groups.forEach((group, index) => {
    const button = group.querySelector(':scope > button');
    const menu = group.querySelector(':scope > .nav-dropdown');
    if (!button || !menu) return;

    const menuId = `nav-menu-${index + 1}`;
    menu.id = menuId;
    button.setAttribute('aria-controls', menuId);
    button.setAttribute('aria-expanded', 'false');

    if (menu.querySelector('[aria-current="page"]')) group.classList.add('contains-current');

    button.addEventListener('click', event => {
      event.preventDefault();
      const willOpen = !group.classList.contains('is-open');
      if (willOpen) openGroup(group);
      else closeGroup(group);
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

    group.addEventListener('pointerenter', () => {
      if (!mobileNav.matches) openGroup(group);
    });
    group.addEventListener('pointerleave', () => {
      if (!mobileNav.matches && !group.contains(document.activeElement)) closeGroup(group);
    });
    group.addEventListener('focusin', () => {
      if (!mobileNav.matches) openGroup(group);
    });
    group.addEventListener('focusout', () => {
      if (mobileNav.matches) return;
      setTimeout(() => {
        if (!group.contains(document.activeElement)) closeGroup(group);
      }, 0);
    });
  });

  /* Canonical desktop actions: Discord, Store, Play, menu toggle. */
  const navActions = nav?.querySelector('.nav-actions');
  const storeLanding = safeLocalPage(network?.store?.landing, 'store.html');
  const discordFallback = 'https://discord.gg/7KzWpezTNZ';
  const discordUrl = safeHttpUrl(network?.community?.discordUrl, discordFallback);

  if (navActions) {
    let desktopDiscord = navActions.querySelector('.nav-discord');
    if (!desktopDiscord) {
      desktopDiscord = document.createElement('a');
      desktopDiscord.className = 'button quiet nav-discord';
      navActions.prepend(desktopDiscord);
    }
    desktopDiscord.textContent = 'Discord';
    desktopDiscord.href = discordUrl;
    desktopDiscord.target = '_blank';
    desktopDiscord.rel = 'noopener';
    desktopDiscord.setAttribute('aria-label', 'Join Pixel Network on Discord');

    let desktopStore = navActions.querySelector('.nav-store');
    if (!desktopStore) {
      desktopStore = document.createElement('a');
      desktopStore.className = 'button quiet nav-store';
      const playButton = navActions.querySelector('.nav-play');
      navActions.insertBefore(desktopStore, playButton || navToggle || null);
    }
    desktopStore.textContent = 'Store';
    desktopStore.href = storeLanding;
    desktopStore.removeAttribute('target');
    desktopStore.removeAttribute('rel');
    desktopStore.toggleAttribute('aria-current', currentPage === storeLanding);
    if (currentPage === storeLanding) desktopStore.setAttribute('aria-current', 'page');
  }

  /* Store and Discord remain available inside the mobile menu while Play stays in the header. */
  if (navLinks) {
    const mobileDiscord = document.createElement('a');
    mobileDiscord.className = 'nav-mobile-store nav-mobile-discord';
    mobileDiscord.href = discordUrl;
    mobileDiscord.target = '_blank';
    mobileDiscord.rel = 'noopener';
    mobileDiscord.textContent = 'Discord';
    navLinks.appendChild(mobileDiscord);

    const mobileStore = document.createElement('a');
    mobileStore.className = 'nav-mobile-store nav-mobile-store-link';
    mobileStore.href = storeLanding;
    mobileStore.textContent = 'Store';
    if (currentPage === storeLanding) mobileStore.setAttribute('aria-current', 'page');
    navLinks.appendChild(mobileStore);
  }

  /* Keep public destination links synchronized with data/network.js. */
  document.querySelectorAll('[data-discord-url]').forEach(link => {
    link.href = discordUrl;
  });
  const docsUrl = safeHttpUrl(network?.community?.documentationUrl);
  if (docsUrl) {
    document.querySelectorAll('[data-docs-url]').forEach(link => { link.href = docsUrl; });
  }

  const closeMobileNav = () => {
    navLinks?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    closeGroups();
  };

  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    document.body.classList.toggle('nav-open', open && mobileNav.matches);
    if (!open) closeGroups();
  });

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
      return;
    }
    if (mobileNav.matches && navLinks?.classList.contains('open')) {
      closeMobileNav();
      navToggle?.focus();
    }
  });

  const syncNavigationMode = () => {
    document.body.classList.remove('nav-open');
    closeGroups();
    if (!mobileNav.matches) {
      navLinks?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  };
  mobileNav.addEventListener?.('change', syncNavigationMode);

  /* Conservative same-origin prefetch on intent only. */
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
      // Invalid destinations are ignored instead of being prefetched.
    }
  };

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    link.addEventListener('pointerenter', () => prefetch(href), { once: true, passive: true });
    link.addEventListener('focus', () => prefetch(href), { once: true });
  });
})();

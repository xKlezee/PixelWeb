(() => {
  const nav = document.querySelector('.site-nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const mobileNav = matchMedia('(max-width: 980px)');
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  /* Reading progress only. Scroll handlers must not mutate page geometry. */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
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
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, y / maxScroll))})`;
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

  /*
   * Global navigation normalization.
   * Changelog belongs to Development; Community stays focused on social/reference destinations.
   * This is generated once here so older static page markup cannot drift apart.
   */
  const changelogLanding = network?.changelog?.landing || 'changelog.html';
  const developmentLanding = 'development.html';

  const existingDevelopmentGroup = Array.from(document.querySelectorAll('.nav-group')).find(group =>
    group.querySelector(':scope > button')?.textContent.trim() === 'Development'
  );

  if (!existingDevelopmentGroup && navLinks) {
    const directDevelopment = Array.from(navLinks.children).find(child =>
      child.matches?.('a') && child.getAttribute('href')?.endsWith(developmentLanding)
    );

    if (directDevelopment) {
      const group = document.createElement('div');
      group.className = 'nav-group nav-development';

      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-haspopup', 'true');
      button.textContent = 'Development';

      const menu = document.createElement('div');
      menu.className = 'nav-dropdown';

      const developmentLink = document.createElement('a');
      developmentLink.href = developmentLanding;
      developmentLink.innerHTML = '<strong>Development</strong><span>Current status, roadmap and product scale.</span>';
      if (currentPage === developmentLanding) developmentLink.setAttribute('aria-current', 'page');

      const changelogLink = document.createElement('a');
      changelogLink.href = changelogLanding;
      changelogLink.innerHTML = '<strong>Changelog</strong><span>Player-facing release notes.</span>';
      if (currentPage === changelogLanding) changelogLink.setAttribute('aria-current', 'page');

      menu.append(developmentLink, changelogLink);
      group.append(button, menu);
      directDevelopment.replaceWith(group);
    }
  }

  const communityGroup = Array.from(document.querySelectorAll('.nav-group')).find(group =>
    group.querySelector(':scope > button')?.textContent.trim() === 'Community'
  );
  if (communityGroup) {
    const menu = communityGroup.querySelector(':scope > .nav-dropdown');
    menu?.querySelectorAll(`a[href$="${changelogLanding}"]`).forEach(link => link.remove());
    const communityDescription = menu?.querySelector('a[href$="community.html"] span');
    if (communityDescription) communityDescription.textContent = 'Discord, Forum and documentation.';
  }

  /* Navigation groups: hover is convenient on desktop, click/keyboard is authoritative. */
  const groups = [...document.querySelectorAll('.nav-group')];

  const closeGroup = (group) => {
    const button = group?.querySelector(':scope > button');
    group?.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
  };

  const closeGroups = (except = null) => {
    groups.forEach(group => {
      if (group !== except) closeGroup(group);
    });
  };

  const openGroup = (group) => {
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

    const menuId = menu.id || `nav-menu-${index + 1}`;
    menu.id = menuId;
    button.setAttribute('aria-controls', menuId);
    button.setAttribute('aria-expanded', 'false');

    if (menu.querySelector('[aria-current="page"]')) {
      group.classList.add('contains-current');
    }

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

  /* PixelWeb explains the commercial model before handing off to the official Store. */
  const navActions = nav?.querySelector('.nav-actions');
  const desktopStore = navActions?.querySelector('.nav-store');
  const storeLanding = network?.store?.landing || 'store.html';
  if (desktopStore && !desktopStore.hasAttribute('data-store-direct')) {
    desktopStore.href = storeLanding;
    desktopStore.removeAttribute('target');
    desktopStore.removeAttribute('rel');
    if (currentPage === storeLanding) desktopStore.setAttribute('aria-current', 'page');
  }

  /* Discord is a permanent direct-access action beside Store and Play on desktop. */
  const discordUrl = network?.community?.discordUrl || 'https://discord.gg/khRCRhR9d4';
  let desktopDiscord = navActions?.querySelector('.nav-discord');
  if (navActions && !desktopDiscord) {
    desktopDiscord = document.createElement('a');
    desktopDiscord.className = 'button quiet nav-discord';
    desktopDiscord.href = discordUrl;
    desktopDiscord.target = '_blank';
    desktopDiscord.rel = 'noopener';
    desktopDiscord.textContent = 'Discord';
    desktopDiscord.setAttribute('aria-label', 'Join Pixel Network on Discord');
    navActions.insertBefore(desktopDiscord, desktopStore || navToggle || null);
  }

  /* Store and Discord remain available inside the mobile menu while Play stays in the header. */
  if (navLinks && !navLinks.querySelector('.nav-mobile-discord')) {
    const mobileDiscord = document.createElement('a');
    mobileDiscord.className = 'nav-mobile-store nav-mobile-discord';
    mobileDiscord.href = discordUrl;
    mobileDiscord.target = '_blank';
    mobileDiscord.rel = 'noopener';
    mobileDiscord.textContent = 'Discord';
    navLinks.appendChild(mobileDiscord);
  }

  if (navLinks && desktopStore && !navLinks.querySelector('.nav-mobile-store-link')) {
    const mobileStore = document.createElement('a');
    mobileStore.className = 'nav-mobile-store nav-mobile-store-link';
    mobileStore.href = desktopStore.href;
    if (desktopStore.target) mobileStore.target = desktopStore.target;
    if (desktopStore.rel) mobileStore.rel = desktopStore.rel;
    if (desktopStore.getAttribute('aria-current') === 'page') mobileStore.setAttribute('aria-current', 'page');
    mobileStore.textContent = 'Store';
    navLinks.appendChild(mobileStore);
  }

  /* Keep public destination links synchronized with data/network.js. */
  document.querySelectorAll('[data-discord-url]').forEach(link => {
    link.href = discordUrl;
  });
  const docsUrl = network?.community?.documentationUrl;
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
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
    prefetched.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    document.head.appendChild(link);
  };

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    link.addEventListener('pointerenter', () => prefetch(href), { once: true, passive: true });
    link.addEventListener('focus', () => prefetch(href), { once: true });
  });
})();
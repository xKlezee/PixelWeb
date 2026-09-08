(() => {
  const nav = document.querySelector('.site-nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const mobileNav = matchMedia('(max-width: 980px)');

  /* Reading progress and compact navigation state. */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  let scheduled = false;
  const updateScrollState = () => {
    scheduled = false;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, y / max))})`;
    nav?.classList.toggle('is-scrolled', y > 18);
  };
  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateScrollState);
  };
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  updateScrollState();

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

  /* Store remains available inside the mobile menu while Play stays in the header. */
  const desktopStore = nav?.querySelector('.nav-store');
  if (navLinks && desktopStore && !navLinks.querySelector('.nav-mobile-store')) {
    const mobileStore = document.createElement('a');
    mobileStore.className = 'nav-mobile-store';
    mobileStore.href = desktopStore.href;
    mobileStore.target = desktopStore.target || '_blank';
    mobileStore.rel = desktopStore.rel || 'noopener';
    mobileStore.textContent = 'Store';
    navLinks.appendChild(mobileStore);
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
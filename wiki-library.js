(() => {
  'use strict';

  const WIKI_GZIP_BASE64 = String(window.PIXEL_WIKI_PAYLOAD || '');
  window.PIXEL_WIKI_PAYLOAD = '';

  const decodeLibrary = async () => {
    if (typeof DecompressionStream !== 'function') throw new Error('Compressed wiki payload is not supported by this browser.');
    const bytes = Uint8Array.from(atob(WIKI_GZIP_BASE64), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  };

  const start = async () => {
    let library;
    try {
      library = await decodeLibrary();
    } catch (error) {
      const article = document.querySelector('[data-wiki-library-article]');
      if (article) article.innerHTML = '<div class="wiki-library-load-error"><strong>La wiki completa no pudo cargarse.</strong><p>Podés seguir usando la guía curada mientras actualizás el navegador.</p><a href="guides.html">Volver a Guide →</a></div>';
      return;
    }
    if (!library || !Array.isArray(library.articles) || !library.articles.length) return;

    const nav = document.querySelector('[data-wiki-library-nav]');
    const search = document.querySelector('[data-wiki-library-search]');
    const count = document.querySelector('[data-wiki-library-count]');
    const title = document.querySelector('[data-wiki-library-title]');
    const section = document.querySelector('[data-wiki-library-section]');
    const path = document.querySelector('[data-wiki-library-path]');
    const summary = document.querySelector('[data-wiki-library-summary]');
    const status = document.querySelector('[data-wiki-library-status]');
    const content = document.querySelector('[data-wiki-library-content]');
    const prev = document.querySelector('[data-wiki-library-prev]');
    const next = document.querySelector('[data-wiki-library-next]');

    const statusCopy = {
      verified: 'Confirmado',
      partial: 'Parcial',
      verification: 'Requiere verificación'
    };

    const normalize = value => String(value || '')
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const articleBySlug = slug => library.articles.find(article => article.slug === slug) || null;
    const currentSlug = () => decodeURIComponent(String(location.hash || '').replace(/^#/, ''));

    const buildNav = () => {
      if (!nav) return;
      const fragment = document.createDocumentFragment();

      library.sections.forEach((sectionDefinition, sectionIndex) => {
        const articles = library.articles.filter(article => article.section === sectionDefinition.id);
        if (!articles.length) return;

        const group = document.createElement('details');
        group.className = 'wiki-library-nav-group';
        group.dataset.wikiLibrarySection = sectionDefinition.id;
        group.open = sectionIndex < 4;

        const summaryEl = document.createElement('summary');
        const label = document.createElement('span');
        label.textContent = sectionDefinition.label;
        const badge = document.createElement('small');
        badge.textContent = String(articles.length);
        summaryEl.append(label, badge);

        const links = document.createElement('div');
        links.className = 'wiki-library-nav-links';

        articles.forEach(article => {
          const link = document.createElement('a');
          link.href = `#${article.slug}`;
          link.dataset.wikiLibraryLink = article.slug;
          link.dataset.search = article.search;

          const dot = document.createElement('i');
          dot.className = `wiki-library-status-dot is-${article.status}`;
          dot.setAttribute('aria-hidden', 'true');

          const text = document.createElement('span');
          text.textContent = article.title;
          link.append(dot, text);
          links.appendChild(link);
        });

        group.append(summaryEl, links);
        fragment.appendChild(group);
      });

      nav.replaceChildren(fragment);
    };

    const updateSearch = () => {
      if (!nav) return;
      const query = normalize(search?.value || '');
      const links = [...nav.querySelectorAll('[data-wiki-library-link]')];
      let visible = 0;

      links.forEach(link => {
        const article = articleBySlug(link.dataset.wikiLibraryLink);
        const haystack = normalize(`${article?.title || ''} ${article?.summary || ''} ${article?.search || ''}`);
        const matches = !query || haystack.includes(query);
        link.hidden = !matches;
        if (matches) visible += 1;
      });

      [...nav.querySelectorAll('.wiki-library-nav-group')].forEach(group => {
        const visibleLinks = [...group.querySelectorAll('[data-wiki-library-link]')].filter(link => !link.hidden);
        group.hidden = visibleLinks.length === 0;
        if (query && visibleLinks.length) group.open = true;
      });

      if (count) count.textContent = String(visible);
    };

    const setPager = (element, article) => {
      if (!element) return;
      if (!article) {
        element.hidden = true;
        element.removeAttribute('href');
        return;
      }
      element.hidden = false;
      element.href = `#${article.slug}`;
      const strong = element.querySelector('strong');
      if (strong) strong.textContent = article.title;
    };

    const render = slug => {
      const article = articleBySlug(slug) || library.articles[0];
      if (!article) return;

      if (currentSlug() !== article.slug) history.replaceState(null, '', `#${article.slug}`);

      if (title) title.textContent = article.title;
      if (section) section.textContent = article.sectionLabel;
      if (path) path.textContent = article.title;
      if (summary) summary.textContent = article.summary;
      if (status) {
        status.textContent = statusCopy[article.status] || 'Parcial';
        status.className = `is-${article.status}`;
      }
      if (content) content.innerHTML = article.html;

      document.title = `${article.title} — Pixel Network Wiki`;

      if (nav) {
        nav.querySelectorAll('[data-wiki-library-link]').forEach(link => {
          const active = link.dataset.wikiLibraryLink === article.slug;
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
        const activeLink = nav.querySelector(`[data-wiki-library-link="${CSS.escape(article.slug)}"]`);
        const activeGroup = activeLink?.closest('details');
        if (activeGroup) activeGroup.open = true;
      }

      const index = library.articles.findIndex(item => item.slug === article.slug);
      setPager(prev, index > 0 ? library.articles[index - 1] : null);
      setPager(next, index >= 0 && index < library.articles.length - 1 ? library.articles[index + 1] : null);

      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    };

    buildNav();
    updateSearch();
    render(currentSlug());

    search?.addEventListener('input', updateSearch, { passive: true });
    window.addEventListener('hashchange', () => render(currentSlug()));
  };

  start();
})();

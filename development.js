(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const readPath = path => path.split('.').reduce((value, key) => value?.[key], network);

  const safePublicUrl = value => {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, location.href);
      const sameOrigin = url.origin === location.origin;
      if (sameOrigin && ['http:', 'https:'].includes(url.protocol)) return url.href;
      if (location.protocol === 'file:' && url.protocol === 'file:') return url.href;
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  };

  document.querySelectorAll('[data-network-list]').forEach(list => {
    const values = readPath(list.dataset.networkList);
    if (!Array.isArray(values)) return;
    list.replaceChildren(...values.map(value => {
      const item = document.createElement('li');
      item.textContent = String(value);
      return item;
    }));
  });

  document.querySelectorAll('[data-changelog-external]').forEach(link => {
    const externalUrl = safePublicUrl(network?.changelog?.externalUrl);
    if (externalUrl) {
      link.href = externalUrl;
      link.removeAttribute('aria-disabled');
      return;
    }
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
  });

  document.querySelectorAll('[data-changelog-feed]').forEach(feed => {
    const entries = Array.isArray(network?.changelog?.latest) ? network.changelog.latest : [];
    feed.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement('article');
      empty.className = 'timeline-item reveal visible';

      const when = document.createElement('div');
      when.className = 'when';
      when.textContent = 'Release notes';

      const body = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = 'No local release notes published yet.';
      const copy = document.createElement('p');
      copy.textContent = 'PixelWeb will show concise, player-facing release notes here when they are published. The existing GitBook remains available for the full changelog history.';
      body.append(title, copy);

      empty.append(when, body);
      feed.appendChild(empty);
      return;
    }

    entries.forEach(entry => {
      const item = document.createElement('article');
      item.className = 'timeline-item reveal visible';

      const when = document.createElement('div');
      when.className = 'when';
      when.textContent = entry.date || entry.label || 'Update';

      const body = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = entry.title || 'Pixel Network update';
      body.appendChild(title);

      if (entry.summary) {
        const summary = document.createElement('p');
        summary.textContent = entry.summary;
        body.appendChild(summary);
      }

      if (Array.isArray(entry.changes) && entry.changes.length) {
        const changes = document.createElement('ul');
        changes.className = 'feature-list';
        entry.changes.forEach(change => {
          const row = document.createElement('li');
          row.textContent = change;
          changes.appendChild(row);
        });
        body.appendChild(changes);
      }

      item.append(when, body);
      feed.appendChild(item);
    });
  });
})();
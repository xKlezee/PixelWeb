(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const readPath = path => path.split('.').reduce((value, key) => value?.[key], network);

  document.querySelectorAll('[data-network-list]').forEach(list => {
    const values = readPath(list.dataset.networkList);
    if (!Array.isArray(values)) return;
    list.replaceChildren(...values.map(value => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  });

  document.querySelectorAll('[data-changelog-external]').forEach(link => {
    if (network?.changelog?.externalUrl) link.href = network.changelog.externalUrl;
  });

  document.querySelectorAll('[data-changelog-feed]').forEach(feed => {
    const entries = Array.isArray(network?.changelog?.latest) ? network.changelog.latest : [];
    feed.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement('article');
      empty.className = 'timeline-item reveal visible';
      empty.innerHTML = '<div class="when">Release notes</div><div><h3>No local release notes published yet.</h3><p>PixelWeb will show concise, player-facing release notes here when they are published. The existing GitBook remains available for the full changelog history.</p></div>';
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
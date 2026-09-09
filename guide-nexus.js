(() => {
  const network = window.PIXEL_NETWORK_PUBLIC || {};
  const nexus = network.nexus || {};
  const instances = Array.isArray(nexus.instances) ? nexus.instances : [];
  const summaryHost = document.querySelector('[data-guide-nexus-summary]');
  const encountersBody = document.querySelector('[data-guide-nexus-encounters]');
  const milestoneHost = document.querySelector('[data-guide-nexus-milestones]');

  const el = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null && text !== undefined) node.textContent = String(text);
    return node;
  };

  if (summaryHost) {
    const facts = [
      ['Access', nexus.unlock ?? '—'],
      ['Access model', nexus.accessModel ?? '—'],
      ['Instance encounters', network.content?.instanceEncounters ?? instances.length],
      ['Individual bosses', network.content?.instanceBosses ?? '—']
    ];
    summaryHost.replaceChildren(...facts.map(([label, value]) => {
      const item = el('div', 'guide-fact');
      item.append(el('span', '', label), el('strong', '', value));
      return item;
    }));
  }

  if (encountersBody) {
    const rows = [];
    instances.forEach(instance => {
      (instance.difficulties || []).forEach(difficulty => {
        const tr = document.createElement('tr');
        [instance.name, instance.format, difficulty.name, difficulty.unlock].forEach(value => {
          tr.appendChild(el('td', '', value ?? '—'));
        });
        rows.push(tr);
      });
    });
    encountersBody.replaceChildren(...rows);
  }

  if (milestoneHost) {
    const preferredOrder = [nexus.unlock || 'Prestige IV', 'Prestige VII', 'Legacy I', 'Legacy II'];
    const grouped = new Map(preferredOrder.map(value => [value, []]));

    instances.forEach(instance => {
      (instance.difficulties || []).forEach(difficulty => {
        if (!grouped.has(difficulty.unlock)) grouped.set(difficulty.unlock, []);
        grouped.get(difficulty.unlock).push(`${instance.name} · ${difficulty.name}`);
      });
    });

    const stages = [...grouped.entries()].map(([milestone, unlocks], index) => {
      const article = el('article', 'guide-world-stage');
      const head = el('div', 'guide-world-stage-head');
      head.append(el('span', '', `MILESTONE ${String(index + 1).padStart(2, '0')}`), el('strong', '', milestone));
      const list = el('div', 'guide-milestone-unlocks');
      unlocks.forEach(unlock => list.appendChild(el('span', '', unlock)));
      article.append(head, list);
      return article;
    });
    milestoneHost.replaceChildren(...stages);
  }
})();

(() => {
  'use strict';

  const documentRoot = document.querySelector('.guides-document');
  if (!documentRoot) return;

  const categories = [
    {
      id: 'progression',
      name: 'Progression',
      description: 'The route through Pixel Network from first entry to Worlds, Prestige, Nexus and alternate progression surfaces.',
      guides: [
        ['guide-getting-started.html', 'Getting Started', 'The main Pixel experience and where a new player should begin.'],
        ['guide-progression.html', 'Levels, Prestige & Legacy', 'Current caps, access milestones and account progression layers.'],
        ['guide-worlds.html', 'Worlds & Gates', 'The four current Worlds and their progression roles.'],
        ['guide-nexus.html', 'Nexus & Instances', 'The endgame transition and account-based Nexus access.'],
        ['guide-skyblock.html', 'Skyblock', 'Personal island progression as a dedicated gameplay route.']
      ]
    },
    {
      id: 'mechanics',
      name: 'Mechanics',
      description: 'How Pixel systems behave in play: island systems, combat rules and the mechanics that connect equipment to progression.',
      guides: [
        ['guide-skyblock.html', 'Skyblock', 'Island persistence, upgrades, quests and the current feature boundary.'],
        ['guide-enchantments.html', 'Enchantments', 'Compatibility, specialized mechanics and current effect semantics.'],
        ['guide-stats-equipment.html', 'Stats & Equipment', 'Combat stats, mitigation and equipment-family behavior.']
      ]
    },
    {
      id: 'tools',
      name: 'Tools',
      description: 'Reference material for tools, equipment families and the systems that modify how they perform.',
      guides: [
        ['guide-stats-equipment.html', 'Stats & Equipment', 'Equipment-family roles, combat stats and their boundaries.'],
        ['guide-enchantments.html', 'Enchantments', 'The enchantment families that apply to tools and equipment.']
      ]
    },
    {
      id: 'armor',
      name: 'Armor',
      description: 'Defense, equipment slots and the modifiers that affect armor-oriented builds.',
      guides: [
        ['guide-stats-equipment.html', 'Stats & Equipment', 'Defense, Max Health, mitigation and equipment semantics.'],
        ['guide-enchantments.html', 'Enchantments', 'Armor-compatible enchantments and family boundaries.']
      ]
    },
    {
      id: 'specials',
      name: 'Specials',
      description: 'Systems that sit outside ordinary equipment progression and define specialized endgame or collection behavior.',
      guides: [
        ['guide-talismans.html', 'Talisman Codex', 'Collection states, equipped effects, affinity, synergy and Meta behavior.'],
        ['guide-nexus.html', 'Nexus & Instances', 'Endgame access, encounter catalogue and difficulty milestones.']
      ]
    },
    {
      id: 'boosts',
      name: 'Boosts',
      description: 'Effect-driven ways to improve equipment or character performance without presenting unverified values as facts.',
      guides: [
        ['guide-enchantments.html', 'Enchantments', 'Equipment effects and specialized enhancement mechanics.'],
        ['guide-talismans.html', 'Talisman Codex', 'Equipped passive effects and advanced Talisman interactions.']
      ]
    }
  ];

  const sidebarGroups = [...document.querySelectorAll('.guides-sidebar-nav .guides-nav-group')];
  const categoryGroup = sidebarGroups.find(group => group.querySelector('small')?.textContent.trim() === 'Categories');
  if (categoryGroup) {
    const label = document.createElement('small');
    label.textContent = 'Categories';
    const links = categories.map(category => {
      const link = document.createElement('a');
      link.href = `#${category.id}`;
      link.textContent = category.name;
      return link;
    });
    categoryGroup.replaceChildren(label, ...links);
  }

  /* The old four-category layout is presentation legacy. Remove it before mounting the
     canonical six-category Guide IA so ids such as #progression remain unique. */
  ['progression', 'worlds-endgame', 'systems', 'skyblock'].forEach(id => {
    documentRoot.querySelector(`#${id}`)?.remove();
  });

  const verification = documentRoot.querySelector('#verification');
  const library = documentRoot.querySelector('#library');
  const anchor = verification || library?.nextElementSibling || null;

  const sections = categories.map((category, index) => {
    const section = document.createElement('section');
    section.className = 'guide-section';
    section.id = category.id;

    const head = document.createElement('div');
    head.className = 'guide-section-head';
    const titleWrap = document.createElement('div');
    const small = document.createElement('small');
    small.textContent = `Category ${String(index + 1).padStart(2, '0')}`;
    const title = document.createElement('h2');
    title.textContent = category.name;
    const description = document.createElement('p');
    description.textContent = category.description;
    titleWrap.append(small, title);
    head.append(titleWrap, description);

    const grid = document.createElement('div');
    grid.className = 'guide-reference-grid';
    category.guides.forEach(([href, name, copy]) => {
      const card = document.createElement('article');
      card.className = 'guide-reference-item';
      const kind = document.createElement('small');
      kind.textContent = 'Pixel Guide';
      const heading = document.createElement('h3');
      heading.textContent = name;
      const paragraph = document.createElement('p');
      paragraph.textContent = copy;
      const link = document.createElement('a');
      link.className = 'guide-text-link';
      link.href = href;
      link.textContent = `Open ${name} →`;
      card.append(kind, heading, paragraph, link);
      grid.appendChild(card);
    });

    section.append(head, grid);
    return section;
  });

  if (anchor) sections.forEach(section => documentRoot.insertBefore(section, anchor));
  else sections.forEach(section => documentRoot.appendChild(section));

  const requestedId = location.hash.slice(1);
  if (categories.some(category => category.id === requestedId)) {
    requestAnimationFrame(() => document.getElementById(requestedId)?.scrollIntoView({ block: 'start' }));
  }
})();
(() => {
  const section = document.getElementById('immersiveStory');
  const video = document.getElementById('storyVideo');
  if (!section || !video) return;

  const copy = section.querySelector('.immersive-copy');
  const title = document.getElementById('storyTitle');
  const body = document.getElementById('storyBody');
  const kicker = document.getElementById('storyKicker');
  const progressBar = document.getElementById('storyProgress');
  const tabList = section.querySelector('.immersive-tabs');
  const tabs = [...section.querySelectorAll('.immersive-tab')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const chapters = [
    {
      at: 0,
      kicker: '01 / Progression',
      title: 'Progression gives every action context.',
      body: 'Levels, equipment, mining, combat and collections feed the same long-term account journey rather than ending as isolated activities.'
    },
    {
      at: .33,
      kicker: '02 / Worlds',
      title: 'Each world marks a change in pressure.',
      body: 'Moving forward introduces new resources, encounters and requirements. The environment is part of progression, not a backdrop placed around it.'
    },
    {
      at: .66,
      kicker: '03 / Combat',
      title: 'Combat has progression context.',
      body: 'Equipment value, preparation and PvP sit inside the wider account progression, so combat decisions matter beyond a single encounter.'
    },
    {
      at: 1,
      kicker: '04 / Nexus',
      title: 'The Nexus opens the endgame curve.',
      body: 'Prestige IV + defeating Viking permanently unlocks Nexus, where later Prestige and Legacy milestones continue through progressively harder instance encounters.'
    }
  ];

  let duration = 0;
  let frame = 0;
  let lastTime = -1;
  let activeChapter = -1;
  let chapterTransition = 0;

  tabList?.setAttribute('role', 'tablist');
  tabList?.setAttribute('aria-label', 'Pixel Network story chapters');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
  });

  function chapterFor(progress) {
    if (progress < .245) return 0;
    if (progress < .57) return 1;
    if (progress < .86) return 2;
    return 3;
  }

  function applyChapter(index) {
    const chapter = chapters[index];
    if (!chapter) return;
    if (kicker) kicker.textContent = chapter.kicker;
    if (title) title.textContent = chapter.title;
    if (body) body.textContent = chapter.body;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  function setChapter(index) {
    if (index === activeChapter) return;
    activeChapter = index;
    const token = ++chapterTransition;

    if (reducedMotion || !copy?.animate) {
      applyChapter(index);
      return;
    }

    copy.getAnimations().forEach(animation => animation.cancel());
    const out = copy.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-6px)' }
      ],
      { duration: 110, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
    );

    out.finished.then(() => {
      if (token !== chapterTransition) return;
      applyChapter(index);
      copy.animate(
        [
          { opacity: 0, transform: 'translateY(7px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 250, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
      );
    }).catch(() => {
      if (token === chapterTransition) applyChapter(index);
    });
  }

  function getProgress() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / total));
  }

  function render() {
    frame = 0;
    const progress = getProgress();
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    setChapter(chapterFor(progress));

    if (!reducedMotion && duration > 0 && video.readyState >= 1) {
      const target = Math.min(duration - .04, Math.max(0, progress * duration));
      if (Math.abs(target - lastTime) > .035) {
        try { video.currentTime = target; } catch {}
        lastTime = target;
      }
    }
  }

  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function goToChapter(index, focus = false) {
    const chapter = chapters[index];
    if (!chapter) return;
    const total = section.offsetHeight - window.innerHeight;
    const absoluteTop = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({
      top: absoluteTop + total * chapter.at,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
    if (focus) tabs[index]?.focus();
  }

  video.addEventListener('loadedmetadata', () => {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (reducedMotion && duration > 0) {
      try { video.currentTime = Math.min(duration * .28, Math.max(0, duration - .1)); } catch {}
    }
    requestRender();
  }, { once: true });

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => goToChapter(index));
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      goToChapter(next, true);
    });
  });

  applyChapter(0);
  activeChapter = 0;
  requestRender();
})();
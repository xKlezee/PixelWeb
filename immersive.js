(() => {
  const section = document.getElementById('immersiveStory');
  const video = document.getElementById('storyVideo');
  if (!section || !video) return;

  const copy = section.querySelector('.immersive-copy');
  const title = document.getElementById('storyTitle');
  const body = document.getElementById('storyBody');
  const kicker = document.getElementById('storyKicker');
  const progressBar = document.getElementById('storyProgress');
  const tabs = [...document.querySelectorAll('.immersive-tab')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const chapters = [
    {
      at: 0,
      kicker: '01 / Progression',
      title: 'Progression gives every action context.',
      body: 'Mining, trading, equipment and combat all contribute to the same journey. Advancement changes what the player can access, what they can risk and what they can build toward.'
    },
    {
      at: .33,
      kicker: '02 / Worlds',
      title: 'Each world marks a change in pressure.',
      body: 'Moving forward introduces new resources, encounters and risk. The environment is part of progression, not a backdrop placed around it.'
    },
    {
      at: .66,
      kicker: '03 / Combat',
      title: 'Combat has consequences.',
      body: 'Equipment value, economy and PvP are connected. Better preparation and better decisions matter because every fight sits inside the wider progression model.'
    },
    {
      at: 1,
      kicker: '04 / Nexus',
      title: 'The Nexus closes the loop.',
      body: 'Endgame access is earned through the systems that come before it. The final layer is designed to test progression choices and mastery rather than simply increase enemy health.'
    }
  ];

  let duration = 0;
  let frame = 0;
  let lastTime = -1;
  let activeChapter = -1;

  function chapterFor(progress) {
    if (progress < .245) return 0;
    if (progress < .57) return 1;
    if (progress < .86) return 2;
    return 3;
  }

  function setChapter(index) {
    if (index === activeChapter) return;
    activeChapter = index;
    const chapter = chapters[index];
    if (!chapter) return;

    const apply = () => {
      if (kicker) kicker.textContent = chapter.kicker;
      if (title) title.textContent = chapter.title;
      if (body) body.textContent = chapter.body;
      tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
    };

    if (reducedMotion || !copy?.animate) {
      apply();
      return;
    }

    const out = copy.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-8px)' }
      ],
      { duration: 120, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
    );

    out.finished.then(() => {
      apply();
      copy.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 280, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
      );
    }).catch(apply);
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
    tab.addEventListener('click', () => {
      const target = chapters[index].at;
      const total = section.offsetHeight - window.innerHeight;
      const absoluteTop = window.scrollY + section.getBoundingClientRect().top;
      window.scrollTo({
        top: absoluteTop + total * target,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  setChapter(0);
  requestRender();
})();

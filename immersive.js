(() => {
  const section = document.getElementById('immersiveStory');
  const video = document.getElementById('storyVideo');
  if (!section || !video) return;

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
      title: 'Every system points somewhere.',
      body: 'Progression is the spine of Pixel Network. Worlds, economy, items and combat are meant to move the same journey forward instead of existing as disconnected features.'
    },
    {
      at: .33,
      kicker: '02 / Worlds',
      title: 'The world changes with the player.',
      body: 'Each environment has a role in the progression curve: a different level of risk, different rewards and a different reason to keep moving.'
    },
    {
      at: .66,
      kicker: '03 / Combat',
      title: 'PvP is part of the progression, not a side mode.',
      body: 'Combat, equipment and economy are designed to influence one another so that better decisions matter as much as raw playtime.'
    },
    {
      at: 1,
      kicker: '04 / Nexus',
      title: 'The Nexus is the convergence point.',
      body: 'Endgame is where the systems come together. Access is earned through progression and the reward structure is built around mastery, not simply stronger numbers.'
    }
  ];

  let duration = 0;
  let frame = 0;
  let lastTime = -1;

  function chapterFor(progress) {
    if (progress < .245) return 0;
    if (progress < .57) return 1;
    if (progress < .86) return 2;
    return 3;
  }

  function paintChapter(index) {
    const chapter = chapters[index];
    if (!chapter) return;
    if (kicker) kicker.textContent = chapter.kicker;
    if (title) title.textContent = chapter.title;
    if (body) body.textContent = chapter.body;
    tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
  }

  function getProgress() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / total));
  }

  function render() {
    frame = 0;
    const p = getProgress();
    if (progressBar) progressBar.style.transform = `scaleX(${p})`;
    paintChapter(chapterFor(p));

    if (!reducedMotion && duration > 0 && video.readyState >= 1) {
      const target = Math.min(duration - .04, Math.max(0, p * duration));
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
      const top = absoluteTop + total * target;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  paintChapter(0);
  requestRender();
})();

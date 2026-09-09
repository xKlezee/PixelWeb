(() => {
  const media = (source, alt, accent, referenceStatus, referenceLabel, sprite = null) => ({
    source,
    alt,
    accent,
    referenceStatus,
    referenceLabel,
    sprite
  });

  const bossSprite = 'assets/nexus/bosses.avif';

  window.PIXEL_NEXUS_MEDIA = Object.freeze({
    hero: media(
      'assets/nexus/nexus-threshold.svg',
      'Stylized Nexus threshold portal',
      'violet',
      'original',
      'Original PixelWeb visual for the permanent Nexus threshold.'
    ),
    raphael: media(
      bossSprite,
      'Raphael in a radiant celestial sanctuary',
      'gold',
      'approved-player-provided',
      'Boss identity is based on the supplied Raphael model; the website background treatment was approved for PixelWeb.',
      'raphael'
    ),
    azazel: media(
      bossSprite,
      'Azazel inside an infernal corrupted arena',
      'crimson',
      'approved-player-provided',
      'Boss identity is based on the supplied Azazel artwork; the website composition was approved for PixelWeb.',
      'azazel'
    ),
    abyss: media(
      bossSprite,
      'Abyss inside a violet void sanctum',
      'void',
      'approved-player-provided',
      'Boss identity is based on the supplied Abyss model; the website background treatment was approved for PixelWeb.',
      'abyss'
    ),
    astral: media(
      bossSprite,
      'Astral inside a luminous cosmic arena',
      'astral',
      'approved-player-provided',
      'Boss identity is based on the supplied Astral model; the website background treatment was approved for PixelWeb.',
      'astral'
    )
  });
})();
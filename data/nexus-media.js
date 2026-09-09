(() => {
  const media = (source, alt, accent, referenceStatus, referenceLabel) => ({ source, alt, accent, referenceStatus, referenceLabel });

  window.PIXEL_NEXUS_MEDIA = Object.freeze({
    hero: media(
      'assets/nexus/nexus-threshold.svg',
      'Stylized Nexus threshold portal',
      'violet',
      'original',
      'Original PixelWeb visual for the permanent Nexus threshold.'
    ),
    raphael: media(
      'assets/nexus/raphael.svg',
      'Stylized Raphael instance concept visual',
      'gold',
      'exact-unconfirmed',
      'No unique public marketplace match was found for Raphael, so PixelWeb uses an original celestial-armored concept.'
    ),
    azazel: media(
      'assets/nexus/azazel.svg',
      'Stylized Azazel instance concept visual',
      'crimson',
      'name-match-found',
      'A public MCModels Azazel boss exists for ModelEngine/MythicMobs with sword, halberd and shield; PixelWeb does not copy its commercial artwork or assert it is Pixel\'s exact model.'
    ),
    abyss: media(
      'assets/nexus/abyss.svg',
      'Stylized Abyss instance concept visual',
      'void',
      'name-match-found',
      'A public MCModels Abyss boss exists for ModelEngine/MythicMobs; PixelWeb uses original artwork and does not assert an exact server-model match.'
    ),
    astral: media(
      'assets/nexus/astral.svg',
      'Stylized Astral instance concept visual',
      'astral',
      'exact-unconfirmed',
      'No unique public marketplace match was found for Astral, so PixelWeb uses an original celestial contrast to Abyss.'
    )
  });
})();
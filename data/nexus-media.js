(() => {
  const media = (source, alt, accent, referenceStatus, referenceLabel) => ({
    source,
    alt,
    accent,
    referenceStatus,
    referenceLabel
  });

  window.PIXEL_NEXUS_MEDIA = Object.freeze({
    hero: media(
      'assets/nexus/nexus-threshold.svg',
      'Stylized Nexus threshold portal',
      'violet',
      'original',
      'Original PixelWeb visual for the permanent Nexus threshold.'
    ),
    raphael: media(
      'assets/nexus/raphael.png',
      'Raphael in a radiant celestial sanctuary',
      'gold',
      'approved-player-provided',
      'Approved original 1448×1086 PNG. PixelWeb displays the file without conversion or sprite cropping.'
    ),
    azazel: media(
      'assets/nexus/azazel.png',
      'Azazel inside an infernal corrupted arena',
      'crimson',
      'approved-player-provided',
      'Approved original 1448×1086 PNG. PixelWeb displays the file without conversion or sprite cropping.'
    ),
    abyss: media(
      'assets/nexus/astral.png',
      'Abyss inside a violet void sanctum',
      'void',
      'approved-player-provided',
      'Approved original 1448×1086 PNG. The uploaded filenames for the dual encounter were inverted, so the manifest maps this unchanged original file to Abyss.'
    ),
    astral: media(
      'assets/nexus/abyss.png',
      'Astral inside a luminous cosmic arena',
      'astral',
      'approved-player-provided',
      'Approved original 1448×1086 PNG. The uploaded filenames for the dual encounter were inverted, so the manifest maps this unchanged original file to Astral.'
    )
  });
})();
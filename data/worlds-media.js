(() => {
  const gitbook = {
    overworld: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252Fi2tm3Y1jcEiOxK2PaII4%252FImage_fx%2520%2817%29.png%3Falt%3Dmedia%26token%3D2b1dfa01-3645-4ea0-9608-57d90114ac12&width=768&dpr=2&quality=90',
    pirate: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FCCUBM7YeamDndDjhkrjD%252F01K55740KGP2VJ0ZF14MFM3WJP.png%3Falt%3Dmedia%26token%3Da2859a65-78ca-4f37-ba39-d48464f6e726&width=768&dpr=2&quality=90',
    nether: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FTeslxzxtfv637Q0qUwd7%252FImage_fx%2520%287%29.png%3Falt%3Dmedia%26token%3D5ef48e3f-0c6b-4ee6-b257-3d8166ed6f57&width=768&dpr=2&quality=90',
    winter: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FyIhbKmsLNws7h50DFutx%252Fconsumables.png%3Falt%3Dmedia%26token%3D165c7aa4-9dba-4fdd-a79e-3753df117989&width=768&dpr=2&quality=90'
  };

  const boss = (source, alt, referenceStatus, referenceLabel) => ({
    source,
    alt,
    referenceStatus,
    referenceLabel
  });

  window.PIXEL_WORLDS_MEDIA = Object.freeze({
    overworld: {
      source: gitbook.overworld,
      alt: 'Pixel Network Overworld landscape',
      accent: 'green',
      label: 'The beginning',
      boss: boss(
        'assets/worlds/boss-beholder.svg',
        'Stylized Beholder concept visual',
        'archetype-confirmed',
        'Public ModelEngine/MythicMobs references confirm the floating-eye Beholder archetype; exact Pixel server model is not asserted.'
      )
    },
    pirate: {
      source: gitbook.pirate,
      alt: 'Pixel Network Pirate Kingdom landscape',
      accent: 'brown',
      label: 'New horizons',
      boss: boss(
        'assets/worlds/boss-hollowkeeper.svg',
        'Stylized HollowKeeper concept visual',
        'exact-unconfirmed',
        'No unique public marketplace match was found for HollowKeeper, so PixelWeb uses an original undead-pirate concept visual.'
      ),
      optionalBoss: boss(
        'assets/worlds/boss-kraken.svg',
        'Stylized Kraken concept visual',
        'archetype-confirmed',
        'Public ModelEngine/MythicMobs Kraken boss products confirm the ocean-tentacle boss archetype; PixelWeb does not copy their commercial artwork.'
      )
    },
    nether: {
      source: gitbook.nether,
      alt: 'Pixel Network Nether landscape',
      accent: 'red',
      label: 'A hotter path',
      boss: boss(
        'assets/worlds/boss-eldric.svg',
        'Stylized Eldric concept visual',
        'exact-unconfirmed',
        'No unique public marketplace match was found for Eldric, so PixelWeb uses an original infernal armored concept visual.'
      )
    },
    winter: {
      source: gitbook.winter,
      alt: 'Pixel Network Winter landscape',
      accent: 'ice',
      label: 'The final current world',
      boss: boss(
        'assets/worlds/boss-viking.svg',
        'Stylized Viking concept visual',
        'archetype-confirmed',
        'Multiple public ModelEngine/MythicMobs Viking boss packs confirm the armored Viking archetype; exact Pixel server model is not asserted.'
      )
    }
  });
})();
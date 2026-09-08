(() => {
  const gitbook = {
    overworld: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252Fi2tm3Y1jcEiOxK2PaII4%252FImage_fx%2520%2817%29.png%3Falt%3Dmedia%26token%3D2b1dfa01-3645-4ea0-9608-57d90114ac12&width=768&dpr=2&quality=90',
    pirate: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FCCUBM7YeamDndDjhkrjD%252F01K55740KGP2VJ0ZF14MFM3WJP.png%3Falt%3Dmedia%26token%3Da2859a65-78ca-4f37-ba39-d48464f6e726&width=768&dpr=2&quality=90',
    nether: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FTeslxzxtfv637Q0qUwd7%252FImage_fx%2520%287%29.png%3Falt%3Dmedia%26token%3D5ef48e3f-0c6b-4ee6-b257-3d8166ed6f57&width=768&dpr=2&quality=90',
    winter: 'https://pixel-network-1.gitbook.io/home/~gitbook/image?url=https%3A%2F%2F712597880-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fn7xotQKtgeq6qSw4VBXF%252Fuploads%252FyIhbKmsLNws7h50DFutx%252Fconsumables.png%3Falt%3Dmedia%26token%3D165c7aa4-9dba-4fdd-a79e-3753df117989&width=768&dpr=2&quality=90'
  };

  window.PIXEL_WORLDS_MEDIA = Object.freeze({
    overworld: {
      source: gitbook.overworld,
      alt: 'Pixel Network Overworld landscape',
      accent: 'green',
      label: 'The beginning'
    },
    pirate: {
      source: gitbook.pirate,
      alt: 'Pixel Network Pirate Kingdom landscape',
      accent: 'cyan',
      label: 'New horizons'
    },
    nether: {
      source: gitbook.nether,
      alt: 'Pixel Network Nether landscape',
      accent: 'red',
      label: 'A hotter path'
    },
    winter: {
      source: gitbook.winter,
      alt: 'Pixel Network Winter landscape',
      accent: 'ice',
      label: 'The final current world'
    },
    nexus: {
      source: null,
      alt: 'Nexus endgame visual',
      accent: 'violet',
      label: 'The next chapter',
      procedural: true
    }
  });
})();
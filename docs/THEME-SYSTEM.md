# PixelWeb theme system

PixelWeb exposes three visual modes through the bottom-right Appearance control:

- `System`: follows `prefers-color-scheme` and reacts to OS/browser changes while the page is open.
- `Light`: warm parchment / pale-stone interpretation of the Pixel gold identity.
- `Dark`: the original charcoal / gold presentation.

The preference is stored locally under `pixel-theme-mode-v1`. No account, cookie or backend is required.

`data/network.js` applies the saved/system mode before loading `pixel-theme.css` and `pixel-theme.js`, so the same choice follows navigation across public pages. `pixel-theme.js` owns the accessible chooser, persistence, system-theme listener and `theme-color` updates.

`pixel-theme.css` is deliberately loaded after the existing page styles. Light mode remaps shared backgrounds, chrome, Guide, Leaderboards, common cards, dialogs and footer surfaces while leaving authored media such as Minecraft screenshots, world imagery, boss art and player skins unchanged.

The active state is available on `<html>` as:

- `data-theme-mode="system|light|dark"`
- `data-theme-effective="light|dark"`

A `pixelthemechange` window event is dispatched after changes with `{ mode, effective }` in `event.detail`.

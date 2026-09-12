(() => {
  'use strict';

  const STORAGE_KEY = 'pixel-theme-mode-v1';
  const MODES = Object.freeze(['system', 'light', 'dark']);
  const root = document.documentElement;

  let mode = 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (MODES.includes(stored)) mode = stored;
  } catch {
    /* Storage can be unavailable in hardened/private contexts. */
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  const effective = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  root.dataset.themeMode = mode;
  root.dataset.themeEffective = effective;
  root.style.colorScheme = effective;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = effective === 'light' ? '#f1eadf' : '#0b0c0e';

  const styles = [
    ['pixel-theme.css', 'base'],
    ['pixel-theme-coverage.css', 'coverage'],
    ['pixel-theme-audit-fixes.css', 'audit'],
    ['pixel-theme-page-fixes.css', 'pages']
  ];

  styles.forEach(([href, role]) => {
    if (document.querySelector(`link[data-pixel-theme-styles="${role}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.pixelThemeStyles = role;
    document.head.appendChild(link);
  });

  window.PIXEL_THEME_BOOTSTRAP = Object.freeze({ mode, effective });
})();

(() => {
  'use strict';

  if (document.querySelector('[data-pixel-theme-root]')) return;

  const STORAGE_KEY = 'pixel-theme-mode-v1';
  const MODES = Object.freeze(['system', 'light', 'dark']);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const rootElement = document.documentElement;

  const readStoredMode = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return MODES.includes(value) ? value : null;
    } catch {
      return null;
    }
  };

  const writeStoredMode = mode => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* Storage can be unavailable in hardened/private contexts. */
    }
  };

  const effectiveTheme = mode => mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
  let mode = MODES.includes(rootElement.dataset.themeMode) ? rootElement.dataset.themeMode : (readStoredMode() || 'system');

  const updateThemeColor = effective => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = effective === 'light' ? '#f1eadf' : '#0b0c0e';
  };

  const modeCopy = selected => ({
    system: ['System', 'Matches your device automatically.'],
    light: ['Light', 'Warm parchment and pale stone surfaces.'],
    dark: ['Dark', 'Original charcoal and gold Pixel theme.']
  }[selected]);

  const applyMode = (nextMode, { persist = true, announce = true } = {}) => {
    mode = MODES.includes(nextMode) ? nextMode : 'system';
    const effective = effectiveTheme(mode);
    rootElement.dataset.themeMode = mode;
    rootElement.dataset.themeEffective = effective;
    rootElement.style.colorScheme = effective;
    updateThemeColor(effective);
    if (persist) writeStoredMode(mode);

    const triggerLabel = document.querySelector('[data-pixel-theme-trigger-label]');
    const triggerIcon = document.querySelector('[data-pixel-theme-trigger-icon]');
    const live = document.querySelector('[data-pixel-theme-live]');
    if (triggerLabel) triggerLabel.textContent = modeCopy(mode)[0];
    if (triggerIcon) triggerIcon.dataset.mode = mode;

    document.querySelectorAll('[data-pixel-theme-option]').forEach(button => {
      const selected = button.dataset.pixelThemeOption === mode;
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
      button.classList.toggle('is-selected', selected);
    });

    if (live && announce) {
      live.textContent = mode === 'system'
        ? `Theme set to System. Using ${effective} mode.`
        : `Theme set to ${mode}.`;
    }

    window.dispatchEvent(new CustomEvent('pixelthemechange', { detail: { mode, effective } }));
  };

  const control = document.createElement('div');
  control.className = 'pixel-theme-control';
  control.dataset.pixelThemeRoot = '';

  const panel = document.createElement('section');
  panel.className = 'pixel-theme-panel';
  panel.id = 'pixel-theme-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'pixel-theme-title');

  const panelHeader = document.createElement('header');
  panelHeader.className = 'pixel-theme-panel-head';
  const headerCopy = document.createElement('div');
  const kicker = document.createElement('span');
  kicker.className = 'pixel-theme-kicker';
  kicker.textContent = 'Appearance';
  const title = document.createElement('h2');
  title.id = 'pixel-theme-title';
  title.textContent = 'Page theme';
  headerCopy.append(kicker, title);
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'pixel-theme-close';
  closeButton.setAttribute('aria-label', 'Close theme menu');
  closeButton.textContent = '×';
  panelHeader.append(headerCopy, closeButton);

  const choices = document.createElement('div');
  choices.className = 'pixel-theme-options';
  choices.setAttribute('role', 'radiogroup');
  choices.setAttribute('aria-label', 'Page theme');

  MODES.forEach(themeMode => {
    const [label, description] = modeCopy(themeMode);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pixel-theme-option';
    button.dataset.pixelThemeOption = themeMode;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');

    const symbol = document.createElement('span');
    symbol.className = 'pixel-theme-symbol';
    symbol.dataset.mode = themeMode;
    symbol.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    copy.className = 'pixel-theme-option-copy';
    const strong = document.createElement('strong');
    strong.textContent = label;
    const small = document.createElement('small');
    small.textContent = description;
    copy.append(strong, small);
    const check = document.createElement('span');
    check.className = 'pixel-theme-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';
    button.append(symbol, copy, check);

    button.addEventListener('click', () => {
      applyMode(themeMode);
      window.setTimeout(() => closePanel({ restoreFocus: true }), 80);
    });
    choices.appendChild(button);
  });

  const live = document.createElement('span');
  live.className = 'pixel-theme-live';
  live.dataset.pixelThemeLive = '';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  panel.append(panelHeader, choices, live);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'pixel-theme-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', panel.id);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', 'Change page theme');

  const triggerIcon = document.createElement('span');
  triggerIcon.className = 'pixel-theme-trigger-icon';
  triggerIcon.dataset.pixelThemeTriggerIcon = '';
  triggerIcon.setAttribute('aria-hidden', 'true');
  const triggerText = document.createElement('span');
  triggerText.className = 'pixel-theme-trigger-copy';
  const triggerTitle = document.createElement('span');
  triggerTitle.textContent = 'Theme';
  const triggerLabel = document.createElement('strong');
  triggerLabel.dataset.pixelThemeTriggerLabel = '';
  triggerText.append(triggerTitle, triggerLabel);
  trigger.append(triggerIcon, triggerText);

  control.append(panel, trigger);
  document.body.appendChild(control);

  const openPanel = () => {
    if (!panel.hidden) return;
    panel.hidden = false;
    control.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => panel.querySelector('.pixel-theme-option.is-selected')?.focus());
  };

  function closePanel({ restoreFocus = false } = {}) {
    if (panel.hidden) return;
    panel.hidden = true;
    control.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', () => panel.hidden ? openPanel() : closePanel({ restoreFocus: true }));
  closeButton.addEventListener('click', () => closePanel({ restoreFocus: true }));

  document.addEventListener('pointerdown', event => {
    if (panel.hidden || control.contains(event.target)) return;
    closePanel();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      closePanel({ restoreFocus: true });
      return;
    }
    if (!panel.hidden && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      const options = [...choices.querySelectorAll('.pixel-theme-option')];
      const index = options.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      options[(index + delta + options.length) % options.length].focus();
    }
  });

  media.addEventListener?.('change', () => {
    if (mode === 'system') applyMode('system', { persist: false, announce: false });
  });

  applyMode(mode, { persist: false, announce: false });

  window.PixelTheme = Object.freeze({
    get mode() { return mode; },
    get effective() { return effectiveTheme(mode); },
    set: nextMode => applyMode(nextMode),
    open: openPanel
  });
})();

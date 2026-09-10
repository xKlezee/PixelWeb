(() => {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;

  const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const visibleFocusable = () => [...overlay.querySelectorAll(focusableSelector)]
    .filter(element => !element.hidden && element.offsetParent !== null);

  const focusEntry = () => {
    if (overlay.hidden) return;
    const preferred = document.getElementById('login-email');
    if (preferred instanceof HTMLElement && preferred.offsetParent !== null) {
      preferred.focus();
      return;
    }
    visibleFocusable()[0]?.focus();
  };

  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || overlay.hidden) return;
    const focusable = visibleFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (!overlay.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  requestAnimationFrame(focusEntry);
})();
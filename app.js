/* Pixel Network — community forum preview */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const RANK_PREMIUM = ['vip', 'mvp', 'ultra', 'pixel', 'pixel+'];
const RANK_MEDIA = ['media'];
const RANK_STAFF = ['staff'];

function getRankClass(rank) {
  const value = String(rank || 'member').toLowerCase();
  if (RANK_STAFF.includes(value)) return 'rank-staff';
  if (RANK_PREMIUM.includes(value)) return 'rank-premium';
  if (RANK_MEDIA.includes(value)) return 'rank-media';
  return 'rank-normal';
}

function getRankChipClass(rank) {
  const value = String(rank || 'member').toLowerCase();
  if (RANK_STAFF.includes(value)) return 'rank-chip-staff';
  if (RANK_PREMIUM.includes(value)) return 'rank-chip-premium';
  if (RANK_MEDIA.includes(value)) return 'rank-chip-media';
  return '';
}

let toastTimer = null;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

const TOAST = {
  success: message => showToast(message, 'success'),
  info: message => showToast(message, 'info'),
  error: message => showToast(message, 'error')
};

const PREVIEW_PROFILE = {
  username: 'Guest',
  rank: 'member'
};

const SAMPLE_POSTS = [
  {
    id: 'welcome',
    title: 'Welcome to the Pixel Network Forum',
    content: 'This preview shows the community experience while persistent accounts and live forum services remain disabled.',
    created_at: '2026-09-06T12:00:00Z',
    profiles: { username: 'Pixel Network', rank: 'staff' }
  },
  {
    id: 'progression',
    title: 'Progression and world design',
    content: 'A space for development updates, player discussion, guides and feedback around the systems that shape Pixel Network.',
    created_at: '2026-09-05T18:30:00Z',
    profiles: { username: 'Community', rank: 'media' }
  }
];

let currentUser = null;
let currentProfile = null;
let allPosts = [...SAMPLE_POSTS];
let lastPostAt = 0;
let cooldownTimer = null;
let lastDialogTrigger = null;

function switchTab(tab) {
  const tabs = [...document.querySelectorAll('.auth-tab')];
  const panels = [...document.querySelectorAll('.auth-panel')];

  tabs.forEach(button => {
    const active = button.id === `tab-${tab}`;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });

  panels.forEach(panel => {
    const active = panel.id === `panel-${tab}`;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
}

function enterPreview(username) {
  currentUser = { id: 'preview-session' };
  currentProfile = { ...PREVIEW_PROFILE, username: username || PREVIEW_PROFILE.username };
  applyProfileToUI(currentProfile);

  const authOverlay = document.getElementById('auth-overlay');
  const appContainer = document.getElementById('app');
  if (authOverlay) authOverlay.style.display = 'none';
  if (appContainer) appContainer.style.display = 'block';

  loadPosts();
  document.getElementById('post-title')?.focus();
  TOAST.info('Preview session started. Changes remain local to this visit.');
}

function doLogin() {
  const username = document.getElementById('login-email')?.value.trim() || 'Guest';
  enterPreview(username);
}

function doSignup() {
  const username = document.getElementById('su-username')?.value.trim() || 'Guest';
  enterPreview(username);
}

function doLogout() {
  currentUser = null;
  currentProfile = null;
  closePost(false);
  const overlay = document.getElementById('auth-overlay');
  const app = document.getElementById('app');
  if (overlay) overlay.style.display = 'flex';
  if (app) app.style.display = 'none';
  requestAnimationFrame(() => document.getElementById('login-email')?.focus());
  TOAST.info('Preview session closed.');
}

function applyProfileToUI(profile) {
  const rank = profile.rank || 'member';
  const rankClass = getRankClass(rank);
  const username = profile.username || 'Guest';
  const initial = username.charAt(0).toUpperCase();

  document.getElementById('profile-username').textContent = username;
  document.getElementById('profile-rank-badge').textContent = rank.toUpperCase();
  document.getElementById('profile-avatar-char').textContent = initial;
  document.getElementById('profile-avatar-wrap').className = `profile-avatar-wrap ${rankClass}`;

  document.getElementById('nav-username').textContent = username;
  document.getElementById('nav-avatar-char').textContent = initial;
  document.getElementById('nav-avatar-border').className = `nav-avatar ${rankClass}`;
}

function generateLinkCode() {
  TOAST.info('Account linking will be available when persistent accounts go live.');
}

function loadPosts() {
  const feed = document.getElementById('posts-feed');
  if (!feed) return;

  document.getElementById('posts-count').textContent =
    `${allPosts.length} ${allPosts.length === 1 ? 'POST' : 'POSTS'}`;

  feed.innerHTML = allPosts.map(renderPost).join('');
}

function formatDate(value, includeTime = false) {
  const options = includeTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(value).toLocaleString('en', options);
}

function renderPost(post) {
  const profile = post.profiles || {};
  const username = profile.username || 'Unknown';
  const rank = profile.rank || 'member';
  const rankClass = getRankClass(rank);
  const chipClass = getRankChipClass(rank);
  const initial = username.charAt(0).toUpperCase();
  const date = formatDate(post.created_at);
  const postId = escapeHtml(String(post.id));
  const title = escapeHtml(post.title || 'Untitled post');

  return `
<div class="post-card ${rankClass}" role="button" tabindex="0" aria-label="Open post: ${title}" onclick="openPost('${postId}')" onkeydown="handlePostKey(event, '${postId}')">
  <div class="post-header">
    <div class="post-author-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
    <div class="post-author-info">
      <div class="post-author-name font-special">
        ${escapeHtml(username)}
        <span class="post-rank-chip font-special ${chipClass}">${escapeHtml(rank.toUpperCase())}</span>
      </div>
      <div class="post-time font-special">${escapeHtml(date)}</div>
    </div>
  </div>
  <div class="post-title">${title}</div>
  <div class="post-body font-special">${escapeHtml(post.content || '')}</div>
  <div class="post-footer">
    <span class="post-footer-meta font-special">${escapeHtml(date)}</span>
  </div>
</div>`;
}

function handlePostKey(event, id) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openPost(id);
}

function openPost(id) {
  const post = allPosts.find(item => String(item.id) === String(id));
  if (!post) return;

  lastDialogTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const profile = post.profiles || {};
  const username = profile.username || 'Unknown';
  const rank = profile.rank || 'member';
  const rankClass = getRankClass(rank);
  const chipClass = getRankChipClass(rank);
  const initial = username.charAt(0).toUpperCase();
  const date = formatDate(post.created_at, true);

  let overlay = document.getElementById('post-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'post-modal-overlay';
    overlay.className = 'post-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';
    overlay.innerHTML = '<div class="post-modal" id="post-modal-inner" role="dialog" aria-modal="true" aria-labelledby="post-modal-title" tabindex="-1" style="position:relative"></div>';
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closePost();
    });
    document.body.appendChild(overlay);
  }

  const modal = document.getElementById('post-modal-inner');
  modal.innerHTML = `
    <button class="post-modal-close font-special" type="button" onclick="closePost()" aria-label="Close post">CLOSE ×</button>
    <div class="post-header" style="margin-bottom:18px">
      <div class="post-author-avatar ${rankClass}" aria-hidden="true">${escapeHtml(initial)}</div>
      <div class="post-author-info">
        <div class="post-author-name font-special">
          ${escapeHtml(username)}
          <span class="post-rank-chip font-special ${chipClass}">${escapeHtml(rank.toUpperCase())}</span>
        </div>
        <div class="post-time font-special">${escapeHtml(date)}</div>
      </div>
    </div>
    <div class="post-title" id="post-modal-title" style="font-size:19px;margin-bottom:16px">${escapeHtml(post.title || '')}</div>
    <div class="post-modal-body font-special">${escapeHtml(post.content || '')}</div>
  `;

  overlay.style.display = '';
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    modal.querySelector('.post-modal-close')?.focus();
  });
}

function closePost(restoreFocus = true) {
  const overlay = document.getElementById('post-modal-overlay');
  if (!overlay || overlay.getAttribute('aria-hidden') === 'true') return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  setTimeout(() => {
    overlay.style.display = 'none';
    if (restoreFocus && lastDialogTrigger?.isConnected) lastDialogTrigger.focus();
    lastDialogTrigger = null;
  }, delay);
}

function updateCooldownUI() {
  const button = document.getElementById('btn-submit');
  const info = document.getElementById('cooldown-info');
  if (!button || !info) return;

  const remaining = 15000 - (Date.now() - lastPostAt);
  if (lastPostAt > 0 && remaining > 0) {
    const seconds = Math.ceil(remaining / 1000);
    button.disabled = true;
    info.textContent = `WAIT ${seconds}S`;
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(updateCooldownUI, 1000);
  } else {
    button.disabled = false;
    info.textContent = '';
  }
}

function submitPost() {
  if (!currentUser) {
    TOAST.error('Enter the forum preview before posting.');
    return;
  }

  const now = Date.now();
  if (lastPostAt > 0 && now - lastPostAt < 15000) {
    TOAST.info('Please wait a few seconds before posting again.');
    return;
  }

  const title = document.getElementById('post-title')?.value.trim() || '';
  const content = document.getElementById('post-body')?.value.trim() || '';
  if (!title || !content) {
    TOAST.error('A title and message are required.');
    return;
  }

  allPosts.unshift({
    id: `preview-${Date.now()}`,
    title,
    content,
    created_at: new Date().toISOString(),
    profiles: { username: currentProfile?.username || 'Guest', rank: 'member' }
  });

  lastPostAt = Date.now();
  document.getElementById('post-title').value = '';
  document.getElementById('post-body').value = '';
  TOAST.success('Post added to this preview session.');
  updateCooldownUI();
  loadPosts();
  document.querySelector('.post-card')?.focus();
}

function trapDialogFocus(event) {
  if (event.key !== 'Tab') return;
  const overlay = document.getElementById('post-modal-overlay');
  if (!overlay || overlay.getAttribute('aria-hidden') === 'true') return;
  const modal = document.getElementById('post-modal-inner');
  const focusable = [...modal.querySelectorAll('button,[href],input,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.disabled && element.offsetParent !== null);
  if (!focusable.length) {
    event.preventDefault();
    modal.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closePost();
  trapDialogFocus(event);
});

document.addEventListener('DOMContentLoaded', () => {
  const authTabs = [...document.querySelectorAll('.auth-tab')];
  authTabs.forEach((tab, index) => {
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % authTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + authTabs.length) % authTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = authTabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      const target = authTabs[next];
      switchTab(target.id.replace('tab-', ''));
      target.focus();
    });
  });

  document.getElementById('post-title')?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.getElementById('post-body')?.focus();
    }
  });
});
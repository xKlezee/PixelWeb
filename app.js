/* Pixel Network — community forum preview */

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

function createElement(tag, className = '', text = null) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== null && text !== undefined) element.textContent = String(text);
  return element;
}

let toastTimer = null;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.className = `toast ${type}`;
  toast.textContent = String(message);
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
let closePostTimer = null;

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
  if (authOverlay) authOverlay.hidden = true;
  if (appContainer) appContainer.hidden = false;

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
  if (overlay) overlay.hidden = false;
  if (app) app.hidden = true;
  requestAnimationFrame(() => document.getElementById('login-email')?.focus());
  TOAST.info('Preview session closed.');
}

function applyProfileToUI(profile) {
  const rank = profile.rank || 'member';
  const rankClass = getRankClass(rank);
  const username = profile.username || 'Guest';
  const initial = username.charAt(0).toUpperCase();

  const profileUsername = document.getElementById('profile-username');
  const profileRankBadge = document.getElementById('profile-rank-badge');
  const profileAvatarChar = document.getElementById('profile-avatar-char');
  const profileAvatarWrap = document.getElementById('profile-avatar-wrap');
  const navUsername = document.getElementById('nav-username');
  const navAvatarChar = document.getElementById('nav-avatar-char');
  const navAvatarBorder = document.getElementById('nav-avatar-border');

  if (profileUsername) profileUsername.textContent = username;
  if (profileRankBadge) profileRankBadge.textContent = rank.toUpperCase();
  if (profileAvatarChar) profileAvatarChar.textContent = initial;
  if (profileAvatarWrap) profileAvatarWrap.className = `profile-avatar-wrap ${rankClass}`;
  if (navUsername) navUsername.textContent = username;
  if (navAvatarChar) navAvatarChar.textContent = initial;
  if (navAvatarBorder) navAvatarBorder.className = `nav-avatar ${rankClass}`;
}

function generateLinkCode() {
  TOAST.info('Account linking will be available when persistent accounts go live.');
}

function formatDate(value, includeTime = false) {
  const options = includeTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(value).toLocaleString('en', options);
}

function buildPost(post) {
  const profile = post?.profiles || {};
  const username = profile.username || 'Unknown';
  const rank = profile.rank || 'member';
  const rankClass = getRankClass(rank);
  const chipClass = getRankChipClass(rank);
  const initial = username.charAt(0).toUpperCase();
  const date = formatDate(post?.created_at);
  const title = post?.title || 'Untitled post';

  const card = createElement('div', `post-card ${rankClass}`);
  card.setAttribute('role', 'button');
  card.tabIndex = 0;
  card.setAttribute('aria-label', `Open post: ${title}`);
  card.dataset.postId = String(post?.id ?? '');

  const header = createElement('div', 'post-header');
  const avatar = createElement('div', 'post-author-avatar', initial);
  avatar.setAttribute('aria-hidden', 'true');

  const authorInfo = createElement('div', 'post-author-info');
  const authorName = createElement('div', 'post-author-name font-special');
  authorName.append(document.createTextNode(username), document.createTextNode(' '));
  const rankChip = createElement('span', `post-rank-chip font-special ${chipClass}`.trim(), rank.toUpperCase());
  authorName.appendChild(rankChip);
  const time = createElement('div', 'post-time font-special', date);
  authorInfo.append(authorName, time);
  header.append(avatar, authorInfo);

  const titleNode = createElement('div', 'post-title', title);
  const body = createElement('div', 'post-body font-special', post?.content || '');
  const footer = createElement('div', 'post-footer');
  footer.appendChild(createElement('span', 'post-footer-meta font-special', date));

  card.append(header, titleNode, body, footer);
  return card;
}

function loadPosts() {
  const feed = document.getElementById('posts-feed');
  if (!feed) return;

  const count = document.getElementById('posts-count');
  if (count) count.textContent = `${allPosts.length} ${allPosts.length === 1 ? 'POST' : 'POSTS'}`;

  feed.replaceChildren(...allPosts.map(buildPost));
}

function buildModalHeader(post) {
  const profile = post?.profiles || {};
  const username = profile.username || 'Unknown';
  const rank = profile.rank || 'member';
  const rankClass = getRankClass(rank);
  const chipClass = getRankChipClass(rank);
  const initial = username.charAt(0).toUpperCase();
  const date = formatDate(post?.created_at, true);

  const header = createElement('div', 'post-header post-modal-header');
  const avatar = createElement('div', `post-author-avatar ${rankClass}`, initial);
  avatar.setAttribute('aria-hidden', 'true');

  const authorInfo = createElement('div', 'post-author-info');
  const authorName = createElement('div', 'post-author-name font-special');
  authorName.append(document.createTextNode(username), document.createTextNode(' '));
  authorName.appendChild(createElement('span', `post-rank-chip font-special ${chipClass}`.trim(), rank.toUpperCase()));
  authorInfo.append(authorName, createElement('div', 'post-time font-special', date));
  header.append(avatar, authorInfo);
  return header;
}

function ensurePostModal() {
  let overlay = document.getElementById('post-modal-overlay');
  if (overlay) return overlay;

  overlay = createElement('div', 'post-modal-overlay');
  overlay.id = 'post-modal-overlay';
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');

  const modal = createElement('div', 'post-modal post-modal-inner');
  modal.id = 'post-modal-inner';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'post-modal-title');
  modal.tabIndex = -1;
  overlay.appendChild(modal);

  overlay.addEventListener('click', event => {
    if (event.target === overlay) closePost();
  });
  document.body.appendChild(overlay);
  return overlay;
}

function openPost(id) {
  const post = allPosts.find(item => String(item.id) === String(id));
  if (!post) return;

  clearTimeout(closePostTimer);
  lastDialogTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const overlay = ensurePostModal();
  const modal = document.getElementById('post-modal-inner');
  if (!modal) return;

  const closeButton = createElement('button', 'post-modal-close font-special', 'CLOSE ×');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close post');
  closeButton.addEventListener('click', () => closePost());

  const title = createElement('div', 'post-title post-modal-title', post.title || '');
  title.id = 'post-modal-title';
  const body = createElement('div', 'post-modal-body font-special', post.content || '');

  modal.replaceChildren(closeButton, buildModalHeader(post), title, body);
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    closeButton.focus();
  });
}

function closePost(restoreFocus = true) {
  const overlay = document.getElementById('post-modal-overlay');
  if (!overlay || overlay.getAttribute('aria-hidden') === 'true') return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  clearTimeout(closePostTimer);
  closePostTimer = setTimeout(() => {
    if (overlay.getAttribute('aria-hidden') === 'true') overlay.hidden = true;
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

  const titleInput = document.getElementById('post-title');
  const bodyInput = document.getElementById('post-body');
  const title = titleInput?.value.trim() || '';
  const content = bodyInput?.value.trim() || '';
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
  if (titleInput) titleInput.value = '';
  if (bodyInput) bodyInput.value = '';
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
  if (!modal) return;
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

function handlePostFeedActivation(event) {
  const card = event.target instanceof Element ? event.target.closest('.post-card[data-post-id]') : null;
  if (!card) return;
  if (event.type === 'keydown') {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
  }
  openPost(card.dataset.postId);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closePost();
  trapDialogFocus(event);
});

document.addEventListener('DOMContentLoaded', () => {
  const authTabs = [...document.querySelectorAll('.auth-tab')];
  authTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchTab(tab.id.replace('tab-', '')));
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

  document.getElementById('btn-login')?.addEventListener('click', doLogin);
  document.getElementById('btn-signup')?.addEventListener('click', doSignup);
  document.getElementById('btn-logout')?.addEventListener('click', doLogout);
  document.getElementById('btn-link-mc')?.addEventListener('click', generateLinkCode);
  document.getElementById('btn-submit')?.addEventListener('click', submitPost);
  document.getElementById('btn-refresh')?.addEventListener('click', loadPosts);

  const feed = document.getElementById('posts-feed');
  feed?.addEventListener('click', handlePostFeedActivation);
  feed?.addEventListener('keydown', handlePostFeedActivation);

  document.getElementById('post-title')?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.getElementById('post-body')?.focus();
    }
  });
});

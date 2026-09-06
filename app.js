/* =============================================
   PIXEL NETWORK — COMMUNITY FORUM
   Public demonstration build

   This file intentionally contains no production credentials,
   database endpoints, webhooks, server integration commands,
   or administrative infrastructure details.
   ============================================= */

const SC_MAP = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ',
  k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'Q', r:'ʀ', s:'ꜱ', t:'ᴛ',
  u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
};

function toSmallCaps(str) {
  if (!str) return '';
  return String(str).toLowerCase().split('').map(c => SC_MAP[c] || c).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const RANK_PREMIUM = ['vip', 'pixel'];
const RANK_MEDIA = ['media'];
const RANK_STAFF = ['staff'];

function getRankClass(rank) {
  const r = String(rank || 'member').toLowerCase();
  if (RANK_STAFF.includes(r)) return 'rank-staff';
  if (RANK_PREMIUM.includes(r)) return 'rank-premium';
  if (RANK_MEDIA.includes(r)) return 'rank-media';
  return 'rank-normal';
}

function getRankChipClass(rank) {
  const r = String(rank || 'member').toLowerCase();
  if (RANK_STAFF.includes(r)) return 'rank-chip-staff';
  if (RANK_PREMIUM.includes(r)) return 'rank-chip-premium';
  if (RANK_MEDIA.includes(r)) return 'rank-chip-media';
  return '';
}

let _toastTimer = null;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = `toast ${type}`;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

const TOAST = {
  success: m => showToast(m, 'success'),
  info: m => showToast(m, 'info'),
  error: m => showToast(m, 'error')
};

const DEMO_PROFILE = {
  username: 'Guest',
  rank: 'member'
};

const SAMPLE_POSTS = [
  {
    id: 'welcome',
    title: 'Welcome to the Pixel Network Community Forum',
    content: 'This public build demonstrates the forum interface without connecting to production services or private server infrastructure.',
    created_at: '2026-09-06T12:00:00Z',
    profiles: { username: 'Pixel Network', rank: 'staff' }
  },
  {
    id: 'progression',
    title: 'Progression & world design',
    content: 'A preview area for sharing updates, community discussions, guides and future Pixel Network announcements.',
    created_at: '2026-09-05T18:30:00Z',
    profiles: { username: 'Community', rank: 'media' }
  }
];

let _user = null;
let _profile = null;
let _allPosts = [...SAMPLE_POSTS];
let _lastPost = 0;
let _cooldownTimer = null;

function switchTab(tab) {
  document.querySelectorAll('.auth-tab, .auth-panel').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  document.getElementById(`panel-${tab}`)?.classList.add('active');
}

function enterDemo(username) {
  _user = { id: 'public-demo' };
  _profile = { ...DEMO_PROFILE, username: username || DEMO_PROFILE.username };
  applyProfileToUI(_profile);

  const authOverlay = document.getElementById('auth-overlay');
  const appContainer = document.getElementById('app');
  if (authOverlay) authOverlay.style.display = 'none';
  if (appContainer) appContainer.style.display = 'block';

  loadPosts();
  TOAST.info('Public demo mode — no account data is sent or stored.');
}

function doLogin() {
  const email = document.getElementById('login-email')?.value.trim() || '';
  const username = email.includes('@') ? email.split('@')[0] : 'Guest';
  enterDemo(username);
}

function doSignup() {
  const username = document.getElementById('su-username')?.value.trim() || 'Guest';
  enterDemo(username);
}

function doLogout() {
  _user = null;
  _profile = null;
  document.getElementById('auth-overlay').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  TOAST.info('Demo session closed.');
}

function applyProfileToUI(profile) {
  const rankRaw = profile.rank || 'member';
  const rankClass = getRankClass(rankRaw);
  const usernameDisplay = toSmallCaps(profile.username || 'guest');
  const rankDisplay = toSmallCaps(rankRaw);
  const initial = (profile.username || '?').charAt(0).toUpperCase();

  document.getElementById('profile-username').textContent = usernameDisplay;
  document.getElementById('profile-rank-badge').textContent = rankDisplay;
  document.getElementById('profile-avatar-char').textContent = initial;
  document.getElementById('profile-avatar-wrap').className = `profile-avatar-wrap ${rankClass}`;

  document.getElementById('nav-username').textContent = usernameDisplay;
  document.getElementById('nav-avatar-char').textContent = initial;
  document.getElementById('nav-avatar-border').className = `nav-avatar ${rankClass}`;
}

function generateLinkCode() {
  TOAST.info('Account linking is disabled in the public demonstration build.');
}

function loadPosts() {
  const feed = document.getElementById('posts-feed');
  if (!feed) return;

  document.getElementById('posts-count').textContent =
    toSmallCaps(`${_allPosts.length} ${_allPosts.length === 1 ? 'post' : 'posts'}`);

  feed.innerHTML = _allPosts.map(post => renderPost(post)).join('');
}

function renderPost(post) {
  const profile = post.profiles || {};
  const username = toSmallCaps(profile.username || 'unknown');
  const rankRaw = profile.rank || 'member';
  const rankDisplay = toSmallCaps(rankRaw);
  const rankClass = getRankClass(rankRaw);
  const chipClass = getRankChipClass(rankRaw);
  const initial = (profile.username || '?').charAt(0).toUpperCase();
  const dateStr = new Date(post.created_at).toLocaleDateString('en', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const postId = escapeHtml(String(post.id));

  return `
<div class="post-card ${rankClass}" onclick="openPost('${postId}')">
  <div class="post-header">
    <div class="post-author-avatar">${escapeHtml(initial)}</div>
    <div class="post-author-info">
      <div class="post-author-name font-special">
        ${escapeHtml(username)}
        <span class="post-rank-chip font-special ${chipClass}">${escapeHtml(rankDisplay)}</span>
      </div>
      <div class="post-time font-special">${escapeHtml(toSmallCaps(dateStr))}</div>
    </div>
  </div>
  <div class="post-title">${escapeHtml(post.title || '')}</div>
  <div class="post-body font-special">${escapeHtml(post.content || '')}</div>
  <div class="post-footer">
    <span class="post-footer-meta font-special">${escapeHtml(toSmallCaps(dateStr))}</span>
  </div>
</div>`;
}

function openPost(id) {
  const post = _allPosts.find(p => String(p.id) === String(id));
  if (!post) return;

  const profile = post.profiles || {};
  const username = toSmallCaps(profile.username || 'unknown');
  const rankRaw = profile.rank || 'member';
  const rankDisplay = toSmallCaps(rankRaw);
  const rankClass = getRankClass(rankRaw);
  const chipClass = getRankChipClass(rankRaw);
  const initial = (profile.username || '?').charAt(0).toUpperCase();
  const dateStr = new Date(post.created_at).toLocaleString('en', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  let overlay = document.getElementById('post-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'post-modal-overlay';
    overlay.className = 'post-modal-overlay';
    overlay.innerHTML = '<div class="post-modal" id="post-modal-inner" style="position:relative"></div>';
    overlay.addEventListener('click', e => { if (e.target === overlay) closePost(); });
    document.body.appendChild(overlay);
  }

  document.getElementById('post-modal-inner').innerHTML = `
    <button class="post-modal-close font-special" onclick="closePost()">${toSmallCaps('close ×')}</button>
    <div class="post-header" style="margin-bottom:18px">
      <div class="post-author-avatar ${rankClass}">${escapeHtml(initial)}</div>
      <div class="post-author-info">
        <div class="post-author-name font-special">
          ${escapeHtml(username)}
          <span class="post-rank-chip font-special ${chipClass}">${escapeHtml(rankDisplay)}</span>
        </div>
        <div class="post-time font-special">${escapeHtml(toSmallCaps(dateStr))}</div>
      </div>
    </div>
    <div class="post-title" style="font-size:19px;margin-bottom:16px">${escapeHtml(post.title || '')}</div>
    <div class="post-modal-body font-special">${escapeHtml(post.content || '')}</div>
  `;

  overlay.style.display = '';
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closePost() {
  const overlay = document.getElementById('post-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

function updateCooldownUI() {
  const btn = document.getElementById('btn-submit');
  const info = document.getElementById('cooldown-info');
  if (!btn || !info) return;

  const diff = 15000 - (Date.now() - _lastPost);
  if (_lastPost > 0 && diff > 0) {
    const secs = Math.ceil(diff / 1000);
    btn.disabled = true;
    info.textContent = toSmallCaps(`wait ${secs}s before posting`);
    clearTimeout(_cooldownTimer);
    _cooldownTimer = setTimeout(updateCooldownUI, 1000);
  } else {
    btn.disabled = false;
    info.textContent = '';
  }
}

function submitPost() {
  if (!_user) {
    TOAST.error('Open the demo session first.');
    return;
  }

  const now = Date.now();
  if (_lastPost > 0 && now - _lastPost < 15000) {
    TOAST.info('Please wait a few seconds before posting again.');
    return;
  }

  const title = document.getElementById('post-title')?.value.trim() || '';
  const content = document.getElementById('post-body')?.value.trim() || '';
  if (!title || !content) {
    TOAST.error('Title and post body are required.');
    return;
  }

  _allPosts.unshift({
    id: `demo-${Date.now()}`,
    title,
    content,
    created_at: new Date().toISOString(),
    profiles: { username: _profile?.username || 'Guest', rank: 'member' }
  });

  _lastPost = Date.now();
  document.getElementById('post-title').value = '';
  document.getElementById('post-body').value = '';
  TOAST.success('Demo post created locally.');
  updateCooldownUI();
  loadPosts();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePost();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-pw')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('su-pw')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSignup();
  });
  document.getElementById('post-title')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('post-body')?.focus();
    }
  });
});

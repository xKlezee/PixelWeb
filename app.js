/* =============================================
   PIXEL SKYBLOCK COMMUNITY FORUM
   app.js — Supabase + Full Forum Logic (HOTFIXED)
   ============================================= */

// ─── SUPABASE & DISCORD INIT ─────────────────────────────────────────────────
const _SB_URL = 'https://hlcptvdkwmaeiazybenl.supabase.co';
const _SB_KEY = 'sb_publishable_L78nHl65t4LxyLvEXJw34Q_iMqXcGzU';
const sb = window.supabase.createClient(_SB_URL, _SB_KEY);

// IMPORTANTE: Reemplaza esto con la URL del Webhook de tu canal Foro en Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1478024586967777455/Viu99gOXNrOYDKPB9vfq0lNpiCNZbcOmkQYIz191KtSQycxv1i076TlGmyvZdbfOL4Od'; 

// ─── SMALL CAPS FONT MAP ──────────────────────────────────────────────────────
const SC_MAP = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ',
  k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'Q', r:'ʀ', s:'ꜱ', t:'ᴛ',
  u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
};

/**
 * Convert a string to the special small-caps font.
 * Numbers and symbols pass through unchanged.
 */
function toSmallCaps(str) {
  if (!str) return '';
  return String(str).toLowerCase().split('').map(c => SC_MAP[c] || c).join('');
}

// ─── RANK CLASSIFICATION ─────────────────────────────────────────────────────
const RANK_NORMAL  = ['member','iron','gold','diamond','emerald','obsidian'];
const RANK_PREMIUM = ['vip','mvp','ultra','pixel','pixel+'];
const RANK_MEDIA   = ['media'];
const RANK_STAFF   = ['builder','helper','moderator','senior mod','global mod','admin','global admin','manager','founder'];

/**
 * Normalise a rank string (coming in small-caps) back to plain lowercase.
 * Needed because ranks stored in DB go through toSmallCaps display but
 * the raw value is used for CSS class logic.
 */
const SC_REVERSE = Object.fromEntries(Object.entries(SC_MAP).map(([k,v]) => [v, k]));
function normaliseRank(rankStr) {
  if (!rankStr) return 'member';
  return String(rankStr).split('').map(c => SC_REVERSE[c] || c).join('').toLowerCase().trim();
}

function getRankClass(rawRank) {
  const r = normaliseRank(rawRank);
  if (RANK_STAFF.includes(r))   return 'rank-staff';
  if (RANK_PREMIUM.includes(r)) return 'rank-premium';
  if (RANK_MEDIA.includes(r))   return 'rank-media';
  return 'rank-normal';
}

function getRankChipClass(rawRank) {
  const r = normaliseRank(rawRank);
  if (RANK_STAFF.includes(r))   return 'rank-chip-staff';
  if (RANK_PREMIUM.includes(r)) return 'rank-chip-premium';
  if (RANK_MEDIA.includes(r))   return 'rank-chip-media';
  return '';
}

// ─── TOAST SYSTEM ────────────────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

const TOAST = {
  success: (m) => showToast(`<span style="color:#c1ffcf;font-weight:bold;">${m}</span>`, 'success'),
  info:    (m) => showToast(`<span style="color:#b9e5ff;font-weight:bold;">${m}</span>`, 'info'),
  error:   (m) => showToast(`<span style="color:#ffb3b3;font-weight:bold;">${m}</span>`, 'error'),
};

// ─── APP STATE ────────────────────────────────────────────────────────────────
let _user      = null;   // supabase auth user
let _profile   = null;   // profiles row
let _lastPost  = 0;      // timestamp of last post (for rate limiting)
let _cooldownTimer = null;

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.auth-tab, .auth-panel').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');
}

async function doSignup() {
  const username = document.getElementById('su-username').value.trim();
  const email    = document.getElementById('su-email').value.trim();
  const pw       = document.getElementById('su-pw').value;

  if (!username || !email || !pw) {
    TOAST.error(toSmallCaps('all fields are required'));
    return;
  }
  if (pw.length < 6) {
    TOAST.error(toSmallCaps('password must be at least 6 characters'));
    return;
  }

  TOAST.info(toSmallCaps('creating account...'));

  const { data, error } = await sb.auth.signUp({ email, password: pw });
  if (error) { TOAST.error(toSmallCaps(error.message)); return; }

  // Create profile row
  const uid = data.user?.id;
  if (uid) {
    const { error: pe } = await sb.from('profiles').upsert({
      id: uid,
      username: username,
      rank: 'member'
    });
    if (pe) console.warn('Profile upsert error:', pe.message);
  }

  TOAST.success(toSmallCaps('account created — check email to confirm'));
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;

  if (!email || !pw) {
    TOAST.error(toSmallCaps('enter email and password'));
    return;
  }

  TOAST.info(toSmallCaps('signing in...'));

  const { error } = await sb.auth.signInWithPassword({ email, password: pw });
  if (error) { TOAST.error(toSmallCaps(error.message)); return; }
  // Session change fires onAuthStateChange below
}

async function doLogout() {
  await sb.auth.signOut();
  _user = null; _profile = null;
  document.getElementById('auth-overlay').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  TOAST.info(toSmallCaps('signed out'));
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
async function loadProfile(uid) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', uid).single();
  if (error || !data) return null;
  return data;
}

function applyProfileToUI(profile) {
  const rankRaw   = profile.rank || 'member';
  const rankClass = getRankClass(rankRaw);
  const usernameDisplay = toSmallCaps(profile.username || 'unknown');
  const rankDisplay     = toSmallCaps(rankRaw);
  const initial = (profile.username || '?').charAt(0).toUpperCase();

  // Sidebar
  document.getElementById('profile-username').textContent = usernameDisplay;
  document.getElementById('profile-rank-badge').textContent = rankDisplay;
  document.getElementById('profile-avatar-char').textContent = initial;
  const pa = document.getElementById('profile-avatar-wrap');
  pa.className = `profile-avatar-wrap ${rankClass}`;

  // Nav
  document.getElementById('nav-username').textContent = usernameDisplay;
  document.getElementById('nav-avatar-char').textContent = initial;
  const na = document.getElementById('nav-avatar-border');
  na.className = `nav-avatar ${rankClass}`;
}

// ─── LINK CODE ────────────────────────────────────────────────────────────────
async function generateLinkCode() {
  if (!_user) return;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code  = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  const { error } = await sb.from('profiles').update({ link_code: code }).eq('id', _user.id);
  if (error) { TOAST.error(toSmallCaps('could not save code')); return; }

  document.getElementById('link-code-val').textContent = code;
  const box = document.getElementById('link-code-box');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
  TOAST.success(toSmallCaps('link code generated'));
}

// ─── DISCORD WEBHOOK INTEGRATION ──────────────────────────────────────────────
async function syncPostToDiscord(title, content, authorName) {
  if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === 'TU_WEBHOOK_URL_AQUI') return null;

  const discordPayload = {
      thread_name: title.toUpperCase(),
      content: `📝 **ɴᴇᴡ ꜰᴏʀᴜᴍ ᴘᴏꜱᴛ**\n\n**ᴀᴜᴛʜᴏʀ:** ${authorName}\n\n${content}`,
  };

  try {
      const response = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload)
      });

      if (!response.ok) throw new Error('Failed to reach Discord Webhook');
      
      const data = await response.json();
      return data.channel_id; // Retorna el ID del hilo para Supabase
  } catch (err) {
      console.error("Error syncing to Discord:", err);
      return null;
  }
}

// ─── POSTS ────────────────────────────────────────────────────────────────────
async function loadPosts() {
  const feed = document.getElementById('posts-feed');
  feed.innerHTML = `<div class="loading-posts">
    <div class="loading-spinner"></div>
    <span class="font-special">${toSmallCaps('loading posts...')}</span>
  </div>`;

  // HOTFIX: Modificado user_id por author_id y añadido discord_thread_id
  const { data, error } = await sb
    .from('posts')
    .select(`
      id, title, content, created_at, author_id, discord_thread_id,
      profiles ( username, rank )
    `)
    .order('created_at', { ascending: false })
    .limit(80);

  if (error) {
    feed.innerHTML = `<div class="no-posts font-special">${toSmallCaps('could not load posts — ' + error.message)}</div>`;
    TOAST.error(toSmallCaps(error.message));
    return;
  }

  const count = data?.length || 0;
  document.getElementById('posts-count').textContent =
    toSmallCaps(count + (count === 1 ? ' post' : ' posts'));

  if (!count) {
    feed.innerHTML = `<div class="no-posts font-special">${toSmallCaps('no posts yet — be the first!')}</div>`;
    return;
  }

  feed.innerHTML = data.map(post => renderPost(post)).join('');
}

function renderPost(post) {
  const profile    = post.profiles || {};
  const username   = toSmallCaps(profile.username  || 'unknown');
  const rankRaw    = profile.rank || 'member';
  const rankDisplay = toSmallCaps(rankRaw);
  const rankClass  = getRankClass(rankRaw);
  const chipClass  = getRankChipClass(rankRaw);
  const initial    = (profile.username || '?').charAt(0).toUpperCase();
  const dateStr    = new Date(post.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  const titleSafe  = escapeHtml(post.title || '');
  const bodySafe   = escapeHtml(post.content || '');
  const postId     = escapeHtml(String(post.id));

  // Opcional: Badge de Discord si existe el thread ID
  const discordBadge = post.discord_thread_id ? `<span style="margin-left:8px;color:#5865F2;">[Discord Sync]</span>` : '';

  return `
<div class="post-card ${rankClass}" onclick="openPost('${postId}')">
  <div class="post-header">
    <div class="post-author-avatar">${initial}</div>
    <div class="post-author-info">
      <div class="post-author-name font-special">
        ${username}
        <span class="post-rank-chip font-special ${chipClass}">${rankDisplay}</span>
      </div>
      <div class="post-time font-special">${toSmallCaps(dateStr)} ${discordBadge}</div>
    </div>
  </div>
  <div class="post-title">${titleSafe}</div>
  <div class="post-body font-special">${bodySafe}</div>
  <div class="post-footer">
    <span class="post-footer-meta font-special">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ${toSmallCaps(dateStr)}
    </span>
  </div>
</div>`;
}

// ─── POST MODAL ───────────────────────────────────────────────────────────────
let _allPosts = [];

// Override loadPosts to cache data
const _origLoad = loadPosts;
async function loadPosts() {
  const feed = document.getElementById('posts-feed');
  feed.innerHTML = `<div class="loading-posts">
    <div class="loading-spinner"></div>
    <span class="font-special">${toSmallCaps('loading posts...')}</span>
  </div>`;

  // HOTFIX: Modificado user_id por author_id y añadido discord_thread_id
  const { data, error } = await sb
    .from('posts')
    .select(`
      id, title, content, created_at, author_id, discord_thread_id,
      profiles ( username, rank )
    `)
    .order('created_at', { ascending: false })
    .limit(80);

  if (error) {
    feed.innerHTML = `<div class="no-posts font-special">${toSmallCaps('could not load posts — ' + error.message)}</div>`;
    TOAST.error(toSmallCaps(error.message));
    return;
  }

  _allPosts = data || [];
  const count = _allPosts.length;
  document.getElementById('posts-count').textContent =
    toSmallCaps(count + (count === 1 ? ' post' : ' posts'));

  if (!count) {
    feed.innerHTML = `<div class="no-posts font-special">${toSmallCaps('no posts yet — be the first!')}</div>`;
    return;
  }

  feed.innerHTML = _allPosts.map(post => renderPost(post)).join('');
}

function openPost(id) {
  const post = _allPosts.find(p => String(p.id) === String(id));
  if (!post) return;

  const profile     = post.profiles || {};
  const username    = toSmallCaps(profile.username || 'unknown');
  const rankRaw     = profile.rank || 'member';
  const rankDisplay = toSmallCaps(rankRaw);
  const rankClass   = getRankClass(rankRaw);
  const chipClass   = getRankChipClass(rankRaw);
  const initial     = (profile.username || '?').charAt(0).toUpperCase();
  const dateStr     = new Date(post.created_at).toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Build or reuse modal
  let overlay = document.getElementById('post-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'post-modal-overlay';
    overlay.className = 'post-modal-overlay';
    overlay.innerHTML = `<div class="post-modal" id="post-modal-inner" style="position:relative"></div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closePost(); });
    document.body.appendChild(overlay);
  }

  document.getElementById('post-modal-inner').innerHTML = `
    <button class="post-modal-close font-special" onclick="closePost()">${toSmallCaps('close ×')}</button>
    <div class="post-header" style="margin-bottom:18px">
      <div class="post-author-avatar ${rankClass}">${initial}</div>
      <div class="post-author-info">
        <div class="post-author-name font-special">
          ${username}
          <span class="post-rank-chip font-special ${chipClass}">${rankDisplay}</span>
        </div>
        <div class="post-time font-special">${toSmallCaps(dateStr)}</div>
      </div>
    </div>
    <div class="post-title" style="font-size:19px;margin-bottom:16px">${escapeHtml(post.title || '')}</div>
    <div class="post-modal-body font-special">${escapeHtml(post.content || '')}</div>
  `;

  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closePost() {
  const overlay = document.getElementById('post-modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.style.display = 'none', 300);
    setTimeout(() => overlay.style.display = '', 310);
  }
}

// ─── SUBMIT POST ──────────────────────────────────────────────────────────────
function updateCooldownUI() {
  const btn  = document.getElementById('btn-submit');
  const info = document.getElementById('cooldown-info');
  const now  = Date.now();
  const diff = 60000 - (now - _lastPost);

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

async function submitPost() {
  const now = Date.now();

  // Rate limit: 60 second cooldown
  if (_lastPost > 0 && (now - _lastPost) < 60000) {
    const secs = Math.ceil((60000 - (now - _lastPost)) / 1000);
    TOAST.info(toSmallCaps(`please wait ${secs} seconds before posting again`));
    return;
  }

  const title   = document.getElementById('post-title').value.trim();
  const content = document.getElementById('post-body').value.trim();

  if (!title)   { TOAST.error(toSmallCaps('post title cannot be empty')); return; }
  if (!content) { TOAST.error(toSmallCaps('post body cannot be empty'));  return; }
  if (!_user)   { TOAST.error(toSmallCaps('you must be signed in'));       return; }

  document.getElementById('btn-submit').disabled = true;

  // 1. Sincronizar con el Foro de Discord para obtener el ID del hilo
  const threadId = await syncPostToDiscord(title, content, _profile?.username || 'user');

  // 2. Insertar en Supabase guardando el vínculo con Discord
  const { error } = await sb.from('posts').insert({
    author_id: _user.id,
    title:   title,
    content: content,
    discord_thread_id: threadId
  });

  if (error) {
    TOAST.error(toSmallCaps(error.message));
    document.getElementById('btn-submit').disabled = false;
    return;
  }

  _lastPost = Date.now();
  document.getElementById('post-title').value = '';
  document.getElementById('post-body').value  = '';
  TOAST.success(toSmallCaps('post published successfully'));
  updateCooldownUI();
  await loadPosts();
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
sb.auth.onAuthStateChange(async (event, session) => {
  const authOverlay = document.getElementById('auth-overlay');
  const appContainer = document.getElementById('app');

  if (session?.user) {
    _user = session.user;

    try {
      // Load / create profile
      _profile = await loadProfile(_user.id);
      if (!_profile) {
        // Create minimal profile if doesn't exist
        const { data, error: upsertError } = await sb.from('profiles').upsert({
          id:       _user.id,
          username: _user.email?.split('@')[0] || 'user',
          rank:     'member'
        }).select().single();
        
        if (upsertError) throw upsertError;
        _profile = data;
      }

      if (_profile) applyProfileToUI(_profile);

      // Show app, hide auth overlay safely
      if (authOverlay) authOverlay.style.display = 'none';
      if (appContainer) appContainer.style.display = 'block';

      await loadPosts();
    } catch (err) {
      console.error("Critical Auth Sync Error:", err);
      // Fallback: Mostrar UI de todas formas para evitar freeze
      if (authOverlay) authOverlay.style.display = 'none';
      if (appContainer) appContainer.style.display = 'block';
      await loadPosts();
    }
  } else {
    _user = null; _profile = null;
    if (authOverlay) authOverlay.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
  }
});

// Keyboard shortcut: Escape closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePost();
});

// Enter key in login form
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

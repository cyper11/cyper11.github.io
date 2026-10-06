/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIELD LOG — PUBLIC CLIENT MODULE
 * Responsive Feed · Anonymous Verified Likes · Modal Lightbox · Owner State
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  const STORAGE_KEY_TOKEN = 'c1p_visitor_token';
  const STORAGE_KEY_LIKES = 'c1p_local_likes';
  const POSTS_PER_PAGE = 100; // Load all — feed uses internal scroll

  let currentPage = 1;
  let totalPosts = 0;
  let allLoadedPosts = [];
  let userLikesMap = {};
  let isFetching = false;

  // DOM Elements
  let feedContainer, dialogEl, toastEl;

  /* ─── Anonymous Visitor Token ─── */
  function getVisitorToken() {
    try {
      let token = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (!token || token.length < 10) {
        token = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      }
      return token;
    } catch (_) {
      return 'anon_' + Date.now().toString(36);
    }
  }

  function getLocalLikes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LIKES) || '{}');
    } catch (_) {
      return {};
    }
  }

  function setLocalLike(postId, isLiked) {
    try {
      const likes = getLocalLikes();
      if (isLiked) {
        likes[postId] = true;
      } else {
        delete likes[postId];
      }
      localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(likes));
    } catch (_) {}
  }

  /* ─── Date Formatter ─── */
  function formatDate(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (_) {
      return isoString;
    }
  }

  /* ─── HTML Sanitizer / Escape ─── */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ─── Toast Notification ─── */
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'fl-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2600);
  }

  /* ─── Fetch Posts (API with Static JSON Fallback) ─── */
  async function fetchPosts(page = 1) {
    if (isFetching) return;
    isFetching = true;
    const visitorToken = getVisitorToken();

    try {
      // Attempt live API first
      const res = await fetch(`/api/posts?page=${page}&limit=${POSTS_PER_PAGE}&visitorToken=${encodeURIComponent(visitorToken)}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) throw new Error('API server returned ' + res.status);
      const data = await res.json();

      currentPage = data.page;
      totalPosts = data.total;
      userLikesMap = { ...userLikesMap, ...(data.userLikes || {}) };

      if (page === 1) {
        allLoadedPosts = data.posts || [];
      } else {
        allLoadedPosts = [...allLoadedPosts, ...(data.posts || [])];
      }

      renderFeed();
    } catch (err) {
      // Graceful fallback to static JSON export (e.g. GitHub Pages)
      console.warn('[Field Log] API offline, falling back to static JSON export:', err.message);
      await fetchStaticFallback(page);
    } finally {
      isFetching = false;
    }
  }

  async function fetchStaticFallback(page) {
    try {
      const res = await fetch('data/field-log.json');
      if (!res.ok) throw new Error('Static JSON missing');
      const data = await res.json();
      const rawPosts = data.posts || [];

      totalPosts = rawPosts.length;
      const startIndex = 0;
      const endIndex = page * POSTS_PER_PAGE;
      allLoadedPosts = rawPosts.slice(startIndex, endIndex);

      // Merge local likes from localStorage
      const localLikes = getLocalLikes();
      userLikesMap = { ...localLikes };

      renderFeed();
    } catch (fallbackErr) {
      console.error('[Field Log] Static fallback also failed:', fallbackErr);
      if (allLoadedPosts.length === 0) {
        renderEmptyState();
      }
    }
  }

  /* ─── Render Feed ─── */
  function renderFeed() {
    if (!feedContainer) return;

    if (allLoadedPosts.length === 0) {
      renderEmptyState();
      return;
    }

    const html = allLoadedPosts.map(post => {
      const isLiked = !!userLikesMap[post.id];
      const typeClean = escapeHtml(post.type || 'GENERAL');
      const typeSlug = typeClean.toLowerCase().replace(/\s+/g, '-');
      const formattedDate = formatDate(post.created_at);
      const isCert = typeClean === 'CERTIFICATION';

      return `
        <article class="field-log-post reveal visible" data-id="${post.id}" data-type="${typeClean}" id="field-log-${post.id}">
          <header class="fl-post-header">
            <div class="fl-post-author">
              <img src="profile.jpg" alt="Cyper Ivan Pelina" class="fl-author-avatar" width="40" height="40" loading="lazy">
              <div class="fl-author-info">
                <div class="fl-author-name-row">
                  <span class="fl-author-name">Cyper Ivan Pelina</span>
                  <span class="verified-badge" title="Verified profile" aria-label="Verified profile">
                    <svg viewBox="0 0 16 16" width="0.9em" height="0.9em" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.8" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.3"/>
                      <path d="M5.2 8.2l1.9 2 3.8-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </div>
                <span class="fl-author-role">Field Service Engineer</span>
                <time class="fl-post-date" datetime="${escapeHtml(post.created_at)}">${formattedDate}</time>
              </div>
            </div>
            <span class="fl-type-pill fl-type-${typeSlug}">${typeClean}</span>
          </header>

          <div class="fl-post-body">
            <h3 class="fl-post-title" data-open-id="${post.id}">${escapeHtml(post.title)}</h3>
            <div class="fl-post-content">${escapeHtml(post.content)}</div>

            ${post.image_url ? `
              <div class="fl-media-wrap ${isCert ? 'fl-media-cert' : ''}" role="button" tabindex="0" data-open-id="${post.id}" aria-label="View enlarged image: ${escapeHtml(post.title)}">
                <img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.title)}" class="fl-media-img" loading="lazy">
                <span class="fl-media-zoom-hint" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  ${isCert ? 'VIEW CERTIFICATE' : 'PREVIEW'}
                </span>
              </div>
            ` : ''}

            ${post.external_link ? `
              <a href="${escapeHtml(post.external_link)}" target="_blank" rel="noopener noreferrer" class="fl-ext-link">
                <span>${isCert ? 'Verify Credential' : 'Open Link'}</span>
                <svg class="ui-arrow ui-arrow-up-right" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </a>
            ` : ''}
          </div>

          <footer class="fl-post-footer">
            <button type="button" class="fl-action-btn fl-like-btn ${isLiked ? 'liked' : ''}" data-like-id="${post.id}" aria-label="${isLiked ? 'Unlike post' : 'Like post'}">
              <span class="fl-like-icon" aria-hidden="true">${isLiked ? '♥︎' : '♡'}</span>
              <span class="fl-action-text">${isLiked ? 'Liked' : 'Like'}</span>
              <span class="fl-like-count">${post.likes_count || 0}</span>
            </button>
            <button type="button" class="fl-action-btn fl-detail-btn" data-open-id="${post.id}" aria-label="View full post details">
              <span class="fl-action-icon" aria-hidden="true">💬</span>
              <span class="fl-action-text">Details</span>
            </button>
            <button type="button" class="fl-action-btn fl-share-btn" data-share-id="${post.id}" aria-label="Share this field log entry">
              <span class="fl-action-icon" aria-hidden="true">↗︎</span>
              <span class="fl-action-text">Share</span>
            </button>
          </footer>
        </article>
      `;
    }).join('');

    feedContainer.innerHTML = html;

    const noteGrid = document.querySelector('.personal-note .note-grid');
    if (noteGrid) noteGrid.classList.add('visible');
  }

  function renderEmptyState() {
    if (!feedContainer) return;
    feedContainer.innerHTML = `
      <div class="field-log-empty">
        <span class="field-log-empty-icon" aria-hidden="true">⚡</span>
        <h4>No field logs yet.</h4>
        <p>New work, certifications, and engineering projects will appear here.</p>
      </div>
    `;
  }

  /* ─── Like Toggle Interaction ─── */
  async function handleLikeClick(postId, buttonEl) {
    postId = parseInt(postId, 10);
    const post = allLoadedPosts.find(p => p.id === postId);
    if (!post) return;

    const currentlyLiked = !!userLikesMap[postId];
    const newLiked = !currentlyLiked;

    // Optimistic UI update
    userLikesMap[postId] = newLiked;
    post.likes_count = Math.max(0, (post.likes_count || 0) + (newLiked ? 1 : -1));
    setLocalLike(postId, newLiked);

    updateLikeButtonUI(buttonEl, newLiked, post.likes_count);

    // Sync modal like button if open
    if (dialogEl && dialogEl.open) {
      const modalLikeBtn = dialogEl.querySelector(`[data-like-id="${postId}"]`);
      if (modalLikeBtn) {
        updateLikeButtonUI(modalLikeBtn, newLiked, post.likes_count);
      }
    }

    // Server confirmation
    try {
      const visitorToken = getVisitorToken();
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorToken })
      });

      if (res.ok) {
        const data = await res.json();
        post.likes_count = data.likesCount;
        userLikesMap[postId] = data.liked;
        setLocalLike(postId, data.liked);
        updateLikeButtonUI(buttonEl, data.liked, data.likesCount);
      }
    } catch (_) {
      // Retain optimistic offline state
    }
  }

  function updateLikeButtonUI(btn, isLiked, count) {
    if (!btn) return;
    btn.classList.toggle('liked', isLiked);
    btn.setAttribute('aria-label', isLiked ? 'Unlike post' : 'Like post');
    const icon = btn.querySelector('.fl-like-icon');
    const text = btn.querySelector('.fl-action-text');
    const countEl = btn.querySelector('.fl-like-count');

    if (icon) icon.textContent = isLiked ? '♥︎' : '♡';
    if (text) text.textContent = isLiked ? 'Liked' : 'Like';
    if (countEl) countEl.textContent = count;
  }

  /* ─── Share Handler ─── */
  function handleShareClick(postId) {
    const post = allLoadedPosts.find(p => p.id === parseInt(postId, 10));
    if (!post) return;

    const shareUrl = window.location.origin + window.location.pathname + '#field-log-' + postId;
    const shareTitle = `Cyper Ivan Pelina — ${post.title} (${post.type})`;

    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      navigator.share({
        title: shareTitle,
        text: post.content.substring(0, 100) + '...',
        url: shareUrl
      }).catch(() => {
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!');
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Link copied to clipboard!');
    } catch (_) {
      showToast('Share URL: ' + text);
    }
    document.body.removeChild(ta);
  }

  /* ─── Detail Modal / Lightbox ─── */
  function openPostModal(postId) {
    const post = allLoadedPosts.find(p => p.id === parseInt(postId, 10));
    if (!post || !dialogEl) return;

    const isLiked = !!userLikesMap[post.id];
    const typeClean = escapeHtml(post.type || 'GENERAL');
    const typeSlug = typeClean.toLowerCase().replace(/\s+/g, '-');
    const formattedDate = formatDate(post.created_at);

    const dialogContent = `
      <div class="fl-dialog-shell">
        <header class="fl-dialog-header">
          <div class="fl-dialog-title-meta">
            <span class="fl-type-pill fl-type-${typeSlug}">${typeClean}</span>
            <span>LOG #${String(post.id).padStart(3, '0')}</span>
          </div>
          <button type="button" class="fl-dialog-close" id="fl-dialog-close-btn" aria-label="Close dialog">×</button>
        </header>

        <div class="fl-dialog-content">
          <div class="fl-dialog-author-row">
            <div class="fl-post-author">
              <img src="profile.jpg" alt="Cyper Ivan Pelina" class="fl-author-avatar" width="42" height="42">
              <div class="fl-author-info">
                <div class="fl-author-name-row">
                  <span class="fl-author-name">Cyper Ivan Pelina</span>
                  <span class="verified-badge" title="Verified profile" aria-label="Verified profile">
                    <svg viewBox="0 0 16 16" width="0.9em" height="0.9em" fill="none">
                      <circle cx="8" cy="8" r="6.8" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.3"/>
                      <path d="M5.2 8.2l1.9 2 3.8-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </div>
                <span class="fl-author-role">Field Service Engineer</span>
                <time class="fl-post-date">${formattedDate}</time>
              </div>
            </div>
          </div>

          <h2 class="fl-dialog-heading">${escapeHtml(post.title)}</h2>
          <div class="fl-dialog-text">${escapeHtml(post.content)}</div>

          ${post.image_url ? `
            <div class="fl-dialog-media">
              <img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.title)}" loading="lazy">
            </div>
          ` : ''}

          ${post.external_link ? `
            <a href="${escapeHtml(post.external_link)}" target="_blank" rel="noopener noreferrer" class="fl-ext-link">
              <span>${post.type === 'CERTIFICATION' ? 'Verify Credential' : 'Open Link'}</span>
              <svg class="ui-arrow ui-arrow-up-right" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>
          ` : ''}
        </div>

        <footer class="fl-dialog-footer">
          <button type="button" class="fl-action-btn fl-like-btn ${isLiked ? 'liked' : ''}" data-like-id="${post.id}" aria-label="${isLiked ? 'Unlike post' : 'Like post'}">
            <span class="fl-like-icon" aria-hidden="true">${isLiked ? '♥︎' : '♡'}</span>
            <span class="fl-action-text">${isLiked ? 'Liked' : 'Like'}</span>
            <span class="fl-like-count">${post.likes_count || 0}</span>
          </button>
          <button type="button" class="fl-action-btn fl-share-btn" data-share-id="${post.id}" aria-label="Share post">
            <span class="fl-action-icon" aria-hidden="true">↗︎</span>
            <span class="fl-action-text">Share</span>
          </button>
        </footer>
      </div>
    `;

    dialogEl.innerHTML = dialogContent;

    if (typeof dialogEl.showModal === 'function') {
      dialogEl.showModal();
    } else {
      dialogEl.setAttribute('open', '');
    }

    document.body.style.overflow = 'hidden';

    // Hook modal close
    const closeBtn = dialogEl.querySelector('#fl-dialog-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closePostModal);
  }

  function closePostModal() {
    if (!dialogEl) return;
    if (typeof dialogEl.close === 'function') {
      dialogEl.close();
    } else {
      dialogEl.removeAttribute('open');
    }
    document.body.style.overflow = '';
  }

  /* ─── Check Owner Session & Update Subtle Sidebar Entry ─── */
  async function checkOwnerSession() {
    try {
      const res = await fetch('/api/admin/session');
      if (!res.ok) return;
      const data = await res.json();

      if (data.authenticated) {
        revealOwnerNav();
      }
    } catch (_) {}
  }

  function revealOwnerNav() {
    const ownerNav = document.getElementById('nav-owner-field-log');
    if (ownerNav) {
      ownerNav.hidden = false;
      ownerNav.style.display = 'flex';
    }

    const secretBtn = document.getElementById('click-this-btn');
    if (secretBtn) {
      secretBtn.innerHTML = '<span class="owner-pill">● OWNER</span> FIELD LOG';
      secretBtn.title = 'Open Field Log Admin Workspace';
      secretBtn.setAttribute('aria-label', 'Open Field Log Admin Workspace');
      secretBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/admin/field-log';
      };
    }
  }

  /* ─── Setup Event Delegation ─── */
  function setupEvents() {
    // Feed container delegation (likes, details, media click, share)
    if (feedContainer) {
      feedContainer.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('[data-like-id]');
        if (likeBtn) {
          e.preventDefault();
          handleLikeClick(likeBtn.dataset.likeId, likeBtn);
          return;
        }

        const shareBtn = e.target.closest('[data-share-id]');
        if (shareBtn) {
          e.preventDefault();
          handleShareClick(shareBtn.dataset.shareId);
          return;
        }

        const openTarget = e.target.closest('[data-open-id]');
        if (openTarget) {
          e.preventDefault();
          openPostModal(openTarget.dataset.openId);
          return;
        }
      });
    }

    // Modal dialog click delegation
    if (dialogEl) {
      dialogEl.addEventListener('click', (e) => {
        if (e.target === dialogEl) {
          closePostModal();
          return;
        }

        const likeBtn = e.target.closest('[data-like-id]');
        if (likeBtn) {
          e.preventDefault();
          const feedBtn = feedContainer.querySelector(`.fl-like-btn[data-like-id="${likeBtn.dataset.likeId}"]`);
          handleLikeClick(likeBtn.dataset.likeId, feedBtn || likeBtn);
          return;
        }

        const shareBtn = e.target.closest('[data-share-id]');
        if (shareBtn) {
          e.preventDefault();
          handleShareClick(shareBtn.dataset.shareId);
          return;
        }
      });

      dialogEl.addEventListener('cancel', () => {
        document.body.style.overflow = '';
      });
    }

    // Owner secret shortcut: Ctrl+Shift+L
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        window.location.href = '/admin/field-log';
      }
    });

    // Deep link hash support (#field-log-1)
    if (window.location.hash && window.location.hash.startsWith('#field-log-')) {
      const targetId = window.location.hash.replace('#field-log-', '');
      setTimeout(() => {
        openPostModal(targetId);
      }, 600);
    }
  }

  /* ─── Initialization ─── */
  function init() {
    feedContainer = document.getElementById('field-log-feed');
    dialogEl = document.getElementById('fl-detail-dialog');

    if (!feedContainer) return;

    setupEvents();
    fetchPosts(1);
    checkOwnerSession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

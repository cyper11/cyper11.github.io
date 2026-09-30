/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIELD LOG ADMIN CMS — CONTROLLER
 * Session Guard · Post CRUD · Certificate Upload · Live Sync
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  let currentEditingPostId = null;
  let allAdminPosts = [];
  let currentFilter = 'all';
  let uploadedImageUrl = null;

  // DOM Elements
  const loginSection = document.getElementById('admin-login-view');
  const dashboardSection = document.getElementById('admin-dashboard-view');
  const loginForm = document.getElementById('admin-login-form');
  const loginPassInput = document.getElementById('admin-pass-input');
  const loginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const topLogoutBtn = document.getElementById('admin-top-logout-btn');

  const editorCard = document.getElementById('admin-editor-card');
  const editorForm = document.getElementById('admin-post-form');
  const editorHeading = document.getElementById('editor-heading');
  const newPostBtn = document.getElementById('admin-new-post-btn');
  const cancelEditBtn = document.getElementById('editor-cancel-btn');

  // Form Fields
  const inputType = document.getElementById('post-type-select');
  const inputTitle = document.getElementById('post-title-input');
  const inputContent = document.getElementById('post-content-input');
  const inputDate = document.getElementById('post-date-input');
  const inputLink = document.getElementById('post-link-input');
  const inputStatusPublished = document.getElementById('status-published-radio');
  const inputStatusDraft = document.getElementById('status-draft-radio');

  // Media Upload & Preview
  const fileInput = document.getElementById('media-file-input');
  const uploadZone = document.getElementById('media-upload-zone');
  const previewBox = document.getElementById('media-preview-box');
  const previewImg = document.getElementById('media-preview-img');
  const replaceImgBtn = document.getElementById('media-replace-btn');
  const removeImgBtn = document.getElementById('media-remove-btn');

  // Posts List
  const postsListContainer = document.getElementById('admin-posts-list');
  const filterTabs = document.querySelectorAll('.filter-tab');

  // Toast
  const toastEl = document.getElementById('admin-toast');

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (_) {
      return isoString;
    }
  }

  function resolveMediaUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:')) {
      return url;
    }
    return '/' + url;
  }

  /* ─── Session Verification ─── */
  async function checkSession() {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();

      if (data.authenticated) {
        showDashboard();
      } else {
        showLogin();
      }
    } catch (err) {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    if (loginPassInput) loginPassInput.focus();
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    loadAdminPosts();
    resetEditor();
  }

  /* ─── Login & Logout Handlers ─── */
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pass = loginPassInput.value;
      if (!pass) return;

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'AUTHENTICATING...';
      if (loginError) loginError.classList.remove('show');

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          loginPassInput.value = '';
          showToast('Authenticated as Owner');
          showDashboard();
        } else {
          if (loginError) {
            loginError.textContent = data.error || 'Authentication rejected';
            loginError.classList.add('show');
          }
        }
      } catch (err) {
        if (loginError) {
          loginError.textContent = 'Server connection error';
          loginError.classList.add('show');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'AUTHENTICATE ACCESS →';
      }
    });
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (_) {}
    showToast('Logged out');
    showLogin();
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (topLogoutBtn) topLogoutBtn.addEventListener('click', handleLogout);

  /* ─── Load Admin Posts ─── */
  async function loadAdminPosts() {
    try {
      const res = await fetch('/api/admin/posts');
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      allAdminPosts = data.posts || [];
      renderAdminPostsList();
    } catch (err) {
      showToast('Error loading posts');
    }
  }

  /* ─── Render Posts in CMS ─── */
  function renderAdminPostsList() {
    if (!postsListContainer) return;

    let filtered = allAdminPosts;
    if (currentFilter === 'published') {
      filtered = allAdminPosts.filter(p => p.published === 1);
    } else if (currentFilter === 'drafts') {
      filtered = allAdminPosts.filter(p => p.published === 0);
    } else if (currentFilter === 'certifications') {
      filtered = allAdminPosts.filter(p => p.type === 'CERTIFICATION');
    }

    if (filtered.length === 0) {
      postsListContainer.innerHTML = `
        <div style="padding: 32px; text-align: center; color: var(--muted); border: 1px dashed var(--line); border-radius: 6px;">
          No posts found matching current filter.
        </div>
      `;
      return;
    }

    postsListContainer.innerHTML = filtered.map(post => {
      const isPub = post.published === 1;
      const typeClean = escapeHtml(post.type);
      const formattedDate = formatDate(post.created_at);

      return `
        <article class="admin-post-card" data-post-id="${post.id}">
          ${post.image_url ? `
            <img src="${escapeHtml(resolveMediaUrl(post.image_url))}" alt="Thumbnail" class="admin-post-thumb">
          ` : ''}

          <div class="admin-post-meta">
            <div class="admin-post-row1">
              <span class="fl-type-pill fl-type-${typeClean.toLowerCase().replace(/\s+/g, '-')}">${typeClean}</span>
              <span class="admin-status-badge ${isPub ? 'status-published' : 'status-draft'}">
                ● ${isPub ? 'Published' : 'Draft'}
              </span>
              <span style="font-family: var(--mono); font-size: 11px; color: var(--muted);">${formattedDate}</span>
              <span style="font-family: var(--mono); font-size: 11px; color: #ff5252;">♥ ${post.likes_count || 0}</span>
            </div>
            <h3 class="admin-post-title">${escapeHtml(post.title)}</h3>
            <p class="admin-post-desc">${escapeHtml(post.content)}</p>
          </div>

          <div class="admin-post-actions">
            <button type="button" class="admin-btn btn-sm" data-action="edit" data-id="${post.id}">EDIT</button>
            <button type="button" class="admin-btn btn-sm" data-action="publish" data-id="${post.id}">
              ${isPub ? 'UNPUBLISH' : 'PUBLISH'}
            </button>
            <button type="button" class="admin-btn btn-sm btn-danger" data-action="delete" data-id="${post.id}">DELETE</button>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ─── Filter Tabs ─── */
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderAdminPostsList();
    });
  });

  /* ─── Actions Delegation (Edit, Publish Toggle, Delete) ─── */
  if (postsListContainer) {
    postsListContainer.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const postId = parseInt(btn.dataset.id, 10);
      const post = allAdminPosts.find(p => p.id === postId);
      if (!post) return;

      if (action === 'edit') {
        openEditorForEdit(post);
      } else if (action === 'publish') {
        btn.disabled = true;
        try {
          const res = await fetch(`/api/admin/posts/${postId}/publish`, { method: 'PATCH' });
          if (res.ok) {
            post.published = post.published === 1 ? 0 : 1;
            renderAdminPostsList();
            showToast(post.published === 1 ? 'Post published to public feed' : 'Post converted to draft');
          }
        } catch (_) {
          showToast('Failed to update status');
        } finally {
          btn.disabled = false;
        }
      } else if (action === 'delete') {
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
        btn.disabled = true;
        try {
          const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
          if (res.ok) {
            allAdminPosts = allAdminPosts.filter(p => p.id !== postId);
            renderAdminPostsList();
            showToast('Post deleted');
          }
        } catch (_) {
          showToast('Failed to delete post');
        }
      }
    });
  }

  /* ─── Editor Controls ─── */
  function openEditorForNew() {
    currentEditingPostId = null;
    editorHeading.textContent = 'CREATE FIELD LOG ENTRY';
    resetEditorForm();
    editorCard.classList.remove('hidden');
    editorCard.scrollIntoView({ behavior: 'smooth' });
    inputTitle.focus();
  }

  function openEditorForEdit(post) {
    currentEditingPostId = post.id;
    editorHeading.textContent = `EDIT ENTRY: #${post.id} // ${post.title.substring(0, 24)}...`;

    inputType.value = post.type;
    inputTitle.value = post.title;
    inputContent.value = post.content;
    inputDate.value = post.created_at ? post.created_at.substring(0, 10) : '';
    inputLink.value = post.external_link || '';

    if (post.published === 1) {
      inputStatusPublished.checked = true;
    } else {
      inputStatusDraft.checked = true;
    }

    uploadedImageUrl = post.image_url || null;
    updateImagePreviewUI();

    editorCard.classList.remove('hidden');
    editorCard.scrollIntoView({ behavior: 'smooth' });
  }

  function resetEditor() {
    currentEditingPostId = null;
    editorHeading.textContent = 'CREATE FIELD LOG ENTRY';
    resetEditorForm();
    editorCard.classList.add('hidden');
  }

  function resetEditorForm() {
    if (editorForm) editorForm.reset();
    inputType.value = 'CERTIFICATION';
    // Set default date to today YYYY-MM-DD
    const today = new Date().toISOString().substring(0, 10);
    inputDate.value = today;
    inputStatusPublished.checked = true;
    uploadedImageUrl = null;
    updateImagePreviewUI();
  }

  if (newPostBtn) newPostBtn.addEventListener('click', openEditorForNew);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetEditor);

  /* ─── Media Upload Handling ─── */
  function updateImagePreviewUI() {
    if (uploadedImageUrl) {
      previewImg.src = resolveMediaUrl(uploadedImageUrl);
      previewBox.style.display = 'flex';
      uploadZone.style.display = 'none';
    } else {
      previewImg.src = '';
      previewBox.style.display = 'none';
      uploadZone.style.display = 'block';
    }
  }

  if (uploadZone) {
    uploadZone.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        uploadFile(fileInput.files[0]);
      }
    });
  }

  if (replaceImgBtn) {
    replaceImgBtn.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  if (removeImgBtn) {
    removeImgBtn.addEventListener('click', () => {
      uploadedImageUrl = null;
      if (fileInput) fileInput.value = '';
      updateImagePreviewUI();
    });
  }

  async function uploadFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPG, JPEG, PNG, and WEBP formats are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;

      showToast('Uploading image...');
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            data: base64Data
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          uploadedImageUrl = data.url;
          updateImagePreviewUI();
          showToast('Image uploaded successfully');
        } else {
          alert('Upload failed: ' + (data.error || 'Server error'));
        }
      } catch (err) {
        alert('Upload failed. Check server connection.');
      }
    };
    reader.readAsDataURL(file);
  }

  /* ─── Submit Post (Create / Update) ─── */
  if (editorForm) {
    editorForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const type = inputType.value;
      const title = inputTitle.value.trim();
      const content = inputContent.value.trim();
      const dateVal = inputDate.value;
      const link = inputLink.value.trim() || null;
      const published = inputStatusPublished.checked ? 1 : 0;

      if (!title || !content) {
        alert('Please provide both Title and Content.');
        return;
      }

      let created_at = null;
      if (dateVal) {
        created_at = new Date(dateVal + 'T12:00:00Z').toISOString();
      }

      const payload = {
        type,
        title,
        content,
        image_url: uploadedImageUrl,
        external_link: link,
        created_at,
        published
      };

      const submitBtn = editorForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'SAVING...';

      try {
        let res;
        if (currentEditingPostId) {
          // Update
          res = await fetch(`/api/admin/posts/${currentEditingPostId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          // Create
          res = await fetch('/api/admin/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json();
        if (res.ok && data.success) {
          showToast(currentEditingPostId ? 'Post updated successfully' : 'Post published to Field Log!');
          resetEditor();
          loadAdminPosts();
        } else {
          alert('Failed to save post: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Failed to save post: Network or server error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'PUBLISH POST';
      }
    });
  }

  // Run on page load
  checkSession();
})();

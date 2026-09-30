const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const db = require('./db.js');

const PORT = parseInt(process.env.PORT, 10) || 8080;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4'
};

/* ─── Real-Time Presence Store ─── */
const activeVisitors = new Map();

function broadcastPresence() {
  const count = activeVisitors.size;
  const payload = JSON.stringify({
    type: 'presence',
    count: count,
    timestamp: Date.now()
  });
  const sseData = `data: ${payload}\n\n`;

  for (const [id, client] of activeVisitors.entries()) {
    try {
      client.res.write(sseData);
    } catch (err) {
      activeVisitors.delete(id);
    }
  }
}

// Keep-alive heartbeat every 15s
setInterval(() => {
  const now = Date.now();
  let changed = false;

  for (const [id, client] of activeVisitors.entries()) {
    if (client.disconnectedAt && now - client.disconnectedAt > 1500) {
      activeVisitors.delete(id);
      changed = true;
      continue;
    }

    try {
      client.res.write(': keepalive\n\n');
    } catch (e) {
      activeVisitors.delete(id);
      changed = true;
    }
  }

  if (changed) {
    broadcastPresence();
  }
}, 15000);

/* ─── Server Utility Helpers ─── */
function sendJson(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
  });
  return list;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    const maxBytes = 15 * 1024 * 1024; // 15MB limit for uploads
    req.on('data', chunk => {
      body += chunk;
      if (body.length > maxBytes) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function getAuthToken(req) {
  const cookies = parseCookies(req);
  if (cookies.c1p_admin_session) {
    return cookies.c1p_admin_session;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

function isAuthenticated(req) {
  const token = getAuthToken(req);
  return db.validateAdminSession(token);
}

// Rate limiting for login
const failedAttempts = new Map();
function checkLoginRateLimit(ip) {
  const record = failedAttempts.get(ip);
  if (!record) return true;
  if (Date.now() - record.lastTime > 15 * 60 * 1000) {
    failedAttempts.delete(ip);
    return true;
  }
  return record.count < 5;
}

function recordFailedLogin(ip) {
  const record = failedAttempts.get(ip) || { count: 0, lastTime: 0 };
  record.count += 1;
  record.lastTime = Date.now();
  failedAttempts.set(ip, record);
}

function clearLoginRateLimit(ip) {
  failedAttempts.delete(ip);
}

/* ─── HTTP Server ─── */
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  /* ── Presence API Routes ── */
  if (pathname === '/api/presence/stream') {
    const visitorId = parsedUrl.query.id || ('anon_' + Math.random().toString(36).substring(2, 9));

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write(': sse connected\n\n');

    const existing = activeVisitors.get(visitorId);
    if (existing && existing.res && existing.res !== res) {
      try { existing.res.end(); } catch (e) {}
    }

    activeVisitors.set(visitorId, {
      res,
      lastPing: Date.now(),
      disconnectedAt: null
    });

    broadcastPresence();

    req.on('close', () => {
      const visitor = activeVisitors.get(visitorId);
      if (!visitor) return;

      visitor.disconnectedAt = Date.now();
      setTimeout(() => {
        const current = activeVisitors.get(visitorId);
        if (current && current.disconnectedAt && Date.now() - current.disconnectedAt >= 600) {
          activeVisitors.delete(visitorId);
          broadcastPresence();
        }
      }, 700);
    });

    return;
  }

  if (pathname === '/api/presence/leave') {
    const visitorId = parsedUrl.query.id;
    if (visitorId && activeVisitors.has(visitorId)) {
      activeVisitors.delete(visitorId);
      broadcastPresence();
    }
    return sendJson(res, 200, { ok: true, count: activeVisitors.size });
  }

  if (pathname === '/api/presence/count') {
    return sendJson(res, 200, { count: activeVisitors.size, ok: true });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FIELD LOG PUBLIC API
     ═══════════════════════════════════════════════════════════════════════ */

  // GET /api/posts - Public feed with pagination and optional type filter
  if (pathname === '/api/posts' && req.method === 'GET') {
    try {
      const page = parseInt(parsedUrl.query.page, 10) || 1;
      const limit = parseInt(parsedUrl.query.limit, 10) || 5;
      const type = parsedUrl.query.type || null;
      const visitorToken = parsedUrl.query.visitorToken || null;

      const data = db.getPublicPosts({ page, limit, type });

      // If visitor token provided, annotate with user's liked posts
      let userLikes = {};
      if (visitorToken && data.posts.length > 0) {
        const postIds = data.posts.map(p => p.id);
        userLikes = db.checkUserLikes(visitorToken, postIds);
      }

      return sendJson(res, 200, {
        success: true,
        ...data,
        userLikes
      });
    } catch (err) {
      console.error('[API /api/posts Error]', err);
      return sendJson(res, 500, { error: 'Failed to retrieve posts' });
    }
  }

  // GET /api/posts/:id - Single post detail
  const postMatch = pathname.match(/^\/api\/posts\/(\d+)$/);
  if (postMatch && req.method === 'GET') {
    try {
      const postId = parseInt(postMatch[1], 10);
      const post = db.getPostById(postId);
      if (!post || post.published !== 1) {
        return sendJson(res, 404, { error: 'Post not found' });
      }
      return sendJson(res, 200, { success: true, post });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to retrieve post' });
    }
  }

  // POST /api/posts/:id/like - Anonymous like toggling
  const likeMatch = pathname.match(/^\/api\/posts\/(\d+)\/like$/);
  if (likeMatch && req.method === 'POST') {
    try {
      const postId = parseInt(likeMatch[1], 10);
      const body = await parseBody(req);
      const visitorToken = body.visitorToken;

      if (!visitorToken || typeof visitorToken !== 'string' || visitorToken.length < 8) {
        return sendJson(res, 400, { error: 'Valid visitor token required' });
      }

      const result = db.toggleLike(postId, visitorToken.trim());
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      console.error('[API Like Error]', err);
      return sendJson(res, 400, { error: err.message || 'Failed to toggle like' });
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FIELD LOG ADMIN API
     ═══════════════════════════════════════════════════════════════════════ */

  // POST /api/admin/login
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      if (!checkLoginRateLimit(clientIp)) {
        return sendJson(res, 429, { error: 'Too many failed login attempts. Please wait 15 minutes.' });
      }

      const body = await parseBody(req);
      const password = body.password || body.passkey;

      if (!password || !db.verifyAdminAuth(password)) {
        recordFailedLogin(clientIp);
        return sendJson(res, 401, { error: 'Invalid owner passkey' });
      }

      clearLoginRateLimit(clientIp);
      const sessionToken = db.createAdminSession();

      // Set secure HTTP-only cookie
      const cookieHeader = `c1p_admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`;
      return sendJson(res, 200, {
        success: true,
        token: sessionToken,
        message: 'Authenticated successfully'
      }, { 'Set-Cookie': cookieHeader });
    } catch (err) {
      return sendJson(res, 500, { error: 'Authentication failed' });
    }
  }

  // POST /api/admin/logout
  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    const token = getAuthToken(req);
    db.destroyAdminSession(token);
    const cookieHeader = 'c1p_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
    return sendJson(res, 200, { success: true, message: 'Logged out' }, { 'Set-Cookie': cookieHeader });
  }

  // GET /api/admin/session - Check if current session is authenticated
  if (pathname === '/api/admin/session' && req.method === 'GET') {
    const authenticated = isAuthenticated(req);
    return sendJson(res, 200, { authenticated });
  }

  // Protected Admin Endpoints
  if (pathname.startsWith('/api/admin/')) {
    if (!isAuthenticated(req)) {
      return sendJson(res, 401, { error: 'Unauthorized: Owner authentication required' });
    }

    // GET /api/admin/posts - All posts for admin dashboard
    if (pathname === '/api/admin/posts' && req.method === 'GET') {
      try {
        const posts = db.getAllPostsForAdmin();
        return sendJson(res, 200, { success: true, posts });
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to retrieve admin posts' });
      }
    }

    // POST /api/admin/posts - Create post
    if (pathname === '/api/admin/posts' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const post = db.createPost(body);
        return sendJson(res, 201, { success: true, post });
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to create post' });
      }
    }

    // PUT /api/admin/posts/:id - Edit post
    const adminPutMatch = pathname.match(/^\/api\/admin\/posts\/(\d+)$/);
    if (adminPutMatch && req.method === 'PUT') {
      try {
        const postId = parseInt(adminPutMatch[1], 10);
        const body = await parseBody(req);
        const post = db.updatePost(postId, body);
        return sendJson(res, 200, { success: true, post });
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to update post' });
      }
    }

    // DELETE /api/admin/posts/:id - Delete post
    const adminDelMatch = pathname.match(/^\/api\/admin\/posts\/(\d+)$/);
    if (adminDelMatch && req.method === 'DELETE') {
      try {
        const postId = parseInt(adminDelMatch[1], 10);
        db.deletePost(postId);
        return sendJson(res, 200, { success: true, message: 'Post deleted' });
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to delete post' });
      }
    }

    // PATCH /api/admin/posts/:id/publish - Toggle publish/draft status
    const adminPubMatch = pathname.match(/^\/api\/admin\/posts\/(\d+)\/publish$/);
    if (adminPubMatch && req.method === 'PATCH') {
      try {
        const postId = parseInt(adminPubMatch[1], 10);
        const result = db.togglePublish(postId);
        return sendJson(res, 200, { success: true, ...result });
      } catch (err) {
        return sendJson(res, 400, { error: err.message || 'Failed to toggle publication' });
      }
    }

    // POST /api/admin/upload - Safe certificate / image upload handler
    if (pathname === '/api/admin/upload' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        if (!body || !body.data || !body.filename) {
          return sendJson(res, 400, { error: 'Missing file data or filename' });
        }

        const ext = path.extname(body.filename).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
        if (!allowedExts.includes(ext)) {
          return sendJson(res, 400, { error: 'Invalid file extension. Allowed: JPG, JPEG, PNG, WEBP' });
        }

        let base64Data = body.data;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length > 10 * 1024 * 1024) {
          return sendJson(res, 400, { error: 'File size exceeds maximum allowed limit (10MB)' });
        }

        // Magic byte verification
        let validMagic = false;
        if (ext === '.png' && buffer.length >= 8) {
          validMagic = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
        } else if ((ext === '.jpg' || ext === '.jpeg') && buffer.length >= 3) {
          validMagic = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
        } else if (ext === '.webp' && buffer.length >= 12) {
          const riff = buffer.toString('ascii', 0, 4);
          const webp = buffer.toString('ascii', 8, 12);
          validMagic = riff === 'RIFF' && webp === 'WEBP';
        }

        if (!validMagic) {
          return sendJson(res, 400, { error: 'Corrupted image file or unsupported format' });
        }

        const safeName = `fl_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
        const targetPath = path.join(db.UPLOADS_DIR, safeName);
        fs.writeFileSync(targetPath, buffer);

        return sendJson(res, 201, { success: true, url: `uploads/${safeName}` });
      } catch (err) {
        console.error('[API Upload Error]', err);
        return sendJson(res, 500, { error: 'Image upload failed' });
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     ADMIN PAGE & STATIC FILES SERVING
     ═══════════════════════════════════════════════════════════════════════ */

  // Route /admin/field-log -> serve admin/field-log/index.html
  if (pathname === '/admin/field-log' || pathname === '/admin/field-log/') {
    const adminHtmlPath = path.join(ROOT, 'admin', 'field-log', 'index.html');
    if (fs.existsSync(adminHtmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(adminHtmlPath).pipe(res);
      return;
    }
  }

  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT, safePath);

  // Security check: must reside inside ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
      res.writeHead(304);
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Last-Modified': stats.mtime.toUTCString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/ (Static + Real-Time Presence + Field Log API)`);
});

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

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
// activeVisitors: visitorId -> { res, lastPing, disconnectedAt }
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

// Keep-alive heartbeat every 15s to keep connections alive and prune dead sockets
setInterval(() => {
  const now = Date.now();
  let changed = false;

  for (const [id, client] of activeVisitors.entries()) {
    // If connection was marked disconnected and grace period expired, delete
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

/* ─── HTTP Server ─── */
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

      // Grace period for quick page refreshes (700ms)
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, count: activeVisitors.size }));
    return;
  }

  if (pathname === '/api/presence/count') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: activeVisitors.size, ok: true }));
    return;
  }

  /* ── Static Files Serving ── */
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

    // 304 Not Modified support
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
  console.log(`Server running at http://localhost:${PORT}/ (Static + Real-Time Presence)`);
});

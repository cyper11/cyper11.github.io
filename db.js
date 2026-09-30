/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIELD LOG DATABASE & AUTHENTICATION LAYER
 * Relational SQLite (node:sqlite) + JSON Static Fallback Sync
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'field-log.db');
const JSON_FILE = path.join(DATA_DIR, 'field-log.json');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Initialize SQLite database
const db = new DatabaseSync(DB_FILE);

// Set WAL mode and foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'GENERAL',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    external_link TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 1,
    likes_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    visitor_token TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(post_id, visitor_token)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_post_likes ON post_likes(post_id, visitor_token);
`);

/* ─── Password Hashing & Setup ─── */
function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return { hash: derivedKey.toString('hex'), salt };
}

function verifyPassword(password, storedHash, salt) {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(derivedKey.toString('hex'), 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (keyBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(keyBuf, storedBuf);
  } catch (_) {
    return false;
  }
}

// Seed default admin password if not initialized
const checkPwdStmt = db.prepare('SELECT value FROM admin_config WHERE key = ?');
const pwdRow = checkPwdStmt.get('password_hash');
if (!pwdRow) {
  const defaultPass = process.env.ADMIN_PASSWORD || 'FieldEngineer2026!';
  const { hash, salt } = hashPassword(defaultPass);
  const insCfg = db.prepare('INSERT OR REPLACE INTO admin_config (key, value) VALUES (?, ?)');
  insCfg.run('password_hash', hash);
  insCfg.run('password_salt', salt);
  console.log('[FieldLog DB] Initialized owner admin account. (Passkey configured)');
}

/* ─── Seed Initial Sample Posts (If empty) ─── */
const countPostsStmt = db.prepare('SELECT COUNT(*) as count FROM posts');
const totalPostsRow = countPostsStmt.get();
if (totalPostsRow.count === 0) {
  const insertPostStmt = db.prepare(`
    INSERT INTO posts (type, title, content, image_url, external_link, created_at, updated_at, published, likes_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPostStmt.run(
    'CERTIFICATION',
    'Lenovo Field Service — Rising Star Qualification',
    'Earned the Lenovo Field Service Rising Star qualification. Grateful for the hands-on troubleshooting, customer unit repairs, and continuous hardware diagnostics experience with IPVCYX across Cavite and nearby regions.',
    'rising-star.png',
    'https://pcsupport.lenovo.com/',
    new Date(Date.now() - 3600000 * 3).toISOString(),
    new Date().toISOString(),
    1,
    18
  );

  insertPostStmt.run(
    'FIELD UPDATE',
    'MEC Cabling & Infrastructure Quality Inspections',
    'Completed on-site structured cabling audits and equipment inspections. Prepared circuit diagrams, verified patch panel terminologies, and documented fiber/coaxial run conditions for client handover.',
    'field-01.png',
    null,
    new Date(Date.now() - 3600000 * 24).toISOString(),
    new Date().toISOString(),
    1,
    12
  );

  insertPostStmt.run(
    'PROJECT',
    'C1-Convert — All-in-One Client-Side File Utility',
    'Shipped C1-Convert: a browser-native document and image conversion engine. Built with privacy at its core — zero cloud retention, automated 30-minute purging, and instantaneous conversions for PDFs, Word documents, and spreadsheets.',
    'c1convert-01.png',
    'https://c1-convert.vercel.app/',
    new Date(Date.now() - 3600000 * 50).toISOString(),
    new Date().toISOString(),
    1,
    21
  );

  insertPostStmt.run(
    'LEARNING',
    'Diagnose First, Never Swap Blindly',
    '“Walang sasagip sa’yo. Kaya matuto kang bumangon at laging galingan.” In field engineering, it is easy to assume the first error code is the root cause. Real reliability comes from verifying voltages, testing continuity, and understanding the entire system before replacing parts.',
    null,
    null,
    new Date(Date.now() - 3600000 * 80).toISOString(),
    new Date().toISOString(),
    1,
    15
  );

  console.log('[FieldLog DB] Seeded 4 initial authentic sample Field Log entries.');
}

/* ─── Static JSON Fallback Sync ─── */
function syncJsonExport() {
  try {
    const publishedPosts = db.prepare(`
      SELECT id, type, title, content, image_url, external_link, created_at, likes_count
      FROM posts
      WHERE published = 1
      ORDER BY created_at DESC
    `).all();

    fs.writeFileSync(JSON_FILE, JSON.stringify({
      version: 1,
      updated_at: new Date().toISOString(),
      posts: publishedPosts
    }, null, 2), 'utf-8');
  } catch (err) {
    console.error('[FieldLog DB] Failed to sync JSON export:', err);
  }
}

// Initial sync
syncJsonExport();

/* ─── Public Feed Methods ─── */
function getPublicPosts({ page = 1, limit = 5, type = null } = {}) {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.max(1, Math.min(50, parseInt(limit, 10) || 5));
  const offset = (page - 1) * limit;

  let countSql = 'SELECT COUNT(*) as count FROM posts WHERE published = 1';
  let selectSql = 'SELECT id, type, title, content, image_url, external_link, created_at, likes_count FROM posts WHERE published = 1';
  const params = [];

  if (type) {
    countSql += ' AND type = ?';
    selectSql += ' AND type = ?';
    params.push(type.toUpperCase());
  }

  selectSql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const total = db.prepare(countSql).get(...params).count;
  const posts = db.prepare(selectSql).all(...params, limit, offset);

  return {
    posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

function getPostById(id) {
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
}

/* ─── Anonymous Likes Methods ─── */
function toggleLike(postId, visitorToken) {
  if (!postId || !visitorToken) {
    throw new Error('Post ID and Visitor Token are required');
  }

  postId = parseInt(postId, 10);
  const post = db.prepare('SELECT id, likes_count FROM posts WHERE id = ?').get(postId);
  if (!post) throw new Error('Post not found');

  const existingLike = db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND visitor_token = ?').get(postId, visitorToken);

  let liked = false;
  if (existingLike) {
    // Remove like
    db.prepare('DELETE FROM post_likes WHERE id = ?').run(existingLike.id);
    db.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1), updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), postId);
    liked = false;
  } else {
    // Add like
    db.prepare('INSERT INTO post_likes (post_id, visitor_token, created_at) VALUES (?, ?, ?)')
      .run(postId, visitorToken, new Date().toISOString());
    db.prepare('UPDATE posts SET likes_count = likes_count + 1, updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), postId);
    liked = true;
  }

  const updated = db.prepare('SELECT likes_count FROM posts WHERE id = ?').get(postId);
  syncJsonExport();

  return {
    liked,
    likesCount: updated.likes_count
  };
}

function checkUserLikes(visitorToken, postIds = []) {
  if (!visitorToken || postIds.length === 0) return {};
  const placeholders = postIds.map(() => '?').join(',');
  const rows = db.prepare(`SELECT post_id FROM post_likes WHERE visitor_token = ? AND post_id IN (${placeholders})`)
    .all(visitorToken, ...postIds);
  const map = {};
  rows.forEach(r => { map[r.post_id] = true; });
  return map;
}

/* ─── Admin Post Management Methods ─── */
function getAllPostsForAdmin() {
  return db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
}

function createPost({ type, title, content, image_url = null, external_link = null, created_at = null, published = 1 }) {
  if (!title || !title.trim()) throw new Error('Title is required');
  if (!content || !content.trim()) throw new Error('Content is required');

  const now = new Date().toISOString();
  const postDate = created_at && !isNaN(new Date(created_at).getTime()) ? new Date(created_at).toISOString() : now;
  const postType = (type || 'GENERAL').toUpperCase();

  const stmt = db.prepare(`
    INSERT INTO posts (type, title, content, image_url, external_link, created_at, updated_at, published, likes_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const info = stmt.run(
    postType,
    title.trim(),
    content.trim(),
    image_url ? image_url.trim() : null,
    external_link ? external_link.trim() : null,
    postDate,
    now,
    published ? 1 : 0
  );

  syncJsonExport();
  return getPostById(Number(info.lastInsertRowid));
}

function updatePost(id, { type, title, content, image_url, external_link, created_at, published }) {
  id = parseInt(id, 10);
  const current = getPostById(id);
  if (!current) throw new Error('Post not found');

  const now = new Date().toISOString();
  const postDate = created_at && !isNaN(new Date(created_at).getTime()) ? new Date(created_at).toISOString() : current.created_at;

  const stmt = db.prepare(`
    UPDATE posts
    SET type = ?, title = ?, content = ?, image_url = ?, external_link = ?, created_at = ?, updated_at = ?, published = ?
    WHERE id = ?
  `);

  stmt.run(
    (type || current.type).toUpperCase(),
    title !== undefined ? title.trim() : current.title,
    content !== undefined ? content.trim() : current.content,
    image_url !== undefined ? (image_url ? image_url.trim() : null) : current.image_url,
    external_link !== undefined ? (external_link ? external_link.trim() : null) : current.external_link,
    postDate,
    now,
    published !== undefined ? (published ? 1 : 0) : current.published,
    id
  );

  syncJsonExport();
  return getPostById(id);
}

function deletePost(id) {
  id = parseInt(id, 10);
  const current = getPostById(id);
  if (!current) throw new Error('Post not found');

  // If local image in uploads/, optionally remove it
  if (current.image_url && current.image_url.startsWith('uploads/')) {
    const fullPath = path.join(__dirname, current.image_url);
    if (fs.existsSync(fullPath)) {
      try { fs.unlinkSync(fullPath); } catch (_) {}
    }
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  syncJsonExport();
  return { success: true };
}

function togglePublish(id) {
  id = parseInt(id, 10);
  const current = getPostById(id);
  if (!current) throw new Error('Post not found');

  const newPub = current.published === 1 ? 0 : 1;
  db.prepare('UPDATE posts SET published = ?, updated_at = ? WHERE id = ?')
    .run(newPub, new Date().toISOString(), id);

  syncJsonExport();
  return { id, published: newPub };
}

/* ─── Admin Authentication & Sessions ─── */
function verifyAdminAuth(password) {
  const hashRow = db.prepare('SELECT value FROM admin_config WHERE key = ?').get('password_hash');
  const saltRow = db.prepare('SELECT value FROM admin_config WHERE key = ?').get('password_salt');
  if (!hashRow || !saltRow) return false;
  return verifyPassword(password, hashRow.value, saltRow.value);
}

function changeAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  const { hash, salt } = hashPassword(newPassword);
  db.prepare('UPDATE admin_config SET value = ? WHERE key = ?').run(hash, 'password_hash');
  db.prepare('UPDATE admin_config SET value = ? WHERE key = ?').run(salt, 'password_salt');
  return { success: true };
}

function createAdminSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  db.prepare('INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)')
    .run(token, now.toISOString(), expiresAt.toISOString());

  return token;
}

function validateAdminSession(token) {
  if (!token) return false;
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) return false;

  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return false;
  }
  return true;
}

function destroyAdminSession(token) {
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  return { success: true };
}

module.exports = {
  db,
  getPublicPosts,
  getPostById,
  toggleLike,
  checkUserLikes,
  getAllPostsForAdmin,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
  verifyAdminAuth,
  changeAdminPassword,
  createAdminSession,
  validateAdminSession,
  destroyAdminSession,
  syncJsonExport,
  UPLOADS_DIR,
  DATA_DIR
};

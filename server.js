import express from 'express';
import session from 'express-session';
import Database from 'better-sqlite3';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Gzip/Brotli Compression for ultra-fast page reloads
app.use(compression());

// Setup Database
const db = new Database('grievances.db', { verbose: console.log });

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS grievances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    constituency TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_data TEXT DEFAULT '',
    photo_name TEXT DEFAULT '',
    status TEXT DEFAULT 'Pending',
    admin_notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const grievanceColumns = db.prepare("PRAGMA table_info(grievances)").all().map(column => column.name);
if (!grievanceColumns.includes('photo_data')) {
  db.exec("ALTER TABLE grievances ADD COLUMN photo_data TEXT DEFAULT ''");
}
if (!grievanceColumns.includes('photo_name')) {
  db.exec("ALTER TABLE grievances ADD COLUMN photo_name TEXT DEFAULT ''");
}
if (!grievanceColumns.includes('user_id')) {
  db.exec("ALTER TABLE grievances ADD COLUMN user_id INTEGER");
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  app.set('trust proxy', 1);
}

app.use(session({
  secret: 'tvk-digital-super-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd, // True on Render HTTPS
    sameSite: isProd ? 'none' : 'lax', // Permissive cross-origin session on Vercel/Render
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

const staticOptions = {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.match(/\.(png|jpg|jpeg|webp|gif|svg|woff2?|css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
};

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, staticOptions));
}
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, staticOptions));
}

app.get(/^\/(?!api(?:\/|$)).*/, (req, res, next) => {
  const requestedPath = req.path === '/' ? 'index.html' : req.path.replace(/^\/+/, '');
  const resolvedPath = path.join(distDir, requestedPath);

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    return res.sendFile(resolvedPath);
  }

  const fallbackPath = path.join(distDir, 'index.html');
  if (fs.existsSync(fallbackPath)) {
    return res.sendFile(fallbackPath);
  }

  next();
});

// Admin credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123';

let instagramCache = {
  fetchedAt: 0,
  data: []
};

const activeAdminTokens = new Set();

const getAuthToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return req.headers['x-auth-token'] || null;
};

// Middleware to check if admin logged in
const requireAdminAuth = (req, res, next) => {
  const token = getAuthToken(req);
  if ((req.session && req.session.isAdmin) || (token && activeAdminTokens.has(token))) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized. Admin login required.' });
  }
};

// Middleware to check if user logged in
const requireUserAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }
};



function buildTrackId(id) {
  return `TVK-GR-2026-${String(id).padStart(4, '0')}`;
}

function parseTrackId(trackId) {
  if (!trackId) return null;

  const normalized = String(trackId).trim().toUpperCase();
  const match = normalized.match(/^TVK-GR-2026-(\d{4,})$/);

  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

// API: Submit Grievance (guest-friendly — name & phone come from form body)
app.post('/api/grievances', (req, res) => {
  try {
    // Support both logged-in users and guests
    let name, phone;
    if (req.session && req.session.userId) {
      const user = db.prepare('SELECT name, phone FROM users WHERE id = ?').get(req.session.userId);
      name = user.name;
      phone = user.phone;
    } else {
      name = req.body.name;
      phone = req.body.phone;
    }

    const { constituency, category, description, photoData, photoName } = req.body;

    if (!name || !phone || !constituency || !category || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (photoData && !String(photoData).startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'Only image uploads are allowed.' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO grievances (user_id, name, phone, constituency, category, description, photo_data, photo_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      req.session?.userId || null,
      name,
      phone,
      constituency,
      category,
      description,
      photoData || '',
      photoName || ''
    );
    const id = result.lastInsertRowid;

    // Generate an elegant tracking ID
    const trackId = buildTrackId(id);

    res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully',
      trackId,
      data: { id, name, constituency, category, status: 'Pending' }
    });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({ success: false, message: 'Failed to save grievance. Database error.' });
  }
});

// API: User Register
app.post('/api/user/register', (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ success: false, message: 'All fields are required.' });
  
  try {
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) return res.status(400).json({ success: false, message: 'Phone number already registered.' });

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const result = db.prepare('INSERT INTO users (name, phone, password) VALUES (?, ?, ?)').run(name, phone, hashedPassword);
    
    req.session.userId = result.lastInsertRowid;
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API: User Login
app.post('/api/user/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ success: false, message: 'All fields are required.' });

  try {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = db.prepare('SELECT id, name FROM users WHERE phone = ? AND password = ?').get(phone, hashedPassword);
    if (user) {
      req.session.userId = user.id;
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API: User Logout
app.post('/api/user/logout', (req, res) => {
  req.session.userId = null;
  res.json({ success: true, message: 'Logged out successfully' });
});

// API: User Status
app.get('/api/user/status', (req, res) => {
  if (req.session && req.session.userId) {
    const user = db.prepare('SELECT name, phone FROM users WHERE id = ?').get(req.session.userId);
    if (user) {
      return res.json({ success: true, loggedIn: true, user });
    }
  }
  res.json({ success: true, loggedIn: false });
});

// API: Get User Grievances
app.get('/api/user/grievances', requireUserAuth, (req, res) => {
  try {
    const grievances = db.prepare('SELECT * FROM grievances WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);
    const mapped = grievances.map(g => ({
      ...g,
      trackId: buildTrackId(g.id)
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error fetching user grievances:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// API: Public Track Grievance
app.get('/api/grievances/:trackId', (req, res) => {
  try {
    const grievanceId = parseTrackId(req.params.trackId);

    if (!grievanceId) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid TNX ID like TVK-GR-2026-0001.'
      });
    }

    const grievance = db.prepare(`
      SELECT id, name, constituency, category, status, admin_notes, created_at
      FROM grievances
      WHERE id = ?
    `).get(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'No grievance was found for this TNX ID.'
      });
    }

    res.json({
      success: true,
      data: {
        trackId: buildTrackId(grievance.id),
        name: grievance.name,
        constituency: grievance.constituency,
        category: grievance.category,
        status: grievance.status,
        adminNotes: grievance.admin_notes,
        createdAt: grievance.created_at
      }
    });
  } catch (error) {
    console.error('Error tracking grievance:', error);
    res.status(500).json({ success: false, message: 'Unable to check grievance status right now.' });
  }
});

// API: Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    const token = crypto.randomUUID();
    activeAdminTokens.add(token);
    res.json({ success: true, message: 'Login successful', token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// API: Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const token = getAuthToken(req);
  if (token) {
    activeAdminTokens.delete(token);
  }
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logout successful' });
  });
});

// API: Admin Check Status
app.get('/api/admin/status', (req, res) => {
  const token = getAuthToken(req);
  if ((req.session && req.session.isAdmin) || (token && activeAdminTokens.has(token))) {
    res.json({ success: true, loggedIn: true });
  } else {
    res.json({ success: true, loggedIn: false });
  }
});

// API: Instagram media feed for development page
app.get('/api/instagram/media', async (req, res) => {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramUserId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !instagramUserId) {
    return res.json({
      success: false,
      message: 'Instagram API is not configured. Add INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN.',
      data: []
    });
  }

  const cacheAge = Date.now() - instagramCache.fetchedAt;
  if (instagramCache.data.length > 0 && cacheAge < 10 * 60 * 1000) {
    return res.json({ success: true, source: 'cache', data: instagramCache.data });
  }

  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
    const graphUrl = new URL(`https://graph.facebook.com/v20.0/${instagramUserId}/media`);
    graphUrl.searchParams.set('fields', fields);
    graphUrl.searchParams.set('limit', '8');
    graphUrl.searchParams.set('access_token', accessToken);

    const response = await fetch(graphUrl);
    const result = await response.json();

    if (!response.ok) {
      console.error('Instagram API error:', result);
      return res.status(502).json({
        success: false,
        message: result.error?.message || 'Instagram API request failed.',
        data: []
      });
    }

    const media = (result.data || []).map(item => ({
      id: item.id,
      caption: item.caption || 'Instagram update',
      mediaType: item.media_type,
      mediaUrl: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
      permalink: item.permalink,
      timestamp: item.timestamp
    })).filter(item => item.mediaUrl && item.permalink);

    instagramCache = {
      fetchedAt: Date.now(),
      data: media
    };

    res.json({ success: true, source: 'instagram', data: media });
  } catch (error) {
    console.error('Error fetching Instagram media:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch Instagram media.', data: [] });
  }
});

// API: Fetch All Grievances (Admin only)
app.get('/api/admin/grievances', requireAdminAuth, (req, res) => {
  try {
    const grievances = db.prepare('SELECT * FROM grievances ORDER BY created_at DESC').all();
    res.json({ success: true, data: grievances });
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// API: Update Grievance Status & Notes (Admin only)
app.put('/api/admin/grievances/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updateStmt = db.prepare(`
      UPDATE grievances 
      SET status = ?, admin_notes = ?
      WHERE id = ?
    `);

    const result = updateStmt.run(status, admin_notes || '', id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    res.json({ success: true, message: 'Grievance updated successfully' });
  } catch (error) {
    console.error('Error updating grievance:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// API: Delete Grievance (Admin only)
app.delete('/api/admin/grievances/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const deleteStmt = db.prepare('DELETE FROM grievances WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    res.json({ success: true, message: 'Grievance deleted successfully' });
  } catch (error) {
    console.error('Error deleting grievance:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

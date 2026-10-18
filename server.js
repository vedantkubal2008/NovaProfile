import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(process.env.DATABASE_PATH || join(rootDirectory, 'data', 'guestbook.sqlite'));
const distDirectory = resolve(rootDirectory, 'dist');
const port = Number(process.env.PORT || 3001);
const appBasePath = (process.env.APP_BASE_PATH || '/NovaProfile/').replace(/\/?$/, '/');
const allowedOrigin = process.env.ALLOWED_ORIGIN || '';

mkdirSync(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec(`
  CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    sticker TEXT NOT NULL,
    date_label TEXT,
    created_at INTEGER NOT NULL
  )
`);

const seededEntries = [
  {
    name: 'Commander Pip the Skull Baby',
    message: 'Nova! Your orbital radio beacon came through loud and clear. Midnight Nursery is asleep under your stars! 🚀',
    sticker: '🚀',
    date: 'Orbit #104'
  },
  {
    name: 'Major Barnaby (Lunar Base)',
    message: 'Hoo-hoo! The Stellar Loom navigation path guided our lunar lander safely past the asteroid belt.',
    sticker: '🪐',
    date: 'Orbit #101'
  },
  {
    name: 'Luna the Space Pup',
    message: 'Bork! I caught a floating star-biscuit in zero-g! Best spacewalk ever. 🐾',
    sticker: '⭐',
    date: 'Orbit #98'
  }
];

const countEntries = database.prepare('SELECT COUNT(*) AS count FROM guestbook');
if (countEntries.get().count === 0) {
  const insertEntry = database.prepare(
    'INSERT INTO guestbook (name, message, sticker, date_label, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  for (const entry of [...seededEntries].reverse()) {
    insertEntry.run(entry.name, entry.message, entry.sticker, entry.date, Date.now());
  }
}

const getEntries = database.prepare(
  'SELECT id, name, message, sticker, date_label, created_at FROM guestbook ORDER BY id DESC LIMIT 100'
);
const insertEntry = database.prepare(
  'INSERT INTO guestbook (name, message, sticker, date_label, created_at) VALUES (?, ?, ?, NULL, ?)'
);
const allowedStickers = new Set(['🚀', '🪐', '👨‍🚀', '⭐', '🛸']);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (allowedOrigin && origin && origin !== allowedOrigin) return false;
  if (allowedOrigin && origin === allowedOrigin) {
    response.setHeader('access-control-allow-origin', allowedOrigin);
    response.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
    response.setHeader('access-control-allow-headers', 'Content-Type');
    response.setHeader('vary', 'Origin');
  }
  return true;
}

function serializeEntries() {
  return getEntries.all().map((entry) => ({
    id: entry.id,
    name: entry.name,
    message: entry.message,
    sticker: entry.sticker,
    date: entry.date_label || new Date(entry.created_at).toLocaleString()
  }));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8192) throw Object.assign(new Error('Request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Invalid JSON.'), { status: 400 });
  }
}

async function serveStatic(pathname, response) {
  let filePath;
  try {
    let staticPath = decodeURIComponent(pathname);
    const baseWithoutTrailingSlash = appBasePath.slice(0, -1);
    if (staticPath === baseWithoutTrailingSlash || staticPath === appBasePath) {
      staticPath = '/';
    } else if (staticPath.startsWith(appBasePath)) {
      staticPath = staticPath.slice(appBasePath.length - 1);
    } else {
      response.writeHead(404).end('Not found');
      return;
    }
    filePath = resolve(distDirectory, `.${staticPath === '/' ? '/index.html' : staticPath}`);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html');
    const content = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypes[extname(filePath)] || 'application/octet-stream'
    });
    response.end(content);
  } catch {
    response.writeHead(404).end('Not found. Build the site with npm run build first.');
  }
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');
  if (pathname.startsWith('/api/')) {
    if (!applyCors(request, response)) {
      sendJson(response, 403, { error: 'Origin is not allowed.' });
      return;
    }
    if (request.method === 'OPTIONS') {
      response.writeHead(204).end();
      return;
    }
  }

  if (pathname === '/api/guestbook' && request.method === 'GET') {
    sendJson(response, 200, serializeEntries());
    return;
  }

  if (pathname === '/api/guestbook' && request.method === 'POST') {
    try {
      const body = await readJson(request);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const sticker = typeof body.sticker === 'string' ? body.sticker : '';
      if (!name || name.length > 30 || !message || message.length > 140 || !allowedStickers.has(sticker)) {
        sendJson(response, 400, { error: 'Name, message, or sticker is invalid.' });
        return;
      }

      const createdAt = Date.now();
      const result = insertEntry.run(name, message, sticker, createdAt);
      sendJson(response, 201, {
        id: Number(result.lastInsertRowid),
        name,
        message,
        sticker,
        date: new Date(createdAt).toLocaleString()
      });
    } catch (error) {
      sendJson(response, error.status || 500, { error: error.message || 'Could not save message.' });
    }
    return;
  }

  if (pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'API route not found.' });
    return;
  }

  if (pathname === '/' && appBasePath !== '/') {
    response.writeHead(302, { location: appBasePath }).end();
    return;
  }
  if (request.method === 'GET' || request.method === 'HEAD') {
    await serveStatic(pathname, response);
    return;
  }
  response.writeHead(405).end('Method not allowed');
});

server.listen(port, () => {
  console.log(`Nova site and guestbook database listening on port ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    database.close();
    server.close(() => process.exit(0));
  });
}
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data.json');
const MAX_BODY_BYTES = 5 * 1024 * 1024;

function emptyData() {
  return { proyectos: [], tareas: [], np: 1, nt: 1 };
}

function normalizeData(data) {
  const value = data && typeof data === 'object' ? data : emptyData();
  const proyectos = Array.isArray(value.proyectos) ? value.proyectos : [];
  const tareas = Array.isArray(value.tareas) ? value.tareas : [];
  const maxProyecto = proyectos.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  const maxTarea = tareas.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  return {
    ...value,
    proyectos,
    tareas,
    np: Math.max(Number(value.np) || 1, maxProyecto + 1),
    nt: Math.max(Number(value.nt) || 1, maxTarea + 1)
  };
}

function ensureDataFile() {
  try {
    fs.accessSync(DATA_FILE, fs.constants.F_OK);
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify(emptyData(), null, 2));
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return normalizeData(JSON.parse(raw));
  } catch {
    return emptyData();
  }
}

function writeData(data) {
  ensureDataFile();
  const temporaryFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(normalizeData(data), null, 2));
  fs.renameSync(temporaryFile, DATA_FILE);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.ico': 'image/x-icon'
};

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function serveFile(req, res, urlPath) {
  let normalized = urlPath === '/' ? '/gestor.html' : urlPath;
  normalized = normalized.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (url.pathname === '/health') {
    sendJson(res, { ok: true, service: 'gestor-de-proyectos' });
    return;
  }

  if (url.pathname === '/api/data') {
    if (req.method === 'GET') {
      sendJson(res, readData());
      return;
    }

    if (req.method === 'PUT') {
      let body = '';
      let tooLarge = false;
      req.on('data', chunk => {
        body += chunk;
        if (Buffer.byteLength(body) > MAX_BODY_BYTES) tooLarge = true;
      });
      req.on('end', () => {
        if (tooLarge) {
          sendJson(res, { error: 'El cuerpo supera el límite permitido' }, 413);
          return;
        }
        try {
          const parsed = JSON.parse(body || '{}');
          writeData(parsed);
          sendJson(res, { ok: true });
        } catch (error) {
          sendJson(res, { error: 'JSON inválido' }, 400);
        }
      });
      return;
    }

    res.writeHead(405, { 'Allow': 'GET, PUT' });
    res.end('Method not allowed');
    return;
  }

  serveFile(req, res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Gestor compartido corriendo en el puerto ${PORT}`);
});

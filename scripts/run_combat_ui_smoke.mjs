import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, 'dist');
const smokeUrl = process.env.SMOKE_URL || '';
const outDir = process.env.SMOKE_OUT_DIR || path.join('output', 'web-game', 'refactor-smoke-combat-ui');
const scriptPath = path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function createDistServer(rootDir) {
  return createServer(async (req, res) => {
    try {
      const rawPath = req.url === '/' ? '/index.html' : (req.url || '/index.html');
      const pathname = decodeURIComponent(rawPath.split('?')[0]);
      const filePath = path.resolve(rootDir, `.${pathname}`);
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    } catch (error) {
      res.writeHead(error?.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error?.code === 'ENOENT' ? 'Not found' : String(error?.message || error));
    }
  });
}

const server = smokeUrl ? null : createDistServer(distDir);

try {
  let appUrl = smokeUrl;
  if (server) {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    appUrl = `http://127.0.0.1:${port}`;
  }

  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, '--url', appUrl, '--out-dir', outDir], {
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`combat smoke exited via signal ${signal}`));
        return;
      }
      resolve(code ?? 0);
    });
  });

  process.exit(result);
} finally {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
